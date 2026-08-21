// backend/src/gate/gate.service.ts

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma, TicketStatus, ValidationResult } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ValidateTicketDto } from './dto/validate-ticket.dto';

type TicketPayload = {
  ticketId: string;
  reservationId: string;
  sessionId: string;
};

@Injectable()
export class GateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validate(dto: ValidateTicketDto, gateUserId: string) {
    const payload = await this.verifyTicketToken(dto.qrToken);

    if (!payload) {
      await this.createValidationLog(null, ValidationResult.INVALID, gateUserId);

      return {
        result: ValidationResult.INVALID,
        message: 'Ingresso inválido ou expirado.',
      };
    }

    const ticket = await this.prisma.ticket.findUnique({
      where: { id: payload.ticketId },
      include: {
        reservation: {
          include: {
            session: { include: { movie: true, room: true } },
            seats: {
              include: { seat: true },
              orderBy: [{ seat: { row: 'asc' } }, { seat: { number: 'asc' } }],
            },
            user: true,
          },
        },
      },
    });

    if (!ticket || ticket.qrToken !== dto.qrToken) {
      await this.createValidationLog(null, ValidationResult.INVALID, gateUserId);

      return {
        result: ValidationResult.INVALID,
        message: 'Ingresso inválido.',
      };
    }

    if (dto.sessionId && dto.sessionId !== ticket.reservation.sessionId) {
      await this.createValidationLog(
        ticket.id,
        ValidationResult.WRONG_EVENT,
        gateUserId,
      );

      return {
        result: ValidationResult.WRONG_EVENT,
        message: 'Ingresso pertence a outra sessão.',
        ticket,
      };
    }

    if (ticket.status !== TicketStatus.VALID) {
      const result =
        ticket.status === TicketStatus.USED
          ? ValidationResult.ALREADY_USED
          : ValidationResult.INVALID;

      await this.createValidationLog(
        ticket.id,
        result,
        gateUserId,
      );

      return {
        result,
        message:
          result === ValidationResult.ALREADY_USED
            ? 'Ingresso já utilizado.'
            : 'Ingresso cancelado ou indisponível.',
        ticket,
      };
    }

    const validation = await this.prisma.$transaction(async (tx) => {
      const updatedCount = await tx.ticket.updateMany({
        where: { id: ticket.id, status: TicketStatus.VALID },
        data: { status: TicketStatus.USED, usedAt: new Date() },
      });

      if (updatedCount.count === 0) {
        await tx.validationLog.create({
          data: {
            ticketId: ticket.id,
            result: ValidationResult.ALREADY_USED,
            gateUserId,
          },
        });

        const alreadyUsedTicket = await tx.ticket.findUniqueOrThrow({
          where: { id: ticket.id },
          include: this.ticketInclude(),
        });

        return {
          result: ValidationResult.ALREADY_USED,
          ticket: alreadyUsedTicket,
        };
      }

      await tx.validationLog.create({
        data: {
          ticketId: ticket.id,
          result: ValidationResult.VALID,
          gateUserId,
        },
      });

      const validatedTicket = await tx.ticket.findUniqueOrThrow({
        where: { id: ticket.id },
        include: this.ticketInclude(),
      });

      return {
        result: ValidationResult.VALID,
        ticket: validatedTicket,
      };
    });

    if (validation.result === ValidationResult.ALREADY_USED) {
      return {
        result: ValidationResult.ALREADY_USED,
        message: 'Ingresso já utilizado.',
        ticket: validation.ticket,
      };
    }

    return {
      result: ValidationResult.VALID,
      message: 'Ingresso válido. Entrada liberada.',
      ticket: validation.ticket,
    };
  }

  private async verifyTicketToken(qrToken: string): Promise<TicketPayload | null> {
    const secret =
      this.configService.get<string>('TICKET_JWT_SECRET') ??
      this.configService.get<string>('JWT_SECRET');

    if (!secret) {
      return null;
    }

    try {
      return await this.jwtService.verifyAsync<TicketPayload>(qrToken, {
        secret,
      });
    } catch {
      return null;
    }
  }

  private createValidationLog(
    ticketId: string | null,
    result: ValidationResult,
    gateUserId: string,
  ) {
    return this.prisma.validationLog.create({
      data: {
        ticketId,
        result,
        gateUserId,
      },
    });
  }

  private ticketInclude() {
    return {
      reservation: {
        include: {
          session: { include: { movie: true, room: true } },
          seats: {
            include: { seat: true },
            orderBy: [{ seat: { row: 'asc' } }, { seat: { number: 'asc' } }],
          },
          user: true,
        },
      },
    } satisfies Prisma.TicketInclude;
  }
}
