// backend/src/sessions/sessions.controller.ts

import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  // Primeiro uso "real" de @Roles fora de teste — só o organizador publica
  // sessão (ver docs/PROJETO.md, seção sobre módulo Catálogo).
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateSessionDto, @Req() req: Request) {
    const organizerId = (req['user'] as { sub: string }).sub;
    return this.sessionsService.create(dto, organizerId);
  }

  // Pública — só sessões futuras e não canceladas (decisões 4.32/4.33).
  @Get()
  findAllPublic() {
    return this.sessionsService.findAllPublic();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sessionsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.sessionsService.cancel(id);
  }
}