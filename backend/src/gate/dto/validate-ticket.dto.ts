// backend/src/gate/dto/validate-ticket.dto.ts

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ValidateTicketDto {
  @IsString()
  @IsNotEmpty()
  qrToken: string;

  @IsOptional()
  @IsString()
  sessionId?: string;
}
