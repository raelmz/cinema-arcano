// frontend/app/services/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export type Usuario = {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER' | 'GATE';
};

type LoginData = {
  email: string;
  password: string;
};

type RegisterData = {
  name: string;
  email: string;
  password: string;
};

type LoginResponse = {
  accessToken: string;
};

export async function login(data: LoginData): Promise<LoginResponse> {
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

export async function registerUser(data: RegisterData): Promise<Usuario> {
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

export type Sessao = {
  id: string;
  movieId: string;
  roomId: string;
  organizerId: string;
  startTime: string;
  price: string;
  status: 'SCHEDULED' | 'CANCELLED' | 'FINISHED';
  movie: {
    id: string;
    tmdbId: number;
    title: string;
    posterPath: string | null;
    overview: string | null;
    durationMinutes: number | null;
    releaseDate: string | null;
  };
  room: {
    id: string;
    name: string;
    rows: number;
    seatsPerRow: number;
    seats?: Assento[];
  };
  occupiedSeatIds?: string[];
};

export type SessaoAdministrativa = Sessao & {
  reservationsCount: number;
  reservedSeatsCount: number;
  soldSeatsCount: number;
};

export type Assento = {
  id: string;
  roomId: string;
  row: number;
  number: number;
};

export type Reserva = {
  id: string;
  sessionId: string;
  userId: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED';
  createdAt: string;
  expiresAt?: string;
  totalAmount?: string;
  session: Sessao;
  user?: Usuario;
  seats: Array<{
    id: string;
    reservationId: string;
    sessionId: string;
    seatId: string;
    seat: Assento;
  }>;
  ticket: Ingresso | null;
  payment: {
    id: string;
    reservationId: string;
    status: 'PENDING' | 'APPROVED' | 'FAILED';
    amount: string;
    method: string;
    paidAt: string | null;
    createdAt: string;
  } | null;
};

export type Ingresso = {
  id: string;
  reservationId: string;
  qrToken: string;
  status: 'VALID' | 'USED' | 'CANCELLED';
  usedAt: string | null;
  createdAt: string;
};

export type IngressoPublico = Ingresso & {
  reservation: Reserva;
};

export type ResultadoValidacao =
  | 'VALID'
  | 'INVALID'
  | 'ALREADY_USED'
  | 'WRONG_EVENT';

export type ValidacaoPortaria = {
  result: ResultadoValidacao;
  message: string;
  ticket?: IngressoPublico;
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

export async function createSession(
  token: string,
  data: { movieId: string; startTime: string; price: number },
): Promise<Sessao> {
  const response = await fetch(`${API_URL}/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Não foi possível criar a sessão.');
  }

  return response.json();
}

export async function getSessions(): Promise<Sessao[]> {
  const response = await fetch(`${API_URL}/sessions`);

  if (!response.ok) {
    throw new Error('Não foi possível carregar as sessões.');
  }

  return response.json();
}

export async function getAdminSessions(
  token: string,
): Promise<SessaoAdministrativa[]> {
  const response = await fetch(`${API_URL}/sessions/admin/mine`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Não foi possível carregar suas sessões.');
  }

  return response.json();
}

export async function getSession(id: string): Promise<Sessao> {
  const response = await fetch(`${API_URL}/sessions/${id}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Não foi possível carregar a sessão.');
  }

  return response.json();
}

export async function cancelSession(
  token: string,
  sessionId: string,
): Promise<Sessao> {
  const response = await fetch(`${API_URL}/sessions/${sessionId}/cancel`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Não foi possível cancelar a sessão.');
  }

  return response.json();
}

export async function createReservation(
  token: string,
  data: { sessionId: string; seatIds: string[] },
): Promise<Reserva> {
  const response = await fetch(`${API_URL}/reservations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Não foi possível criar a reserva.');
  }

  return response.json();
}

export async function payReservation(
  token: string,
  reservationId: string,
  data: { method?: 'CARD' | 'PIX'; simulateFailure?: boolean } = {},
): Promise<Reserva & { ticket: Ingresso | null }> {
  const response = await fetch(`${API_URL}/reservations/${reservationId}/pay`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Não foi possível confirmar o pagamento.');
  }

  return response.json();
}

export async function getReservation(
  token: string,
  reservationId: string,
): Promise<Reserva> {
  const response = await fetch(`${API_URL}/reservations/${reservationId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Não foi possível carregar a reserva.');
  }

  return response.json();
}

export async function getMyReservations(token: string): Promise<Reserva[]> {
  const response = await fetch(`${API_URL}/reservations/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Não foi possível carregar suas reservas.');
  }

  return response.json();
}

export async function getTicket(id: string): Promise<IngressoPublico> {
  const response = await fetch(`${API_URL}/tickets/${id}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Não foi possível carregar o ingresso.');
  }

  return response.json();
}

export async function validateTicket(
  token: string,
  data: { qrToken: string; sessionId?: string },
): Promise<ValidacaoPortaria> {
  const response = await fetch(`${API_URL}/gate/validate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Não foi possível validar o ingresso.');
  }

  return response.json();
}
