// frontend/app/gate/page.tsx
'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactElement } from 'react';
import { AcessoRestrito } from '../components/ui/AcessoRestrito';
import { Aviso } from '../components/ui/Aviso';
import { Botao } from '../components/ui/Botao';
import { CampoTexto } from '../components/ui/CampoTexto';
import { Cartao } from '../components/ui/Cartao';
import { Container } from '../components/ui/Container';
import { useAuth } from '../context/AuthContext';
import { type ValidacaoPortaria, validateTicket } from '../services/api';

const acentoPortaria = {
  '--color-arcano-main': '#fb7185',
  '--color-arcano-sec': '#b91c1c',
} as CSSProperties;

type ResultadoConfig = {
  titulo: string;
  bg: string;
  borda: string;
  texto: string;
  Icone: (props: { className?: string }) => ReactElement;
};

function IconeCheck({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" aria-hidden="true" className={className}>
      <path
        d="M18 54 L40 76 L84 24"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

function IconeAlerta({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" aria-hidden="true" className={className}>
      <path
        d="M50 8 L96 90 L4 90 Z"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinejoin="miter"
      />
      <rect x="46" y="34" width="8" height="30" fill="currentColor" />
      <rect x="46" y="72" width="8" height="8" fill="currentColor" />
    </svg>
  );
}

const resultadoConfig: Record<ValidacaoPortaria['result'], ResultadoConfig> = {
  VALID: {
    titulo: 'Entrada liberada',
    bg: 'bg-emerald-600',
    borda: 'border-emerald-200',
    texto: 'text-white',
    Icone: IconeCheck,
  },
  INVALID: {
    titulo: 'Ingresso inválido',
    bg: 'bg-red-600',
    borda: 'border-red-200',
    texto: 'text-white',
    Icone: IconeAlerta,
  },
  ALREADY_USED: {
    titulo: 'Ingresso já utilizado',
    bg: 'bg-amber-400',
    borda: 'border-amber-100',
    texto: 'text-arcano-bg',
    Icone: IconeAlerta,
  },
  WRONG_EVENT: {
    titulo: 'Sessão incorreta',
    bg: 'bg-red-800',
    borda: 'border-red-300',
    texto: 'text-white',
    Icone: IconeAlerta,
  },
};

function formatarAssentos(resultado: ValidacaoPortaria) {
  const assentos = resultado.ticket?.reservation.seats ?? [];

  return assentos
    .map((item) => `${String.fromCharCode(64 + item.seat.row)}${item.seat.number}`)
    .join(', ');
}

export default function GatePage() {
  const { token, user } = useAuth();
  const scannerRef = useRef<import('html5-qrcode').Html5Qrcode | null>(null);
  const [qrToken, setQrToken] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [resultado, setResultado] = useState<ValidacaoPortaria | null>(null);
  const [validacaoId, setValidacaoId] = useState(0);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [cameraAtiva, setCameraAtiva] = useState(false);

  useEffect(() => {
    return () => {
      pararCamera();
    };
  }, []);

  async function validar(tokenLido = qrToken) {
    if (!token || !user) {
      setErro('Entre com a conta da portaria para validar ingressos.');
      return;
    }

    if (user.role !== 'GATE' && user.role !== 'ADMIN') {
      setErro('Apenas usuários de portaria ou administrador podem validar ingressos.');
      return;
    }

    if (!tokenLido.trim()) {
      setErro('Informe o token do QR code.');
      return;
    }

    setCarregando(true);
    setErro('');

    try {
      const resposta = await validateTicket(token, {
        qrToken: tokenLido.trim(),
        sessionId: sessionId.trim() || undefined,
      });
      setResultado(resposta);
      setValidacaoId((atual) => atual + 1);
      setQrToken(tokenLido.trim());
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro inesperado.');
    } finally {
      setCarregando(false);
    }
  }

  function limparResultado() {
    setResultado(null);
    setQrToken('');
  }

  async function iniciarCamera() {
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const permissionStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      permissionStream.getTracks().forEach((track) => track.stop());
      setCameraAtiva(true);
      await new Promise((resolve) => requestAnimationFrame(resolve));

      const scanner = new Html5Qrcode('leitor-qr-portaria', false);
      scannerRef.current = scanner;
      setErro('');

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 260, height: 260 } },
        async (decodedText) => {
          await pararCamera();
          await validar(decodedText);
        },
        undefined,
      );
    } catch (error) {
      const mensagem =
        error instanceof Error && error.name === 'NotAllowedError'
          ? 'Permissão da câmera bloqueada no navegador. Libere o acesso à câmera e tente novamente.'
          : 'Não foi possível iniciar a câmera neste dispositivo. Use a digitação manual.';
      setErro(mensagem);
      setCameraAtiva(false);
    }
  }

  async function pararCamera() {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop();
    }
    scannerRef.current?.clear();
    scannerRef.current = null;
    setCameraAtiva(false);
  }

  if (!user || (user.role !== 'GATE' && user.role !== 'ADMIN')) {
    return (
      <AcessoRestrito
        titulo="Portaria protegida"
        mensagem="Entre com uma conta de portaria ou administrador para validar ingressos."
      />
    );
  }

  const config = resultado ? resultadoConfig[resultado.result] : null;

  return (
    <main style={acentoPortaria}>
      {/* O RESULTADO É O ELEMENTO HERÓI DESTA TELA: ocupa a viewport
          inteira, cor sólida por estado, ícone grande. Fica por cima de
          tudo até o operador confirmar e liberar a próxima validação. */}
      {resultado && config && (
        <div
          key={validacaoId}
          role="alert"
          style={{ animation: 'gate-flash 0.45s ease-out' }}
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 overflow-y-auto border-8 p-6 text-center sm:p-10 ${config.bg} ${config.borda} ${config.texto}`}
        >
          <config.Icone className="h-24 w-24 shrink-0 sm:h-32 sm:w-32" />

          <div>
            <h1 className="mt-3 text-4xl font-black uppercase leading-none tracking-wide drop-shadow-[3px_3px_0_rgba(0,0,0,0.25)] sm:text-6xl">
              {config.titulo}
            </h1>
            <p className="mt-4 text-lg font-bold sm:text-xl">{resultado.message}</p>
          </div>

          {resultado.ticket && (
            <div className="w-full max-w-md space-y-1.5 border-t-4 border-current/40 pt-5 font-mono text-sm sm:text-base">
              <p>
                Filme: <strong>{resultado.ticket.reservation.session.movie.title}</strong>
              </p>
              <p>
                Sala: <strong>{resultado.ticket.reservation.session.room.name}</strong>
              </p>
              <p>
                Assentos: <strong>{formatarAssentos(resultado)}</strong>
              </p>
              <p>
                Cliente:{' '}
                <strong>{resultado.ticket.reservation.user?.name ?? 'Cliente'}</strong>
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={limparResultado}
            className="mt-2 border-2 border-current bg-black/10 px-6 py-3 text-sm font-bold uppercase tracking-wide text-current transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-black/20 active:translate-y-0.5"
          >
            Validar outro ingresso
          </button>
        </div>
      )}

      <Container className="py-8 sm:py-10">
        <div className="mb-8">
          <p className="font-mono text-sm uppercase tracking-wide text-arcano-main">
            Portaria
          </p>
          <h1 className="mt-2 text-3xl font-bold uppercase leading-tight text-white md:text-5xl">
            Validação de ingresso
          </h1>
        </div>

        <Cartao className="p-4 sm:p-6">
          <div className="space-y-5">
            <CampoTexto
              id="session-id"
              label="ID da sessão esperada"
              value={sessionId}
              onChange={(event) => setSessionId(event.target.value)}
              placeholder="Opcional, usado para detectar sessão errada"
            />

            <div>
              <label
                htmlFor="qr-token"
                className="mb-2 block text-sm font-bold uppercase tracking-wide text-arcano-ter"
              >
                Token do QR code
              </label>
              {/* Fonte e campo maiores de propósito: pode ser digitado sob
                  pressão e pouca luz na entrada do evento. */}
              <textarea
                id="qr-token"
                value={qrToken}
                onChange={(event) => setQrToken(event.target.value)}
                placeholder="Cole aqui o conteúdo lido no QR"
                className="min-h-48 w-full resize-y border-2 border-gray-700 bg-arcano-bg p-4 font-mono text-lg text-white placeholder:text-white/30 focus:border-arcano-main focus:outline-none sm:text-xl"
              />
            </div>

            {erro && <Aviso tipo="erro">{erro}</Aviso>}

            <div className="grid gap-3 sm:grid-cols-2">
              <Botao onClick={() => validar()} disabled={carregando} className="py-4 text-base">
                {carregando ? 'Validando...' : 'Validar ingresso'}
              </Botao>
              <Botao
                variante="secundario"
                className="py-4 text-base"
                onClick={cameraAtiva ? pararCamera : iniciarCamera}
              >
                {cameraAtiva ? 'Parar câmera' : 'Ler com câmera'}
              </Botao>
            </div>

            <div
              id="leitor-qr-portaria"
              className={`aspect-square max-w-90 overflow-hidden border-2 border-arcano-main bg-black ${
                cameraAtiva ? 'block' : 'hidden'
              }`}
            />
          </div>
        </Cartao>

        {!resultado && (
          <div className="mt-6 flex min-h-32 items-center justify-center border-2 border-dashed border-arcano-sec/40 p-6 text-center text-white/50">
            <p className="font-mono text-sm uppercase tracking-wide">
              O resultado da validação ocupa a tela inteira assim que um
              ingresso for lido ou digitado.
            </p>
          </div>
        )}
      </Container>
    </main>
  );
}
