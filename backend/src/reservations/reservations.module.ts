// backend/src/reservations/reservations.module.ts

import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { TicketsController } from './tickets.controller';

@Module({
  imports: [AuthModule],
  controllers: [ReservationsController, TicketsController],
  providers: [ReservationsService],
})
export class ReservationsModule {}
