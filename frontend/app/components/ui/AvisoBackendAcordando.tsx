// frontend/app/components/ui/AvisoBackendAcordando.tsx

export function AvisoBackendAcordando() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="relative overflow-hidden border-2 border-arcano-main bg-arcano-surface p-5 shadow-[8px_8px_0px_0px_#7b1fa2]"
    >
      <div className="absolute inset-x-0 top-0 h-1 animate-pulse bg-arcano-main" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative h-12 w-12 shrink-0 border-2 border-arcano-main bg-arcano-bg">
          <span className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 animate-ping border-2 border-arcano-main" />
          <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 bg-arcano-main" />
        </div>

        <div className="min-w-0">
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-arcano-main">
            Acordando a sala de projeção
          </p>
          <p className="mt-2 text-sm leading-relaxed text-white/65">
            O backend está hospedado no plano gratuito do Render e pode levar
            cerca de 1 minuto para responder na primeira visita. Assim que ele
            acordar, os filmes e sessões aparecem automaticamente.
          </p>
        </div>
      </div>
    </div>
  );
}
