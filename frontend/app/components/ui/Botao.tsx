import type { ButtonHTMLAttributes, ReactNode } from 'react';

type BotaoProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variante?: 'primario' | 'secundario' | 'fantasma';
};

const estilos = {
  primario:
    'border-arcano-main bg-arcano-main text-arcano-bg shadow-[4px_4px_0px_0px_#7b1fa2] hover:bg-arcano-ter hover:shadow-[6px_6px_0px_0px_#7b1fa2] active:shadow-[0px_0px_0px_0px_#7b1fa2]',
  secundario:
    'border-arcano-sec bg-arcano-sec text-white shadow-[4px_4px_0px_0px_#ffd54f] hover:bg-[#5e187a] hover:shadow-[6px_6px_0px_0px_#ffd54f] active:shadow-[0px_0px_0px_0px_#ffd54f]',
  fantasma:
    'border-transparent bg-transparent text-white hover:border-arcano-main hover:text-arcano-main hover:shadow-[4px_4px_0px_0px_#ffd54f] active:shadow-none',
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
      className={`inline-flex items-center justify-center border-2 px-4 py-3 text-center text-sm font-bold uppercase tracking-wide transition-all duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-1 active:translate-x-1 ${estilos[variante]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
