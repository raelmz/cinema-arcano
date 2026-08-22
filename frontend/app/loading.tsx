// frontend/app/loading.tsx

import { Cartao } from './components/ui/Cartao';
import { Container } from './components/ui/Container';

export default function Loading() {
  return (
    <Container className="py-10">
      <Cartao className="p-6">
        <p
          role="status"
          aria-live="polite"
          className="mb-4 font-mono text-xs uppercase tracking-widest text-arcano-main"
        >
          Invocando o catálogo...
        </p>
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-32 bg-white/10" />
          <div className="h-10 max-w-xl bg-white/10" />
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="h-28 bg-white/10" />
            <div className="h-28 bg-white/10" />
            <div className="h-28 bg-white/10" />
          </div>
        </div>
      </Cartao>
    </Container>
  );
}