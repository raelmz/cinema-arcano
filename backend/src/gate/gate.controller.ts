// backend/src/gate/gate.controller.ts

import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ValidateTicketDto } from './dto/validate-ticket.dto';
import { GateService } from './gate.service';

@Controller('gate')
export class GateController {
  constructor(private readonly gateService: GateService) {}

  @Post('validate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GATE', 'ADMIN')
  validate(@Body() dto: ValidateTicketDto, @Req() req) {
    return this.gateService.validate(dto, req.user.sub);
  }
}
