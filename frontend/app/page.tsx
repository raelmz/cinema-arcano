// frontend/app/page.tsx
'use client';

import { useEffect, useState, FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getMovies, searchMovies, Movie } from './services/api';

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPopular();
  }, []);

  async function loadPopular() {
    setIsLoading(true);
    setError(null);
    setActiveQuery(null);
    try {
      const data = await getMovies();
      setMovies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar filmes.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();

    if (!trimmed) {
      loadPopular();
      return;
    }

    setIsLoading(true);
    setError(null);
    setActiveQuery(trimmed);

    try {
      const data = await searchMovies(trimmed);
      setMovies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar filmes.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleClearSearch() {
    setQuery('');
    loadPopular();
  }

  return (
    <div className="flex flex-1 flex-col bg-arcano-bg">
      <header className="border-b border-white/10 px-6 py-8 sm:px-12">
        <h1 className="text-3xl font-bold tracking-tight text-arcano-main sm:text-4xl">
          Cinema Arcano
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Sessões e ingressos para os filmes em cartaz
        </p>

        <form onSubmit={handleSearch} className="mt-6 flex max-w-md gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar filme..."
            aria-label="Buscar filme"
            className="flex-1 rounded-md border border-white/10 bg-arcano-surface px-4 py-2 text-sm text-white placeholder:text-white/30 focus:border-arcano-main focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-md bg-arcano-main px-4 py-2 text-sm font-semibold text-arcano-bg transition-colors hover:bg-arcano-ter"
          >
            Buscar
          </button>
        </form>
      </header>

      <main className="flex-1 px-6 py-8 sm:px-12">
        {activeQuery && !isLoading && (
          <p className="mb-4 text-sm text-white/50">
            Resultados para &ldquo;{activeQuery}&rdquo;{' '}
            <button
              onClick={handleClearSearch}
              className="ml-1 text-arcano-main hover:underline"
            >
              limpar busca
            </button>
          </p>
        )}

        {isLoading && <p className="text-white/50">Carregando...</p>}

        {!isLoading && error && <p className="text-red-400">{error}</p>}

        {!isLoading && !error && movies.length === 0 && (
          <p className="text-white/50">Nenhum filme encontrado.</p>
        )}

        {!isLoading && !error && movies.length > 0 && (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {movies.map((movie) => (
              <Link
                key={movie.id}
                href={`/movies/${movie.id}`}
                className="group flex flex-col overflow-hidden rounded-lg bg-arcano-surface transition-transform hover:-translate-y-1"
              >
                <div className="relative aspect-[2/3] w-full bg-black/30">
                  {movie.posterUrl ? (
                    <Image
                      src={movie.posterUrl}
                      alt={movie.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-2 text-center text-xs text-white/30">
                      Sem pôster
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h2 className="line-clamp-2 text-sm font-medium text-white group-hover:text-arcano-main">
                    {movie.title}
                  </h2>
                  <p className="mt-1 text-xs text-white/40">
                    {movie.releaseDate ? movie.releaseDate.slice(0, 4) : '—'} · ⭐{' '}
                    {movie.voteAverage.toFixed(1)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}