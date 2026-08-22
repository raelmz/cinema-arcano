"use client";

// frontend/app/components/movies/TrailerModal.tsx
import { useEffect } from "react";

type TrailerModalProps = {
  trailerKey: string;
  titulo: string;
  aberto: boolean;
  onClose: () => void;
};

export function TrailerModal({ trailerKey, titulo, aberto, onClose }: TrailerModalProps) {
  useEffect(() => {
    if (!aberto) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [aberto, onClose]);

  if (!aberto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Trailer de ${titulo}`}
    >
      <div
        className="relative w-full max-w-3xl border-4 border-arcano-main bg-black shadow-[8px_8px_0_#7b1fa2]"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "hero-fade-in 0.3s ease-out" }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar trailer"
          className="absolute -top-10 right-0 font-mono text-sm font-bold uppercase tracking-widest text-white/70 hover:text-arcano-main"
        >
          Fechar ✕
        </button>

        <div className="aspect-video w-full">
          <iframe
            className="h-full w-full"
            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
            title={`Trailer de ${titulo}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
