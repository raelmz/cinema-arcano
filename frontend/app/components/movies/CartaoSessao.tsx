// frontend/app/components/movies/CartaoSessao.tsx

import Image from 'next/image';
import Link from 'next/link';
import type { Sessao } from '../../services/api';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

function resolverPosterSessao(posterPath: string | null) {
  if (!posterPath) return null;
  return posterPath.startsWith('http')
    ? posterPath
    : `${TMDB_IMAGE_BASE}${posterPath}`;
}

type CartaoSessaoProps = {
  sessao: Sessao;
};

export function CartaoSessao({ sessao }: CartaoSessaoProps) {
  const posterUrl = resolverPosterSessao(sessao.movie.posterPath);

  const dataFormatada = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(sessao.startTime));

  const precoFormatado = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(sessao.price));

  return (
    <Link
      href={`/movies/${sessao.movie.tmdbId}`}
      className="group flex h-full min-w-0 flex-col overflow-hidden border-2 border-white/10 bg-arcano-surface transition-transform hover:-translate-y-1 hover:border-arcano-main"
    >
      <div className="relative aspect-2/3 w-full overflow-hidden bg-black/30">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={sessao.movie.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover transition-all duration-300 ease-out group-hover:scale-105 group-hover:brightness-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-2 text-center text-xs text-white/30">
            Sem pôster
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 opacity-0 shadow-[inset_0_0_40px_10px_rgba(123,31,162,0.6)] transition-opacity duration-300 group-hover:opacity-100" />

        <span className="absolute left-2 top-2 border-2 border-arcano-main bg-arcano-bg/90 px-2 py-0.5 font-mono text-xs font-bold text-arcano-main">
          {precoFormatado}
        </span>
      </div>
      <div className="flex flex-1 flex-col justify-between p-3">
        <h2 className="line-clamp-2 text-sm font-bold leading-snug text-white group-hover:text-arcano-main">
          {sessao.movie.title}
        </h2>
        <p className="mt-2 text-xs text-white/40">
          {dataFormatada} · {sessao.room.name}
        </p>
      </div>
    </Link>
  );
}
