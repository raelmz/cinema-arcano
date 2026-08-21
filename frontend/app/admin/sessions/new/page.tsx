// frontend/app/admin/sessions/new/page.tsx
'use client';

import { FormEvent, useEffect, useState } from 'react';
import Image from 'next/image';
import { useAuth } from '../../../context/AuthContext';
import {
  createSession,
  getMovies,
  Movie,
  searchMovies,
  Sessao,
} from '../../../services/api';
import { Aviso } from '../../../components/ui/Aviso';
import { AcessoRestrito } from '../../../components/ui/AcessoRestrito';
import { Botao } from '../../../components/ui/Botao';
import { CampoTexto } from '../../../components/ui/CampoTexto';
import { Cartao } from '../../../components/ui/Cartao';
import { Container } from '../../../components/ui/Container';

export default function NovaSessaoPage() {
  const { user, token, isLoading } = useAuth();
  const [filmes, setFilmes] = useState<Movie[]>([]);
  const [filmeSelecionado, setFilmeSelecionado] = useState<Movie | null>(null);
  const [busca, setBusca] = useState('');
  const [dataHora, setDataHora] = useState('');
  const [preco, setPreco] = useState('');
  const [carregandoFilmes, setCarregandoFilmes] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState<Sessao | null>(null);

  useEffect(() => {
    carregarPopulares();
  }, []);

  async function carregarPopulares() {
    setCarregandoFilmes(true);
    setErro('');

    try {
      const resultado = await getMovies();
      setFilmes(resultado.slice(0, 8));
    } catch (error) {
      setErro(
        error instanceof Error ? error.message : 'Erro ao carregar filmes.',
      );
    } finally {
      setCarregandoFilmes(false);
    }
  }

  async function buscarFilmes(event: FormEvent) {
    event.preventDefault();
    const termo = busca.trim();

    if (!termo) {
      carregarPopulares();
      return;
    }

    setCarregandoFilmes(true);
    setErro('');

    try {
      const resultado = await searchMovies(termo);
      setFilmes(resultado.slice(0, 8));
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao buscar filmes.');
    } finally {
      setCarregandoFilmes(false);
    }
  }

  async function criarSessao(event: FormEvent) {
    event.preventDefault();
    setErro('');
    setSucesso(null);

    if (!token) {
      setErro('Sessão expirada. Faça login novamente.');
      return;
    }

    if (!filmeSelecionado) {
      setErro('Escolha um filme para criar a sessão.');
      return;
    }

    if (!dataHora) {
      setErro('Informe data e horário da sessão.');
      return;
    }

    const precoNumerico = Number(preco.replace(',', '.'));
    if (!Number.isFinite(precoNumerico) || precoNumerico <= 0) {
      setErro('Informe um preço válido.');
      return;
    }

    setSalvando(true);

    try {
      const sessao = await createSession(token, {
        movieId: String(filmeSelecionado.id),
        startTime: new Date(dataHora).toISOString(),
        price: precoNumerico,
      });

      setSucesso(sessao);
      setDataHora('');
      setPreco('');
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao criar sessão.');
    } finally {
      setSalvando(false);
    }
  }

  if (isLoading || user?.role !== 'ADMIN') {
    return isLoading ? (
      <Container className="py-10">
        <p className="text-white/50">Verificando acesso...</p>
      </Container>
    ) : (
      <AcessoRestrito
        titulo="Criação de sessão"
        mensagem="Entre com uma conta de organizador para publicar novas sessões."
      />
    );
  }

  return (
    <Container className="py-8">
      <section className="mb-8 border-b-2 border-white/10 pb-6">
        <h1 className="text-3xl font-black uppercase tracking-wide text-arcano-main">
          Nova sessão
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-white/55">
          Escolha um filme do catálogo, defina horário e preço, e publique a
          próxima sessão da sala.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Cartao className="p-5">
          <form
            onSubmit={buscarFilmes}
            className="mb-5 grid gap-2 sm:grid-cols-[1fr_auto]"
          >
            <input
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Buscar filme..."
              aria-label="Buscar filme"
              className="min-w-0 border-2 border-white/10 bg-arcano-bg px-4 py-3 text-base text-white placeholder:text-white/30 focus:border-arcano-main focus:outline-none sm:text-sm"
            />
            <Botao type="submit" className="w-full sm:w-auto">
              Buscar
            </Botao>
          </form>

          {carregandoFilmes && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <Cartao
                  key={index}
                  className="aspect-[2/3] animate-pulse bg-white/[0.04]"
                />
              ))}
            </div>
          )}

          {!carregandoFilmes && filmes.length === 0 && (
            <p className="text-sm text-white/50">Nenhum filme encontrado.</p>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {filmes.map((filme) => {
              const selecionado = filmeSelecionado?.id === filme.id;

              return (
                <button
                  key={filme.id}
                  type="button"
                  onClick={() => setFilmeSelecionado(filme)}
                  className={`border-2 bg-arcano-bg text-left transition-colors ${
                    selecionado
                      ? 'border-arcano-main'
                      : 'border-white/10 hover:border-arcano-main'
                  }`}
                >
                  <div className="relative aspect-[2/3] bg-black/30">
                    {filme.posterUrl ? (
                      <Image
                        src={filme.posterUrl}
                        alt={filme.title}
                        fill
                        sizes="(max-width: 640px) 50vw, 160px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-white/30">
                        Sem pôster
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="line-clamp-2 text-xs font-bold leading-snug text-white">
                      {filme.title}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </Cartao>

        <Cartao destaque className="h-fit p-6">
          <h2 className="mb-5 border-b-2 border-arcano-sec pb-2 text-xl font-black uppercase tracking-wide text-arcano-main">
            Publicar horário
          </h2>

          {erro && (
            <div className="mb-5">
              <Aviso tipo="erro">{erro}</Aviso>
            </div>
          )}

          {sucesso && (
            <div className="mb-5">
              <Aviso tipo="sucesso">
                Sessão criada para {sucesso.movie.title}.
              </Aviso>
            </div>
          )}

          {filmeSelecionado ? (
            <div className="mb-5 border-2 border-white/10 bg-arcano-bg p-3">
              <p className="text-xs uppercase tracking-wide text-white/40">
                Filme selecionado
              </p>
              <p className="mt-1 font-bold text-white">
                {filmeSelecionado.title}
              </p>
            </div>
          ) : (
            <p className="mb-5 text-sm text-white/50">
              Selecione um filme na lista ao lado.
            </p>
          )}

          <form onSubmit={criarSessao} className="space-y-5">
            <CampoTexto
              id="dataHora"
              type="datetime-local"
              label="Data e horário"
              value={dataHora}
              onChange={(event) => setDataHora(event.target.value)}
            />

            <CampoTexto
              id="preco"
              type="number"
              min="1"
              step="0.01"
              label="Preço"
              placeholder="35.50"
              value={preco}
              onChange={(event) => setPreco(event.target.value)}
            />

            <Botao
              type="submit"
              variante="secundario"
              className="w-full"
              disabled={salvando}
            >
              {salvando ? 'Publicando...' : 'Criar sessão'}
            </Botao>
          </form>
        </Cartao>
      </div>
    </Container>
  );
}
