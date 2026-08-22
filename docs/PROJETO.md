# 📋 Documentação do Projeto — Cinema Arcano

*Diário de decisões técnicas e de produto, registrado ao longo do desenvolvimento.*

> Uso IA como apoio para organizar ideias e revisar trade-offs, mas as decisões de produto e arquitetura são minhas. Mantenho isso versionado porque documentar o "porquê" evita que decisões corretas pareçam arbitrárias numa leitura rápida do código.

| | |
|---|---|
| **Autor** | Israel Menezes de Andrade |
| **Status** | ✅ Projeto concluído |
| **Última atualização** | 22/08/2026 |

**Resumo do estado atual**: Módulos Auth, Catálogo, Salas/Sessões, Reserva/Ingresso e Portaria **implementados e testados, backend e frontend**. Deploy no ar: frontend em Vercel (`https://cinema-arcano.vercel.app`) e backend/PostgreSQL em Render (`https://cinema-arcano-api.onrender.com`). Cobre criação e gerenciamento de sessões pelo organizador, mapa de assentos, reserva, checkout com cartão/PIX (aprovação e recusa), área de Meus ingressos, ticket público com QR code, validação na portaria (câmera com fallback manual), estados de erro/loading tratados, controle de acesso por papel, e revisão de responsividade/acessibilidade.

<details>
<summary><strong>📑 Sumário</strong></summary>

1. Contexto do projeto
2. 🎬 Proposta do produto
3. ✅ Requisitos funcionais
4. 🧩 Decisões técnicas tomadas até agora
5. 📦 Checklist de entrega
6. 🛤️ Trilha de execução
7. 🗓️ Changelog

</details>

---

## 1. Contexto do projeto

Etapa 3 de 6 do processo seletivo **Elite Dev** (Verzel — vaga de Desenvolvedor Full Stack Jr).

**E-mail recebido**: 18/08/2026, 13:03 (via Pipefy).
**Prazo**: 7 dias corridos a partir do recebimento → limite em 25/08/2026, 13:03.
**Entregue em**: 22/08/2026 — 3 dias antes do prazo.

Fases do processo:
1. Candidatura (Triagem)
2. Teste Técnico Online (Coderbyte)
3. **Projeto de desenvolvimento (GitHub) ← esta etapa**
4. Papo com o time de Pessoas (RH)
5. Dinâmica Final
6. Contratação

### Como conduzi o trabalho

Optei por priorizar um fluxo completo e simples em vez de features soltas pela metade, documentar o raciocínio por trás de cada decisão técnica, e manter um histórico de commits ao longo da semana em vez de uma entrega única no fim.

---

## 2. 🎬 Proposta do produto

**Plataforma de Eventos e Ingressos**: organizador publica eventos a partir de um catálogo externo; cliente navega, reserva, paga (simulado) e recebe ingresso com QR code; portaria valida o ingresso na entrada.

### 2.1 Identidade: Cinema Arcano

Decidi dar identidade própria ao produto em vez de entregar um cinema genérico. Toda referência de mercado que olhei (sites de venda de ingresso) segue o mesmo padrão visual e de copy, e eu queria fugir disso.

**Conceito**: Cinema Arcano — uma sala de cinema com identidade "arcana"/mística, que trata a compra do ingresso como um pequeno ritual de entrada no mundo do filme, não como um checkout qualquer.

**Como isso entra no projeto, na prática**:
- Nome, paleta de cores e tipografia próprios (detalhados na decisão 4.12).
- Microcopy temática nas telas principais (ex.: confirmação de ingresso, tela de portaria) em vez de textos genéricos de sistema.
- **Decisão de escopo**: o tema fica restrito a identidade visual e copy, aplicado sobre uma estrutura de componentes simples. Não usei o tema para justificar UX não-convencional ou fluxos alternativos — o fluxo continua sendo o fluxo padrão de compra de ingresso, só que com uma casca própria. Preferi limitar o tempo de polimento visual e priorizar o back-end (QR, concorrência, auth própria), que é onde está a parte mais relevante do sistema.

### Papéis (3 perfis distintos, com autenticação)
- **Organizador**: cria e gerencia eventos.
- **Cliente**: navega, reserva, paga, recebe e compartilha ingressos.
- **Portaria**: valida ingressos na entrada do evento.

---

## 3. ✅ Requisitos funcionais

### Front-End
- [x] Navegação e busca de eventos publicados (data, local, preço) — catálogo de filmes via TMDb; ver seções 4.26 a 4.30
- [x] Criação e gerenciamento de eventos/sessões pelo organizador — telas `/admin/sessions/new` e `/admin/sessions`
- [x] Fluxo de reserva com seleção de lugar em mapa de assentos
- [x] Pagamento simulado — caminhos de aprovação e recusa implementados
- [x] Ticket público com exibição do QR code
- [x] Cliente consegue rever reservas/ingressos em `/reservations`
- [x] Tela de portaria com retorno claro: válido / inválido / já utilizado / evento errado
- [x] Leitura de QR via câmera na portaria, com digitação manual como alternativa

*(Autenticação — login e cadastro — não está listada como item separado porque é pré-requisito transversal aos itens acima. Está implementada; ver seção 4.20 a 4.24.)*

### Back-End
- [x] Integração com API externa de catálogo (ver decisão na seção 4.26)
- [x] Autenticação com os 3 papéis
- [x] Persistência de eventos, reservas e ingressos
- [x] Garantia de que o mesmo assento não seja vendido duas vezes (concorrência)
- [x] QR code não forjável (não pode ser um ID cru — precisa de assinatura/hash verificável)
- [x] Geração de link compartilhável do ingresso
- [x] Validação de ingresso impedindo reuso

### Fora de escopo
Nota fiscal, revenda entre usuários, aplicativo nativo, recuperação de senha, envio de ingresso por e-mail.

### Extras implementados além do essencial
Busca/filtro de catálogo, painel do organizador, cancelamento de sessão com devolução ao estoque, Docker Compose para o banco local, e deploy publicado.

---

## 4. 🧩 Decisões técnicas tomadas até agora

Cada decisão abaixo inclui o motivo, na ordem em que foram tomadas ao longo do desenvolvimento.

#### 🏗️ Fundação

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

Escolhi essa stack para focar em engenharia de software sólida, sem adicionar complexidade desnecessária:

- **Next.js + TypeScript**: base sólida para a aplicação web, com deploy simples na Vercel.
- **NestJS + TypeScript**: estrutura o backend em módulos e concentra ali toda a lógica de negócio — autenticação, autorização, reservas, pagamentos, ingressos e portaria.
- **PostgreSQL**: banco relacional adequado ao domínio, e especialmente apropriado para garantir integridade e concorrência na venda de assentos (a regra "o mesmo lugar não pode ser vendido duas vezes" se apoia em transações/constraints do próprio banco).
- **Prisma**: camada de acesso ao banco fortemente integrada ao TypeScript, com migrations e modelagem tipada.
- **JWT + Argon2id + RBAC**: autenticação e autorização implementadas diretamente na API, em vez de delegadas a um BaaS — preferi manter essa camada sob meu controle em vez de depender de configuração de terceiro.
- **TMDb**: catálogo externo com baixo risco de integração (ver decisão 4.2), liberando tempo para as regras de negócio mais relevantes.
- **Docker Compose**: facilita reprodução do ambiente de desenvolvimento por quem for avaliar o projeto.
- **Vercel (front) + Render (backend/Postgres gerenciado)**: entrega uma aplicação de fato acessível pela internet, sem depender de manter infraestrutura ou computador pessoal ligado. Trade-off de cold start no free tier documentado e aceito (ver seção 4.11).

Evitei deliberadamente microserviços, Redis, filas, Kubernetes e qualquer tecnologia que não agregasse valor proporcional ao escopo. O objetivo aqui é mostrar boas decisões arquiteturais, segurança, consistência de dados, tratamento de concorrência e um fluxo completo — não quantidade de tecnologias.

**Nota sobre a evolução dessa decisão**: cheguei a considerar Supabase como banco gerenciado por trás de uma API própria (ver decisão original no changelog de 19/08). Descartei essa camada intermediária: se o objetivo é mostrar autenticação e autorização projetadas por mim, faz mais sentido a Auth também ser minha (JWT + Argon2id + RBAC) em vez de depender do Auth de um BaaS — mesmo que ele fique "escondido" atrás da minha API.

### 4.2 API externa de catálogo — TMDb, não Ticketmaster
**Decisão**: usar TMDb (filmes), tratando cada filme como uma "sessão" configurada pelo organizador (define horário, sala/local e preço).

**Porquê**:
- Ticketmaster Discovery tem mais fricção de integração (rate limit mais apertado, dados de venue inconsistentes/incompletos).
- TMDb tem documentação madura, resposta rápida de aprovação de key, dados ricos (poster, sinopse) que melhoram a UI sem esforço extra.
- A fricção técnica economizada foi redirecionada para as partes mais relevantes do sistema: QR não forjável, concorrência de assentos, portaria, README.
- **Risco identificado e aceito conscientemente**: cinema é o cenário mais "óbvio" para filme + assentos, correndo o risco de parecer padrão. Mitigação: a diferenciação não vem da API escolhida, e sim de como as telas de reserva, recusa de pagamento e portaria são desenhadas — isso é decisão de produto, não de fonte de dados.

### 4.3 Modelo de reserva — mapa de assentos, sem pista
**Decisão**: implementar apenas mapa de assentos (não implementar reserva por quantidade/pista).

**Porquê**:
- Coerente com a escolha de TMDb/cinema.
- É a parte tecnicamente mais rica do fluxo (concorrência real: dois clientes disputando o mesmo assento), e por isso a que mais demonstra capacidade técnica.
- Preferi um fluxo completo e bem feito a dois fluxos implementados pela metade.

### 4.4 Arquitetura de backend — API própria, sem BaaS
Consolidado dentro da stack final (seção 4.1): NestJS concentra toda a lógica de negócio, com Auth própria (JWT + Argon2id + RBAC), projetada por mim em vez de configurada a partir de um provedor externo.

**Vercel para deploy do front**: opção simples e confiável para publicar uma aplicação Next.js.

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

**Porquê**: a versão 7 exige uma configuração nova (`prisma.config.ts` obrigatório, mudança de como a `DATABASE_URL` é resolvida) que ainda tem pouca documentação e poucos tutoriais maduros. Priorizei a versão estável e amplamente documentada — menos superfície de coisa nova pra debugar, mais tempo pra regra de negócio. Isso significa: `schema.prisma` resolve a conexão sozinho via `datasource db { url = env("DATABASE_URL") }`, sem `prisma.config.ts` na raiz do backend.

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

### 4.8 Concorrência no assento — constraint UNIQUE, não lock manual

**Decisão**: a garantia de que o mesmo assento não seja vendido duas vezes vem de uma constraint `UNIQUE(sessionId, seatId)` na tabela `ReservationSeat`, aplicada dentro de uma transação Prisma.

**Porquê**: delegar essa garantia ao próprio banco (constraint de unicidade) é mais robusto do que implementar um lock otimista ou pessimista na aplicação — o Postgres rejeita a segunda tentativa de insert automaticamente, mesmo sob concorrência real (duas requisições simultâneas), sem eu precisar reinventar controle de concorrência na camada de aplicação.

### 4.9 QR code do ingresso — JWT assinado (HS256)

**Decisão**: o conteúdo do QR code é um JWT assinado (HS256), não um HMAC construído manualmente nem um ID cru do banco.

**Porquê**:
- Um ID cru seria trivialmente forjável (ou adivinhável) — não atende ao requisito de QR "que não possa ser forjado".
- Reaproveita a mesma biblioteca e o mesmo modelo mental já usado na autenticação (JWT + Argon2id), reduzindo a quantidade de código novo e criptografia própria pra manter.
- JWT já resolve expiração de forma nativa (`exp`), o que é útil para invalidar ingressos de sessões já encerradas.

O payload exato (campos e tempo de expiração) está detalhado na decisão 4.10.

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
  - Não justifica o custo de um plano pago para este projeto.

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

**Porquê**: reforça a identidade "Cinema Arcano" (seção 2.1) sem exigir UX não-convencional — o neo-brutalismo dá personalidade visual forte com poucas regras de CSS (sem sombras suaves, sem cantos arredondados, sem gradientes), fugindo do visual genérico que qualquer ferramenta de geração de UI entrega por padrão.

#### 🔐 Autenticação e papéis

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

**Porquê**: Passport adicionaria uma biblioteca inteira (com seu próprio modelo de `strategy`/`serialize`/`deserialize`) só para resolver algo que o `@nestjs/jwt` sozinho já cobre — verificar um token e popular `request['user']`. A guard ficou autocontida: quem lê `jwt-auth.guard.ts` entende o fluxo inteiro sem precisar rastrear configuração de uma strategy em outro arquivo.

### 4.18 Autorização por papel — RolesGuard + decorator, testada com usuários reais

**Decisão**: autorização por papel implementada com `RolesGuard` + decorator `@Roles(...)`, lido via `Reflector`, sempre usada em conjunto com `JwtAuthGuard` (`@UseGuards(JwtAuthGuard, RolesGuard)` — nessa ordem, porque `RolesGuard` só lê `request['user']`, que é populado pela `JwtAuthGuard`; ela não valida token sozinha).

**Validação**: testada com os 4 usuários reais criados pelo seed (não com rota descartável). Aplicando temporariamente `@Roles('ADMIN')` em `GET /auth/me`: login como ADMIN retornou 200 com o payload esperado; login como CUSTOMER e como GATE retornaram 403 Forbidden, como esperado. Guard validada ponta a ponta e revertida em seguida (ver decisão 4.19).

### 4.19 `GET /auth/me` sem restrição de papel

**Decisão**: `GET /auth/me` usa apenas `JwtAuthGuard` (exige estar logado), sem `RolesGuard`/`@Roles`. Qualquer papel autenticado (ADMIN, CUSTOMER ou GATE) pode acessar essa rota.

**Porquê**: o dado retornado por `/auth/me` já vem do próprio token decodificado (`req['user']`) — ou seja, cada usuário só enxerga os próprios dados, nunca os de outra pessoa. Restringir essa rota por papel não adiciona segurança nenhuma (não há vazamento de dado de terceiros possível) e quebraria a experiência normal: um CUSTOMER logado precisa conseguir ver o próprio perfil. `RolesGuard` fica reservada para rotas que de fato mexem em recursos de outra pessoa ou do sistema como um todo — por exemplo, futuramente, `POST /sessions` (publicar sessão de filme, ação do organizador) ou uma eventual rota de listagem de todos os usuários.

### 4.20 Frontend — roteamento e formulários

**Decisão**: roteamento via **App Router** do Next.js (`app/`); formulários com **`react-hook-form` + `zod`** (validação de schema), integrados via `@hookform/resolvers`.

**Porquê**: App Router é o padrão atual do Next.js e o projeto já foi inicializado dessa forma. `react-hook-form` evita re-render a cada tecla digitada (melhor performance que estado controlado manual), e `zod` centraliza a validação em um schema só, reaproveitado tanto para o tipo TypeScript do formulário (`z.infer`) quanto para a validação em si — uma fonte de verdade, sem duplicar regras entre tipo e validação.

### 4.21 Frontend — módulo Auth (login e cadastro)

**Decisão**: páginas `app/login/page.tsx` e `app/register/page.tsx`, ambas client components (`'use client'`), consumindo `POST /auth/login` e `POST /auth/register` via um serviço centralizado (`app/services/api.ts`).

**Porquê**: centralizar as chamadas HTTP em `api.ts` evita duplicar `fetch` e tratamento de erro em cada página — qualquer mudança de URL base ou de contrato da API muda em um lugar só. `NEXT_PUBLIC_API_URL` com fallback para `http://localhost:3000` (porta fixa do backend) permite rodar local sem `.env` configurado e trocar de ambiente (produção) só setando a variável. *(Nota: o fallback foi originalmente escrito como `3001` por engano — corrigido para `3000` ainda no dia 20/08, ver changelog.)*

**Tratamento de erro**: tanto `login` quanto `registerUser` leem `errorData.message` do corpo da resposta do backend quando a requisição falha, com uma mensagem genérica de fallback caso o backend não retorne corpo JSON válido — assim o usuário vê o motivo real da falha (ex: e-mail já cadastrado) e não só um erro genérico, exceto quando o backend realmente não informa nada.

### 4.22 Frontend — persistência do token

**Decisão**: após login bem-sucedido, o `accessToken` retornado é salvo em `localStorage` (`arcano_token`).

**Porquê**: solução simples, sem exigir configuração de cookie `httpOnly` + proteção CSRF no backend. **Trade-off consciente**: `localStorage` é mais exposto a XSS do que um cookie `httpOnly` (qualquer script injetado na página consegue ler o token). Aceito esse risco porque o projeto não expõe conteúdo gerado por outros usuários sem sanitização, que é o vetor típico de XSS. Redirecionamento pós-login e leitura desse token nas demais páginas foram resolvidos na decisão 4.25.

### 4.23 Frontend — escopo "Esqueci a senha" descartado, sem rastro na UI

**Decisão**: a funcionalidade de recuperação de senha não será implementada (já estava fora de escopo — ver seção 3, "Fora de escopo"), e por isso **nenhum elemento de UI relacionado a ela existe** nas telas de login/cadastro.

**Porquê**: um botão ou link de "esqueci minha senha" que não faz nada de útil (ex: só um alerta) é pior do que a simples ausência da funcionalidade — prefiro a ausência clara e documentada a um elemento morto na tela.

### 4.24 Frontend — acessibilidade básica de formulários

**Decisão**: todo `<label>` nos formulários usa `htmlFor` apontando para o `id` do `<input>` correspondente.

**Porquê**: sem essa associação, clicar no texto do label não foca o campo e leitores de tela não conseguem relacionar a legenda ao input — ajuste de baixo custo que evita um problema básico de acessibilidade sem alterar nada visualmente.

### 4.25 Frontend — estratégia de pós-login (Context API)

**Decisão**: estado de autenticação pós-login gerenciado com **Context API** nativa do React (`AuthContext` + `AuthProvider`, em `app/context/AuthContext.tsx`), envolvendo toda a aplicação a partir do `layout.tsx`. Descartadas as alternativas Zustand e checagem manual de token por página.

**Porquê**: o escopo atual é pequeno — poucas páginas, um único token de sessão — o que não justifica adicionar Zustand como dependência nova para aprender sob prazo apertado (mesmo racional já aplicado em outras decisões do projeto, como a guard própria sem Passport, seção 4.17). Context API resolve bem esse escopo sem lib externa. Checagem manual de token em cada página foi descartada por espalhar a lógica de sessão em vez de centralizá-la em um único lugar.

**Implementação**: o `AuthProvider` lê `arcano_token`/`arcano_user` do `localStorage` ao montar (populando o contexto antes de qualquer redirecionamento de rota protegida) e expõe `user`, `token`, `login(token, user)` e `logout()`. `login/page.tsx` chama `POST /auth/login`, busca os dados do usuário via `GET /auth/me` (endpoint já existente do módulo Auth, seção 4.19) e então chama `login()` do contexto, redirecionando para `/` em seguida. `logout()` limpa tanto o contexto quanto o `localStorage`. A chamada extra a `/auth/me` evita duplicar no frontend a decisão de payload do JWT de sessão (que é responsabilidade do backend, seção 4.7) — o frontend sempre lê o usuário da mesma fonte, logo após login ou ao recarregar a página.

#### 🎞️ Catálogo

### 4.26 Backend do Catálogo: proxy do TMDb com resposta mapeada

**Decisão**: `MoviesModule`/`MoviesController`/`MoviesService` em `backend/src/movies/`, com três rotas públicas — `GET /movies` (populares), `GET /movies/search?query=`, `GET /movies/:id` (detalhes) — todas fazendo proxy para a API do TMDb via `fetch` nativo (sem `axios`). A resposta nunca repassa o payload bruto do TMDb: é mapeada para tipos próprios (`Movie`, com `id`/`title`/`overview`/`posterUrl`/`releaseDate`/`voteAverage`; `MovieDetails` estende `Movie` com `runtime`/`genres`). Idioma fixado em `pt-BR` em todas as chamadas ao TMDb.

**Porquê**: mapear a resposta desacopla o frontend do formato específico do TMDb (campos em inglês tipo `poster_path`, `vote_average`) — se um dia trocar de provedor de catálogo, só o `MoviesService` muda, não todo o front. Rotas públicas porque catálogo é conteúdo de vitrine, sem motivo de negócio pra exigir login só pra ver filme.

### 4.27 Frontend do Catálogo: Home, busca e detalhes

**Decisão**: `app/page.tsx` (Home) lista os populares via `getMovies()` ao montar e permite busca via `searchMovies(query)`, reaproveitando o mesmo grid. Busca com campo vazio recarrega os populares em vez de chamar `/movies/search` sem query (o backend rejeita isso com 400). `app/movies/[id]/page.tsx` é *server component* (não `'use client'`), buscando os detalhes direto no servidor via `getMovieDetails(id)` e usando `notFound()` do Next quando o filme não existe. Três novas funções (`getMovies`, `searchMovies`, `getMovieDetails`) adicionadas em `app/services/api.ts`, seguindo o mesmo padrão de tratamento de erro (mensagem em português, lida do corpo da resposta) já usado nas funções de Auth.

**Porquê do server component nos detalhes**: página de detalhes não tem nenhuma interação client-side (sem estado, sem formulário) — só busca e exibe. Buscar no servidor evita around-trip extra de loading state no cliente e é mais simples de implementar corretamente.

### 4.28 Pôsteres via `next/image`, não `<img>` puro

**Decisão**: exibição de pôster nas duas telas usa o componente `next/image`, exigindo `remotePatterns` em `next.config.ts` liberando `image.tmdb.org`.

**Porquê**: `next/image` otimiza (lazy loading, dimensionamento automático) sem custo de implementação — só a config do domínio. Trade-off aceito: acopla o `next.config.ts` ao domínio específico do TMDb; se trocar de provedor de imagem no futuro, precisa lembrar de atualizar essa config também.

### 4.29 CORS habilitado no backend

**Decisão**: `app.enableCors({ origin: [...] })` adicionado em `main.ts`, liberando `http://localhost:3000` e `http://localhost:3001`.

**Porquê**: bug encontrado em teste manual — backend fixo na porta 3000, e o Next cai pra 3001 quando a 3000 já está ocupada (justamente pelo próprio backend rodando). Sem `enableCors()`, toda chamada do frontend pro backend era bloqueada pelo navegador. Liberar as duas portas evita esse mesmo problema se a ordem de start mudar no dia a dia. Escopo é só local — pra produção (Vercel/Render), a allowlist vai precisar da URL real de deploy.

### 4.30 Convenção: caminho do arquivo como comentário na primeira linha

**Decisão**: todo arquivo novo ou editado com apoio de IA passa a levar um comentário na primeira linha com o caminho real dentro do repositório (ex: `// frontend/app/page.tsx`).

**Porquê**: elimina ambiguidade na hora de colar o conteúdo entregue pela IA no lugar certo do projeto — sem essa convenção, cada arquivo exigia uma pergunta separada de "isso vai onde?".

#### 🎟️ Salas e sessões

### 4.31 Sala única, seedada, com 40 assentos

**Decisão**: uma única `Room` fixa ("Cinema Arcano — Sala 1"), criada via seed, com 40 assentos (`Seat`) organizados em grade (5 fileiras × 8 colunas, ex: A1–A8 até E1–E8). Todas as `Session` (filme + data/horário + preço, criadas pelo organizador) apontam para essa mesma sala.

**Porquê**: o schema (seção 4.7) já modela `Room`/`Seat` como entidades separadas de `Session`, então essa é uma decisão de produto/seed, não uma limitação técnica — suporta múltiplas salas no futuro sem migration, se um dia fizer sentido. Uma sala fixa é coerente com a identidade de um cinema específico (não uma rede). 40 assentos é grande o bastante pra parecer um mapa real e pequeno o bastante pra caber numa tela sem virar problema de scroll/UI.

### 4.32 Comportamento do módulo Salas/Sessões

**Decisões**, definidas antes de iniciar a implementação:

- **Criação de sessão pelo organizador**: tela própria (`/admin/sessions/new`), com busca de filme dedicada (reaproveitando `searchMovies`/`getMovies` do serviço já existente em `api.ts`), em vez de um botão "Criar sessão" embutido na Home pública do Catálogo. Mantém a área do organizador separada da navegação do cliente.
- **Conflito de horário**: bloqueado. Como só existe uma sala (seção 4.31), duas sessões não podem se sobrepor nela — a criação de uma nova sessão precisa validar contra o intervalo (`início` até `início + duração do filme`) das sessões já existentes na mesma sala e rejeitar em caso de sobreposição.
- **Visibilidade de sessões**: só sessões futuras aparecem para o cliente (`GET` público de sessões de um filme filtra `dataHora >= now`). Sessões passadas não ficam visíveis nem reserváveis nessa consulta — não há tela de histórico no escopo atual.

**Porquê**: separar a área do organizador evita misturar fluxo de gestão com navegação pública, mantendo os 3 papéis do sistema bem distintos. Bloquear conflito de horário é a única forma de a sala única (4.31) fazer sentido operacional — sem essa validação, o sistema permitiria vender ingresso pra duas sessões impossíveis de acontecer ao mesmo tempo na mesma sala física. Esconder sessões passadas evita o cliente tentar reservar algo que já aconteceu, sem precisar de uma tela de histórico fora do escopo atual.

### 4.33 Uso do enum `SessionStatus`

**Decisão**: o enum `SessionStatus` (`SCHEDULED`/`CANCELLED`/`FINISHED`), já presente no `schema.prisma` mas até então sem decisão registrada, vai ser usado com escopo mínimo: apenas `SCHEDULED` e `CANCELLED` são gravados/gerenciados ativamente pela aplicação. `FINISHED` não é escrito no banco por nenhum job/cron — é só um estado calculado on-the-fly na consulta (`startTime + duração <= now`), nunca persistido.

- Organizador pode cancelar uma sessão já publicada (`status = CANCELLED`), em vez de deletar a linha — preserva histórico de `Reservation`/`ReservationSeat` já ligados a ela.
- A validação de conflito de horário (seção 4.32) precisa ignorar sessões com `status = CANCELLED` ao checar sobreposição — uma sessão cancelada libera o horário na sala para uma nova sessão.

**Porquê**: sem `CANCELLED`, a decisão de bloquear conflito de horário (4.32) fica incompleta — não haveria como reabrir um horário depois de cancelar uma sessão sem deletar a linha e arriscar quebrar `Reservation`/`ReservationSeat`. `FINISHED` como campo calculado evita a necessidade de um job periódico atualizando status no banco, o que seria infraestrutura desnecessária para o volume real do sistema. Alternativa considerada e descartada: remover o enum do schema por ser "campo não usado" — descartada porque cancelamento de sessão é um caso real que vale a pena cobrir dado o baixo custo de implementação.

### 4.34 Implementação do `SessionsModule`

**Decisão**: o backend de Salas/Sessões foi implementado como módulo próprio (`backend/src/sessions/`), com rotas `POST /sessions` (ADMIN), `GET /sessions` (pública), `GET /sessions/:id` (pública) e `PATCH /sessions/:id/cancel` (ADMIN). A criação de sessão resolve a sala única internamente, valida conflito de horário e persiste a sessão ligada ao organizador autenticado.

**Porquê**: manter sessões em um módulo próprio separa a gestão de eventos da integração de catálogo. O catálogo (`MoviesModule`) continua sendo vitrine/proxy do TMDb; a sessão é a entidade local vendável, com preço, horário, sala e organizador.

### 4.35 `roomId` implícito no `POST /sessions`

**Decisão**: o `CreateSessionDto` não recebe `roomId`. O `SessionsService` busca a sala única existente no banco, criada pelo seed.

**Porquê**: como a versão atual do produto tem uma sala fixa (4.31), expor `roomId` no corpo da requisição criaria uma escolha falsa para o organizador e aumentaria a chance de payload inválido. O schema continua preparado para múltiplas salas no futuro, mas a UI/API do MVP não precisa expor essa complexidade.

### 4.36 Vínculo entre TMDb e `Movie` local

**Decisão**: o `movieId` recebido em `POST /sessions` é tratado como `tmdbId`, porque as rotas públicas de catálogo expõem o id do TMDb. Na criação da sessão, o backend resolve ou cria o `Movie` local via `findOrCreateLocalMovie`, usando `upsert` por `tmdbId`.

**Porquê**: antes dessa decisão, o backend tentaria buscar um `Movie.id` local que nunca existia, já que `GET /movies` é um proxy puro do TMDb e não grava filmes no banco. Criar o filme local sob demanda evita uma etapa manual de importação e preserva uma cópia estável dos dados usados nas sessões já publicadas.

### 4.37 Fallback de duração da sessão

**Decisão**: quando o TMDb não retorna duração (`durationMinutes` nulo), o backend usa fallback fixo de 120 minutos para calcular término da sessão.

**Porquê**: conflito de horário e expiração de ticket dependem do horário de término. Sem fallback, uma sessão de filme sem runtime quebraria regras importantes do domínio. O fallback é explícito no código e não é persistido como dado real do filme.

#### 🪑 Reserva e ingresso

### 4.38 Reserva/Ingresso no backend

**Decisão**: `ReservationsModule` implementado com criação de reserva, pagamento simulado e ticket público:

- `POST /reservations`: CUSTOMER cria reserva `PENDING` para uma sessão e lista de assentos.
- `POST /reservations/:id/pay`: CUSTOMER paga uma reserva própria pendente; o backend cria `Payment APPROVED`, confirma a reserva e gera um `Ticket`.
- `GET /reservations/:id`: CUSTOMER consulta a própria reserva.
- `GET /tickets/:id`: rota pública para exibir o ticket compartilhável.

**Decisões de regra de negócio**:

- Um ticket cobre a reserva inteira, não um ticket por assento.
- Reserva `PENDING` expira em 1 hora.
- A liberação de assento expirado acontece on-the-fly na tentativa de nova reserva, sem job/cron.
- O QR/JWT do ticket contém `ticketId`, `reservationId` e `sessionId`, com `exp` no horário de término da sessão.

**Porquê**: separar reserva e pagamento reflete melhor o fluxo real de compra (assentos travados primeiro, confirmação depois). A constraint `UNIQUE(sessionId, seatId)` continua sendo a garantia principal contra venda duplicada, e a aplicação traduz a colisão do Prisma em `409 Conflict`. A expiração on-the-fly evita infraestrutura extra (job/cron) sem custo real de negócio.

### 4.39 Componentes reutilizáveis no frontend

**Decisão**: antes de avançar no mapa de assentos, criei uma base de componentes reutilizáveis em `frontend/app/components/`: `Cabecalho`, `Rodape`, `Container`, `Cartao`, `Botao`, `CampoTexto`, `Aviso` e `CartaoFilme`. Home, login, cadastro e detalhe do filme passaram a usar essa base, e o `layout.tsx` ganhou header/footer globais.

**Porquê**: o frontend começava a repetir classes e padrões visuais nas telas. Criar componentes pequenos agora reduz retrabalho nas próximas telas (admin, reserva, ticket, portaria), mantém o neo-brutalismo consistente e evita que cada página vire uma composição diferente. O cuidado aqui foi não criar um design system grande demais: só componentes que já tinham uso real ou uso imediato no próximo módulo.

### 4.40 Frontend inicial de Salas/Sessões

**Decisão**: criada a tela `/admin/sessions/new` para o organizador buscar filmes no catálogo, selecionar um resultado, informar data/hora e preço, e chamar `POST /sessions` com token de ADMIN. A página de detalhes do filme também passou a consultar `GET /sessions` e exibir as sessões futuras daquele filme.

**Porquê**: esse é o menor fluxo visível que conecta o backend de sessões ao frontend sem misturar a área administrativa com a vitrine do cliente. A tela de detalhe exibe horários e preço, mas ainda não mostra botão de escolher assentos porque a rota de mapa/reserva ainda não existe; manter um botão morto seria pior para a avaliação do que deixar a ação para o próximo bloco.

### 4.41 Ferramentas de IA usadas no processo

**Decisão**: documentar explicitamente o uso de IA ao longo do desenvolvimento. Usei Claude Sonnet 5 como principal apoio de desenvolvimento, Gemini Pro pontualmente para alguns testes, e ChatGPT Codex 5.5 para revisão geral do projeto e ajuda na correção de falhas.

**Porquê**: preferi registrar o processo com clareza. Como usei essas ferramentas nos planos gratuitos, e também por escolha própria, não terceirizei decisões técnicas, planejamento, escopo ou priorização para a IA. As decisões de produto e arquitetura continuam registradas e justificadas neste documento em primeira pessoa.

**Design**: as decisões visuais foram guiadas pelo meu gosto pessoal, não por direção criativa terceirizada para IA. O Cinema Arcano usa uma estética neo-brutalista com paleta própria, bordas fortes, sombras duras e microcopy temática porque essa foi a identidade que eu quis defender para fugir de uma interface genérica.

**Stack enxuta**: evitei propositalmente usar muitos frameworks ou soluções prontas. Isso foi uma escolha para demonstrar que entendo as peças que estou construindo e consigo criar a base do projeto do zero sem depender de ferramentas prontas. Não é uma rejeição a esse tipo de ferramenta em outros contextos — elas têm valor real para acelerar entregas —, mas nesse projeto fez mais sentido mostrar o processo manual e o raciocínio por trás das escolhas.

### 4.42 Frontend de Reserva/Ingresso

**Decisão**: criada a rota `/sessions/[id]` para o cliente escolher assentos em mapa, criar reserva `PENDING`, confirmar pagamento simulado e ser redirecionado para `/tickets/[id]`. A rota pública `/tickets/[id]` exibe os dados do ingresso e gera um QR code real no frontend usando a biblioteca `qrcode`.

**Ajuste necessário no backend**: `GET /sessions/:id` passou a devolver `room.seats` e `occupiedSeatIds`, considerando como ocupados assentos de reservas `CONFIRMED` e reservas `PENDING` ainda não expiradas. Isso permite que o frontend desenhe o mapa com assentos livres/ocupados sem criar uma rota separada só para disponibilidade.

**Porquê**: o mapa de assentos é o coração técnico do fluxo do cliente. Mostrar o estado dos assentos no detalhe da sessão e conduzir reserva → pagamento → ticket fecha um fluxo ponta a ponta. O QR é gerado no frontend a partir do `qrToken` assinado pelo backend; assim o segredo de assinatura continua só na API.

### 4.43 Credenciais de teste no README

**Decisão**: documentar no README as contas criadas pelo seed (`ADMIN`, dois `CUSTOMER` e `GATE`) com e-mail, senha e uso sugerido.

**Porquê**: o recrutador precisa conseguir testar o sistema rapidamente, sem abrir `seed.ts` nem adivinhar credenciais. Como são contas de seed para ambiente de avaliação/desenvolvimento, deixá-las explícitas no README melhora a testabilidade e reduz fricção. Em produção real, essas senhas não existiriam como credenciais públicas.

#### 🚪 Portaria e áreas logadas

### 4.44 Módulo de Portaria

**Decisão**: criado o `GateModule` no backend, com `POST /gate/validate` protegido por `JwtAuthGuard` + `RolesGuard` e restrito ao papel `GATE`. A validação recebe o `qrToken` do ingresso e um `sessionId` opcional para checar se o ingresso pertence à sessão esperada. A primeira validação válida marca o ticket como `USED`; novas tentativas retornam `ALREADY_USED`. Token inválido/expirado retorna `INVALID`; token válido de outra sessão retorna `WRONG_EVENT`.

**Ajuste no schema**: `ValidationLog.ticketId` passou a ser opcional. Sem isso, uma tentativa com QR completamente inválido não poderia ser registrada, porque não existe `Ticket` associado para preencher a foreign key.

**Frontend**: criada a rota `/gate`, disponível para a conta de portaria. A tela permite colar o token manualmente e também tenta leitura via câmera usando a API nativa `BarcodeDetector` quando o navegador suporta. Se o navegador não tiver suporte, o fluxo manual continua funcionando.

**Porquê**: a Portaria fecha o ciclo do sistema: ingresso não forjável → validação → bloqueio de reuso → registro de auditoria. O endpoint centraliza a regra no backend para não depender da UI; a tela é só uma camada operacional.

### 4.45 Gerenciamento de sessões e Meus ingressos

**Decisão**: adicionados dois endpoints autenticados para áreas logadas: `GET /sessions/admin/mine` para o organizador listar todas as sessões que criou, incluindo canceladas/finalizadas e contadores operacionais; e `GET /reservations/me` para o cliente rever suas reservas e tickets. No frontend, foram criadas as telas `/admin/sessions` e `/reservations`, além de links no cabeçalho conforme o papel do usuário.

**Gerenciamento do organizador**: a tela `/admin/sessions` mostra totais por status, dados de filme/sala/horário/preço, contadores de reservas/assentos e botão para cancelar sessões `SCHEDULED` usando o endpoint já existente `PATCH /sessions/:id/cancel`.

**Meus ingressos**: a tela `/reservations` lista reservas do cliente, mostra status da reserva e do pagamento, assentos, total estimado e permite abrir novamente o ticket quando já existe. Reservas `PENDING` ainda podem ser pagas por ali.

**Porquê**: essas duas áreas reduzem dependência de um fluxo linear único. O cliente não precisa "perder" o link do ticket se sair da tela, e o organizador consegue conferir/cancelar sessões sem chamar a API manualmente. Mantive edição de sessão fora deste bloco porque cancelamento cobre a operação crítica sem introduzir regras ambíguas sobre alterar horário/preço depois de reservas existentes.

### 4.46 Checkout simulado e estados de acabamento

**Decisão**: o botão simples de pagamento foi substituído por uma tela dedicada em `/reservations/[id]/payment`, com seleção entre cartão e PIX, visual de cartão, PIX copia-e-cola simulado, resumo da reserva e dois caminhos explícitos: simular aprovação ou simular recusa. O endpoint `POST /reservations/:id/pay` passou a aceitar `method` (`CARD`/`PIX`) e `simulateFailure`.

**Recusa de pagamento**: quando `simulateFailure` é verdadeiro, o backend grava `Payment FAILED`, cancela a reserva (`ReservationStatus.CANCELLED`), remove os `ReservationSeat` e não gera ticket. Assim a falha não é apenas visual: os assentos voltam de fato para o mapa.

**Estados visuais**: foram criadas páginas globais do Next para `not-found.tsx`, `loading.tsx` e `error.tsx`, mantendo a identidade Cinema Arcano também em 404, carregamento e falha inesperada.

**Porquê**: fazer a recusa apenas com um alerta no frontend seria frágil e não demonstraria regra de negócio de verdade. Ao registrar `FAILED` e liberar assentos no backend, o fluxo fica auditável e testável. A 404/loading/error personalizada evita cair na aparência padrão do framework.

#### 🚀 Produção e acabamento final

### 4.47 Ajustes de validação, acesso e produção

**Decisão**: a leitura de QR da portaria passou de `BarcodeDetector` nativo para a biblioteca `html5-qrcode`, porque Chrome/Brave desktop podem não expor a API nativa de detecção. O ticket público agora também exibe o `qrToken` em texto e oferece botão de copiar, garantindo validação manual mesmo quando a câmera não estiver disponível.

**Acesso por papel**: páginas privadas deixaram de redirecionar silenciosamente para a home e passaram a exibir um componente reutilizável `AcessoRestrito`, com mensagem contextual e links para login/catálogo. Isso foi aplicado em `/admin/sessions`, `/admin/sessions/new`, `/reservations`, `/reservations/[id]/payment` e `/gate`. A rota de backend `POST /gate/validate` passou a aceitar `GATE` e `ADMIN`.

**Porquê**: para avaliação, falhas silenciosas parecem bugs. Uma tela de bloqueio explícita melhora UX, acessibilidade cognitiva e segurança percebida. O token copiável preserva o fluxo da portaria em qualquer dispositivo, sem depender de suporte do navegador à câmera/leitor.

### 4.48 Deploy em Vercel + Render

**Decisão**: deploy feito com frontend na Vercel e backend/PostgreSQL no Render. URLs finais:

- Frontend: `https://cinema-arcano.vercel.app`
- Backend: `https://cinema-arcano-api.onrender.com`

**Configuração usada**:

- Backend Render: `Root Directory = backend`, build `npm install && npx prisma generate && npm run build`, start `npx prisma migrate deploy && node dist/src/main.js`.
- Frontend Vercel: `Root Directory = frontend`, env `NEXT_PUBLIC_API_URL=https://cinema-arcano-api.onrender.com`.
- Backend recebeu `FRONTEND_URL=https://cinema-arcano.vercel.app` para CORS de produção.

**Seed em produção**: como o plano free do Render não libera shell no Web Service, o seed foi executado temporariamente pelo Start Command (`npx prisma migrate deploy && npx prisma db seed && node dist/src/main.js`) e depois o comando voltou para o formato normal. Seed confirmado por login com `admin@cinemaarcano.com`.

**Trade-off**: no free tier do Render, o backend pode dormir após inatividade. Isso causa cold start na primeira requisição — aceito conscientemente e documentado no README, sem mecanismo de keep-alive.

**UX do cold start**: a Home exibe um aviso temático de "Acordando a sala de projeção" quando as chamadas iniciais demoram alguns segundos. A intenção é deixar claro para o recrutador que o backend gratuito está acordando, sem usar keep-alive artificial nem esconder erros reais quando a API falha de fato.

### 4.49 Revisão de responsividade e acessibilidade

**Decisão**: antes do polimento visual final, fiz uma passada técnica nas telas principais para reduzir atritos em mobile e melhorar acessibilidade básica. A aplicação ganhou skip link para o conteúdo principal, estilos globais de `:focus-visible`, `Aviso` com `role="alert"`/`status`, inputs com tamanho adequado em mobile, botões com alinhamento consistente e cards preparados para não estourar em grids responsivos.

**Telas revisadas**: catálogo, detalhes do filme, criação/listagem de sessões do organizador, mapa de assentos, checkout, Meus ingressos, ticket e portaria. Estados simples de texto foram trocados por skeletons ou cards em pontos críticos; textos longos passam a quebrar linha corretamente; QR code e prévia de cartão respeitam largura máxima no celular.

**Porquê**: como o projeto será avaliado por um recrutador em ambiente real, responsividade e acessibilidade básica entram como parte da qualidade percebida. A intenção foi reforçar a robustez da experiência sem fazer uma reescrita visual grande antes da revisão premium final.

### 4.50 Polimento visual final e entrega

**Decisão**: a etapa final de UI manteve a identidade Cinema Arcano, mas reorganizou a experiência para ficar mais apresentável como produto: Home com destaque para sessões disponíveis, catálogo separado de filmes sem sessão publicada, filtros simples de catálogo, cards de sessão, trailer no detalhe do filme quando disponível no TMDb, ticket com visual de canhoto, portaria com resultado mais destacado e páginas institucionais `/sobre`, `/contato` e `/termos`.

**Backend do catálogo**: o detalhe de filme passou a buscar também vídeos do TMDb para expor `trailerKey` quando houver trailer no YouTube. A falha ou ausência de trailer não bloqueia o carregamento do filme.

**Organização final**: removi assets padrão não usados do `create-next-app`, mantive apenas os assets reais do projeto (`logo.png`, bandeiras de pagamento e favicon), limpei comentários visuais que eram apenas bastidor de implementação e rodei validações finais de build/lint/test.

**Porquê**: um fluxo funcional completo é a base, mas acabamento visual importa para a percepção do produto. Essa etapa final melhora a percepção de acabamento sem mudar contratos principais da API nem adicionar complexidade estrutural fora do escopo.

---

## 5. 📦 Checklist de entrega

- **README**: detalhado, com passo a passo de setup, incluindo configuração do banco escolhido; qualquer coisa que não funcione como esperado é mencionada
- **Dados semeados (seed)**: 1 organizador, 2 clientes, 1 usuário de portaria, ao menos 1 evento publicado com ingressos disponíveis
- **Deploy**: publicado (Vercel + Render)
- **Repositório GitHub público**, com commits descritivos ao longo da semana
- **Documentação do uso de IA**: seção explicando quais ferramentas foram usadas, em que partes, e o que foi feito sem IA. Artefatos de processo (este arquivo, entre outros) versionados no repositório.

---

## 6. 🛤️ Trilha de execução

O projeto foi conduzido em blocos fechados por módulo — cada decisão de arquitetura, escopo ou ajuste de rota veio antes da implementação correspondente, não depois. A ordem foi: fundação (identidade visual, monorepo, schema do banco, estratégia de QR e concorrência) → Auth → Catálogo → Salas/Sessões → Reserva/Ingresso → Portaria → áreas logadas (gerenciamento do organizador e Meus ingressos) → checkout completo e estados de erro → deploy → responsividade/acessibilidade → polimento visual final.

O histórico completo de cada etapa, com data e link para a decisão correspondente na seção 4, está no changelog (seção 7).

---

## 7. 🗓️ Changelog

| Data | Mudança |
|---|---|
| 19/08/2026 | Criação do documento. Decisões iniciais: TMDb, mapa de assentos. |
| 19/08/2026 | Confirmado prazo real (e-mail recebido 18/08 13:03 → entrega até 25/08 13:03). Definida identidade do produto: Cinema Arcano. Stack final fechada: Next.js + NestJS + Prisma + PostgreSQL + JWT/Argon2id/RBAC próprios (substitui a hipótese anterior de Supabase como banco por trás de uma API própria). Documento reescrito em primeira pessoa. |
| 20/08/2026 | Estrutura do monorepo criada (`frontend/` Next.js, `backend/` NestJS). Banco local via Docker Compose (Postgres 16) documentado. Downgrade de Prisma 7 para 6.x, com justificativa. Schema do banco (10 tabelas) documentado. Decisões de QR (JWT assinado HS256) e concorrência de assento (constraint `UNIQUE`) transcritas com justificativa. Primeira migration (`init`) aplicada com sucesso ao banco. |
| 20/08/2026 | Tabelas conferidas visualmente no Prisma Studio (10 modelos, vazios, estrutura correta). Payload do JWT do ticket definido e documentado (campos + estratégia de expiração atrelada ao horário da sessão). |
| 20/08/2026 | Provedor de hospedagem gerenciada definido: Render, free tier, para backend + PostgreSQL. Trade-off de cold start documentado e aceito, priorizando durabilidade do projeto para portfólio. Fluxo de desenvolvimento definido como intercalado (backend → frontend por módulo). Plano dia-a-dia fechado para os 5 dias restantes do prazo. |
| 20/08/2026 | Módulo Auth implementado e testado por completo: `AuthService`/`AuthController` (register + login), `PrismaService`/`PrismaModule` (global), `JwtAuthGuard` e `RolesGuard` (sem Passport), `GET /auth/me`, e `prisma/seed.ts` (1 ADMIN, 2 CUSTOMERs, 1 GATE, senhas Argon2id). Decisões documentadas: registro sempre como CUSTOMER via API (4.14), commit único por módulo funcional (4.15), PrismaModule global (4.16), guard própria sem Passport (4.17). `RolesGuard` validada com os 4 usuários reais do seed (4.18). `/auth/me` liberado para qualquer papel autenticado, sem restrição por role (4.19). |
| 20/08/2026 | Frontend do módulo Auth implementado e commitado: identidade visual do Cinema Arcano fechada (paleta amarelo/roxo/preto, neo-brutalismo — 4.12); roteamento via App Router e formulários com `react-hook-form` + `zod` (4.20); páginas de login e cadastro consumindo a API via serviço centralizado `api.ts`, com tratamento de erro lendo a mensagem real do backend (4.21); token salvo em `localStorage`, trade-off de XSS documentado, persistência/redirecionamento pós-login ainda pendente (4.22); escopo "esqueci a senha" confirmado descartado, sem nenhum elemento de UI residual (4.23); acessibilidade básica de formulários com `htmlFor`/`id` em todos os labels (4.24). |
| 20/08/2026 | Estratégia de pós-login implementada: `AuthContext`/`AuthProvider` (Context API nativa, sem Zustand) criado em `app/context/AuthContext.tsx` e envolvendo a aplicação em `layout.tsx`; lê `localStorage` ao montar, expõe `user`/`token`/`login`/`logout`. `login/page.tsx` passou a buscar o usuário via `GET /auth/me` após o login e redirecionar para `/`; `api.ts` ganhou a função `getMe`. Decisão documentada (4.25). Módulo Auth fica **100% completo, backend e frontend, commitado**. |
| 20/08/2026 | Backend do módulo Catálogo implementado, testado ponta a ponta via `Invoke-RestMethod` e commitado: `MoviesModule`/`MoviesController`/`MoviesService`, proxy do TMDb com resposta mapeada, rotas públicas `GET /movies`, `GET /movies/search?query=`, `GET /movies/:id` (4.26). |
| 21/08/2026 | Frontend do módulo Catálogo implementado a partir da leitura direta dos arquivos reais do projeto: Home com populares e busca, página de detalhes como server component, três novas funções em `api.ts` (4.27). Pôsteres via `next/image` com `remotePatterns` liberando `image.tmdb.org` (4.28). Testes manuais no navegador revelaram e corrigiram dois bugs: CORS ausente no backend, bloqueando as chamadas do frontend (4.29), e `Image` com `fill` vazando pela página de detalhes por falta de `position: relative` no elemento pai. Nova convenção fechada: caminho do arquivo como comentário na primeira linha em toda entrega de IA (4.30). Módulo Catálogo (frontend) commitado em dois commits separados: `feat(catalog)` e `fix(backend)` do CORS. Módulo Catálogo fica **100% completo, backend e frontend, commitado**. |
| 21/08/2026 | `schema.prisma` conferido contra todas as decisões do módulo Salas/Sessões (4.31/4.32) — sem inconsistência, sem migration de estrutura pendente. Enum `SessionStatus` (`SCHEDULED`/`CANCELLED`/`FINISHED`), presente no schema mas sem decisão registrada até então, decidido: escopo mínimo, só `SCHEDULED`/`CANCELLED` geridos pela aplicação (organizador pode cancelar sessão sem deletar a linha, e a validação de conflito de horário passa a ignorar sessões `CANCELLED`), `FINISHED` é só calculado na consulta, nunca persistido (4.33). Seed de `Room`/`Seat` ainda não escrita — pendente antes de iniciar o `SessionsModule`. |
| 21/08/2026 | Backend de Salas/Sessões concluído e commitado: seed de sala/assentos, `SessionsModule`, conflito de horário, cancelamento, status `FINISHED` calculado, `roomId` implícito, fallback de 120 minutos e vínculo entre TMDb e `Movie` local via upsert (4.34 a 4.37). Backend de Reserva/Ingresso concluído e commitado: `ReservationsModule`, reserva `PENDING`, pagamento simulado, ticket público, QR/JWT com expiração no fim da sessão, liberação on-the-fly de reservas expiradas e teste manual completo (4.38). |
| 21/08/2026 | Frontend de Salas/Sessões iniciado: componentes reutilizáveis criados (`Cabecalho`, `Rodape`, `Container`, `Cartao`, `Botao`, `CampoTexto`, `Aviso`, `CartaoFilme`), telas existentes refatoradas para usar a base visual, `/admin/sessions/new` implementada para criação de sessões por ADMIN, detalhes do filme exibindo sessões futuras, e script `npm run dev` do frontend fixado na porta 3001 para evitar conflito com o backend na 3000 (4.39/4.40). Uso de IA atualizado: migração de Claude Sonnet para ChatGPT Codex documentada por limitações de crédito e pela vantagem de acesso direto ao workspace (4.41). |
| 21/08/2026 | Frontend de Reserva/Ingresso implementado: `GET /sessions/:id` passou a retornar assentos e ocupação; rota `/sessions/[id]` criada com mapa de assentos, criação de reserva `PENDING` e pagamento simulado; rota `/tickets/[id]` criada com ticket público e QR code real via `qrcode` (4.42). README atualizado com contas de teste do seed e roteiro rápido para o recrutador validar organizador → cliente → ticket (4.43). |
| 21/08/2026 | Módulo de Portaria implementado: backend `GateModule` com `POST /gate/validate` restrito a `GATE`, validação de QR assinado, retorno `VALID`/`INVALID`/`ALREADY_USED`/`WRONG_EVENT`, marcação do ticket como `USED`, registro em `ValidationLog` e migration para permitir log de token inválido sem ticket associado. Frontend `/gate` criado com digitação manual e leitura por câmera via `BarcodeDetector` quando disponível (4.44). |
| 21/08/2026 | Gerenciamento de sessões e Meus ingressos implementados: backend ganhou `GET /sessions/admin/mine` e `GET /reservations/me`; frontend ganhou `/admin/sessions` com listagem/contadores/cancelamento e `/reservations` para o cliente rever reservas, pagar pendentes e reabrir tickets. Header passou a mostrar atalhos por papel (4.45). |
| 21/08/2026 | Checkout simulado implementado: nova rota `/reservations/[id]/payment` com cartão/PIX, aprovação e recusa; backend `POST /reservations/:id/pay` aceita método e falha simulada, grava `Payment FAILED`, cancela reserva e libera assentos. Criadas páginas globais `not-found.tsx`, `loading.tsx` e `error.tsx` para acabamento visual (4.46). |
| 21/08/2026 | Ajustes de produção antes da entrega: portaria trocada para `html5-qrcode`, ticket exibe token copiável para validação manual, páginas privadas usam `AcessoRestrito` em vez de redirecionamento silencioso, e backend permite validação por `GATE` ou `ADMIN` (4.47). |
| 21/08/2026 | Deploy realizado: backend/PostgreSQL no Render, frontend na Vercel, seed de produção confirmado via login, CORS de produção configurado com `FRONTEND_URL`, e README atualizado com links públicos e roteiro de teste em produção (4.48). |
| 21/08/2026 | Primeira revisão de responsividade/acessibilidade aplicada no frontend: skip link, foco visível, avisos com roles semânticas, skeletons em telas principais, ajustes mobile no QR/ticket, checkout, portaria, mapa de assentos, reservas e gerenciamento de sessões (4.49). |
| 22/08/2026 | Polimento visual final concluído: Home premium com sessões em destaque, filtros de catálogo, trailers via TMDb, ticket com visual de canhoto, portaria refinada, páginas institucionais e limpeza de assets/comentários. README e documentação de uso de IA atualizados para entrega (4.50). |
| 22/08/2026 | Adicionado aviso temático de cold start na Home para orientar o usuário/recrutador quando o backend do Render free tier estiver acordando. |
