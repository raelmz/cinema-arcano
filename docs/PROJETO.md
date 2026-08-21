# Documentação do Projeto — Cinema Arcano

> Este é o meu diário de decisões para o desafio técnico da Verzel (Elite Dev). Uso IA como apoio para organizar ideias, revisar trade-offs e manter esse registro atualizado a cada sessão — mas as decisões de produto e arquitetura são minhas. Mantenho isso versionado no repositório porque o próprio desafio pede transparência sobre processo, e porque documentar o "porquê" evita que decisões corretas pareçam arbitrárias numa leitura rápida do código.

**Última atualização**: 20/08/2026
**Autor**: Israel Menezes de Andrade
**Status**: Módulo Auth **completo, backend e frontend, ambos implementados, testados e commitados** — demais módulos de aplicação (catálogo, reserva, pagamento, ticket, portaria) ainda não iniciados

---

## 1. Contexto do desafio

Etapa 3 de 6 do processo seletivo **Elite Dev** (Verzel — vaga de Desenvolvedor Full Stack Jr).

**E-mail recebido**: 18/08/2026, 13:03 (via Pipefy).
**Prazo**: 7 dias corridos a partir do recebimento → **entrega até 25/08/2026, 13:03**.

Fases do processo:
1. Candidatura (Triagem)
2. Teste Técnico Online (Coderbyte)
3. **Projeto de desenvolvimento (GitHub) ← estamos aqui**
4. Papo com o time de Pessoas (RH)
5. Dinâmica Final
6. Contratação

### O que avaliam de verdade

O PDF do desafio é explícito: eles já receberam candidatos que colaram o enunciado numa IA e devolveram "o sistema pronto" — e isso é tratado como o principal erro a evitar. O texto usa o termo **"AI slop"**: interfaces genéricas, sem nenhuma decisão de produto por trás, reconhecíveis de longe.

O que pesa na nota, segundo o próprio PDF:
- **As decisões tomadas e o porquê** — não o volume de features entregue.
- Fluxo completo e simples > fluxo sofisticado pela metade.
- Documentação clara de processo, incluindo uso de IA (não é punido, é esperado — desde que explicado).
- README detalhado, inclusive listando o que **não** funciona.
- Histórico de commits ao longo da semana (mostra processo, não só resultado final).

**Implicação prática**: este documento e as decisões registradas nele são, em si, parte do que será avaliado — não é só bagagem de bastidores.

---

## 2. Proposta do produto

**Plataforma de Eventos e Ingressos**: organizador publica eventos a partir de um catálogo externo; cliente navega, reserva, paga (simulado) e recebe ingresso com QR code; portaria valida o ingresso na entrada.

### 2.1 Identidade: Cinema Arcano

Decidi dar identidade própria ao produto em vez de entregar um cinema genérico. Toda referência de mercado que olhei (sites de venda de ingresso) segue o mesmo padrão visual e de copy — o que reforça o risco que o próprio desafio descreve como "AI slop": interfaces que qualquer um reconhece de longe.

**Conceito**: Cinema Arcano — uma sala de cinema com identidade "arcana"/mística, que trata a compra do ingresso como um pequeno ritual de entrada no mundo do filme, não como um checkout qualquer.

**Como isso entra no projeto, na prática**:
- Nome, paleta de cores e tipografia próprios (a definir na fase de UI).
- Microcopy temática nas telas principais (ex.: confirmação de ingresso, tela de portaria) em vez de textos genéricos de sistema.
- **Decisão de escopo**: o tema fica restrito a identidade visual e copy, aplicado sobre uma estrutura de componentes simples. Não vou usar o tema para justificar UX não-convencional ou fluxos alternativos — o fluxo continua sendo o fluxo padrão de compra de ingresso, só que com uma casca própria. Isso porque, com 7 dias e ainda bastante trabalho de back-end pela frente (QR, concorrência, auth própria), polimento visual tem custo de tempo que cresce rápido se não for limitado — e a nota pesa mais sobre fluxo completo e decisões técnicas do que sobre acabamento visual.

### Papéis (3 perfis distintos, com autenticação)
- **Organizador**: cria e gerencia eventos.
- **Cliente**: navega, reserva, paga, recebe e compartilha ingressos.
- **Portaria**: valida ingressos na entrada do evento.

---

## 3. Requisitos funcionais

### Front-End
- [ ] Navegação e busca de eventos publicados (data, local, preço)
- [ ] Criação e gerenciamento de eventos (organizador)
- [ ] Fluxo de reserva com seleção de lugar em mapa de assentos
- [ ] Pagamento simulado — com caminho de confirmação **e** de recusa
- [ ] "Meus ingressos" com exibição do QR code
- [ ] Tela de portaria com retorno claro: válido / inválido / já utilizado / evento errado
- [ ] Leitura de QR via câmera na portaria, com digitação manual como alternativa

*(Autenticação — login e cadastro — não está listada como item separado nesta seção porque é pré-requisito transversal aos itens acima, não um requisito funcional isolado do desafio. Está implementada; ver seção 4.20 a 4.24.)*

### Back-End
- [ ] Integração com API externa de catálogo (ver decisão na seção 4)
- [ ] Autenticação com os 3 papéis
- [ ] Persistência de eventos, reservas e ingressos
- [ ] Garantia de que o mesmo assento não seja vendido duas vezes (concorrência)
- [ ] QR code não forjável (não pode ser um ID cru — precisa de assinatura/hash verificável)
- [ ] Geração de link compartilhável do ingresso
- [ ] Validação de ingresso impedindo reuso

### Fora de escopo (explícito no desafio — não implementar)
Nota fiscal, revenda entre usuários, aplicativo nativo, recuperação de senha, envio de ingresso por e-mail.

### Opcionais (somam nota, não obrigatórios)
Busca/filtro avançado, painel do organizador mais completo, cancelamento com devolução ao estoque, mapa de assentos em tempo real, Docker Compose, testes automatizados, deploy publicado (**+1 ponto garantido no critério oficial**).

---

## 4. Decisões técnicas tomadas até agora

Cada decisão abaixo inclui o motivo — é o material bruto para a seção "como pensei" do README final.

### 4.1 Stack final

```
                     INTERNET
                        │
                        ▼
              ┌──────────────────┐
              │     Next.js      │
              │   Frontend Web   │
              └────────┬─────────┘
                       │
                   REST / HTTPS
                       │
                       ▼
              ┌──────────────────┐
              │      NestJS      │
              │    Backend API   │
              └────────┬─────────┘
                       │
                    Prisma
                       │
                       ▼
              ┌──────────────────┐
              │   PostgreSQL     │
              │ Managed Database │
              └──────────────────┘
                       ▲
                       │
              ┌──────────────────┐
              │       TMDb       │
              │  External API    │
              └──────────────────┘
```

Escolhi essa stack para maximizar a demonstração de engenharia de software dentro dos 7 dias de prazo, sem adicionar complexidade desnecessária:

- **Next.js + TypeScript**: base sólida para a aplicação web, com deploy simples na Vercel.
- **NestJS + TypeScript**: estrutura o backend em módulos e concentra ali toda a lógica de negócio — autenticação, autorização, reservas, pagamentos, ingressos e portaria.
- **PostgreSQL**: banco relacional adequado ao domínio, e especialmente apropriado para garantir integridade e concorrência na venda de assentos (a regra "o mesmo lugar não pode ser vendido duas vezes" se apoia em transações/constraints do próprio banco).
- **Prisma**: camada de acesso ao banco fortemente integrada ao TypeScript, com migrations e modelagem tipada.
- **JWT + Argon2id + RBAC**: autenticação e autorização implementadas diretamente na API, em vez de delegadas a um BaaS — isso é proposital: o desafio pede para ver a camada de backend que eu projetei, não uma configuração de terceiro.
- **TMDb**: catálogo externo com baixo risco de integração (ver decisão 4.2), liberando tempo para as regras de negócio mais relevantes.
- **Docker Compose**: facilita reprodução do ambiente de desenvolvimento por quem for avaliar o projeto.
- **Vercel (front) + hospedagem gerenciada para o backend + Postgres gerenciado**: entrega uma aplicação de fato acessível pela internet, sem depender de manter infraestrutura ou computador pessoal ligado. *(Provedor específico do backend/banco — Railway, Render, Fly.io, Neon etc. — a definir; ver seção 6.)*

Evitei deliberadamente microserviços, Redis, filas, Kubernetes e qualquer tecnologia que não agregasse valor proporcional ao escopo. O objetivo aqui é mostrar boas decisões arquiteturais, segurança, consistência de dados, tratamento de concorrência e um fluxo completo — não quantidade de tecnologias.

**Nota sobre a evolução dessa decisão**: cheguei a considerar Supabase como banco gerenciado por trás de uma API própria (ver decisão original no changelog de 19/08). Descartei essa camada intermediária: se o objetivo é mostrar autenticação e autorização projetadas por mim, faz mais sentido a Auth também ser minha (JWT + Argon2id + RBAC) em vez de depender do Auth de um BaaS — mesmo que ele fique "escondido" atrás da minha API.

### 4.2 API externa de catálogo — TMDb, não Ticketmaster
**Decisão**: usar TMDb (filmes), tratando cada filme como uma "sessão" configurada pelo organizador (define horário, sala/local e preço).

**Porquê**:
- Ticketmaster Discovery tem mais fricção de integração (rate limit mais apertado, dados de venue inconsistentes/incompletos).
- TMDb tem documentação madura, resposta rápida de aprovação de key, dados ricos (poster, sinopse) que melhoram a UI sem esforço extra.
- Com 7 dias de prazo, a fricção técnica economizada é redirecionada para as partes mais avaliadas: QR não forjável, concorrência de assentos, portaria, README.
- **Risco identificado e aceito conscientemente**: cinema é o cenário mais "óbvio" para filme + assentos, correndo o risco de parecer padrão. Mitigação: a diferenciação não vem da API escolhida, e sim de como as telas de reserva, recusa de pagamento e portaria são desenhadas — isso é decisão de produto, não de fonte de dados.

### 4.3 Modelo de reserva — mapa de assentos, sem pista
**Decisão**: implementar apenas mapa de assentos (não implementar reserva por quantidade/pista).

**Porquê**:
- Coerente com a escolha de TMDb/cinema.
- É a parte tecnicamente mais rica do desafio (concorrência real: dois clientes disputando o mesmo assento), e por isso a que mais demonstra capacidade técnica.
- O próprio desafio recomenda fluxo completo e simples em vez de dois fluxos pela metade — fazer só um bem feito reduz risco de entrega capenga no prazo.

### 4.4 Arquitetura de backend — API própria, sem BaaS
Consolidado dentro da stack final (seção 4.1): NestJS concentra toda a lógica de negócio, com Auth própria (JWT + Argon2id + RBAC). O PDF do desafio lista explicitamente frameworks de API (NestJS, Express, FastAPI, Django, Spring Boot) como as opções de back-end — não cita BaaS como alternativa, o que reforça que querem ver uma camada de API projetada pelo candidato, não configurada a partir de um provedor.

**Vercel para deploy do front**: decisão de baixo risco — é a opção literalmente sugerida no PDF ("Vercel ou plataforma similar"), vale +1 ponto no critério oficial.

### 4.5 Ambiente de banco local — Docker Compose

**Decisão**: PostgreSQL 16 rodando em container local via `docker-compose.yml` dentro de `backend/`, em vez de instalado direto no sistema operacional.

**Porquê**: ambiente descartável e reproduzível — qualquer pessoa que for rodar o projeto (incluindo o avaliador) sobe o banco com um único comando, sem precisar instalar Postgres manualmente na máquina. Reduz também o risco de conflito de versão entre o Postgres do meu ambiente de desenvolvimento e o que será usado em produção.

```yaml
services:
  postgres:
    image: postgres:16
    container_name: cinema-arcano-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: cinema_arcano
    ports:
      - "5432:5432"
    volumes:
      - cinema_arcano_pgdata:/var/lib/postgresql/data
volumes:
  cinema_arcano_pgdata:
```

Testado localmente (Windows 11 + WSL2 + Docker Desktop): banco sobe com `docker compose up -d`, confirmado `Up` via `docker ps`.

### 4.6 Versão do Prisma — downgrade de 7 para 6.x

**Decisão**: usar Prisma na linha 6.x, não a 7 (que veio instalada por padrão ao rodar `npx prisma init` nesta fase do projeto).

**Porquê**: a versão 7 exige uma configuração nova (`prisma.config.ts` obrigatório, mudança de como a `DATABASE_URL` é resolvida) que ainda tem pouca documentação e poucos tutoriais maduros. Dado o prazo de 7 dias, priorizei a versão estável e amplamente documentada — menos superfície de coisa nova pra debugar, mais tempo pra regra de negócio. Isso significa: `schema.prisma` resolve a conexão sozinho via `datasource db { url = env("DATABASE_URL") }`, sem `prisma.config.ts` na raiz do backend.

### 4.7 Schema do banco

Modelagem inicial com 10 tabelas, cobrindo os três papéis (organizador, cliente, portaria) e o fluxo completo de reserva → pagamento → ingresso → validação:

- **User** — usuários da plataforma, com papel (role: organizador / cliente / portaria)
- **Movie** — cópia local dos dados relevantes do filme vindos da TMDb (título, sinopse, pôster) no momento em que o organizador cria uma sessão — ver decisão de "copiar vs buscar ao vivo" já discutida
- **Room** — sala de exibição, com sua disposição de assentos
- **Seat** — assento individual, pertencente a uma sala
- **Session** — a "sessão" de fato: um filme (`Movie`) numa sala (`Room`), em uma data/horário, com preço definido pelo organizador
- **Reservation** — a reserva feita por um cliente para uma sessão
- **ReservationSeat** — tabela de junção entre `Reservation` e `Seat`, com a constraint `UNIQUE(sessionId, seatId)` que impede o mesmo assento ser reservado duas vezes na mesma sessão (ver decisão 4.8)
- **Ticket** — o ingresso gerado após pagamento confirmado, com o payload assinado (JWT) usado no QR code
- **ValidationLog** — registro de cada tentativa de validação na portaria (para rastrear "já utilizado" e auditoria)
- **Payment** — registro da simulação de pagamento (confirmado ou recusado)

*(Diagrama de relacionamento entre as tabelas: a incluir aqui numa próxima atualização, se fizer sentido para clareza.)*

### 4.8 Concorrência no assento — constraint UNIQUE, não lock manual

**Decisão**: a garantia de que o mesmo assento não seja vendido duas vezes vem de uma constraint `UNIQUE(sessionId, seatId)` na tabela `ReservationSeat`, aplicada dentro de uma transação Prisma.

**Porquê**: delegar essa garantia ao próprio banco (constraint de unicidade) é mais robusto do que implementar um lock otimista ou pessimista na aplicação — o Postgres rejeita a segunda tentativa de insert automaticamente, mesmo sob concorrência real (duas requisições simultâneas), sem eu precisar reinventar controle de concorrência na camada de aplicação. Menos código próprio para errar, dado o prazo.

### 4.9 QR code do ingresso — JWT assinado (HS256)

**Decisão**: o conteúdo do QR code é um JWT assinado (HS256), não um HMAC construído manualmente nem um ID cru do banco.

**Porquê**:
- Um ID cru seria trivialmente forjável (ou adivinhável) — não atende ao requisito de QR "que não possa ser forjado".
- Reaproveita a mesma biblioteca e o mesmo modelo mental já usado na autenticação (JWT + Argon2id), reduzindo a quantidade de código novo e criptografia própria pra debugar em 7 dias.
- JWT já resolve expiração de forma nativa (`exp`), o que é útil para invalidar ingressos de sessões já encerradas.

**Pendente de detalhar**: o payload exato do JWT do ticket (quais campos entram — ex: `ticketId`, `sessionId`, `seatId` — e o tempo de expiração escolhido). Ver seção 6.

### 4.10 Payload do JWT do ticket

**Decisão**: o QR code do ingresso carrega um JWT (HS256, ver decisão 4.9) com o seguinte payload:

| Campo | Função |
|---|---|
| `ticketId` | Identifica o ingresso no banco — usado pela portaria para buscar o registro e checar status ("já utilizado") |
| `sessionId` | Permite a portaria detectar "evento errado" sem precisar de outra consulta |
| `seatId` | Exibido na tela da portaria no momento da validação (não obrigatório para a validação em si) |
| `iat` | Data de emissão (padrão JWT, útil para auditoria) |
| `exp` | Expiração = horário da sessão + duração do filme + margem de tolerância |

**Porquê**: nenhum dado pessoal do cliente (nome, e-mail) ou valor pago entra no token — o JWT do ticket prova posse de um ingresso válido, não autentica um usuário. Essas informações continuam só no banco, associadas ao `ticketId`.

Sobre a expiração: optei por atrelar o `exp` ao horário da sessão (em vez de não usar expiração e depender só do campo de status no banco) porque isso resolve "evento errado/expirado" com uma verificação nativa do próprio JWT — funciona como camada extra de defesa mesmo que a checagem contra o banco falhe ou esteja indisponível no momento da validação na portaria.

### 4.11 Hospedagem gerenciada — Render (backend + PostgreSQL)

**Decisão**: backend (NestJS) e PostgreSQL gerenciado hospedados no Render, free tier.

**Porquê**:
- Este projeto vai para o meu portfólio, não é descartável após a avaliação — então priorizei durabilidade sobre performance de free tier: o Render tem um limite de free tier melhor para manter o projeto no ar por tempo indeterminado, comparado às alternativas consideradas (Railway, Fly.io, Neon).
- Trade-off consciente e documentado: **cold start**. No free tier, o serviço web "dorme" após um período de inatividade e a primeira requisição depois disso demora mais para responder (o servidor precisa "acordar"). Decidi aceitar esse trade-off porque:
  - O impacto é só na primeira requisição após inatividade, não no uso contínuo.
  - Para um projeto de portfólio (visitado esporadicamente, não em produção real com tráfego constante), durabilidade do free tier pesa mais do que latência de cold start.
  - Não justifica o custo de um plano pago para um desafio técnico.

**Pendente**: se o cold start atrapalhar a demonstração para o avaliador, considerar algum mecanismo simples de keep-alive (ex: ping periódico) — decisão a avaliar mais perto da entrega, sem prioridade agora.

### 4.12 Identidade visual do Cinema Arcano — fechada

**Decisão**: paleta e estilo definidos e já implementados no `globals.css` do frontend (Tailwind v4, via `@theme`):

| Papel | Cor | Hex |
|---|---|---|
| Cor principal (destaque, botões, títulos) | Amarelo Arcano | `#ffd54f` |
| Cor secundária (ações, hover) | Roxo Escuro | `#7b1fa2` |
| Cor terciária (labels, acentos) | Laranja | `#ff8f00` |
| Fundo | Quase-preto | `#1a161d` |
| Superfície (cards, formulários) | Quase-preto (mais escuro) | `#161219` |

Estilo visual: **neo-brutalismo** — sem `border-radius`, bordas sólidas de 2px, sombras duras (`box-shadow` deslocada, sem blur), tipografia em caixa alta com `tracking-widest` nos títulos e labels.

**Porquê**: reforça a decisão já registrada na seção 2.1 (identidade "Cinema Arcano", ritual de entrada) sem gastar tempo do prazo em UX não-convencional — o neo-brutalismo dá personalidade visual forte com poucas regras de CSS (sem sombras suaves, sem cantos arredondados, sem gradientes), evitando o visual genérico de UI gerada por IA que o próprio desafio penaliza como "AI slop".

### 4.20 Frontend — roteamento e formulários

**Decisão**: roteamento via **App Router** do Next.js (`app/`); formulários com **`react-hook-form` + `zod`** (validação de schema), integrados via `@hookform/resolvers`.

**Porquê**: App Router é o padrão atual do Next.js e o projeto já foi inicializado dessa forma. `react-hook-form` evita re-render a cada tecla digitada (melhor performance que estado controlado manual), e `zod` centraliza a validação em um schema só, reaproveitado tanto para o tipo TypeScript do formulário (`z.infer`) quanto para a validação em si — uma fonte de verdade, sem duplicar regras entre tipo e validação.

### 4.21 Frontend — módulo Auth (login e cadastro)

**Decisão**: páginas `app/login/page.tsx` e `app/register/page.tsx`, ambas client components (`'use client'`), consumindo `POST /auth/login` e `POST /auth/register` via um serviço centralizado (`app/services/api.ts`).

**Porquê**: centralizar as chamadas HTTP em `api.ts` evita duplicar `fetch` e tratamento de erro em cada página — qualquer mudança de URL base ou de contrato da API muda em um lugar só. `NEXT_PUBLIC_API_URL` com fallback para `http://localhost:3001` permite rodar local sem `.env` configurado e trocar de ambiente (produção) só setando a variável.

**Tratamento de erro**: tanto `login` quanto `registerUser` leem `errorData.message` do corpo da resposta do backend quando a requisição falha, com uma mensagem genérica de fallback caso o backend não retorne corpo JSON válido — assim o usuário vê o motivo real da falha (ex: e-mail já cadastrado) e não só um erro genérico, exceto quando o backend realmente não informa nada.

### 4.22 Frontend — persistência do token (decisão provisória)

**Decisão**: após login bem-sucedido, o `accessToken` retornado é salvo em `localStorage` (`arcano_token`).

**Porquê**: solução mais simples para o prazo do desafio, sem exigir configuração de cookie `httpOnly` + proteção CSRF no backend. **Trade-off consciente**: `localStorage` é mais exposto a XSS do que um cookie `httpOnly` (qualquer script injetado na página consegue ler o token). Aceito esse risco porque o escopo do desafio não inclui conteúdo gerado por terceiros/usuários que pudesse virar vetor de XSS (não há campo de texto livre exibido sem sanitização para outros usuários). Redirecionamento pós-login e leitura desse token nas demais páginas ainda estão pendentes (ver seção 6).

### 4.23 Frontend — escopo "Esqueci a senha" descartado, sem rastro na UI

**Decisão**: a funcionalidade de recuperação de senha não será implementada (já estava fora de escopo — ver seção 3, "Fora de escopo"), e por isso **nenhum elemento de UI relacionado a ela existe** nas telas de login/cadastro.

**Porquê**: um botão ou link de "esqueci minha senha" que não faz nada de útil (ex: só um alerta) é pior do que a simples ausência da funcionalidade — no desafio, "tudo o que existe na tela deve funcionar" pesa na nota, e um elemento morto chama mais atenção negativa do avaliador do que a decisão documentada de não ter recuperação de senha.

### 4.24 Frontend — acessibilidade básica de formulários

**Decisão**: todo `<label>` nos formulários usa `htmlFor` apontando para o `id` do `<input>` correspondente.

**Porquê**: sem essa associação, clicar no texto do label não foca o campo e leitores de tela não conseguem relacionar a legenda ao input — ajuste de baixo custo que evita um problema básico de acessibilidade sem alterar nada visualmente.

### 4.25 Frontend — estratégia de pós-login (Context API)

**Decisão**: estado de autenticação pós-login gerenciado com **Context API** nativa do React (`AuthContext` + `AuthProvider`, em `app/context/AuthContext.tsx`), envolvendo toda a aplicação a partir do `layout.tsx`. Descartadas as alternativas Zustand e checagem manual de token por página.

**Porquê**: o escopo atual é pequeno — poucas páginas, um único token de sessão — o que não justifica adicionar Zustand como dependência nova para aprender sob prazo apertado (mesmo racional já aplicado em outras decisões do projeto, como a guard própria sem Passport, seção 4.17). Context API resolve bem esse escopo sem lib externa. Checagem manual de token em cada página foi descartada por espalhar a lógica de sessão em vez de centralizá-la em um único lugar.

**Implementação**: o `AuthProvider` lê `arcano_token`/`arcano_user` do `localStorage` ao montar (populando o contexto antes de qualquer redirecionamento de rota protegida) e expõe `user`, `token`, `login(token, user)` e `logout()`. `login/page.tsx` chama `POST /auth/login`, busca os dados do usuário via `GET /auth/me` (endpoint já existente do módulo Auth, seção 4.19) e então chama `login()` do contexto, redirecionando para `/` em seguida. `logout()` limpa tanto o contexto quanto o `localStorage`. A chamada extra a `/auth/me` evita duplicar no frontend a decisão de payload do JWT de sessão (que é responsabilidade do backend, seção 4.7) — o frontend sempre lê o usuário da mesma fonte, logo após login ou ao recarregar a página.

### 4.13 Fluxo de desenvolvimento e plano dia-a-dia

**Decisão**: desenvolvimento intercalado por módulo — backend do módulo, depois frontend consumindo esse módulo, depois o próximo módulo — em vez de fechar o backend inteiro antes de tocar no frontend.

**Porquê**: reduz o risco de estourar o prazo sem nada entregável ponta a ponta; sempre há um pedaço do fluxo funcionando de verdade; problemas de contrato de API entre front e back aparecem cedo, não só no fim.

**Plano dia-a-dia** (5 dias restantes até 25/08 13:03):

| Dia | Data | Backend | Frontend |
|---|---|---|---|
| 1 | 20/08 | Auth (User, JWT, Argon2id, RBAC) | — |
| 2 | 21/08 | Catálogo (integração TMDb) | Login/cadastro (consome Auth) |
| 3 | 22/08 | Salas/Assentos/Sessões + início de Reserva | Vitrine de filmes/sessões (consome Catálogo) |
| 4 | 23/08 | Pagamento simulado + Ticket (QR/JWT) | Mapa de assentos interativo + tela do ingresso com QR |
| 5 | 24/08 | Portaria (validação de QR) + deploy completo | Tela de portaria (câmera + digitação manual) |
| — | 25/08 até 13:03 | Margem de folga: ajustes finais, revisão de docs, entrega | |

### 4.14 Registro de usuários por papel

**Decisão**: `POST /auth/register` sempre cria o usuário com `role: CUSTOMER`, ignorando qualquer valor de `role` enviado no corpo da requisição. Os papéis `ADMIN` (organizador) e `GATE` (portaria) só existem através do seed do banco (`prisma/seed.ts`) — não há rota pública para criá-los.

**Porquê**: impede escalada de privilégio via cadastro público — sem essa trava, qualquer pessoa poderia se autopromover a organizador ou portaria só enviando `"role": "ADMIN"` no corpo do `register`. Isso também é coerente com o mundo real: ninguém se autocadastra como dono do cinema ou funcionário da portaria, esses papéis são atribuídos internamente.

### 4.15 Granularidade de commit do módulo Auth

**Decisão**: o módulo de autenticação (register, login, `/auth/me`, `JwtAuthGuard`, `RolesGuard`, seed) foi implementado e testado por completo antes de um único commit — em vez de dividir em múltiplos commits menores ao longo do desenvolvimento do módulo.

**Porquê**: mantém a ideia de "commit = unidade funcional coerente". Um commit no meio do módulo (ex: só o register, sem login nem guards) representaria um estado do sistema que não é testável ponta a ponta por si só. O requisito de "commits descritivos ao longo da semana" (seção 5) é atendido no nível de módulo — cada módulo funcional vira um commit — e não no nível de cada arquivo criado.

### 4.16 PrismaModule como `@Global()`

**Decisão**: o módulo do Prisma (`PrismaModule`) é marcado com `@Global()` no NestJS e importado uma única vez no `AppModule`, em vez de ser importado individualmente em cada módulo que precisa dele.

**Porquê**: praticamente todo módulo futuro do projeto (Auth, Catálogo, Sessão, Reserva, Ticket, Portaria) depende do banco de dados. Reimportar `PrismaModule` em cada um desses módulos seria repetição sem ganho real. Essa é uma exceção consciente à prática padrão do NestJS de módulos explícitos (evitar globals) — aceita aqui porque o `PrismaService` é infraestrutura transversal, não uma dependência de domínio específica de um módulo.

### 4.17 Guard de autenticação própria, sem Passport

**Decisão**: `JwtAuthGuard` implementada manualmente usando `JwtService.verifyAsync` (do `@nestjs/jwt`) diretamente dentro da guard, sem usar as bibliotecas `passport`/`passport-jwt`. A extração do token do header `Authorization: Bearer <token>` também é feita manualmente dentro da própria guard, sem uma `strategy` separada.

**Porquê**: Passport adicionaria uma biblioteca inteira (com seu próprio modelo de `strategy`/`serialize`/`deserialize`) só para resolver algo que o `@nestjs/jwt` sozinho já cobre — verificar um token e popular `request['user']`. Menos superfície de código novo para debugar dado o prazo de 7 dias. A guard ficou autocontida: quem lê `jwt-auth.guard.ts` entende o fluxo inteiro sem precisar rastrear configuração de uma strategy em outro arquivo.

### 4.18 Autorização por papel — RolesGuard + decorator, testada com usuários reais

**Decisão**: autorização por papel implementada com `RolesGuard` + decorator `@Roles(...)`, lido via `Reflector`, sempre usada em conjunto com `JwtAuthGuard` (`@UseGuards(JwtAuthGuard, RolesGuard)` — nessa ordem, porque `RolesGuard` só lê `request['user']`, que é populado pela `JwtAuthGuard`; ela não valida token sozinha).

**Validação**: testada com os 4 usuários reais criados pelo seed (não com rota descartável). Aplicando temporariamente `@Roles('ADMIN')` em `GET /auth/me`: login como ADMIN retornou 200 com o payload esperado; login como CUSTOMER e como GATE retornaram 403 Forbidden, como esperado. Guard validada ponta a ponta e revertida em seguida (ver decisão 4.19).

### 4.19 `GET /auth/me` sem restrição de papel

**Decisão**: `GET /auth/me` usa apenas `JwtAuthGuard` (exige estar logado), sem `RolesGuard`/`@Roles`. Qualquer papel autenticado (ADMIN, CUSTOMER ou GATE) pode acessar essa rota.

**Porquê**: o dado retornado por `/auth/me` já vem do próprio token decodificado (`req['user']`) — ou seja, cada usuário só enxerga os próprios dados, nunca os de outra pessoa. Restringir essa rota por papel não adiciona segurança nenhuma (não há vazamento de dado de terceiros possível) e quebraria a experiência normal: um CUSTOMER logado precisa conseguir ver o próprio perfil. `RolesGuard` fica reservada para rotas que de fato mexem em recursos de outra pessoa ou do sistema como um todo — por exemplo, futuramente, `POST /sessions` (publicar sessão de filme, ação do organizador) ou uma eventual rota de listagem de todos os usuários.

---

## 5. Requisitos não funcionais

- **Prazo**: 7 dias corridos a partir do recebimento do e-mail
- **README**: detalhado, com passo a passo de setup, incluindo configuração do banco escolhido; qualquer coisa que não funcione como esperado deve ser mencionada
- **Dados semeados (seed) obrigatórios**: 1 organizador, 2 clientes, 1 usuário de portaria, ao menos 1 evento publicado com ingressos disponíveis
- **Deploy**: opcional, mas +1 ponto na nota final se publicado (Vercel ou similar)
- **Repositório GitHub público**, com commits descritivos ao longo da semana (não um commit único no fim)
- **Documentação do uso de IA**: seção no README ou arquivo dedicado explicando quais ferramentas foram usadas, em que partes, e o que foi feito sem IA. Artefatos de processo (specs, PRD, arquivos de contexto como este) devem ser versionados no repositório.

---

## 6. Perguntas em aberto / a resolver nas próximas sessões

- [x] ~~Definir identidade visual do Cinema Arcano (paleta, tipografia, tom de voz das telas)~~ — feito, ver seção 4.12
- [x] ~~Definir estrutura de pastas do monorepo (front + back)~~ — feito, ver seção 4.1 e estrutura no repositório (`frontend/`, `backend/`)
- [x] ~~Desenhar schema do banco~~ — feito, ver seção 4.7 (conferido visualmente no Prisma Studio)
- [x] ~~Definir estratégia técnica do QR não forjável~~ — feito, ver seção 4.9
- [x] ~~Definir estratégia de concorrência no assento~~ — feito, ver seção 4.8
- [x] ~~Definir payload exato do JWT do ticket~~ — feito, ver seção 4.10
- [x] ~~Escolher provedor de hospedagem para backend + Postgres gerenciado~~ — feito, ver seção 4.11 (Render, com trade-off de cold start documentado)
- [x] ~~Montar plano dia-a-dia para os dias restantes do prazo~~ — feito, ver seção 4.13
- [x] ~~Implementar módulo Auth completo (register, login, guards JWT/RBAC, seed)~~ — feito, ver seções 4.14 a 4.19
- [x] ~~Validar `RolesGuard` com usuários reais~~ — feito, ver seção 4.18 (ADMIN 200, CUSTOMER/GATE 403)
- [x] ~~Implementar frontend de Auth (login, cadastro)~~ — feito, ver seções 4.20 a 4.24
- [x] ~~Estratégia de pós-login: redirecionamento após login e forma das demais páginas saberem que o usuário está autenticado~~ — feito, Context API, ver seção 4.25
- [ ] Limpeza opcional: remover boilerplate morto do `globals.css` (`:root`, `@theme inline`, `@media prefers-color-scheme`, sobras do `create-next-app` não usadas pelo tema Cinema Arcano)
- [ ] Iniciar módulo Catálogo (integração TMDb) — backend e frontend

---

## 7. Changelog

| Data | Mudança |
|---|---|
| 19/08/2026 | Criação do documento. Decisões iniciais: TMDb, mapa de assentos. |
| 19/08/2026 | Confirmado prazo real (e-mail recebido 18/08 13:03 → entrega até 25/08 13:03). Definida identidade do produto: Cinema Arcano. Stack final fechada: Next.js + NestJS + Prisma + PostgreSQL + JWT/Argon2id/RBAC próprios (substitui a hipótese anterior de Supabase como banco por trás de uma API própria). Documento reescrito em primeira pessoa. |
| 20/08/2026 | Estrutura do monorepo criada (`frontend/` Next.js, `backend/` NestJS). Banco local via Docker Compose (Postgres 16) documentado. Downgrade de Prisma 7 para 6.x, com justificativa. Schema do banco (10 tabelas) documentado. Decisões de QR (JWT assinado HS256) e concorrência de assento (constraint `UNIQUE`) transcritas com justificativa. Primeira migration (`init`) aplicada com sucesso ao banco. |
| 20/08/2026 | Tabelas conferidas visualmente no Prisma Studio (10 modelos, vazios, estrutura correta). Payload do JWT do ticket definido e documentado (campos + estratégia de expiração atrelada ao horário da sessão). |
| 20/08/2026 | Provedor de hospedagem gerenciada definido: Render, free tier, para backend + PostgreSQL. Trade-off de cold start documentado e aceito, priorizando durabilidade do projeto para portfólio. Fluxo de desenvolvimento definido como intercalado (backend → frontend por módulo). Plano dia-a-dia fechado para os 5 dias restantes do prazo. |
| 20/08/2026 | Módulo Auth implementado e testado por completo: `AuthService`/`AuthController` (register + login), `PrismaService`/`PrismaModule` (global), `JwtAuthGuard` e `RolesGuard` (sem Passport), `GET /auth/me`, e `prisma/seed.ts` (1 ADMIN, 2 CUSTOMERs, 1 GATE, senhas Argon2id). Decisões documentadas: registro sempre como CUSTOMER via API (4.14), commit único por módulo funcional (4.15), PrismaModule global (4.16), guard própria sem Passport (4.17). `RolesGuard` validada com os 4 usuários reais do seed (4.18). `/auth/me` liberado para qualquer papel autenticado, sem restrição por role (4.19). |
| 20/08/2026 | Frontend do módulo Auth implementado e commitado: identidade visual do Cinema Arcano fechada (paleta amarelo/roxo/preto, neo-brutalismo — 4.12); roteamento via App Router e formulários com `react-hook-form` + `zod` (4.20); páginas de login e cadastro consumindo a API via serviço centralizado `api.ts`, com tratamento de erro lendo a mensagem real do backend (4.21); token salvo em `localStorage`, trade-off de XSS documentado, persistência/redirecionamento pós-login ainda pendente (4.22); escopo "esqueci a senha" confirmado descartado, sem nenhum elemento de UI residual (4.23); acessibilidade básica de formulários com `htmlFor`/`id` em todos os labels (4.24). |
| 20/08/2026 | Estratégia de pós-login implementada: `AuthContext`/`AuthProvider` (Context API nativa, sem Zustand) criado em `app/context/AuthContext.tsx` e envolvendo a aplicação em `layout.tsx`; lê `localStorage` ao montar, expõe `user`/`token`/`login`/`logout`. `login/page.tsx` passou a buscar o usuário via `GET /auth/me` após o login e redirecionar para `/`; `api.ts` ganhou a função `getMe`. Decisão documentada (4.25). |