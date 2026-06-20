import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationService } from './reservation.service';

@Controller('reservation')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post()
  create(@Body() createReservationDto: CreateReservationDto) {
    return this.reservationService.create(createReservationDto);
  }

  @Get('by-guest/:guest_id')
  findActiveByGuestId(@Param('guest_id') guestId: string) {
    return this.reservationService.findActiveByGuestId(guestId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.reservationService.findById(id);
  }

  @Delete(':id')
  cancel(@Param('id') id: string) {
    return this.reservationService.cancel(id);
  }
}
