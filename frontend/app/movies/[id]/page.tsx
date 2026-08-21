// frontend/app/movies/[id]/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getMovieDetails, getSessions } from '../../services/api';
import { Container } from '../../components/ui/Container';
import { Cartao } from '../../components/ui/Cartao';

type MovieDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function MovieDetailsPage({
  params,
}: MovieDetailsPageProps) {
  const { id } = await params;

  const [movie, sessions] = await Promise.all([
    getMovieDetails(id).catch((err: unknown) => {
      // Backend devolve 404 quando o filme não existe no TMDb.
      if (err instanceof Error && err.message === 'Filme não encontrado.') {
        notFound();
      }
      throw err;
    }),
    getSessions().catch(() => []),
  ]);
  const sessoesDoFilme = sessions.filter(
    (session) => String(session.movie.tmdbId) === id,
  );

  return (
    <div className="flex flex-1 flex-col bg-arcano-bg">
      <Container className="py-6">
        <Link href="/" className="text-sm text-white/50 hover:text-arcano-main">
          ← Voltar
        </Link>
      </Container>

      <Container className="grid flex-1 gap-8 pb-12 lg:grid-cols-[320px_1fr]">
        <div className="mx-auto w-full max-w-xs shrink-0 sm:mx-0">
          <Cartao className="relative aspect-[2/3] w-full overflow-hidden">
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
          </Cartao>
        </div>

        <div>
          <h1 className="text-3xl font-black uppercase tracking-wide text-white sm:text-4xl">
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
                  className="border-2 border-white/10 bg-arcano-surface px-3 py-1 text-xs text-white/70"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          <p className="mt-6 max-w-2xl leading-relaxed text-white/80">
            {movie.overview || 'Sinopse não disponível.'}
          </p>

          <section className="mt-8">
            <h2 className="mb-4 text-xl font-black uppercase tracking-wide text-arcano-main">
              Sessões disponíveis
            </h2>

            {sessoesDoFilme.length === 0 ? (
              <Cartao className="p-4">
                <p className="text-sm text-white/50">
                  Nenhuma sessão futura publicada para este filme.
                </p>
              </Cartao>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {sessoesDoFilme.map((sessao) => (
                  <Cartao key={sessao.id} className="p-4">
                    <p className="text-sm font-bold text-white">
                      {new Intl.DateTimeFormat('pt-BR', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      }).format(new Date(sessao.startTime))}
                    </p>
                    <p className="mt-1 text-xs text-white/50">
                      {sessao.room.name}
                    </p>
                    <p className="mt-3 text-lg font-black text-arcano-main">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(Number(sessao.price))}
                    </p>
                    <Link
                      href={`/sessions/${sessao.id}`}
                      className="mt-4 inline-flex w-full items-center justify-center border-2 border-arcano-main bg-arcano-main px-4 py-2 text-center text-sm font-bold uppercase tracking-wide text-arcano-bg hover:bg-arcano-ter sm:w-auto"
                    >
                      Escolher assentos
                    </Link>
                  </Cartao>
                ))}
              </div>
            )}
          </section>
        </div>
      </Container>
    </div>
  );
}
