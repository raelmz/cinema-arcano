import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Movie,
  MovieDetails,
  TmdbMovie,
  TmdbMovieDetails,
  TmdbPaginatedResponse,
} from './interfaces/movie.interface';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

@Injectable()
export class MoviesService {
  private readonly apiKey: string;

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.getOrThrow<string>('TMDB_API_KEY');
  }

  async findPopular(): Promise<Movie[]> {
    const data = await this.fetchTmdb<TmdbPaginatedResponse<TmdbMovie>>(
      '/movie/popular',
      { language: 'pt-BR' },
    );

    return data.results.map((movie) => this.mapMovie(movie));
  }

  async search(query: string): Promise<Movie[]> {
    const data = await this.fetchTmdb<TmdbPaginatedResponse<TmdbMovie>>(
      '/search/movie',
      { query, language: 'pt-BR' },
    );

    return data.results.map((movie) => this.mapMovie(movie));
  }

  async findOne(id: string): Promise<MovieDetails> {
    const data = await this.fetchTmdb<TmdbMovieDetails>(`/movie/${id}`, {
      language: 'pt-BR',
    });

    return this.mapMovieDetails(data);
  }

  private async fetchTmdb<T>(
    path: string,
    params: Record<string, string> = {},
  ): Promise<T> {
    const url = new URL(`${TMDB_BASE_URL}${path}`);
    url.searchParams.set('api_key', this.apiKey);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }

    const response = await fetch(url.toString());

    if (response.status === 404) {
      throw new NotFoundException('Filme não encontrado.');
    }

    if (!response.ok) {
      throw new InternalServerErrorException(
        'Erro ao consultar o catálogo de filmes.',
      );
    }

    return response.json();
  }

  private mapMovie(movie: TmdbMovie): Movie {
    return {
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      posterUrl: movie.poster_path
        ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`
        : null,
      releaseDate: movie.release_date,
      voteAverage: movie.vote_average,
    };
  }

  private mapMovieDetails(movie: TmdbMovieDetails): MovieDetails {
    return {
      ...this.mapMovie(movie),
      runtime: movie.runtime,
      genres: movie.genres.map((genre) => genre.name),
    };
  }
}