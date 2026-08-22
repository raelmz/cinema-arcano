// frontend/app/tickets/[id]/page.tsx
'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Aviso } from '../../components/ui/Aviso';
import { Botao } from '../../components/ui/Botao';
import { Cartao } from '../../components/ui/Cartao';
import { Container } from '../../components/ui/Container';
import { getTicket, type IngressoPublico } from '../../services/api';

type StatusIngresso = IngressoPublico['status'];

const selosStatus: Record<
  StatusIngresso,
  { label: string; className: string }
> = {
  VALID: {
    label: 'Válido',
    className: 'border-emerald-400/70 bg-emerald-500/10 text-emerald-300',
  },
  USED: {
    label: 'Utilizado',
    className: 'border-amber-400/70 bg-amber-500/10 text-amber-300',
  },
  CANCELLED: {
    label: 'Cancelado',
    className: 'border-red-500/70 bg-red-500/10 text-red-300',
  },
};

const carimbos: Partial<Record<StatusIngresso, { texto: string; className: string }>> = {
  USED: {
    texto: 'Utilizado',
    className: 'border-amber-400/80 bg-amber-500/15 text-amber-200',
  },
  CANCELLED: {
    texto: 'Cancelado',
    className: 'border-red-500/80 bg-red-600/15 text-red-200',
  },
};

function formatarData(data: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date(data));
}

function formatarAssentos(ticket: IngressoPublico) {
  return ticket.reservation.seats
    .map((item) => `${String.fromCharCode(64 + item.seat.row)}${item.seat.number}`)
    .join(' · ');
}

export default function TicketPage() {
  const params = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<IngressoPublico | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [linkCopiado, setLinkCopiado] = useState(false);

  useEffect(() => {
    async function carregarIngresso() {
      setIsLoading(true);
      setErro('');
      try {
        const resultado = await getTicket(params.id);
        setTicket(resultado);
      } catch (error) {
        setErro(error instanceof Error ? error.message : 'Não foi possível invocar este ingresso.');
      } finally {
        setIsLoading(false);
      }
    }

    carregarIngresso();
  }, [params.id]);

  useEffect(() => {
    if (!ticket) return;

    QRCode.toDataURL(ticket.qrToken, {
      margin: 0,
      width: 320,
    })
      .then(setQrDataUrl)
      .catch(() => setErro('Não foi possível gerar o QR Code deste ingresso.'));
  }, [ticket]);

  async function compartilharLink() {
    if (typeof window === 'undefined') return;

    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopiado(true);
      setTimeout(() => setLinkCopiado(false), 2000);
    } catch {
      return;
    }
  }

  return (
    <Container className="py-10">
      <Link href="/reservations" className="text-sm text-white/50 hover:text-arcano-main">
        ← Voltar para meus ingressos
      </Link>

      <section className="mt-6 mb-8 border-b-2 border-white/10 pb-6">
        <span className="mb-3 inline-block border-2 border-arcano-sec bg-arcano-sec/20 px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest text-white/80">
          Canhoto de Ingresso
        </span>
      </section>

      {isLoading && (
        <Cartao className="mx-auto max-w-3xl p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-40 bg-white/10" />
            <div className="h-8 w-2/3 bg-white/10" />
            <div className="grid gap-6 md:grid-cols-[1fr_240px]">
              <div className="h-32 bg-white/10" />
              <div className="aspect-square bg-white/10" />
            </div>
          </div>
        </Cartao>
      )}

      {!isLoading && erro && (
        <Cartao className="mx-auto max-w-3xl p-8">
          <Aviso tipo="erro">{erro}</Aviso>
          <p className="mt-4 text-sm text-white/50">
            O grimório não encontrou este ritual. Verifique o link ou volte
            para seus ingressos.
          </p>
        </Cartao>
      )}

      {!isLoading && !erro && ticket && (
        <div className="mx-auto max-w-3xl">
          <Cartao destaque className="relative overflow-hidden p-0">
            {carimbos[ticket.status] && (
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute left-1/2 top-1/2 z-20 w-[140%] -translate-x-1/2 -translate-y-1/2 rotate-[-10deg] border-y-4 py-2 text-center font-mono text-2xl font-black uppercase tracking-[0.35em] backdrop-blur-[1px] sm:text-3xl ${carimbos[ticket.status]!.className}`}
              >
                {carimbos[ticket.status]!.texto}
              </div>
            )}

            <div className="grid md:grid-cols-[1fr_260px]">
              <div className="p-6 sm:p-8">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span
                    className={`border-2 px-2 py-1 font-mono text-xs font-bold uppercase tracking-widest ${selosStatus[ticket.status].className}`}
                  >
                    {selosStatus[ticket.status].label}
                  </span>
                  <span className="border-2 border-white/10 px-2 py-1 font-mono text-xs uppercase tracking-widest text-white/40">
                    Código {ticket.id.slice(0, 8)}
                  </span>
                </div>

                <h1 className="mb-2 break-words text-2xl font-bold leading-tight text-white sm:text-3xl">
                  {ticket.reservation.session.movie.title}
                </h1>

                <p className="text-sm text-white/60">
                  {formatarData(ticket.reservation.session.startTime)}
                </p>
                <p className="mt-1 text-sm text-white/60">
                  {ticket.reservation.session.room.name}
                </p>

                <div className="mt-6 grid grid-cols-2 gap-4 border-t-2 border-white/10 pt-6 sm:max-w-xs">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-white/35">
                      Assentos
                    </p>
                    <p className="mt-1 font-mono text-base font-bold text-arcano-main">
                      {formatarAssentos(ticket)}
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-white/35">
                      Portador
                    </p>
                    <p className="mt-1 truncate text-sm text-white/70">
                      {ticket.reservation.user?.name ?? '—'}
                    </p>
                  </div>
                </div>

                {ticket.usedAt && (
                  <p className="mt-6 font-mono text-xs uppercase tracking-wide text-white/35">
                    Utilizado em {formatarData(ticket.usedAt)}
                  </p>
                )}
              </div>

              <div className="relative border-t-4 border-dashed border-white/20 md:border-l-4 md:border-t-0">
                <div className="flex h-full flex-col items-center justify-center gap-4 p-6 sm:p-8">
                  <div className="relative border-4 border-arcano-main bg-arcano-bg p-3 shadow-[0_0_24px_4px_rgba(255,213,79,0.35)]">
                    <div className="absolute -left-1 -top-1 h-4 w-4 border-l-4 border-t-4 border-arcano-sec" />
                    <div className="absolute -right-1 -top-1 h-4 w-4 border-r-4 border-t-4 border-arcano-sec" />
                    <div className="absolute -bottom-1 -left-1 h-4 w-4 border-b-4 border-l-4 border-arcano-sec" />
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 border-b-4 border-r-4 border-arcano-sec" />

                    <div className="flex h-40 w-40 items-center justify-center border-2 border-arcano-sec/60 bg-white p-2 sm:h-44 sm:w-44">
                      {qrDataUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={qrDataUrl}
                          alt={`QR Code do ingresso ${ticket.id}`}
                          className="h-full w-full"
                        />
                      ) : (
                        <div className="h-full w-full animate-pulse bg-arcano-bg/10" />
                      )}
                    </div>
                  </div>

                  <p className="text-center font-mono text-[10px] uppercase tracking-widest text-white/35">
                    Apresente na portaria
                  </p>

                  <Botao
                    variante="fantasma"
                    onClick={compartilharLink}
                    className="w-full text-xs"
                  >
                    {linkCopiado ? 'Link copiado!' : 'Compartilhar link'}
                  </Botao>
                </div>
              </div>
            </div>
          </Cartao>
        </div>
      )}
    </Container>
  );
}
