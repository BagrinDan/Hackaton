import { Injectable } from '@nestjs/common';
import { AirportArrivalResponseDto } from './dto/airport-arrival-response.dto';

@Injectable()
export class AirportService {
  private readonly airportServiceUrl = process.env.AIRPORT_SERVICE_URL;

  async hasGuestClearedProcessing(guestId: string): Promise<boolean | null> {
    if (!this.airportServiceUrl) {
      return null;
    }

    try {
      const response = await fetch(
        `${this.airportServiceUrl}/arrivals/${guestId}`,
      );

      if (!response.ok) {
        return null;
      }

      const body = JSON.parse(
        await response.text(),
      ) as AirportArrivalResponseDto;

      return body.isProcessed;
    } catch {
      return null;
    }
  }
}
