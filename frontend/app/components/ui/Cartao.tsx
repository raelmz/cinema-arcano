import type { ReactNode } from 'react';

type CartaoProps = {
  children?: ReactNode;
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
      className={`min-w-0 border-2 bg-arcano-surface transition-all duration-200 ease-out hover:-translate-y-1 ${
        destaque
          ? 'border-arcano-main shadow-[8px_8px_0px_0px_#ffd54f] hover:shadow-[12px_12px_0px_0px_#ffd54f]'
          : 'border-arcano-sec/50 shadow-[6px_6px_0px_0px_#7b1fa2] hover:shadow-[10px_10px_0px_0px_#7b1fa2]'
      } ${className}`}
    >
      {children}
    </div>
  );
}
