"use client";

import { useEffect, useState, useRef, useMemo, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { getMovies, searchMovies, getSessions, Movie, Sessao } from "./services/api";
import { Botao } from "./components/ui/Botao";
import { Container } from "./components/ui/Container";
import { CartaoFilme } from "./components/movies/CartaoFilme";
import { CartaoSessao } from "./components/movies/CartaoSessao";
import {
  FiltrosFilmes,
  filtrosPadrao,
  aplicarFiltros,
  type FiltrosState,
} from "./components/movies/FiltrosFilmes";
import { Aviso } from "./components/ui/Aviso";
import { Cartao } from "./components/ui/Cartao";
import { AvisoBackendAcordando } from "./components/ui/AvisoBackendAcordando";

const HERO_INTERVALO_MS = 2000;
const HERO_QTD_DESTAQUES = 5;
const TMDB_IMAGE_BASE_W780 = "https://image.tmdb.org/t/p/w780";

function resolverPosterHero(posterPath: string | null) {
  if (!posterPath) return null;
  return posterPath.startsWith("http")
    ? posterPath
    : `${TMDB_IMAGE_BASE_W780}${posterPath}`;
}

export default function Home() {
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [isLoadingSessoes, setIsLoadingSessoes] = useState(true);
  const [errorSessoes, setErrorSessoes] = useState<string | null>(null);

  const [movies, setMovies] = useState<Movie[]>([]);
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<FiltrosState>(filtrosPadrao);

  const [heroIndex, setHeroIndex] = useState(0);
  const [mostrarAvisoColdStart, setMostrarAvisoColdStart] = useState(false);
  const heroPausado = useRef(false);

  useEffect(() => {
    loadSessoes();
    loadPopular();
  }, []);

  useEffect(() => {
    if (!isLoading && !isLoadingSessoes) {
      queueMicrotask(() => setMostrarAvisoColdStart(false));
      return;
    }

    const timerId = window.setTimeout(() => {
      setMostrarAvisoColdStart(true);
    }, 3500);

    return () => window.clearTimeout(timerId);
  }, [isLoading, isLoadingSessoes]);

  async function loadSessoes() {
    setIsLoadingSessoes(true);
    setErrorSessoes(null);
    try {
      const data = await getSessions();
      const agora = Date.now();
      const disponiveis = data.filter(
        (s) => s.status === "SCHEDULED" && new Date(s.startTime).getTime() > agora,
      );
      setSessoes(disponiveis);
    } catch (err) {
      setErrorSessoes(err instanceof Error ? err.message : "Erro ao carregar sessões.");
    } finally {
      setIsLoadingSessoes(false);
    }
  }

  async function loadPopular() {
    setIsLoading(true);
    setError(null);
    setActiveQuery(null);
    setFiltros(filtrosPadrao);
    try {
      const data = await getMovies();
      setMovies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar filmes.");
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
    setFiltros(filtrosPadrao);

    try {
      const data = await searchMovies(trimmed);
      setMovies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar filmes.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleClearSearch() {
    setQuery("");
    loadPopular();
  }

  const heroDestaques = sessoes.slice(0, HERO_QTD_DESTAQUES);
  const heroIndexAtual = heroDestaques.length > 0 && heroIndex < heroDestaques.length
    ? heroIndex
    : 0;
  const sessaoDestaque = heroDestaques[heroIndexAtual] ?? null;

  const tmdbIdsComSessao = useMemo(
    () => new Set(sessoes.map((s) => s.movie.tmdbId)),
    [sessoes],
  );
  const moviesSemSessao = useMemo(
    () => movies.filter((m) => !tmdbIdsComSessao.has(m.id)),
    [movies, tmdbIdsComSessao],
  );
  const filmesFiltrados = useMemo(
    () => aplicarFiltros(moviesSemSessao, filtros),
    [moviesSemSessao, filtros],
  );

  useEffect(() => {
    if (heroDestaques.length <= 1) return;

    const intervalId = setInterval(() => {
      if (heroPausado.current) return;
      setHeroIndex((prev) => (prev + 1) % heroDestaques.length);
    }, HERO_INTERVALO_MS);

    return () => clearInterval(intervalId);
  }, [heroDestaques.length]);

  function irParaHero(index: number) {
    setHeroIndex(index);
  }

  function heroAnterior() {
    setHeroIndex((prev) => (prev - 1 + heroDestaques.length) % heroDestaques.length);
  }

  function heroProximo() {
    setHeroIndex((prev) => (prev + 1) % heroDestaques.length);
  }

  return (
    <div className="flex flex-1 flex-col pb-16">
      {sessaoDestaque && !isLoadingSessoes && (
        <section
          className="relative flex h-80 w-full items-center overflow-hidden border-b-4 border-arcano-sec bg-black md:h-88 lg:h-96"
          onMouseEnter={() => (heroPausado.current = true)}
          onMouseLeave={() => (heroPausado.current = false)}
        >
          <div className="absolute inset-0 opacity-40">
            {heroDestaques.map((sessao, index) => {
              const posterHero = resolverPosterHero(sessao.movie.posterPath);

              return posterHero ? (
                <Image
                  key={sessao.id}
                  src={posterHero}
                  alt={sessao.movie.title}
                  fill
                  sizes="100vw"
                  className={`scale-105 object-cover blur-md transition-opacity duration-1000 ease-in-out ${
                    index === heroIndex ? "opacity-100" : "opacity-0"
                  }`}
                  priority={index === 0}
                />
              ) : null;
            })}
            <div className="absolute inset-0 bg-linear-to-t from-arcano-bg via-arcano-bg/80 to-transparent" />
          </div>

          <Container className="relative z-10 flex flex-col items-center text-center lg:items-start lg:text-left">
            <div key={sessaoDestaque.id} className="flex flex-col items-center lg:items-start" style={{ animation: "hero-fade-in 0.6s ease-out" }}>
              <span className="mb-3 inline-block border-2 border-arcano-main bg-arcano-main px-3 py-1 font-mono text-sm font-bold uppercase tracking-widest text-arcano-bg shadow-[4px_4px_0_#7b1fa2]">
                Sessão Confirmada
              </span>
              <h1 className="mb-3 line-clamp-2 max-w-4xl text-4xl font-black uppercase tracking-tight text-white drop-shadow-[4px_4px_0_#7b1fa2] md:text-5xl lg:text-6xl">
                {sessaoDestaque.movie.title}
              </h1>
              <p className="mb-6 font-mono text-sm uppercase tracking-widest text-arcano-main">
                {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(sessaoDestaque.startTime))}
                {" · "}{sessaoDestaque.room.name}
                {" · "}
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(sessaoDestaque.price))}
              </p>
              <Link href={`/sessions/${sessaoDestaque.id}`}>
                <Botao
                  variante="primario"
                  className="px-8 py-3 text-lg shadow-[6px_6px_0_#7b1fa2]"
                >
                  Reservar Ingresso
                </Botao>
              </Link>
            </div>

            {heroDestaques.length > 1 && (
              <div className="mt-6 flex items-center gap-6">
                <button type="button" onClick={heroAnterior} aria-label="Sessão anterior" className="flex h-9 w-9 items-center justify-center border-2 border-white/30 text-white/70 transition-all hover:-translate-y-0.5 hover:border-arcano-main hover:text-arcano-main">‹</button>
                <div className="flex items-center gap-2">
                  {heroDestaques.map((sessao, index) => (
                    <button
                      key={sessao.id}
                      type="button"
                      onClick={() => irParaHero(index)}
                      aria-label={`Ir para sessão ${sessao.movie.title}`}
                      className={`h-2.5 border-2 border-arcano-main transition-all duration-300 ${
                        index === heroIndex ? "w-8 bg-arcano-main" : "w-2.5 bg-transparent opacity-60 hover:opacity-100"
                      }`}
                    />
                  ))}
                </div>
                <button type="button" onClick={heroProximo} aria-label="Próxima sessão" className="flex h-9 w-9 items-center justify-center border-2 border-white/30 text-white/70 transition-all hover:-translate-y-0.5 hover:border-arcano-main hover:text-arcano-main">›</button>
              </div>
            )}
          </Container>
        </section>
      )}

      <Container className="pt-12">
        {mostrarAvisoColdStart && (isLoading || isLoadingSessoes) && (
          <div className="mb-10">
            <AvisoBackendAcordando />
          </div>
        )}

        <section className="mb-14">
          <h2 className="mb-8 text-3xl font-black uppercase text-white drop-shadow-[2px_2px_0_#7b1fa2]">
            Sessões Disponíveis
          </h2>

          {isLoadingSessoes && (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:gap-8">
              {Array.from({ length: 5 }).map((_, index) => (
                <Cartao key={index} className="aspect-2/3 animate-pulse border-white/10 bg-linear-to-br from-arcano-sec/20 via-white/5 to-arcano-main/10" />
              ))}
            </div>
          )}

          {!isLoadingSessoes && errorSessoes && <Aviso tipo="erro">{errorSessoes}</Aviso>}

          {!isLoadingSessoes && !errorSessoes && sessoes.length === 0 && (
            <Cartao className="p-12 text-center border-dashed border-white/20">
              <p className="text-white/60 font-mono text-lg uppercase">
                Nenhuma sessão publicada no momento.
              </p>
            </Cartao>
          )}

          {!isLoadingSessoes && !errorSessoes && sessoes.length > 0 && (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:gap-8">
              {sessoes.map((sessao) => (
                <CartaoSessao key={sessao.id} sessao={sessao} />
              ))}
            </div>
          )}
        </section>

        <div className="mb-14 flex items-center gap-4">
          <div className="h-px flex-1 bg-white/10" />
          <span className="whitespace-nowrap font-mono text-xs uppercase tracking-widest text-white/40">
            sem sessão marcada ainda
          </span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <section>
          <div className="mb-8 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-3xl font-black uppercase text-white/70">
                Explorar Catálogo
              </h2>
              <p className="font-mono text-xs uppercase tracking-widest text-white/40">
                filmes sem sessão publicada — sugira ao organizador
              </p>
            </div>

            <form onSubmit={handleSearch} className="flex w-full max-w-md border-2 border-white/15 bg-arcano-surface/60 sm:flex-row">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar no catálogo..."
                aria-label="Buscar filme no catálogo"
                className="flex-1 bg-transparent px-4 py-2 font-mono text-sm text-white placeholder:text-white/40 focus:outline-none"
              />
              <button type="submit" className="bg-white/10 px-5 py-2 text-xs font-bold uppercase tracking-widest text-white/70 hover:bg-white/20">
                Buscar
              </button>
            </form>
          </div>

          {activeQuery && !isLoading && (
            <p className="mb-6 text-sm font-mono uppercase text-white/50">
              Resultados para &ldquo;<span className="text-white/80 font-bold">{activeQuery}</span>&rdquo;{" "}
              <button onClick={handleClearSearch} className="ml-3 text-arcano-sec hover:text-white underline decoration-2 underline-offset-4">
                limpar
              </button>
            </p>
          )}

          {isLoading && (
            <div className="grid grid-cols-2 gap-6 opacity-60 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:gap-8">
              {Array.from({ length: 10 }).map((_, index) => (
                <Cartao key={index} className="aspect-2/3 animate-pulse border-white/10 bg-white/5" />
              ))}
            </div>
          )}

          {!isLoading && error && <Aviso tipo="erro">{error}</Aviso>}

          {!isLoading && !error && moviesSemSessao.length > 0 && (
            <FiltrosFilmes filmes={moviesSemSessao} filtros={filtros} onChange={setFiltros} />
          )}

          {!isLoading && !error && moviesSemSessao.length === 0 && (
            <Cartao className="p-12 text-center border-dashed border-white/20">
              <p className="text-white/60 font-mono text-lg uppercase">
                {movies.length > 0
                  ? "Todos os filmes encontrados já têm sessão publicada."
                  : "O grimório não encontrou rituais."}
              </p>
            </Cartao>
          )}

          {!isLoading && !error && filmesFiltrados.length > 0 && (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:gap-8">
              {filmesFiltrados.map((movie) => (
                <div key={movie.id} className="group relative opacity-70 grayscale-[30%] transition-all duration-300 hover:opacity-100 hover:grayscale-0">
                  <span className="pointer-events-none absolute right-2 top-2 z-10 border border-white/30 bg-black/70 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-white/70">
                    Sem sessão
                  </span>
                  <CartaoFilme filme={movie} />
                </div>
              ))}
            </div>
          )}
        </section>
      </Container>
    </div>
  );
}
