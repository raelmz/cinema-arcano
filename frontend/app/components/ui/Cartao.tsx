// frontend/app/components/ui/Cartao.tsx

import type { ReactNode } from 'react';

type CartaoProps = {
  children: ReactNode;
  className?: string;
  destaque?: boolean;
};

export function Cartao({
  children,
  className = '',
  destaque = false,
}: CartaoProps) {
  return (
    <div
      className={`border-2 bg-arcano-surface ${
        destaque
          ? 'border-arcano-main shadow-[8px_8px_0px_0px_rgba(255,213,79,1)]'
          : 'border-white/10'
      } ${className}`}
    >
      {children}
    </div>
  );
}
