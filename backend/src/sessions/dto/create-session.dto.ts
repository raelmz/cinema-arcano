// backend/src/sessions/dto/create-session.dto.ts

import { IsDateString, IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateSessionDto {
  @IsString()
  @IsNotEmpty()
  movieId: string;

  // Sala única (decisão 4.31) — não é o organizador quem escolhe a sala,
  // por isso não há campo roomId aqui; o SessionsService resolve
  // automaticamente a sala única existente.
  @IsDateString()
  startTime: string;

  @IsNumber()
  @IsPositive()
  price: number;
}