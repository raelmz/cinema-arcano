// frontend/app/tickets/[id]/page.tsx
'use client';

import QRCode from 'qrcode';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Aviso } from '../../components/ui/Aviso';
import { Cartao } from '../../components/ui/Cartao';
import { Container } from '../../components/ui/Container';
import { getTicket, IngressoPublico } from '../../services/api';

export default function TicketPage() {
  const params = useParams<{ id: string }>();
  const [ingresso, setIngresso] = useState<IngressoPublico | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    async function carregarIngresso() {
      setCarregando(true);
      setErro('');

      try {
        const resultado = await getTicket(params.id);
        setIngresso(resultado);
        const qr = await QRCode.toDataURL(resultado.qrToken, {
          margin: 1,
          width: 280,
          color: {
            dark: '#1a161d',
            light: '#ffd54f',
          },
        });
        setQrCodeUrl(qr);
      } catch (error) {
        setErro(
          error instanceof Error ? error.message : 'Erro ao carregar ingresso.',
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarIngresso();
  }, [params.id]);

  async function copiarToken() {
    if (!ingresso) return;

    await navigator.clipboard.writeText(ingresso.qrToken);
    setCopiado(true);
    window.setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <Container className="py-8">
      <Link href="/" className="text-sm text-white/50 hover:text-arcano-main">
        ← Voltar para o catálogo
      </Link>

      {carregando && <p className="mt-8 text-white/50">Carregando ingresso...</p>}

      {!carregando && erro && (
        <div className="mt-6">
          <Aviso tipo="erro">{erro}</Aviso>
        </div>
      )}

      {!carregando && ingresso && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
          <Cartao destaque className="p-6">
            <h1 className="border-b-2 border-arcano-sec pb-2 text-2xl font-black uppercase tracking-wide text-arcano-main">
              Ingresso
            </h1>

            <div className="mt-6 flex justify-center">
              {qrCodeUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrCodeUrl}
                  alt="QR code do ingresso"
                  className="border-2 border-arcano-main"
                />
              ) : (
                <div className="h-[280px] w-[280px] border-2 border-white/10" />
              )}
            </div>

            <p className="mt-4 break-all font-mono text-xs text-white/35">
              {ingresso.id}
            </p>

            <div className="mt-5 border-2 border-white/10 p-3">
              <p className="font-mono text-xs uppercase tracking-wide text-white/40">
                Token para validação manual
              </p>
              <p className="mt-2 max-h-28 overflow-y-auto break-all font-mono text-[11px] text-white/55">
                {ingresso.qrToken}
              </p>
              <button
                type="button"
                onClick={copiarToken}
                className="mt-3 w-full border-2 border-arcano-main bg-arcano-main px-3 py-2 text-xs font-bold uppercase tracking-wide text-arcano-bg hover:bg-arcano-ter"
              >
                {copiado ? 'Token copiado' : 'Copiar token'}
              </button>
            </div>
          </Cartao>

          <Cartao className="p-6">
            <p className="text-xs font-bold uppercase tracking-wide text-white/40">
              Sessão
            </p>
            <h2 className="mt-1 text-2xl font-black text-white">
              {ingresso.reservation.session.movie.title}
            </h2>

            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-white/40">
                  Data e horário
                </dt>
                <dd className="mt-1 font-bold text-white">
                  {new Intl.DateTimeFormat('pt-BR', {
                    dateStyle: 'full',
                    timeStyle: 'short',
                  }).format(new Date(ingresso.reservation.session.startTime))}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-white/40">
                  Sala
                </dt>
                <dd className="mt-1 font-bold text-white">
                  {ingresso.reservation.session.room.name}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-white/40">
                  Assentos
                </dt>
                <dd className="mt-1 font-bold text-white">
                  {ingresso.reservation.seats
                    .map((item) => `${item.seat.row}-${item.seat.number}`)
                    .join(', ')}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-white/40">
                  Status
                </dt>
                <dd className="mt-1 font-bold text-arcano-main">
                  {ingresso.status}
                </dd>
              </div>
            </dl>

            <div className="mt-6">
              <Aviso tipo="info">
                Apresente este QR code na portaria. Se a câmera não estiver
                disponível, copie o token e cole na validação manual.
              </Aviso>
            </div>
          </Cartao>
        </div>
      )}
    </Container>
  );
}
