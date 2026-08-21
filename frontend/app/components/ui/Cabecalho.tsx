// frontend/app/components/ui/Cabecalho.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Container } from './Container';

export function Cabecalho() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  function encerrarSessao() {
    logout();
    router.push('/');
  }

  return (
    <header className="border-b-2 border-white/10 bg-arcano-bg">
      <Container className="flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between">
        <Link href="/" className="group w-fit">
          <span className="block text-2xl font-black uppercase tracking-wide text-arcano-main">
            Cinema Arcano
          </span>
          <span className="block text-xs font-mono uppercase tracking-wide text-white/45 group-hover:text-white/70">
            Sessões, rituais e ingressos
          </span>
        </Link>

        <nav
          aria-label="Navegação principal"
          className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide sm:gap-3 sm:text-sm"
        >
          <Link className="px-1 py-2 text-white/70 hover:text-arcano-main" href="/">
            Catálogo
          </Link>

          {user?.role === 'ADMIN' && (
            <>
              <Link
                className="px-1 py-2 text-white/70 hover:text-arcano-main"
                href="/admin/sessions"
              >
                Sessões
              </Link>
              <Link
                className="px-1 py-2 text-white/70 hover:text-arcano-main"
                href="/admin/sessions/new"
              >
                Nova Sessão
              </Link>
            </>
          )}

          {user?.role === 'CUSTOMER' && (
            <Link
              className="px-1 py-2 text-white/70 hover:text-arcano-main"
              href="/reservations"
            >
              Meus Ingressos
            </Link>
          )}

          {user?.role === 'GATE' && (
            <Link
              className="px-1 py-2 text-white/70 hover:text-arcano-main"
              href="/gate"
            >
              Portaria
            </Link>
          )}

          {!isLoading && !user && (
            <>
              <Link className="px-1 py-2 text-white/70 hover:text-arcano-main" href="/login">
                Entrar
              </Link>
              <Link
                className="border-2 border-arcano-main bg-arcano-main px-3 py-2 text-arcano-bg hover:bg-arcano-ter"
                href="/register"
              >
                Cadastro
              </Link>
            </>
          )}

          {user && (
            <button
              type="button"
              onClick={encerrarSessao}
              className="border-2 border-white/20 px-3 py-2 text-white/70 hover:border-arcano-main hover:text-arcano-main"
            >
              Sair
            </button>
          )}
        </nav>
      </Container>
    </header>
  );
}
