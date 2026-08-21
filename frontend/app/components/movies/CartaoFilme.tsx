// frontend/app/components/movies/CartaoFilme.tsx

import Image from 'next/image';
import Link from 'next/link';
import type { Movie } from '../../services/api';

type CartaoFilmeProps = {
  filme: Movie;
};

export function CartaoFilme({ filme }: CartaoFilmeProps) {
  return (
    <Link
      href={`/movies/${filme.id}`}
      className="group flex h-full min-w-0 flex-col overflow-hidden border-2 border-white/10 bg-arcano-surface transition-transform hover:-translate-y-1 hover:border-arcano-main"
    >
      <div className="relative aspect-[2/3] w-full bg-black/30">
        {filme.posterUrl ? (
          <Image
            src={filme.posterUrl}
            alt={filme.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-2 text-center text-xs text-white/30">
            Sem pôster
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between p-3">
        <h2 className="line-clamp-2 text-sm font-bold leading-snug text-white group-hover:text-arcano-main">
          {filme.title}
        </h2>
        <p className="mt-2 text-xs text-white/40">
          {filme.releaseDate ? filme.releaseDate.slice(0, 4) : 'Sem data'} ·{' '}
          {filme.voteAverage.toFixed(1)}
        </p>
      </div>
    </Link>
  );
}
