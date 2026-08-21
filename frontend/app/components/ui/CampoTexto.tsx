// frontend/app/components/ui/CampoTexto.tsx

import { forwardRef, type InputHTMLAttributes } from 'react';

type CampoTextoProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  erro?: string;
};

export const CampoTexto = forwardRef<HTMLInputElement, CampoTextoProps>(
  function CampoTexto({ label, erro, id, className = '', ...props }, ref) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-bold uppercase tracking-wide text-arcano-ter"
      >
        {label}
      </label>
      <input
        id={id}
        ref={ref}
        className={`w-full border-2 border-gray-700 bg-arcano-bg p-3 text-base text-white transition-colors placeholder:text-white/30 focus:border-arcano-main focus:outline-none sm:text-sm ${className}`}
        {...props}
      />
      {erro && <span className="mt-1 block text-xs text-red-400">{erro}</span>}
    </div>
  );
  },
);
