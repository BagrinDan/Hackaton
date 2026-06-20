export type AirportArrivalStatus = 'queued' | 'processing' | 'processed';

export class AirportArrivalResponseDto {
  guestId: string;
  status: AirportArrivalStatus;
  isProcessed: boolean;
  gate: string | null;
  position: number | null;
  queuedAt: number;
  processedAt: number | null;
  waitTimeSeconds: number;
}
