// frontend/app/sobre/page.tsx
import { Container } from '../components/ui/Container';
import { Cartao } from '../components/ui/Cartao';

export default function SobrePage() {
  return (
    <div className="flex flex-1 flex-col py-16">
      <Container>
        <span className="mb-4 inline-block border-2 border-arcano-main bg-arcano-main px-3 py-1 font-mono text-sm font-bold uppercase tracking-widest text-arcano-bg shadow-[4px_4px_0_#7b1fa2]">
          Sobre
        </span>
        <h1 className="mb-8 max-w-3xl text-4xl font-black uppercase tracking-tight text-white drop-shadow-[4px_4px_0_#7b1fa2] md:text-6xl">
          O Cinema Arcano
        </h1>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Cartao destaque className="p-8 lg:col-span-2">
            <p className="text-white/70">
              O Cinema Arcano nasceu da ideia de que assistir a um filme é um
              pequeno ritual: as luzes se apagam, o mundo lá fora some por
              algumas horas, e uma nova história toma o seu lugar. Trazemos
              esse espírito para cada sessão, cada assento e cada ingresso.
            </p>
            <p className="mt-4 text-white/70">
              Aqui você encontra os filmes em cartaz — vindos direto do
              catálogo do TMDb —, escolhe seu assento no mapa da sala, invoca
              seu ingresso digital e apresenta o QR Code na portaria. Tudo em
              um único fluxo, sem etapas escondidas.
            </p>
            <p className="mt-4 text-sm text-white/45">
              Este é um projeto de portfólio, desenvolvido para o desafio
              técnico Elite Dev da Verzel. O catálogo de filmes é real (TMDb);
              os assentos e ingressos são gerenciados por um backend próprio;
              já o pagamento é <strong className="text-white/60">simulado</strong>,
              sem cobrança real em nenhuma etapa.
            </p>
          </Cartao>

          <Cartao className="p-8">
            <span className="mb-3 block text-xs font-bold uppercase tracking-widest text-white/40">
              A sala
            </span>
            <ul className="flex flex-col gap-3 text-sm text-white/70">
              <li>
                <span className="font-black text-arcano-main">1</span> sala —
                Cinema Arcano, Sala 1
              </li>
              <li>
                <span className="font-black text-arcano-main">40</span>{' '}
                assentos, em 5 fileiras de 8 lugares
              </li>
              <li>
                <span className="font-black text-arcano-main">3</span> papéis
                distintos: organizador, cliente e portaria
              </li>
              <li>
                <span className="font-black text-arcano-main">QR</span>{' '}
                assinado por ingresso, validado uma única vez
              </li>
            </ul>
          </Cartao>
        </div>
      </Container>
    </div>
  );
}
