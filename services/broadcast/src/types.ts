export enum EventType {
  AIRPORT_ARRIVAL = "airport.arrival",

  HOTEL_CONFIRM = "hotel.reservation_confirmed",
  HOTEL_CANCEL = "hotel.reservation_cancelled",

  BEACH_FULL = "beach.activity_full",
  BEACH_AVAILABLE = "beach.activity_available",

  PUBLIC_ANNOUNCEMENT = "public.announcement",
}

export interface IslandEvent {
  id: string;
  type: EventType;
  timestamp: string;
  source: string;
  payload: unknown;
}
