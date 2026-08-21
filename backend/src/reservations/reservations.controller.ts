// backend/src/reservations/reservations.controller.ts

import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationsService } from './reservations.service';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CUSTOMER')
  @Post()
  create(@Body() dto: CreateReservationDto, @Req() req: Request) {
    const userId = (req['user'] as { sub: string }).sub;
    return this.reservationsService.create(dto, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CUSTOMER')
  @Post(':id/pay')
  pay(@Param('id') id: string, @Req() req: Request) {
    const userId = (req['user'] as { sub: string }).sub;
    return this.reservationsService.pay(id, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CUSTOMER')
  @Get('me')
  findMine(@Req() req: Request) {
    const userId = (req['user'] as { sub: string }).sub;
    return this.reservationsService.findMine(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CUSTOMER')
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    const userId = (req['user'] as { sub: string }).sub;
    return this.reservationsService.findOne(id, userId);
  }
}
