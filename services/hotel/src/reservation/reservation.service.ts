import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, ReservationStatus } from '../../generated/prisma/client.js';
import { AirportService } from '../airport/airport.service';
import { BroadcastService } from '../broadcast/broadcast.service';
import { HotelBroadcastEventType } from '../broadcast/hotel-events';
import { PrismaService } from '../prisma/prisma.service';
import { CancelReservationResponseDto } from './dto/cancel-reservation-response.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationResponseDto } from './dto/reservation-response.dto';

const MAX_TRANSACTION_RETRIES = 3;

@Injectable()
export class ReservationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly broadcast: BroadcastService,
    private readonly airport: AirportService,
  ) {}

  async create(
    createReservationDto: CreateReservationDto,
  ): Promise<ReservationResponseDto> {
    if (
      createReservationDto.check_out_day <= createReservationDto.check_in_day
    ) {
      throw new HttpException(
        { error: 'check_out_day must be greater than check_in_day' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Found-1
    await this.rejectIfGuestHasNotClearedAirport(createReservationDto.guest_id);

    const rooms = await this.prisma.room.findMany({
      where: { type: createReservationDto.room_type },
      orderBy: { id: 'asc' },
    });

    // Found-2
    const maxCapacity = Math.max(...rooms.map((room) => room.capacity), 0);
    if (createReservationDto.guest_count > maxCapacity) {
      throw new HttpException(
        {
          error: `Room type ${createReservationDto.room_type} supports at most ${maxCapacity} guests`,
        },
        HttpStatus.CONFLICT,
      );
    }

    // Found-3
    const reservation = await this.createReservationWithRetry(
      createReservationDto,
      rooms,
    );

    await this.broadcast.publishHotelEvent(
      HotelBroadcastEventType.ReservationConfirmed,
      {
        message: 'Hotel reservation confirmed.',
        reservation_id: reservation.id,
        guest_id: reservation.guest_id,
        room_type: reservation.room.type,
        guest_count: reservation.guest_count,
        check_in_day: reservation.check_in_day,
        check_out_day: reservation.check_out_day,
      },
    );

    return {
      id: reservation.id,
      guest_id: reservation.guest_id,
      room_id: reservation.room_id,
      room_type: reservation.room.type,
      guest_count: reservation.guest_count,
      check_in_day: reservation.check_in_day,
      check_out_day: reservation.check_out_day,
      status: reservation.status,
    };
  }

  private async createReservationWithRetry(
    createReservationDto: CreateReservationDto,
    rooms: Array<{ id: string; type: any; capacity: number }>,
  ) {
    for (let attempt = 0; attempt < MAX_TRANSACTION_RETRIES; attempt++) {
      try {
        return await this.prisma.$transaction(
          async (tx) => {
            let availableRoom: (typeof rooms)[number] | null = null;

            for (const room of rooms) {
              if (createReservationDto.guest_count > room.capacity) {
                continue;
              }

              const overlappingReservationCount = await tx.reservation.count({
                where: {
                  room_id: room.id,
                  status: ReservationStatus.CONFIRMED,
                  check_in_day: { lte: createReservationDto.check_out_day },
                  check_out_day: { gte: createReservationDto.check_in_day },
                },
              });

              if (overlappingReservationCount === 0) {
                availableRoom = room;
                break;
              }
            }

            if (!availableRoom) {
              throw new HttpException(
                {
                  error: `No available rooms of type ${createReservationDto.room_type} for days ${createReservationDto.check_in_day}-${createReservationDto.check_out_day}`,
                },
                HttpStatus.CONFLICT,
              );
            }

            return tx.reservation.create({
              data: {
                guest_id: createReservationDto.guest_id,
                room_id: availableRoom.id,
                guest_count: createReservationDto.guest_count,
                check_in_day: createReservationDto.check_in_day,
                check_out_day: createReservationDto.check_out_day,
                status: ReservationStatus.CONFIRMED,
              },
              include: { room: true },
            });
          },
          { isolation: Prisma.TransactionIsolationLevel.Serializable },
        );
      } catch (err) {
        const isSerializationConflict =
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === 'P2034';

        if (isSerializationConflict && attempt < MAX_TRANSACTION_RETRIES - 1) {
          continue;
        }

        throw err;
      }
    }

    throw new HttpException(
      { error: 'Could not complete reservation due to high contention, please retry' },
      HttpStatus.CONFLICT,
    );
  }

  private async rejectIfGuestHasNotClearedAirport(
    guestId: string,
  ): Promise<void> {
    const hasClearedAirport =
      await this.airport.hasGuestClearedProcessing(guestId);

    if (hasClearedAirport === false) {
      throw new HttpException(
        { error: 'Guest has not cleared airport processing' },
        HttpStatus.CONFLICT,
      );
    }
  }

  async findById(id: string): Promise<ReservationResponseDto> {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: { room: true },
    });

    if (!reservation) {
      throw new HttpException(
        { error: 'Reservation not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      id: reservation.id,
      guest_id: reservation.guest_id,
      room_id: reservation.room_id,
      room_type: reservation.room.type,
      guest_count: reservation.guest_count,
      check_in_day: reservation.check_in_day,
      check_out_day: reservation.check_out_day,
      status: reservation.status,
    };
  }

  // Found-4 and [BUG, 3]
  async findActiveByGuestId(guestId: string): Promise<ReservationResponseDto> {
    const rows = await this.prisma.$queryRaw<any[]>(
      Prisma.sql`
        SELECT r.id, r.guest_id, r.room_id, r.guest_count, r.check_in_day, r.check_out_day, r.status,
               rm.type AS room_type
        FROM "Reservation" r
        JOIN "Room" rm ON rm.id = r.room_id
        WHERE r.guest_id = ${guestId} AND r.status = ${ReservationStatus.CONFIRMED}
        ORDER BY r.check_in_day DESC
        LIMIT 1
      `,
    );

    if (!rows.length) {
      throw new HttpException(
        { error: 'Reservation not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    const row = rows[0];
    return {
      id: row.id,
      guest_id: row.guest_id,
      room_id: row.room_id,
      room_type: row.room_type,
      guest_count: row.guest_count,
      check_in_day: row.check_in_day,
      check_out_day: row.check_out_day,
      status: row.status,
    };
  }

  // Found-5 and [BUG, 2]
  async cancel(id: string): Promise<CancelReservationResponseDto> {
    const existing = await this.prisma.reservation.findUnique({
      where: { id },
    });

    if (!existing || existing.status === ReservationStatus.CANCELLED) {
      throw new HttpException(
        { error: 'Reservation not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    const reservation = await this.prisma.reservation.update({
      where: { id },
      data: { status: ReservationStatus.CANCELLED },
      include: { room: true },
    });

    await this.broadcast.publishHotelEvent(
      HotelBroadcastEventType.ReservationCancelled,
      {
        message: 'Hotel reservation cancelled.',
        reservation_id: reservation.id,
        guest_id: reservation.guest_id,
        room_type: reservation.room.type,
        guest_count: reservation.guest_count,
        check_in_day: reservation.check_in_day,
        check_out_day: reservation.check_out_day,
      },
    );

    return {
      id: reservation.id,
      status: reservation.status,
    };
  }
}
