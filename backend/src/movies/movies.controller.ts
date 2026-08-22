import { Controller, Get, Param, Query } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { SearchMoviesDto } from './dto/search-movies.dto';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  // Catálogo é público — só a publicação de sessão (POST /sessions,
  // futuramente) exige @Roles('ADMIN'). Ver docs/PROJETO.md.
  @Get()
  findPopular() {
    return this.moviesService.findPopular();
  }

  @Get('search')
  search(@Query() { query }: SearchMoviesDto) {
    return this.moviesService.search(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.moviesService.findOne(id);
  }
}
