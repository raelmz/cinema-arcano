// frontend/app/error.tsx
'use client';

import { Botao } from './components/ui/Botao';
import { Cartao } from './components/ui/Cartao';
import { Container } from './components/ui/Container';

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Container className="py-16">
      <Cartao destaque className="mx-auto max-w-3xl p-8">
        <p className="font-mono text-sm uppercase tracking-wide text-red-300">
          Falha inesperada
        </p>
        <h1 className="mt-3 text-4xl font-black uppercase tracking-wide text-white md:text-6xl">
          O ritual falhou
        </h1>
        <p className="mt-4 max-w-xl text-white/60">
          Algo saiu do eixo ao carregar esta tela. Tente novamente antes de
          abandonar a sessão.
        </p>
        <Botao className="mt-8" onClick={reset}>
          Tentar novamente
        </Botao>
      </Cartao>
    </Container>
  );
}
