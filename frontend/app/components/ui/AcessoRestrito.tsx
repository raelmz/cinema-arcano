// frontend/app/components/ui/AcessoRestrito.tsx

import Link from 'next/link';
import { Cartao } from './Cartao';
import { Container } from './Container';

type AcessoRestritoProps = {
  titulo?: string;
  mensagem?: string;
};

export function AcessoRestrito({
  titulo = 'Acesso restrito',
  mensagem = 'Esta área exige uma conta com permissão específica.',
}: AcessoRestritoProps) {
  return (
    <Container className="py-16">
      <Cartao destaque className="mx-auto max-w-3xl p-8">
        <p className="font-mono text-sm uppercase tracking-wide text-red-300">
          Permissão negada
        </p>
        <h1 className="mt-3 text-4xl font-black uppercase tracking-wide text-white md:text-6xl">
          {titulo}
        </h1>
        <p className="mt-4 max-w-xl text-white/60">{mensagem}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="border-2 border-arcano-main bg-arcano-main px-5 py-3 text-sm font-bold uppercase tracking-wide text-arcano-bg hover:bg-arcano-ter"
          >
            Entrar com outra conta
          </Link>
          <Link
            href="/"
            className="border-2 border-white/20 px-5 py-3 text-sm font-bold uppercase tracking-wide text-white/70 hover:border-arcano-main hover:text-arcano-main"
          >
            Voltar ao catálogo
          </Link>
        </div>
      </Cartao>
    </Container>
  );
}
