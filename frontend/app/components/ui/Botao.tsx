// frontend/app/components/ui/Botao.tsx

import type { ButtonHTMLAttributes, ReactNode } from 'react';

type BotaoProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variante?: 'primario' | 'secundario' | 'fantasma';
};

const estilos = {
  primario:
    'border-arcano-main bg-arcano-main text-arcano-bg hover:border-black hover:bg-arcano-ter',
  secundario:
    'border-arcano-sec bg-arcano-sec text-white hover:border-arcano-main hover:bg-arcano-main hover:text-arcano-bg',
  fantasma:
    'border-white/20 bg-transparent text-white hover:border-arcano-main hover:text-arcano-main',
};

export function Botao({
  children,
  variante = 'primario',
  className = '',
  type = 'button',
  ...props
}: BotaoProps) {
  return (
    <button
      type={type}
      className={`border-2 px-4 py-3 text-sm font-bold uppercase tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${estilos[variante]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
