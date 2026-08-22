import Link from 'next/link';
import { BandeiraPagamento } from './BandeiraPagamento';
import { Container } from './Container';

const linksCatalogo = [
  { href: '/', label: 'Em cartaz' },
  { href: '/reservations', label: 'Meus ingressos' },
];

const linksAjuda = [
  { href: '/sobre', label: 'Sobre o Cinema Arcano' },
  { href: '/contato', label: 'Fale conosco' },
  { href: '/termos', label: 'Termos de uso' },
];

export function Rodape() {
  return (
    <footer className="border-t-4 border-arcano-main bg-arcano-bg">
      <Container className="py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <span className="block text-xl font-black uppercase tracking-wide text-arcano-main drop-shadow-[2px_2px_0_#7b1fa2]">
              Cinema Arcano
            </span>
            <p className="mt-3 max-w-sm text-sm text-white/50">
              Sessões, rituais e ingressos. Um portal para histórias que
              merecem ser vistas na tela grande.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/35">
                Pagamento aceito
              </span>
              <BandeiraPagamento marca="visa" />
              <BandeiraPagamento marca="mastercard" />
              <BandeiraPagamento marca="pix" />
            </div>
          </div>

          <div>
            <span className="mb-4 block text-xs font-bold uppercase tracking-widest text-white/40">
              Catálogo
            </span>
            <ul className="flex flex-col gap-2">
              {linksCatalogo.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 transition-colors hover:text-arcano-main"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span className="mb-4 block text-xs font-bold uppercase tracking-widest text-white/40">
              Ajuda
            </span>
            <ul className="flex flex-col gap-2">
              {linksAjuda.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 transition-colors hover:text-arcano-main"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between font-mono uppercase tracking-wider">
          <span className="font-bold text-white/70">
            Cinema Arcano © {new Date().getFullYear()}
          </span>
          <span>Projeto Elite Dev · Verzel</span>
        </div>
      </Container>
    </footer>
  );
}
