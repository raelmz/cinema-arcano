// frontend/app/reservations/page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AcessoRestrito } from '../components/ui/AcessoRestrito';
import { Aviso } from '../components/ui/Aviso';
import { Cartao } from '../components/ui/Cartao';
import { Container } from '../components/ui/Container';
import { useAuth } from '../context/AuthContext';
import { getMyReservations, type Reserva } from '../services/api';

const labelsStatus = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmada',
  CANCELLED: 'Cancelada',
  EXPIRED: 'Expirada',
};

function formatarData(data: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(data));
}

function formatarAssentos(reserva: Reserva) {
  return reserva.seats
    .map((item) => `${String.fromCharCode(64 + item.seat.row)}${item.seat.number}`)
    .join(', ');
}

function calcularTotal(reserva: Reserva) {
  return Number(reserva.session.price) * reserva.seats.length;
}

export default function ReservationsPage() {
  const { user, token, isLoading } = useAuth();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  async function carregarReservas() {
    if (!token) return;

    setCarregando(true);
    setErro('');

    try {
      const resultado = await getMyReservations(token);
      setReservas(resultado);
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao carregar reservas.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    async function carregarReservasIniciais() {
      await carregarReservas();
    }

    if (!token || user?.role !== 'CUSTOMER') {
      return;
    }

    carregarReservasIniciais();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user]);

  if (isLoading || user?.role !== 'CUSTOMER') {
    return isLoading ? (
      <Container className="py-10">
        <p className="text-white/50">Verificando acesso...</p>
      </Container>
    ) : (
      <AcessoRestrito
        titulo="Ingressos protegidos"
        mensagem="Entre com uma conta de cliente para ver reservas e tickets."
      />
    );
  }

  return (
    <Container className="py-8">
      <section className="mb-8 border-b-2 border-white/10 pb-6">
        <p className="font-mono text-sm uppercase tracking-wide text-arcano-main">
          Cliente
        </p>
        <h1 className="mt-2 text-3xl font-black uppercase tracking-wide text-white md:text-5xl">
          Meus ingressos
        </h1>
      </section>

      {erro && (
        <div className="mb-5">
          <Aviso tipo="erro">{erro}</Aviso>
        </div>
      )}

      {carregando && <p className="text-white/50">Carregando reservas...</p>}

      {!carregando && reservas.length === 0 && (
        <Cartao className="p-6">
          <p className="text-white/60">
            Você ainda não tem reservas. Escolha uma sessão no catálogo para
            iniciar o ritual.
          </p>
        </Cartao>
      )}

      <div className="grid gap-4">
        {reservas.map((reserva) => (
          <Cartao key={reserva.id} className="p-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="border-2 border-white/15 px-2 py-1 font-mono text-xs uppercase text-white/55">
                    {labelsStatus[reserva.status]}
                  </span>
                  {reserva.payment && (
                    <span className="border-2 border-arcano-main px-2 py-1 font-mono text-xs uppercase text-arcano-main">
                      Pagamento {reserva.payment.status}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-black text-white">
                  {reserva.session.movie.title}
                </h2>
                <p className="mt-1 text-sm text-white/55">
                  {formatarData(reserva.session.startTime)} · {reserva.session.room.name}
                </p>
                <p className="mt-2 font-mono text-xs uppercase text-white/40">
                  Assentos: {formatarAssentos(reserva)}
                </p>
              </div>

              <div className="min-w-48 border-2 border-white/10 p-4">
                <p className="font-mono text-xs uppercase text-white/40">
                  Total
                </p>
                <p className="mt-1 text-2xl font-black text-arcano-main">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(calcularTotal(reserva))}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {reserva.ticket ? (
                  <Link
                    href={`/tickets/${reserva.ticket.id}`}
                    className="border-2 border-arcano-main bg-arcano-main px-4 py-3 text-sm font-bold uppercase tracking-wide text-arcano-bg hover:bg-arcano-ter"
                  >
                    Abrir ticket
                  </Link>
                ) : reserva.status === 'PENDING' ? (
                  <Link
                    href={`/reservations/${reserva.id}/payment`}
                    className="border-2 border-arcano-sec bg-arcano-sec px-4 py-3 text-sm font-bold uppercase tracking-wide text-white hover:border-arcano-main hover:bg-arcano-main hover:text-arcano-bg"
                  >
                    Pagar
                  </Link>
                ) : (
                  <span className="border-2 border-white/10 px-4 py-3 text-sm font-bold uppercase tracking-wide text-white/35">
                    Sem ticket
                  </span>
                )}
              </div>
            </div>
          </Cartao>
        ))}
      </div>
    </Container>
  );
}
