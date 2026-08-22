"use client";

// frontend/app/components/movies/BotaoTrailer.tsx
import { useState } from "react";
import { TrailerModal } from "./TrailerModal";

type BotaoTrailerProps = {
  trailerKey: string;
  titulo: string;
};

export function BotaoTrailer({ trailerKey, titulo }: BotaoTrailerProps) {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="inline-flex items-center gap-2 border-2 border-white/20 bg-transparent px-4 py-2 text-sm font-bold uppercase tracking-wide text-white/80 transition-colors hover:border-arcano-main hover:text-arcano-main"
      >
        ▶ Assistir Trailer
      </button>

      <TrailerModal
        trailerKey={trailerKey}
        titulo={titulo}
        aberto={aberto}
        onClose={() => setAberto(false)}
      />
    </>
  );
}