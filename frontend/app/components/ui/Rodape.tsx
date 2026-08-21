// frontend/app/components/ui/Rodape.tsx

import { Container } from './Container';

export function Rodape() {
  return (
    <footer className="border-t-2 border-white/10 bg-arcano-bg">
      <Container className="flex flex-col gap-1 py-5 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
        <span>Cinema Arcano</span>
        <span>Projeto Elite Dev · Verzel</span>
      </Container>
    </footer>
  );
}
