// backend/src/reservations/reservations.service.ts

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma, ReservationStatus } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

const RESERVATION_EXPIRATION_MINUTES = 60;
const FALLBACK_DURATION_MINUTES = 120;

@Injectable()
export class ReservationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async create(dto: CreateReservationDto, userId: string) {
    const uniqueSeatIds = [...new Set(dto.seatIds)];

    if (uniqueSeatIds.length !== dto.seatIds.length) {
      throw new BadRequestException('A reserva não pode repetir assentos.');
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const session = await tx.session.findUnique({
          where: { id: dto.sessionId },
          include: { movie: true, room: true },
        });

        if (!session) {
          throw new NotFoundException('Sessão não encontrada.');
        }

        if (session.status !== 'SCHEDULED') {
          throw new BadRequestException('Sessão indisponível para reserva.');
        }

        if (this.getSessionEndTime(session) <= new Date()) {
          throw new BadRequestException('Sessão já encerrada.');
        }

        const seats = await tx.seat.findMany({
          where: {
            id: { in: uniqueSeatIds },
            roomId: session.roomId,
          },
        });

        if (seats.length !== uniqueSeatIds.length) {
          throw new BadRequestException(
            'Um ou mais assentos não pertencem à sala da sessão.',
          );
        }

        await this.releaseExpiredReservations(tx, session.id, uniqueSeatIds);

        const totalAmount = new Prisma.Decimal(session.price).mul(
          uniqueSeatIds.length,
        );

        const reservation = await tx.reservation.create({
          data: {
            sessionId: session.id,
            userId,
            status: ReservationStatus.PENDING,
            seats: {
              create: uniqueSeatIds.map((seatId) => ({
                sessionId: session.id,
                seatId,
              })),
            },
          },
          include: this.reservationInclude(),
        });

        return {
          ...reservation,
          expiresAt: this.getReservationExpirationTime(reservation.createdAt),
          totalAmount,
        };
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Um ou mais assentos já estão reservados para esta sessão.',
        );
      }

      throw error;
    }
  }

  async pay(id: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({
        where: { id },
        include: this.reservationInclude(),
      });

      if (!reservation) {
        throw new NotFoundException('Reserva não encontrada.');
      }

      this.assertReservationOwner(reservation.userId, userId);

      if (reservation.status === ReservationStatus.CONFIRMED) {
        throw new BadRequestException('Reserva já foi paga.');
      }

      if (reservation.status !== ReservationStatus.PENDING) {
        throw new BadRequestException('Reserva não pode ser paga.');
      }

      if (this.isReservationExpired(reservation.createdAt)) {
        await this.expireReservation(tx, reservation.id);
        throw new BadRequestException('Reserva expirada.');
      }

      if (this.getSessionEndTime(reservation.session) <= new Date()) {
        throw new BadRequestException('Sessão já encerrada.');
      }

      const amount = new Prisma.Decimal(reservation.session.price).mul(
        reservation.seats.length,
      );
      const ticketId = randomUUID();

      const ticket = await tx.ticket.create({
        data: {
          id: ticketId,
          reservationId: reservation.id,
          qrToken: await this.createTicketToken(
            ticketId,
            reservation.id,
            reservation.sessionId,
            this.getSessionEndTime(reservation.session),
          ),
        },
      });

      await tx.payment.create({
        data: {
          reservationId: reservation.id,
          status: 'APPROVED',
          amount,
          paidAt: new Date(),
        },
      });

      const confirmedReservation = await tx.reservation.update({
        where: { id: reservation.id },
        data: { status: ReservationStatus.CONFIRMED },
        include: this.reservationInclude(),
      });

      return {
        ...confirmedReservation,
        ticket,
      };
    });
  }

  async findOne(id: string, userId: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: this.reservationInclude(),
    });

    if (!reservation) {
      throw new NotFoundException('Reserva não encontrada.');
    }

    this.assertReservationOwner(reservation.userId, userId);

    if (
      reservation.status === ReservationStatus.PENDING &&
      this.isReservationExpired(reservation.createdAt)
    ) {
      return this.prisma.reservation.update({
        where: { id: reservation.id },
        data: { status: ReservationStatus.EXPIRED },
        include: this.reservationInclude(),
      });
    }

    return reservation;
  }

  async findMine(userId: string) {
    const reservations = await this.prisma.reservation.findMany({
      where: { userId },
      include: this.reservationInclude(),
      orderBy: { createdAt: 'desc' },
    });

    return Promise.all(
      reservations.map(async (reservation) => {
        if (
          reservation.status === ReservationStatus.PENDING &&
          this.isReservationExpired(reservation.createdAt)
        ) {
          return this.prisma.reservation.update({
            where: { id: reservation.id },
            data: { status: ReservationStatus.EXPIRED },
            include: this.reservationInclude(),
          });
        }

        return reservation;
      }),
    );
  }

  async findTicket(ticketId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        reservation: {
          include: {
            session: { include: { movie: true, room: true } },
            seats: {
              include: { seat: true },
              orderBy: [{ seat: { row: 'asc' } }],
            },
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ingresso não encontrado.');
    }

    return ticket;
  }

  private async releaseExpiredReservations(
    tx: Prisma.TransactionClient,
    sessionId: string,
    seatIds: string[],
  ) {
    const expirationLimit = new Date(
      Date.now() - RESERVATION_EXPIRATION_MINUTES * 60_000,
    );

    const expiredReservationSeats = await tx.reservationSeat.findMany({
      where: {
        sessionId,
        seatId: { in: seatIds },
        reservation: {
          status: ReservationStatus.PENDING,
          createdAt: { lt: expirationLimit },
        },
      },
      select: { reservationId: true },
    });

    const expiredReservationIds = [
      ...new Set(expiredReservationSeats.map((seat) => seat.reservationId)),
    ];

    if (expiredReservationIds.length === 0) {
      return;
    }

    await tx.reservationSeat.deleteMany({
      where: { reservationId: { in: expiredReservationIds } },
    });

    await tx.reservation.updateMany({
      where: { id: { in: expiredReservationIds } },
      data: { status: ReservationStatus.EXPIRED },
    });
  }

  private async expireReservation(
    tx: Prisma.TransactionClient,
    reservationId: string,
  ) {
    await tx.reservationSeat.deleteMany({ where: { reservationId } });

    await tx.reservation.update({
      where: { id: reservationId },
      data: { status: ReservationStatus.EXPIRED },
    });
  }

  private async createTicketToken(
    ticketId: string,
    reservationId: string,
    sessionId: string,
    expiresAt: Date,
  ) {
    const secret =
      this.configService.get<string>('TICKET_JWT_SECRET') ??
      this.configService.get<string>('JWT_SECRET');

    if (!secret) {
      throw new Error('TICKET_JWT_SECRET ou JWT_SECRET não configurado.');
    }

    const expiresInSeconds = Math.max(
      1,
      Math.floor((expiresAt.getTime() - Date.now()) / 1000),
    );

    return this.jwtService.signAsync(
      { ticketId, reservationId, sessionId },
      { secret, expiresIn: expiresInSeconds },
    );
  }

  private isReservationExpired(createdAt: Date) {
    return this.getReservationExpirationTime(createdAt) <= new Date();
  }

  private getReservationExpirationTime(createdAt: Date) {
    return new Date(
      createdAt.getTime() + RESERVATION_EXPIRATION_MINUTES * 60_000,
    );
  }

  private getSessionEndTime(session: {
    startTime: Date;
    movie: { durationMinutes: number | null };
  }) {
    const durationMinutes =
      session.movie.durationMinutes ?? FALLBACK_DURATION_MINUTES;
    return new Date(session.startTime.getTime() + durationMinutes * 60_000);
  }

  private assertReservationOwner(reservationUserId: string, userId: string) {
    if (reservationUserId !== userId) {
      throw new ForbiddenException('Reserva pertence a outro usuário.');
    }
  }

  private reservationInclude() {
    return {
      session: { include: { movie: true, room: true } },
      seats: { include: { seat: true } },
      ticket: true,
      payment: true,
    } satisfies Prisma.ReservationInclude;
  }
}
