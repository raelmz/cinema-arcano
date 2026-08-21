// backend/src/sessions/sessions.module.ts

import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { AuthModule } from '../auth/auth.module';
import { MoviesModule } from '../movies/movies.module';

@Module({
  // AuthModule exporta JwtAuthGuard/RolesGuard, usadas em POST e PATCH aqui.
  // MoviesModule é necessário pro SessionsService fazer upsert do Movie
  // local a partir do tmdbId (ver findOrCreateLocalMovie em sessions.service.ts).
  imports: [AuthModule, MoviesModule],
  controllers: [SessionsController],
  providers: [SessionsService],
})
export class SessionsModule {}