export interface RoomResponseDto {
  id: string;
  type: string;
  capacity: number;
  price_per_night: number;
  current_guests: number;
}

export interface RoomsResponseDto {
  rooms: RoomResponseDto[];
}
