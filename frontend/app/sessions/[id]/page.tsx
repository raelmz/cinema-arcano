// frontend/app/sessions/[id]/page.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Aviso } from '../../components/ui/Aviso';
import { Botao } from '../../components/ui/Botao';
import { Cartao } from '../../components/ui/Cartao';
import { Container } from '../../components/ui/Container';
import { useAuth } from '../../context/AuthContext';
import {
  createReservation,
  getSession,
  Reserva,
  Sessao,
} from '../../services/api';

const linhas = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

function rotuloAssento(row: number, number: number) {
  return `${linhas[row - 1] ?? row}${number}`;
}

function resolverPosterSessao(posterPath: string | null) {
  if (!posterPath) return null;
  return posterPath.startsWith('http')
    ? posterPath
    : `${TMDB_IMAGE_BASE_URL}${posterPath}`;
}

export default function SessionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, token, isLoading } = useAuth();
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [assentosSelecionados, setAssentosSelecionados] = useState<string[]>([]);
  const [reserva, setReserva] = useState<Reserva | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function carregarSessao() {
      setCarregando(true);
      setErro('');

      try {
        const resultado = await getSession(params.id);
        setSessao(resultado);
      } catch (error) {
        setErro(
          error instanceof Error ? error.message : 'Erro ao carregar sessão.',
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarSessao();
  }, [params.id]);

  const assentos = useMemo(
    () => [...(sessao?.room.seats ?? [])].sort((a, b) => a.row - b.row || a.number - b.number),
    [sessao],
  );

  const assentosOcupados = useMemo(
    () => new Set(sessao?.occupiedSeatIds ?? []),
    [sessao],
  );

  const assentoPorId = useMemo(() => {
    const mapa = new Map<string, { row: number; number: number }>();
    assentos.forEach((seat) => mapa.set(seat.id, seat));
    return mapa;
  }, [assentos]);

  const chipsSelecionados = useMemo(
    () =>
      assentosSelecionados
        .map((id) => {
          const seat = assentoPorId.get(id);
          return seat ? { id, rotulo: rotuloAssento(seat.row, seat.number) } : null;
        })
        .filter((chip): chip is { id: string; rotulo: string } => chip !== null)
        .sort((a, b) => a.rotulo.localeCompare(b.rotulo)),
    [assentosSelecionados, assentoPorId],
  );

  const total = sessao ? Number(sessao.price) * assentosSelecionados.length : 0;
  const posterSessao = sessao ? resolverPosterSessao(sessao.movie.posterPath) : null;

  const etapaAtual: 1 | 2 | 3 = reserva ? 3 : assentosSelecionados.length > 0 ? 2 : 1;

  function alternarAssento(seatId: string) {
    if (assentosOcupados.has(seatId) || reserva) {
      return;
    }

    setAssentosSelecionados((atuais) =>
      atuais.includes(seatId)
        ? atuais.filter((id) => id !== seatId)
        : [...atuais, seatId],
    );
  }

  function limparSelecao() {
    if (reserva) return;
    setAssentosSelecionados([]);
  }

  async function reservarAssentos() {
    setErro('');

    if (!token || user?.role !== 'CUSTOMER') {
      setErro('Entre como cliente para reservar assentos.');
      return;
    }

    if (!sessao || assentosSelecionados.length === 0) {
      setErro('Selecione pelo menos um assento.');
      return;
    }

    setProcessando(true);

    try {
      const novaReserva = await createReservation(token, {
        sessionId: sessao.id,
        seatIds: assentosSelecionados,
      });
      setReserva(novaReserva);
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao criar reserva.');
    } finally {
      setProcessando(false);
    }
  }

  return (
    <Container className="py-8">
      <Link href="/" className="text-sm text-white/50 hover:text-arcano-main">
        ← Voltar para o catálogo
      </Link>

      {carregando && (
        <Cartao className="mt-8 p-6">
          <p className="animate-pulse font-mono text-sm uppercase tracking-wide text-white/50">
            Carregando sessão...
          </p>
        </Cartao>
      )}

      {!carregando && erro && (
        <div className="mt-6">
          <Aviso tipo="erro">{erro}</Aviso>
        </div>
      )}

      {!carregando && sessao && (
        <>
          <ol className="mt-6 flex items-center gap-2 overflow-x-auto pb-1 sm:gap-4">
            {[
              { n: 1, rotulo: 'Assentos' },
              { n: 2, rotulo: 'Reserva' },
              { n: 3, rotulo: 'Pagamento' },
            ].map((etapa, index) => (
              <li key={etapa.n} className="flex flex-shrink-0 items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-7 w-7 flex-shrink-0 items-center justify-center border-2 font-mono text-xs font-black ${
                      etapaAtual >= etapa.n
                        ? 'border-arcano-main bg-arcano-main text-arcano-bg'
                        : 'border-white/20 text-white/40'
                    }`}
                  >
                    {etapa.n}
                  </span>
                  <span
                    className={`whitespace-nowrap font-mono text-xs uppercase tracking-widest ${
                      etapaAtual >= etapa.n ? 'text-white' : 'text-white/35'
                    }`}
                  >
                    {etapa.rotulo}
                  </span>
                </div>
                {index < 2 && (
                  <span
                    className={`h-0.5 w-6 flex-shrink-0 sm:w-10 ${
                      etapaAtual > etapa.n ? 'bg-arcano-main' : 'bg-white/15'
                    }`}
                  />
                )}
              </li>
            ))}
          </ol>

          <div className="mt-6 flex flex-col gap-2 border-2 border-arcano-sec bg-arcano-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="break-words text-lg font-black uppercase leading-tight text-arcano-main">
              {sessao.movie.title}
            </p>
            <p className="font-mono text-xs uppercase tracking-widest text-white/60">
              {sessao.room.name} ·{' '}
              {new Intl.DateTimeFormat('pt-BR', {
                dateStyle: 'short',
                timeStyle: 'short',
              }).format(new Date(sessao.startTime))}
            </p>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
            <section>
              <Cartao className="p-5">
                <div className="mb-6 border-2 border-arcano-main bg-arcano-main py-2 text-center text-sm font-black uppercase tracking-[0.35em] text-arcano-bg">
                  Tela
                </div>

                <div className="grid gap-3">
                  {Array.from({ length: sessao.room.rows }).map((_, rowIndex) => {
                    const row = rowIndex + 1;
                    const seatsInRow = assentos.filter((seat) => seat.row === row);

                    return (
                      <div key={row} className="grid grid-cols-[24px_1fr] gap-2 sm:grid-cols-[28px_1fr] sm:gap-3">
                        <span className="flex items-center text-sm font-bold text-white/50">
                          {linhas[rowIndex] ?? row}
                        </span>
                        <div
                          className="grid gap-1.5 sm:gap-2"
                          style={{
                            gridTemplateColumns: `repeat(${sessao.room.seatsPerRow}, minmax(0, 1fr))`,
                          }}
                        >
                          {seatsInRow.map((seat) => {
                            const ocupado = assentosOcupados.has(seat.id);
                            const selecionado = assentosSelecionados.includes(seat.id);
                            const rotulo = rotuloAssento(seat.row, seat.number);

                            return (
                              <button
                                key={seat.id}
                                type="button"
                                disabled={ocupado || Boolean(reserva)}
                                aria-pressed={selecionado}
                                onClick={() => alternarAssento(seat.id)}
                                className={`aspect-square min-h-9 border-2 text-xs font-black transition-all duration-150 ease-out ${
                                  ocupado
                                    ? 'cursor-not-allowed border-white/10 bg-white/10 text-white/25'
                                    : selecionado
                                      ? 'border-arcano-main bg-arcano-main text-arcano-bg shadow-[0_0_12px_2px_rgba(255,213,79,0.55)]'
                                      : 'border-white/20 bg-arcano-bg text-white hover:-translate-y-0.5 hover:border-arcano-main'
                                }`}
                                title={rotulo}
                              >
                                {seat.number}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 flex flex-wrap gap-4 border-t-2 border-white/10 pt-4 text-xs text-white/50">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 border-2 border-white/20" /> Livre
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 border-2 border-arcano-main bg-arcano-main shadow-[0_0_8px_1px_rgba(255,213,79,0.55)]" />{' '}
                    Selecionado
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 border-2 border-white/10 bg-white/10" />{' '}
                    Ocupado
                  </span>
                </div>
              </Cartao>
            </section>

            <Cartao destaque className="h-fit p-6 lg:sticky lg:top-24">
              <div className="flex items-start justify-between gap-3 border-b-2 border-arcano-sec pb-3">
                <h2 className="text-xl font-black uppercase tracking-wide text-arcano-main">
                  Resumo
                </h2>
                {assentosSelecionados.length > 0 && !reserva && (
                  <button
                    type="button"
                    onClick={limparSelecao}
                    className="font-mono text-[10px] uppercase tracking-widest text-white/40 hover:text-red-300"
                  >
                    Limpar
                  </button>
                )}
              </div>

              <div className="mt-5 flex gap-4">
                {posterSessao && (
                  <div className="relative h-24 w-16 flex-shrink-0 border-2 border-white/10 bg-black/30">
                    <Image
                      src={posterSessao}
                      alt={sessao.movie.title}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="break-words text-base font-black leading-tight text-white">
                    {sessao.movie.title}
                  </p>
                  <p className="mt-1 font-mono text-xs uppercase tracking-widest text-white/45">
                    {sessao.room.name}
                  </p>
                  <p className="mt-1 text-xs text-white/45">
                    {new Intl.DateTimeFormat('pt-BR', {
                      dateStyle: 'full',
                      timeStyle: 'short',
                    }).format(new Date(sessao.startTime))}
                  </p>
                </div>
              </div>

              <div className="mt-5 border-t-2 border-white/10 pt-4">
                <p className="font-mono text-xs uppercase tracking-widest text-white/40">
                  Assentos ({chipsSelecionados.length})
                </p>
                {chipsSelecionados.length === 0 ? (
                  <p className="mt-2 text-sm text-white/40">Nenhum assento selecionado.</p>
                ) : (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {chipsSelecionados.map((chip) => (
                      <span
                        key={chip.id}
                        className="border-2 border-arcano-main px-2 py-0.5 font-mono text-xs font-bold text-arcano-main"
                      >
                        {chip.rotulo}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-5 flex items-center justify-between border-t-2 border-white/10 pt-4">
                <span className="font-mono text-xs uppercase tracking-widest text-white/40">
                  Total
                </span>
                <span className="text-2xl font-black text-arcano-main">
                  {formatarMoeda(total)}
                </span>
              </div>

              {!isLoading && user?.role !== 'CUSTOMER' && (
                <div className="mt-5">
                  <Aviso tipo="info">
                    Entre como cliente para reservar esta sessão.
                  </Aviso>
                </div>
              )}

              {reserva ? (
                <div className="mt-5 space-y-4">
                  <Aviso tipo="sucesso">
                    Reserva criada. Os assentos ficam travados por 1 hora.
                  </Aviso>
                  <Botao
                    type="button"
                    variante="secundario"
                    className="w-full"
                    disabled={processando}
                    onClick={() => router.push(`/reservations/${reserva.id}/payment`)}
                  >
                    Ir para pagamento
                  </Botao>
                </div>
              ) : (
                <Botao
                  type="button"
                  variante="secundario"
                  className="mt-6 w-full"
                  disabled={processando || assentosSelecionados.length === 0}
                  onClick={reservarAssentos}
                >
                  {processando ? 'Reservando...' : 'Reservar assentos'}
                </Botao>
              )}
            </Cartao>
          </div>
        </>
      )}
    </Container>
  );
}
