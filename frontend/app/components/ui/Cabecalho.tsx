'use client';

import Link from 'next/link';
import Image from 'next/image';
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
    <header className="border-b-4 border-arcano-sec bg-arcano-bg">
      <Container className="flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <Link href="/" className="group flex w-fit items-center gap-4 transition-transform hover:-translate-y-0.5">
          <div className="relative h-14 w-14 overflow-hidden rounded-none border-2 border-arcano-main shadow-[4px_4px_0px_0px_#ffd54f]">
            <Image src="/logo.png" alt="Logo Cinema Arcano" fill sizes="56px" className="object-cover" />
          </div>
          <div>
            <span className="block text-2xl font-black uppercase tracking-wide text-arcano-main drop-shadow-[2px_2px_0_#7b1fa2]">
              Cinema Arcano
            </span>
            <span className="block text-xs font-mono uppercase tracking-wide text-white/70">
              Sessões, rituais e ingressos
            </span>
          </div>
        </Link>

        <nav
          aria-label="Navegação principal"
          className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-wide sm:text-sm"
        >
          <Link className="border-2 border-transparent px-2 py-2 text-white/90 transition-colors hover:border-arcano-sec hover:bg-arcano-sec hover:text-white" href="/">
            Catálogo
          </Link>

          {!isLoading && (
            <>
              {user?.role === 'ADMIN' && (
                <>
                  <Link className="border-2 border-transparent px-2 py-2 text-white/90 transition-colors hover:border-arcano-sec hover:bg-arcano-sec hover:text-white" href="/admin/sessions">
                    Sessões
                  </Link>
                  <Link className="border-2 border-transparent px-2 py-2 text-white/90 transition-colors hover:border-arcano-sec hover:bg-arcano-sec hover:text-white" href="/admin/sessions/new">
                    Nova Sessão
                  </Link>
                </>
              )}

              {user?.role === 'CUSTOMER' && (
                <Link className="border-2 border-transparent px-2 py-2 text-white/90 transition-colors hover:border-arcano-sec hover:bg-arcano-sec hover:text-white" href="/reservations">
                  Meus Ingressos
                </Link>
              )}

              {(user?.role === 'GATE' || user?.role === 'ADMIN') && (
                <Link className="border-2 border-transparent px-2 py-2 text-white/90 transition-colors hover:border-arcano-sec hover:bg-arcano-sec hover:text-white" href="/gate">
                  Portaria
                </Link>
              )}

              {!user && (
                <>
                  <Link className="border-2 border-transparent px-2 py-2 text-white/90 transition-colors hover:border-arcano-sec hover:bg-arcano-sec hover:text-white" href="/login">
                    Entrar
                  </Link>
                  <Link
                    className="border-2 border-arcano-main bg-arcano-main px-4 py-2 text-arcano-bg shadow-[4px_4px_0px_0px_#7b1fa2] transition-all duration-150 ease-out hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#7b1fa2] active:translate-x-1 active:translate-y-1 active:shadow-none"
                    href="/register"
                  >
                    Cadastro
                  </Link>
                </>
              )}

              {user && (
                <div className="flex items-center gap-3 border-l-2 border-white/10 pl-3">
                  <span className="hidden text-[11px] font-mono normal-case tracking-normal text-white/40 lg:inline">
                    {user.name}
                  </span>
                  <button
                    type="button"
                    onClick={encerrarSessao}
                    className="border-2 border-rose-500/60 px-4 py-2 text-rose-300 shadow-[4px_4px_0px_0px_#f43f5e40] transition-all duration-150 hover:-translate-y-0.5 hover:border-rose-400 hover:bg-rose-500/10 hover:text-rose-200 hover:shadow-[6px_6px_0px_0px_#f43f5e60] active:translate-x-1 active:translate-y-1 active:shadow-none"
                  >
                    Sair
                  </button>
                </div>
              )}
            </>
          )}
        </nav>
      </Container>
    </header>
  );
}
