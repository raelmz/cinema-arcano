// backend/src/reservations/dto/pay-reservation.dto.ts

import { IsBoolean, IsIn, IsOptional } from 'class-validator';

export class PayReservationDto {
  @IsOptional()
  @IsIn(['CARD', 'PIX'])
  method?: 'CARD' | 'PIX';

  @IsOptional()
  @IsBoolean()
  simulateFailure?: boolean;
}
