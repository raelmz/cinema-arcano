// backend/src/reservations/dto/create-reservation.dto.ts

import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class CreateReservationDto {
  @IsString()
  sessionId: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  seatIds: string[];
}
