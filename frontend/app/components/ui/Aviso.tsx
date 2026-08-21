// frontend/app/components/ui/Aviso.tsx

import type { ReactNode } from 'react';

type AvisoProps = {
  children: ReactNode;
  tipo?: 'erro' | 'sucesso' | 'info';
};

const estilos = {
  erro: 'border-red-500 bg-red-900/50 text-red-200',
  sucesso: 'border-green-500 bg-green-900/50 text-green-200',
  info: 'border-arcano-main bg-arcano-main/10 text-arcano-main',
};

export function Aviso({ children, tipo = 'info' }: AvisoProps) {
  return (
    <div className={`border-2 p-3 font-mono text-sm ${estilos[tipo]}`}>
      {children}
    </div>
  );
}
