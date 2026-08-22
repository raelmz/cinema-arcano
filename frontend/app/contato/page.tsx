// frontend/app/contato/page.tsx
import { Container } from '../components/ui/Container';
import { Cartao } from '../components/ui/Cartao';

const EMAIL_CONTATO = 'rael.profissional@gmail.com';

export default function ContatoPage() {
  return (
    <div className="flex flex-1 flex-col py-16">
      <Container>
        <span className="mb-4 inline-block border-2 border-arcano-main bg-arcano-main px-3 py-1 font-mono text-sm font-bold uppercase tracking-widest text-arcano-bg shadow-[4px_4px_0_#7b1fa2]">
          Contato
        </span>
        <h1 className="mb-8 max-w-3xl text-4xl font-black uppercase tracking-tight text-white drop-shadow-[4px_4px_0_#7b1fa2] md:text-6xl">
          Fale conosco
        </h1>

        <Cartao destaque className="max-w-2xl p-8">
          <p className="text-white/70">
            O Cinema Arcano é um projeto de portfólio, sem equipe de suporte
            por trás. Em vez de simular um formulário que não chega a lugar
            nenhum, o canal direto abaixo abre seu cliente de e-mail com o
            destinatário já preenchido.
          </p>

          <a
            href={`mailto:${EMAIL_CONTATO}?subject=${encodeURIComponent(
              'Cinema Arcano — contato',
            )}`}
            className="mt-6 inline-block border-2 border-arcano-main bg-arcano-main px-5 py-3 text-center text-sm font-bold uppercase tracking-wide text-arcano-bg transition-colors hover:bg-arcano-ter"
          >
            Enviar e-mail
          </a>

          <p className="mt-4 font-mono text-xs uppercase tracking-widest text-white/40">
            {EMAIL_CONTATO}
          </p>
        </Cartao>
      </Container>
    </div>
  );
}
