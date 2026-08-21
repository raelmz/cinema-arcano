// frontend/app/sessions/[id]/page.tsx
'use client';

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
  payReservation,
  Reserva,
  Sessao,
} from '../../services/api';

const linhas = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

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

  const total = sessao
    ? Number(sessao.price) * assentosSelecionados.length
    : 0;

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

  async function pagarReserva() {
    setErro('');

    if (!token || !reserva) {
      setErro('Reserva não encontrada para pagamento.');
      return;
    }

    setProcessando(true);

    try {
      const reservaPaga = await payReservation(token, reserva.id);
      router.push(`/tickets/${reservaPaga.ticket.id}`);
    } catch (error) {
      setErro(
        error instanceof Error ? error.message : 'Erro ao confirmar pagamento.',
      );
    } finally {
      setProcessando(false);
    }
  }

  return (
    <Container className="py-8">
      <Link href="/" className="text-sm text-white/50 hover:text-arcano-main">
        ← Voltar para o catálogo
      </Link>

      {carregando && <p className="mt-8 text-white/50">Carregando sessão...</p>}

      {!carregando && erro && (
        <div className="mt-6">
          <Aviso tipo="erro">{erro}</Aviso>
        </div>
      )}

      {!carregando && sessao && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <section>
            <h1 className="text-3xl font-black uppercase tracking-wide text-arcano-main">
              {sessao.movie.title}
            </h1>
            <p className="mt-2 text-sm text-white/55">
              {new Intl.DateTimeFormat('pt-BR', {
                dateStyle: 'full',
                timeStyle: 'short',
              }).format(new Date(sessao.startTime))}{' '}
              · {sessao.room.name}
            </p>

            <Cartao className="mt-6 p-5">
              <div className="mb-6 border-2 border-arcano-main bg-arcano-main py-2 text-center text-sm font-black uppercase tracking-[0.35em] text-arcano-bg">
                Tela
              </div>

              <div className="grid gap-3">
                {Array.from({ length: sessao.room.rows }).map((_, rowIndex) => {
                  const row = rowIndex + 1;
                  const seatsInRow = assentos.filter((seat) => seat.row === row);

                  return (
                    <div key={row} className="grid grid-cols-[28px_1fr] gap-3">
                      <span className="flex items-center text-sm font-bold text-white/50">
                        {linhas[rowIndex] ?? row}
                      </span>
                      <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                        {seatsInRow.map((seat) => {
                          const ocupado = assentosOcupados.has(seat.id);
                          const selecionado = assentosSelecionados.includes(seat.id);

                          return (
                            <button
                              key={seat.id}
                              type="button"
                              disabled={ocupado || Boolean(reserva)}
                              onClick={() => alternarAssento(seat.id)}
                              className={`aspect-square border-2 text-xs font-black transition-colors ${
                                ocupado
                                  ? 'cursor-not-allowed border-white/10 bg-white/10 text-white/25'
                                  : selecionado
                                    ? 'border-arcano-main bg-arcano-main text-arcano-bg'
                                    : 'border-white/20 bg-arcano-bg text-white hover:border-arcano-main'
                              }`}
                              title={`${linhas[rowIndex] ?? row}${seat.number}`}
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

              <div className="mt-6 flex flex-wrap gap-3 text-xs text-white/50">
                <span className="inline-flex items-center gap-2">
                  <span className="h-3 w-3 border-2 border-white/20" /> Livre
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-3 w-3 border-2 border-arcano-main bg-arcano-main" />{' '}
                  Selecionado
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-3 w-3 border-2 border-white/10 bg-white/10" />{' '}
                  Ocupado
                </span>
              </div>
            </Cartao>
          </section>

          <Cartao destaque className="h-fit p-6">
            <h2 className="border-b-2 border-arcano-sec pb-2 text-xl font-black uppercase tracking-wide text-arcano-main">
              Reserva
            </h2>

            <div className="mt-5 space-y-3 text-sm text-white/70">
              <p>
                Assentos:{' '}
                <strong className="text-white">
                  {assentosSelecionados.length || 'nenhum'}
                </strong>
              </p>
              <p>
                Valor:{' '}
                <strong className="text-arcano-main">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(total)}
                </strong>
              </p>
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
                  onClick={pagarReserva}
                >
                  {processando ? 'Confirmando...' : 'Pagar agora'}
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
      )}
    </Container>
  );
}
