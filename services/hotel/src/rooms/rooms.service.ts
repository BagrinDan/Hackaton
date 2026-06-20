import { Injectable } from '@nestjs/common';
import { ReservationStatus } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service';
import { SimulationService } from '../simulation/simulation.service';
import { RoomsResponseDto } from './dto/rooms-response.dto';

@Injectable()
export class RoomsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly simulation: SimulationService,
  ) {}

  async findAll(): Promise<RoomsResponseDto> {
    const currentDay = this.simulation.currentDay();

    const [rooms, occupiedRooms] = await Promise.all([
      this.prisma.room.findMany({
        orderBy: { id: 'asc' },
      }),
      this.prisma.reservation.groupBy({
        by: ['room_id'],
        where: {
          status: ReservationStatus.CONFIRMED,
          check_in_day: { lte: currentDay },
          check_out_day: { gt: currentDay },
        },
        _sum: { guest_count: true },
      }),
    ]);

    const currentGuestsByRoomId = new Map(
      occupiedRooms.map((reservationGroup) => [
        reservationGroup.room_id,
        reservationGroup._sum.guest_count ?? 0,
      ]),
    );

    return {
      rooms: rooms.map((room) => ({
        id: room.id,
        type: room.type,
        capacity: room.capacity,
        price_per_night: room.price_per_night,
        current_guests: currentGuestsByRoomId.get(room.id) ?? 0,
      })),
    };
  }
}
