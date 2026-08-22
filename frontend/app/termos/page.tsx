// frontend/app/termos/page.tsx
import { Container } from '../components/ui/Container';
import { Cartao } from '../components/ui/Cartao';

const secoes = [
  {
    titulo: '1. Reservas e assentos',
    texto:
      'Ao escolher um assento no mapa da Sala 1, sua reserva fica pendente por tempo limitado até a confirmação do pagamento. Reservas não pagas dentro do prazo são liberadas automaticamente e o assento volta a ficar disponível para outra pessoa.',
  },
  {
    titulo: '2. Pagamento (simulado)',
    texto:
      'O checkout aceita cartão ou PIX apenas para fins de demonstração — nenhuma cobrança real é feita em nenhuma etapa. O resultado (aprovado ou recusado) é simulado e serve para mostrar os dois caminhos do fluxo de compra.',
  },
  {
    titulo: '3. Cancelamento de sessão',
    texto:
      'Se o organizador cancelar uma sessão, todas as reservas e assentos vinculados a ela são liberados automaticamente. Como não há cobrança real (ver item 2), não existe reembolso monetário — apenas a liberação do assento.',
  },
  {
    titulo: '4. Ingresso digital',
    texto:
      'Cada ingresso é único e validado por QR Code assinado na entrada. Não compartilhe seu ingresso — o primeiro código lido pela portaria é o único aceito; tentativas seguintes retornam como "já utilizado".',
  },
  {
    titulo: '5. Conduta na sala',
    texto:
      'Pedimos silêncio durante a sessão e respeito aos demais assentos. O descumprimento pode resultar na remoção da sala.',
  },
];

export default function TermosPage() {
  return (
    <div className="flex flex-1 flex-col py-16">
      <Container>
        <span className="mb-4 inline-block border-2 border-arcano-main bg-arcano-main px-3 py-1 font-mono text-sm font-bold uppercase tracking-widest text-arcano-bg shadow-[4px_4px_0_#7b1fa2]">
          Termos
        </span>
        <h1 className="mb-8 max-w-3xl text-4xl font-black uppercase tracking-tight text-white drop-shadow-[4px_4px_0_#7b1fa2] md:text-6xl">
          Termos de uso
        </h1>

        <div className="flex max-w-3xl flex-col gap-4">
          <Cartao destaque className="p-6">
            <p className="text-sm text-white/70">
              O Cinema Arcano é um projeto de portfólio — não uma bilheteria
              real. Estes termos descrevem como o sistema funciona hoje, não
              um contrato comercial.
            </p>
          </Cartao>

          {secoes.map((secao) => (
            <Cartao key={secao.titulo} className="p-6">
              <h2 className="mb-2 text-lg font-black uppercase tracking-wide text-arcano-main">
                {secao.titulo}
              </h2>
              <p className="text-sm text-white/70">{secao.texto}</p>
            </Cartao>
          ))}
        </div>
      </Container>
    </div>
  );
}
