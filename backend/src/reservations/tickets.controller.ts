// backend/src/reservations/tickets.controller.ts

import { Controller, Get, Param } from '@nestjs/common';
import { ReservationsService } from './reservations.service';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get(':id')
  findTicket(@Param('id') id: string) {
    return this.reservationsService.findTicket(id);
  }
}
