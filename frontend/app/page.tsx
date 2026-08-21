// frontend/app/page.tsx
'use client';

import { useEffect, useState, FormEvent } from 'react';
import { getMovies, searchMovies, Movie } from './services/api';
import { Botao } from './components/ui/Botao';
import { Container } from './components/ui/Container';
import { CartaoFilme } from './components/movies/CartaoFilme';
import { Aviso } from './components/ui/Aviso';
import { Cartao } from './components/ui/Cartao';

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
      <Container className="py-8">
        <section className="mb-8 border-b-2 border-white/10 pb-6">
          <h1 className="text-3xl font-black uppercase tracking-wide text-arcano-main sm:text-4xl">
            Filmes em cartaz
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/55">
            Escolha um filme, veja as sessões disponíveis e reserve seu lugar no
            mapa da sala.
          </p>

          <form
            onSubmit={handleSearch}
            className="mt-6 grid max-w-xl gap-2 sm:grid-cols-[1fr_auto]"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar filme..."
              aria-label="Buscar filme"
              className="min-w-0 border-2 border-white/10 bg-arcano-surface px-4 py-3 text-base text-white placeholder:text-white/30 focus:border-arcano-main focus:outline-none sm:text-sm"
            />
            <Botao type="submit" className="w-full sm:w-auto">
              Buscar
            </Botao>
          </form>
        </section>

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

        {isLoading && (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <Cartao
                key={index}
                className="aspect-[2/3] animate-pulse bg-white/[0.04]"
              />
            ))}
          </div>
        )}

        {!isLoading && error && <Aviso tipo="erro">{error}</Aviso>}

        {!isLoading && !error && movies.length === 0 && (
          <Cartao className="p-6">
            <p className="text-white/60">Nenhum filme encontrado.</p>
          </Cartao>
        )}

        {!isLoading && !error && movies.length > 0 && (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {movies.map((movie) => (
              <CartaoFilme key={movie.id} filme={movie} />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
