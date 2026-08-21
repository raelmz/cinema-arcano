// frontend/app/not-found.tsx

import Link from 'next/link';
import { Cartao } from './components/ui/Cartao';
import { Container } from './components/ui/Container';

export default function NotFound() {
  return (
    <Container className="py-16">
      <Cartao destaque className="mx-auto max-w-3xl p-8">
        <p className="font-mono text-sm uppercase tracking-wide text-arcano-main">
          Erro 404
        </p>
        <h1 className="mt-3 text-4xl font-black uppercase tracking-wide text-white md:text-6xl">
          Esta sessão saiu de cartaz
        </h1>
        <p className="mt-4 max-w-xl text-white/60">
          O endereço acessado não existe no Cinema Arcano ou foi removido do
          catálogo desta dimensão.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block border-2 border-arcano-main bg-arcano-main px-5 py-3 text-sm font-bold uppercase tracking-wide text-arcano-bg hover:bg-arcano-ter"
        >
          Voltar ao catálogo
        </Link>
      </Cartao>
    </Container>
  );
}
