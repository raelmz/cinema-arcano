// frontend/app/gate/page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { Aviso } from '../components/ui/Aviso';
import { Botao } from '../components/ui/Botao';
import { CampoTexto } from '../components/ui/CampoTexto';
import { Cartao } from '../components/ui/Cartao';
import { Container } from '../components/ui/Container';
import { useAuth } from '../context/AuthContext';
import { type ValidacaoPortaria, validateTicket } from '../services/api';

type CodigoDetectado = {
  rawValue: string;
};

type BarcodeDetectorConstructor = new (options?: {
  formats?: string[];
}) => {
  detect: (image: HTMLVideoElement) => Promise<CodigoDetectado[]>;
};

type WindowComBarcodeDetector = Window & {
  BarcodeDetector?: BarcodeDetectorConstructor;
};

const textosResultado = {
  VALID: {
    titulo: 'Entrada liberada',
    classe: 'border-green-500 bg-green-900/40 text-green-100',
  },
  INVALID: {
    titulo: 'Ingresso inválido',
    classe: 'border-red-500 bg-red-900/40 text-red-100',
  },
  ALREADY_USED: {
    titulo: 'Ingresso já utilizado',
    classe: 'border-yellow-500 bg-yellow-900/40 text-yellow-100',
  },
  WRONG_EVENT: {
    titulo: 'Sessão incorreta',
    classe: 'border-orange-500 bg-orange-900/40 text-orange-100',
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
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lendoCameraRef = useRef(false);
  const [qrToken, setQrToken] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [resultado, setResultado] = useState<ValidacaoPortaria | null>(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [cameraAtiva, setCameraAtiva] = useState(false);

  useEffect(() => {
    return () => pararCamera();
  }, []);

  async function validar(tokenLido = qrToken) {
    if (!token || !user) {
      setErro('Entre com a conta da portaria para validar ingressos.');
      return;
    }

    if (user.role !== 'GATE') {
      setErro('Apenas usuários de portaria podem validar ingressos.');
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
      setQrToken(tokenLido.trim());
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro inesperado.');
    } finally {
      setCarregando(false);
    }
  }

  async function iniciarCamera() {
    const janela = window as WindowComBarcodeDetector;

    if (!janela.BarcodeDetector) {
      setErro('Este navegador não suporta leitura automática de QR. Use a digitação manual.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      streamRef.current = stream;
      setCameraAtiva(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      lendoCameraRef.current = true;
      lerCamera(janela.BarcodeDetector);
    } catch {
      setErro('Não foi possível acessar a câmera. Use a digitação manual.');
      setCameraAtiva(false);
    }
  }

  async function lerCamera(BarcodeDetector: BarcodeDetectorConstructor) {
    const detector = new BarcodeDetector({ formats: ['qr_code'] });

    while (lendoCameraRef.current && videoRef.current) {
      const codigos = await detector.detect(videoRef.current).catch(() => []);
      const codigo = codigos[0]?.rawValue;

      if (codigo) {
        pararCamera();
        await validar(codigo);
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  function pararCamera() {
    lendoCameraRef.current = false;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraAtiva(false);
  }

  const detalhesResultado = resultado ? textosResultado[resultado.result] : null;

  return (
    <main>
      <Container className="py-10">
        <div className="mb-8">
          <p className="font-mono text-sm uppercase tracking-wide text-arcano-main">
            Portaria
          </p>
          <h1 className="mt-2 text-3xl font-black uppercase text-white md:text-5xl">
            Validação de ingresso
          </h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <Cartao>
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
                <textarea
                  id="qr-token"
                  value={qrToken}
                  onChange={(event) => setQrToken(event.target.value)}
                  placeholder="Cole aqui o conteúdo lido no QR"
                  className="min-h-40 w-full border-2 border-gray-700 bg-arcano-bg p-3 font-mono text-sm text-white placeholder:text-white/30 focus:border-arcano-main focus:outline-none"
                />
              </div>

              {erro && <Aviso tipo="erro">{erro}</Aviso>}

              <div className="flex flex-wrap gap-3">
                <Botao onClick={() => validar()} disabled={carregando}>
                  {carregando ? 'Validando...' : 'Validar ingresso'}
                </Botao>
                <Botao
                  variante="secundario"
                  onClick={cameraAtiva ? pararCamera : iniciarCamera}
                >
                  {cameraAtiva ? 'Parar câmera' : 'Ler com câmera'}
                </Botao>
              </div>

              {cameraAtiva && (
                <video
                  ref={videoRef}
                  muted
                  playsInline
                  className="aspect-video w-full border-2 border-arcano-main bg-black object-cover"
                />
              )}
            </div>
          </Cartao>

          <Cartao className="min-h-80">
            {resultado && detalhesResultado ? (
              <div
                className={`border-2 p-5 ${detalhesResultado.classe}`}
              >
                <p className="font-mono text-sm uppercase tracking-wide">
                  {resultado.result}
                </p>
                <h2 className="mt-2 text-3xl font-black uppercase">
                  {detalhesResultado.titulo}
                </h2>
                <p className="mt-3 font-bold">{resultado.message}</p>

                {resultado.ticket && (
                  <div className="mt-6 space-y-2 border-t-2 border-current pt-4 font-mono text-sm">
                    <p>
                      Filme:{' '}
                      <strong>{resultado.ticket.reservation.session.movie.title}</strong>
                    </p>
                    <p>
                      Sala:{' '}
                      <strong>{resultado.ticket.reservation.session.room.name}</strong>
                    </p>
                    <p>
                      Assentos: <strong>{formatarAssentos(resultado)}</strong>
                    </p>
                    <p>
                      Cliente:{' '}
                      <strong>{resultado.ticket.reservation.user.name}</strong>
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-full min-h-72 items-center justify-center border-2 border-dashed border-white/20 p-6 text-center text-white/60">
                <p className="font-mono text-sm uppercase tracking-wide">
                  O resultado da validação aparece aqui.
                </p>
              </div>
            )}
          </Cartao>
        </div>
      </Container>
    </main>
  );
}
