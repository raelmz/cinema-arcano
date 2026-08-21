// backend/src/sessions/sessions.service.ts

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MoviesService } from '../movies/movies.service';
import { CreateSessionDto } from './dto/create-session.dto';

// Fallback usado só para calcular o horário de término de uma sessão
// quando o filme não tem duração cadastrada no TMDb (durationMinutes
// é opcional no schema). Necessário pra validação de conflito de horário
// (decisão 4.32) não quebrar nesse caso. Não é persistido em lugar nenhum.
const FALLBACK_DURATION_MINUTES = 120;

@Injectable()
export class SessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly moviesService: MoviesService,
  ) {}

  async create(dto: CreateSessionDto, organizerId: string) {
    // dto.movieId chega como o id do TMDB (é o que /movies expõe hoje —
    // MoviesService é um proxy puro do TMDB, não persiste nada localmente).
    // Aqui garantimos que existe um Movie local correspondente antes de
    // usar seu id (uuid) como FK de Session.
    const movie = await this.findOrCreateLocalMovie(dto.movieId);

    const room = await this.getSingleRoom();

    const startTime = new Date(dto.startTime);
    const durationMinutes = movie.durationMinutes ?? FALLBACK_DURATION_MINUTES;
    const endTime = this.addMinutes(startTime, durationMinutes);

    await this.assertNoConflict(room.id, startTime, endTime);

    return this.prisma.session.create({
      data: {
        movieId: movie.id,
        roomId: room.id,
        organizerId,
        startTime,
        price: dto.price,
      },
      include: { movie: true, room: true },
    });
  }

  // Busca o Movie local pelo tmdbId; se não existir ainda, consulta o TMDB
  // (via MoviesService) e persiste um registro local. tmdbId é @unique no
  // schema, então o upsert é seguro mesmo sob concorrência.
  private async findOrCreateLocalMovie(tmdbIdRaw: string) {
    const tmdbId = Number(tmdbIdRaw);

    if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
      throw new BadRequestException('movieId inválido.');
    }

    const existing = await this.prisma.movie.findUnique({
      where: { tmdbId },
    });

    if (existing) {
      return existing;
    }

    // findOne lança NotFoundException se o TMDB não conhecer esse id —
    // propaga naturalmente pro cliente.
    const details = await this.moviesService.findOne(tmdbIdRaw);

    return this.prisma.movie.upsert({
      where: { tmdbId },
      update: {},
      create: {
        tmdbId,
        title: details.title,
        posterPath: details.posterUrl,
        overview: details.overview,
        durationMinutes: details.runtime ?? null,
        releaseDate: details.releaseDate ? new Date(details.releaseDate) : null,
      },
    });
  }

  // Só sessões futuras e não canceladas são visíveis publicamente
  // (decisões 4.32 — sessões futuras / 4.33 — CANCELLED some da vitrine).
  async findAllPublic() {
    const sessions = await this.prisma.session.findMany({
      where: {
        status: 'SCHEDULED',
        startTime: { gte: new Date() },
      },
      include: { movie: true, room: true },
      orderBy: { startTime: 'asc' },
    });

    return sessions.map((session) => this.withComputedStatus(session));
  }

  async findOne(id: string) {
    const session = await this.prisma.session.findUnique({
      where: { id },
      include: { movie: true, room: true },
    });

    if (!session) {
      throw new NotFoundException('Sessão não encontrada.');
    }

    return this.withComputedStatus(session);
  }

  // Cancelamento não deleta a linha (decisão 4.33) — preserva Reservation/
  // ReservationSeat já existentes e libera o horário pra validação de conflito.
  async cancel(id: string) {
    const session = await this.prisma.session.findUnique({ where: { id } });

    if (!session) {
      throw new NotFoundException('Sessão não encontrada.');
    }

    if (session.status === 'CANCELLED') {
      throw new BadRequestException('Sessão já está cancelada.');
    }

    return this.prisma.session.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: { movie: true, room: true },
    });
  }

  private async getSingleRoom() {
    const room = await this.prisma.room.findFirst();

    if (!room) {
      throw new NotFoundException(
        'Nenhuma sala cadastrada. Rode o seed antes de criar sessões.',
      );
    }

    return room;
  }

  private async assertNoConflict(
    roomId: string,
    startTime: Date,
    endTime: Date,
  ) {
    const existingSessions = await this.prisma.session.findMany({
      where: {
        roomId,
        status: { not: 'CANCELLED' }, // decisão 4.33
      },
      include: { movie: true },
    });

    const hasConflict = existingSessions.some((existing) => {
      const existingDuration =
        existing.movie.durationMinutes ?? FALLBACK_DURATION_MINUTES;
      const existingEnd = this.addMinutes(
        existing.startTime,
        existingDuration,
      );

      // Sobreposição de intervalos: [startTime, endTime) x [existing.startTime, existingEnd)
      return startTime < existingEnd && existing.startTime < endTime;
    });

    if (hasConflict) {
      throw new ConflictException(
        'Já existe uma sessão marcada nesse horário para a sala.',
      );
    }
  }

  private addMinutes(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * 60_000);
  }

  // FINISHED nunca é persistido (decisão 4.33) — é calculado on-the-fly
  // aqui, comparando o horário atual com o fim estimado da sessão.
  private withComputedStatus<
    T extends { status: string; startTime: Date; movie: { durationMinutes: number | null } },
  >(session: T) {
    if (session.status !== 'SCHEDULED') {
      return session;
    }

    const durationMinutes =
      session.movie.durationMinutes ?? FALLBACK_DURATION_MINUTES;
    const endTime = this.addMinutes(session.startTime, durationMinutes);

    if (endTime < new Date()) {
      return { ...session, status: 'FINISHED' as const };
    }

    return session;
  }
}