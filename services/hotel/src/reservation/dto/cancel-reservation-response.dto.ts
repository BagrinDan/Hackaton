import { ReservationStatus } from '../../../generated/prisma/client.js';

export interface CancelReservationResponseDto {
  id: string;
  status: ReservationStatus;
}
