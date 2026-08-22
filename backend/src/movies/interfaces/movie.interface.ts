// Formato exposto pela nossa API — só os campos que o frontend usa,
// sem repassar o payload bruto do TMDb (evita acoplar o front a um
// formato de terceiro que pode mudar sem aviso).
export interface Movie {
  id: number;
  title: string;
  overview: string;
  posterUrl: string | null;
  releaseDate: string;
  voteAverage: number;
}

export interface MovieDetails extends Movie {
  runtime: number | null;
  genres: string[];
  // Chave do vídeo no YouTube (o que vai em youtube.com/embed/{trailerKey}).
  // null quando o TMDb não tem trailer cadastrado pro filme.
  trailerKey: string | null;
}

// Formato bruto de retorno do TMDb (apenas os campos que consumimos)
export interface TmdbMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
}

export interface TmdbMovieDetails extends TmdbMovie {
  runtime: number | null;
  genres: { id: number; name: string }[];
}

export interface TmdbPaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

// Resposta de GET /movie/{id}/videos
export interface TmdbVideo {
  id: string;
  key: string; // ex: "dQw4w9WgXcQ" — o id do vídeo no YouTube
  name: string;
  site: 'YouTube' | 'Vimeo' | string;
  type: 'Trailer' | 'Teaser' | 'Clip' | 'Featurette' | string;
  official: boolean;
}

export interface TmdbVideosResponse {
  id: number;
  results: TmdbVideo[];
}