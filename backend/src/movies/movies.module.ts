import { Module } from '@nestjs/common';
import { MoviesService } from './dto/interfaces/movies.service';
import { MoviesController } from './movies.controller';

@Module({
  controllers: [MoviesController],
  providers: [MoviesService],
})
export class MoviesModule {}