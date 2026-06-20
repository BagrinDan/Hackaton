import {
  ReservationStatus,
  RoomType,
} from '../../../generated/prisma/client.js';

export interface ReservationResponseDto {
  id: string;
  guest_id: string;
  room_id: string;
  room_type: RoomType;
  guest_count: number;
  check_in_day: number;
  check_out_day: number;
  status: ReservationStatus;
}
