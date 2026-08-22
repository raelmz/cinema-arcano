// frontend/app/reservations/[id]/payment/page.tsx
'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { AcessoRestrito } from '../../../components/ui/AcessoRestrito';
import { Aviso } from '../../../components/ui/Aviso';
import { BandeiraPagamento } from '../../../components/ui/BandeiraPagamento';
import { Botao } from '../../../components/ui/Botao';
import { CampoTexto } from '../../../components/ui/CampoTexto';
import { Cartao } from '../../../components/ui/Cartao';
import { Container } from '../../../components/ui/Container';
import { useAuth } from '../../../context/AuthContext';
import {
  getReservation,
  payReservation,
  type Reserva,
} from '../../../services/api';

type MetodoPagamento = 'CARD' | 'PIX';

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

function formatarAssentos(reserva: Reserva) {
  return reserva.seats
    .map((item) => `${String.fromCharCode(64 + item.seat.row)}${item.seat.number}`)
    .join(', ');
}

export default function PaymentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, token, isLoading } = useAuth();
  const [reserva, setReserva] = useState<Reserva | null>(null);
  const [metodo, setMetodo] = useState<MetodoPagamento>('CARD');
  const [numeroCartao, setNumeroCartao] = useState('4242 4242 4242 4242');
  const [nomeCartao, setNomeCartao] = useState(user?.name ?? '');
  const [validade, setValidade] = useState('12/30');
  const [cvv, setCvv] = useState('123');
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState('');
  const [recusado, setRecusado] = useState(false);

  useEffect(() => {
    async function carregarReserva() {
      if (!token || user?.role !== 'CUSTOMER') return;

      setCarregando(true);
      setErro('');

      try {
        const resultado = await getReservation(token, params.id);
        setReserva(resultado);
      } catch (error) {
        setErro(error instanceof Error ? error.message : 'Erro ao carregar reserva.');
      } finally {
        setCarregando(false);
      }
    }

    carregarReserva();
  }, [params.id, token, user]);

  const total = useMemo(() => {
    if (!reserva) return 0;
    return Number(reserva.session.price) * reserva.seats.length;
  }, [reserva]);

  // Detecta a bandeira do cartão pelo primeiro dígito, só para exibição —
  // não há validação real de bandeira nesta simulação de checkout.
  const bandeiraCartao = numeroCartao.trim().startsWith('5') ? 'mastercard' : 'visa';

  async function finalizarPagamento(simularFalha: boolean) {
    if (!token || !reserva) {
      setErro('Reserva não encontrada para pagamento.');
      return;
    }

    setProcessando(true);
    setErro('');
    setRecusado(false);

    try {
      const resposta = await payReservation(token, reserva.id, {
        method: metodo,
        simulateFailure: simularFalha,
      });

      if (resposta.ticket) {
        router.push(`/tickets/${resposta.ticket.id}`);
        return;
      }

      setReserva(resposta);
      setRecusado(true);
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao processar pagamento.');
    } finally {
      setProcessando(false);
    }
  }

  if (isLoading || user?.role !== 'CUSTOMER') {
    return isLoading ? (
      <Container className="py-10">
        <p className="text-white/50">Verificando acesso...</p>
      </Container>
    ) : (
      <AcessoRestrito
        titulo="Checkout protegido"
        mensagem="Entre com uma conta de cliente para concluir o pagamento desta reserva."
      />
    );
  }

  return (
    <Container className="py-8">
      <Link
        href="/reservations"
        className="text-sm text-white/50 hover:text-arcano-main"
      >
        ← Voltar para meus ingressos
      </Link>

      <section className="mt-6 border-b-2 border-white/10 pb-6">
        <p className="font-mono text-sm uppercase tracking-wide text-arcano-main">
          Checkout arcano
        </p>
        <h1 className="mt-2 text-3xl font-black uppercase tracking-wide text-white md:text-5xl">
          Pagamento
        </h1>
      </section>

      {carregando && (
        <Cartao className="mt-6 p-6">
          <p className="animate-pulse font-mono text-sm uppercase tracking-wide text-white/50">
            Carregando reserva...
          </p>
        </Cartao>
      )}

      {erro && (
        <div className="mt-6">
          <Aviso tipo="erro">{erro}</Aviso>
        </div>
      )}

      {recusado && (
        <div className="mt-6">
          <Aviso tipo="erro">
            Pagamento recusado. A reserva foi cancelada e os assentos voltaram
            para o mapa.
          </Aviso>
        </div>
      )}

      {!carregando && reserva && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <Cartao className="p-6">
            <div className="mb-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMetodo('CARD')}
                className={`border-2 p-4 text-left transition-colors ${
                  metodo === 'CARD'
                    ? 'border-arcano-main bg-arcano-main text-arcano-bg'
                    : 'border-white/15 text-white hover:border-arcano-main'
                }`}
              >
                <span className="block font-mono text-xs uppercase">Cartão</span>
                <span className="mt-2 block text-lg font-black">Crédito</span>
                <span className="mt-3 flex flex-wrap gap-1.5">
                  <BandeiraPagamento
                    marca="visa"
                    className={metodo === 'CARD' ? 'border-arcano-bg/40 text-arcano-bg' : ''}
                  />
                  <BandeiraPagamento
                    marca="mastercard"
                    className={metodo === 'CARD' ? 'border-arcano-bg/40 text-arcano-bg' : ''}
                  />
                </span>
              </button>
              <button
                type="button"
                onClick={() => setMetodo('PIX')}
                className={`border-2 p-4 text-left transition-colors ${
                  metodo === 'PIX'
                    ? 'border-arcano-main bg-arcano-main text-arcano-bg'
                    : 'border-white/15 text-white hover:border-arcano-main'
                }`}
              >
                <span className="block font-mono text-xs uppercase">Pix</span>
                <span className="mt-2 block text-lg font-black">Instantâneo</span>
                <span className="mt-3 flex flex-wrap gap-1.5">
                  <BandeiraPagamento
                    marca="pix"
                    className={metodo === 'PIX' ? 'border-arcano-bg/40 text-arcano-bg' : ''}
                  />
                </span>
              </button>
            </div>

            {metodo === 'CARD' ? (
              <div className="space-y-5">
                <div className="min-w-0 border-2 border-arcano-main bg-arcano-sec p-5 text-white">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-xs uppercase tracking-wide">
                      Cinema Arcano
                    </span>
                    <BandeiraPagamento marca={bandeiraCartao} className="border-white/40 text-white" />
                  </div>
                  <p className="mt-8 break-all font-mono text-lg font-black tracking-wide sm:text-xl">
                    {numeroCartao || '0000 0000 0000 0000'}
                  </p>
                  <div className="mt-6 flex flex-wrap justify-between gap-3 font-mono text-xs uppercase">
                    <span className="break-words">{nomeCartao || 'Nome no cartão'}</span>
                    <span>{validade || 'MM/AA'}</span>
                  </div>
                </div>

                <CampoTexto
                  id="numero-cartao"
                  label="Número do cartão"
                  value={numeroCartao}
                  onChange={(event) => setNumeroCartao(event.target.value)}
                />
                <CampoTexto
                  id="nome-cartao"
                  label="Nome impresso"
                  value={nomeCartao}
                  onChange={(event) => setNomeCartao(event.target.value)}
                />
                <div className="grid grid-cols-2 gap-3">
                  <CampoTexto
                    id="validade"
                    label="Validade"
                    value={validade}
                    onChange={(event) => setValidade(event.target.value)}
                  />
                  <CampoTexto
                    id="cvv"
                    label="CVV"
                    value={cvv}
                    onChange={(event) => setCvv(event.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="border-2 border-white/15 p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-mono text-xs uppercase tracking-wide text-white/45">
                    Código PIX copia e cola
                  </p>
                  <BandeiraPagamento marca="pix" />
                </div>
                <p className="mt-4 break-all border-2 border-arcano-main bg-arcano-main p-4 font-mono text-sm font-black text-arcano-bg">
                  00020126580014br.gov.bcb.pix0136cinema-arcano-reserva-{reserva.id}
                </p>
                <p className="mt-4 text-sm text-white/55">
                  Este PIX é simulado. Use os botões abaixo para aprovar ou
                  recusar o pagamento durante o teste.
                </p>
              </div>
            )}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Botao
                variante="secundario"
                disabled={processando || reserva.status !== 'PENDING'}
                onClick={() => finalizarPagamento(false)}
              >
                {processando ? 'Processando...' : 'Simular aprovação'}
              </Botao>
              <Botao
                variante="fantasma"
                disabled={processando || reserva.status !== 'PENDING'}
                onClick={() => finalizarPagamento(true)}
              >
                Simular recusa
              </Botao>
            </div>
          </Cartao>

          <Cartao destaque className="h-fit p-6">
            <h2 className="border-b-2 border-arcano-sec pb-2 text-xl font-black uppercase tracking-wide text-arcano-main">
              Resumo
            </h2>
            <div className="mt-5 space-y-3 text-sm text-white/70">
              <p className="text-xl font-black leading-tight text-white">
                {reserva.session.movie.title}
              </p>
              <p>{formatarAssentos(reserva)}</p>
              <p>{reserva.session.room.name}</p>
              <p>
                {new Intl.DateTimeFormat('pt-BR', {
                  dateStyle: 'full',
                  timeStyle: 'short',
                }).format(new Date(reserva.session.startTime))}
              </p>
              <p className="border-t-2 border-white/10 pt-4 text-3xl font-black text-arcano-main">
                {formatarMoeda(total)}
              </p>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-2 border-t-2 border-white/10 pt-4">
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/35">
                Aceitamos
              </span>
              <BandeiraPagamento marca="visa" />
              <BandeiraPagamento marca="mastercard" />
              <BandeiraPagamento marca="pix" />
            </div>
          </Cartao>
        </div>
      )}
    </Container>
  );
}
