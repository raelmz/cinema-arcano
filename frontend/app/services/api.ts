// frontend/app/services/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function login(data: any) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Credenciais inválidas');
  }

  return response.json();
}

export async function getMe(token: string) {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Não foi possível carregar os dados do usuário.');
  }

  return response.json();
}

export async function registerUser(data: any) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erro ao criar conta. Tente novamente.');
  }

  return response.json();
}

// --- Catálogo ---
// Mesmo formato devolvido pelo MoviesService (backend/src/movies/movies.service.ts)

export type Movie = {
  id: number;
  title: string;
  overview: string;
  posterUrl: string | null;
  releaseDate: string;
  voteAverage: number;
};

export type MovieDetails = Movie & {
  runtime: number;
  genres: string[];
};

export async function getMovies(): Promise<Movie[]> {
  const response = await fetch(`${API_URL}/movies`);

  if (!response.ok) {
    throw new Error('Não foi possível carregar os filmes em cartaz.');
  }

  return response.json();
}

export async function searchMovies(query: string): Promise<Movie[]> {
  const response = await fetch(
    `${API_URL}/movies/search?query=${encodeURIComponent(query)}`,
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Não foi possível buscar filmes.');
  }

  return response.json();
}

export async function getMovieDetails(id: string): Promise<MovieDetails> {
  const response = await fetch(`${API_URL}/movies/${id}`);

  if (response.status === 404) {
    throw new Error('Filme não encontrado.');
  }

  if (!response.ok) {
    throw new Error('Não foi possível carregar os detalhes do filme.');
  }

  return response.json();
}