import { RoomType } from '../../generated/prisma/client.js';

export enum HotelBroadcastEventType {
  ReservationConfirmed = 'hotel.reservation_confirmed',
  ReservationCancelled = 'hotel.reservation_cancelled',
}

export interface HotelBroadcastEvent {
  message: string;
  reservation_id: string;
  guest_id: string;
  room_type: RoomType;
  guest_count: number;
  check_in_day: number;
  check_out_day: number;
}
