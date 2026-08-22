import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Movie,
  MovieDetails,
  TmdbMovie,
  TmdbMovieDetails,
  TmdbPaginatedResponse,
  TmdbVideo,
  TmdbVideosResponse,
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
    // Detalhes e trailer são chamadas separadas no TMDb — buscamos as duas
    // em paralelo pra não dobrar a latência. Se o trailer falhar ou não
    // existir, o filme ainda deve carregar normalmente (ver findTrailerKey).
    const [data, trailerKey] = await Promise.all([
      this.fetchTmdb<TmdbMovieDetails>(`/movie/${id}`, { language: 'pt-BR' }),
      this.findTrailerKey(id),
    ]);

    return this.mapMovieDetails(data, trailerKey);
  }

  private async findTrailerKey(id: string): Promise<string | null> {
    // Vídeos em pt-BR costumam vir vazios no TMDb pra maioria dos filmes;
    // por isso essa chamada não usa language, pegando o catálogo padrão
    // (geralmente en-US), que tem cobertura bem maior de trailers.
    const data = await this.fetchTmdb<TmdbVideosResponse>(
      `/movie/${id}/videos`,
    ).catch(() => null);

    if (!data || data.results.length === 0) {
      return null;
    }

    const trailers = data.results.filter(
      (video) => video.site === 'YouTube' && video.type === 'Trailer',
    );

    if (trailers.length === 0) {
      return null;
    }

    // Prioriza o trailer oficial quando existe mais de um.
    const oficial = trailers.find((video) => video.official);
    return (oficial ?? trailers[0]).key;
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

  private mapMovieDetails(
    movie: TmdbMovieDetails,
    trailerKey: string | null,
  ): MovieDetails {
    return {
      ...this.mapMovie(movie),
      runtime: movie.runtime,
      genres: movie.genres.map((genre) => genre.name),
      trailerKey,
    };
  }
}