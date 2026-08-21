// frontend/app/movies/[id]/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getMovieDetails } from '../../services/api';

type MovieDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function MovieDetailsPage({
  params,
}: MovieDetailsPageProps) {
  const { id } = await params;

  const movie = await getMovieDetails(id).catch((err: unknown) => {
    // Backend devolve 404 quando o filme não existe no TMDb
    if (err instanceof Error && err.message === 'Filme não encontrado.') {
      notFound();
    }
    throw err;
  });

  return (
    <div className="flex flex-1 flex-col bg-arcano-bg">
      <div className="px-6 py-6 sm:px-12">
        <Link href="/" className="text-sm text-white/50 hover:text-arcano-main">
          ← Voltar
        </Link>
      </div>

      <main className="flex flex-1 flex-col gap-8 px-6 pb-12 sm:flex-row sm:px-12">
        <div className="mx-auto w-full max-w-xs shrink-0 sm:mx-0">
          <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-arcano-surface">
            {movie.posterUrl ? (
              <Image
                src={movie.posterUrl}
                alt={movie.title}
                fill
                sizes="(max-width: 640px) 100vw, 320px"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-white/30">
                Sem pôster
              </div>
            )}
          </div>
        </div>

        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            {movie.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white/50">
            {movie.releaseDate && <span>{movie.releaseDate.slice(0, 4)}</span>}
            {movie.runtime > 0 && (
              <>
                <span aria-hidden>·</span>
                <span>{movie.runtime} min</span>
              </>
            )}
            <span aria-hidden>·</span>
            <span className="text-arcano-main">
              ⭐ {movie.voteAverage.toFixed(1)}
            </span>
          </div>

          {movie.genres.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {movie.genres.map((genre) => (
                <span
                  key={genre}
                  className="rounded-full bg-arcano-surface px-3 py-1 text-xs text-white/70"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          <p className="mt-6 max-w-2xl leading-relaxed text-white/80">
            {movie.overview || 'Sinopse não disponível.'}
          </p>
        </div>
      </main>
    </div>
  );
}