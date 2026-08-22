# Contexto de Sessão — Cinema Arcano

> **Para a IA que está lendo isto agora**: este arquivo existe porque o desenvolvedor troca de sessão/ferramenta de IA por limitação de créditos. Ele vai colar este arquivo inteiro no início de uma nova conversa. Sua função é continuar o projeto exatamente de onde a sessão anterior parou — sem repetir perguntas já respondidas nem propor decisões já tomadas (elas estão fechadas, ver seção 2). **A atualização deste arquivo só acontece quando o desenvolvedor pedir explicitamente** — não atualize por conta própria. Mas fique atenta ao momento certo de sugerir: sempre que um bloco de trabalho relevante for fechado nesta sessão (uma decisão nova tomada, uma implementação concluída, um módulo terminado) e esse progresso ainda não estiver refletido aqui, avise o developer — algo como "vale atualizar o contexto agora, depois desse trabalho, pra não prejudicar a continuidade em outra sessão" — e espere a confirmação dele antes de editar. Quando for pedido para atualizar, não reescreva o arquivo do zero: ajuste "Estado atual", mova itens concluídos, atualize a seção 5 (próximos passos) e adicione uma linha no changelog no fim. Mantenha o restante do arquivo estável para não confundir a leitura entre sessões.

**Última atualização**: 21/08/2026
**Repositório**: github.com/raelmz/cinema-arcano. Módulos Auth e Catálogo **100% concluídos e commitados** (backend + frontend), incluindo os commits `feat(auth)`, `feat(auth): pós-login`, `feat(movies)`, `feat(catalog)` e `fix(backend): CORS` — todos já refletidos no changelog abaixo, nenhum trabalho fora de sincronia. `docs/PROJETO.md` já reflete isso (decisões 4.26 a 4.30). **Módulo Salas/Sessões: decisões de design fechadas, schema conferido, implementação ainda não iniciada.** Sala única com 40 assentos decidida (4.31); comportamento do módulo (tela própria do organizador, bloqueio de conflito de horário, só sessões futuras visíveis) decidido (4.32); uso do enum `SessionStatus` decidido — escopo mínimo, `SCHEDULED`/`CANCELLED` geridos pela aplicação, `FINISHED` calculado sem persistir (4.33). Próximo passo real: escrever a seed de `Room`/`Seat` (ainda não enviada), rodar a migration se necessário, depois implementar o `SessionsModule`. Ver seção 4/5.

---

## 1. O que é o projeto (resumo rápido)

Desafio técnico da etapa 3/6 do processo seletivo **Elite Dev** (Verzel — vaga Full Stack Jr). Prazo: **7 dias corridos a partir de 18/08/2026, 13:03 → entrega até 25/08/2026, 13:03**.

Produto a construir: **Cinema Arcano**, uma plataforma de eventos e ingressos com identidade temática própria. Organizador publica sessões de filme (catálogo via TMDb), cliente reserva assento num mapa, paga (simulado), recebe ingresso com QR code e pode compartilhar por link. Portaria valida o ingresso na entrada (leitura de câmera + digitação manual), com retorno: válido / inválido / já usado / evento errado.

O desafio original completo está documentado em `docs/PROJETO.md` no repositório — não precisa ser reexplicado aqui, só consultado se necessário.

**Ponto crítico de avaliação** (não esquecer em nenhuma decisão futura): os avaliadores penalizam explicitamente projetos que "saem prontos de colar o prompt numa IA" ("AI slop"). O que conta é o developer mostrar as próprias decisões e justificá-las — não o volume entregue. Toda ajuda de IA daqui em diante deve preservar isso: propor, explicar trade-off, deixar o developer decidir — não decidir por ele.

---

## 2. Decisões já fechadas (não reabrir sem motivo novo)

| Decisão | Escolha | Por quê (resumo) |
|---|---|---|
| Catálogo externo | TMDb (não Ticketmaster) | Menor fricção de integração, mais tempo pra regras de negócio |
| Modelo de reserva | Mapa de assentos (não pista) | Mais rico tecnicamente (concorrência real), coerente com cinema |
| Identidade | Cinema Arcano — tema visual/copy, sem alterar o fluxo padrão | Diferenciação sem gastar tempo do prazo em UX não-convencional |
| Frontend | Next.js + TypeScript | Deploy fácil (Vercel), já dominado pelo dev |
| Backend | NestJS + TypeScript | Framework citado no PDF, estrutura modular, concentra toda lógica de negócio |
| Banco | PostgreSQL + Prisma **6.x** | Relacional, forte em integridade/concorrência (assento não pode duplicar venda) |
| Autenticação | JWT + Argon2id + RBAC, implementada na própria API | Nada de BaaS/Auth de terceiro — o PDF quer ver a camada de API projetada pelo candidato |
| Infra evitada de propósito | Sem microserviços, Redis, filas, Kubernetes | Desproporcional ao escopo do desafio |
| Deploy | Vercel (front) + **Render** (back + Postgres gerenciado) | +1 ponto garantido no critério oficial do desafio |
| Padrão de commits | Conventional Commits simplificado (`feat`, `fix`, `docs`, `refactor`, `chore`) | Ver `CONTRIBUTING.md` no repo |
| Ambiente de banco local | Docker Compose (Postgres 16 em container) | Sem instalar Postgres direto no SO; ambiente descartável e reproduzível |
| QR do ingresso | JWT assinado (HS256), não HMAC cru | Expiração embutida (`exp`), reaproveita a mesma lib/mental model já usada na autenticação, menos código próprio pra debugar dado o prazo |
| Concorrência no assento | Constraint `UNIQUE(sessionId, seatId)` na tabela `ReservationSeat`, via transação Prisma | Garantia no nível do banco, não lock manual/otimista na aplicação |
| Arquivos de config de IA (`.claude/`, `.windsurf/`, `AGENTS.md`, etc.) | Ficam no `.gitignore`, não versionados | Evitar reforçar percepção de "AI slop" no repositório público avaliado |
| Versão do Prisma | Downgrade de 7 para **6.x** | Documentação/tutoriais mais maduros, sem `prisma.config.ts` obrigatório, menos superfície de coisa nova pra debugar dado o prazo de 7 dias |
| Payload do JWT do ticket | `{ ticketId, sessionId, seatId, iat, exp }` | Campos mínimos pra validar o ingresso na portaria; `exp` = horário da sessão + duração do filme + margem de tolerância |
| Fluxo de desenvolvimento (a partir de 20/08) | Intercalado por módulo (backend do módulo → frontend consumindo → próximo módulo) | Reduz risco de prazo, sempre entrega algo ponta a ponta funcional |
| Hospedagem gerenciada (backend + PostgreSQL) | Render, free tier | Melhor limite de free tier entre as opções pra manter o projeto no ar de forma duradoura. Trade-off aceito: cold start no free tier |
| Registro de usuários por papel | `POST /auth/register` sempre cria `role: CUSTOMER`, ignorando qualquer `role` enviado no corpo. `ADMIN` e `GATE` só existem via seed | Impede escalada de privilégio via cadastro público — decisão de segurança, coerente com o mundo real (ninguém se autopromove a organizador/portaria) |
| Granularidade de commit do módulo Auth | Um commit só, ao final do módulo completo (register + login + guards + seed funcionando ponta a ponta) | Mantém a ideia de "commit = unidade funcional coerente" |
| PrismaModule como `@Global()` | Módulo do Prisma marcado global no Nest, importado uma única vez no `AppModule` | Praticamente todo módulo futuro precisa do banco; evita reimportar em cada um. Exceção consciente à prática padrão do Nest de módulos explícitos |
| Geração/validação do JWT de sessão do usuário | `@nestjs/jwt` + `@nestjs/config`, secret e tempo de expiração lidos do `.env` (`JWT_SECRET`, `JWT_EXPIRES_IN`), nunca hardcoded | Padrão idiomático do Nest; separa claramente esse JWT (sessão de login) do JWT do ticket do ingresso |
| Nome do campo de senha no model `User` | `passwordHash` (não `password`) | Nome já existia no `schema.prisma` desde a modelagem inicial |
| Ferramenta de teste manual dos endpoints | `Invoke-RestMethod` do PowerShell, não `curl` | Lida bem com JSON sem gambiarra de escape de aspas |
| Implementação da guard de autenticação | `JwtAuthGuard` própria usando `JwtService.verifyAsync` direto, sem Passport (`passport`/`passport-jwt`) | Evita adicionar uma lib nova só pra isso — menos superfície de coisa nova pra debugar dado o prazo |
| Autorização por papel | `RolesGuard` + decorator `@Roles(...)` via `Reflector`, sempre usada em conjunto com `JwtAuthGuard` (`@UseGuards(JwtAuthGuard, RolesGuard)`) | Padrão idiomático do Nest para RBAC |
| Restrição de papel em `GET /auth/me` | Nenhuma — só exige `JwtAuthGuard` (estar logado) | O dado retornado já vem do próprio token (`req['user']`), então cada usuário só vê os próprios dados |
| Frontend — Roteamento | App Router (`app/`) | Padrão moderno do Next.js, projeto já inicializado dessa forma |
| Frontend — Formulários | `react-hook-form` + `zod` (via `@hookform/resolvers`) | Melhor performance de re-renderização e validação robusta orientada a schema no lado do cliente |
| Frontend — Tema visual | Neo-brutalismo (Tailwind v4) | Sem border-radius, bordas sólidas, paleta Cinema Arcano (Amarelo, Roxo Escuro, Preto). Foge do design padrão genérico de IA, garantindo personalidade |
| Frontend — Escopo "Esqueci a Senha" | Descartado, **e botão removido da UI de login** | Foco no MVP estrito do desafio; exigiria SMTP e rotas extras fora do core avaliado. Botão que só dava `alert()` foi removido nesta sessão — num desafio avaliado por "tudo funcionando", um botão morto chama mais atenção negativa do que a simples ausência da feature |
| Tratamento de erro em `api.ts` | `login` e `registerUser` sempre tentam ler `errorData.message` do corpo da resposta do backend, com fallback para mensagem genérica | Antes da revisão, `login` sempre lançava "Credenciais inválidas" fixo, mesmo em erros que não eram de credencial (500, backend fora do ar). Padronizado com `registerUser`, que já fazia certo |
| Acessibilidade dos formulários | Todo `<label>` usa `htmlFor` ligado ao `id` do `<input>` correspondente (login e registro) | Sem isso, clique no label não focava o campo e leitor de tela não associava label ao input — ajuste simples, sem mudança visual |
| Estratégia de pós-login | Context API nativa do React (`AuthContext`/`AuthProvider`), não Zustand nem checagem manual de token por página | Escopo atual é pequeno (poucas páginas, um token só) — não justifica lib nova pra aprender sob prazo apertado, mesmo racional já usado em outras decisões do projeto |
| Cliente HTTP do backend para o TMDb | `fetch` nativo do Node, sem `@nestjs/axios`/`axios` | Nest 11 roda em Node com `fetch` global; evita lib nova só pra chamada HTTP simples, mesmo racional já usado na guard de auth sem Passport |
| Formato de retorno do módulo Catálogo | Backend mapeia a resposta bruta do TMDb (`TmdbMovie`/`TmdbMovieDetails`) para um formato próprio (`Movie`/`MovieDetails`), só com os campos usados pelo front | Evita acoplar o frontend a um payload de terceiro que pode mudar sem aviso |
| Idioma das respostas do TMDb | `pt-BR` fixo em todas as chamadas | Título/sinopse em português para o usuário final; ponto sinalizado como fácil de tornar configurável depois, se necessário |
| Autenticação nas rotas de Catálogo | Nenhuma — `GET /movies`, `/movies/search`, `/movies/:id` são públicas | Catálogo é conteúdo público; só a futura `POST /sessions` (publicar sessão) exigirá `@Roles('ADMIN')` |
| Exibição de pôsteres no frontend | `next/image` com `remotePatterns` liberando `image.tmdb.org` em `next.config.ts` (não `<img>` puro) | Otimização/lazy loading automático do Next; exige o domínio liberado, mas o custo é baixo (uma entrada de config) |
| CORS no backend | `app.enableCors({ origin: [...] })` em `main.ts`, liberando `http://localhost:3000` e `http://localhost:3001` | Backend fica fixo na porta 3000; o Next sobe em 3000 por padrão mas cai pra 3001 quando a 3000 já está ocupada (pelo próprio backend) — liberar as duas evita quebrar de novo por esse motivo. Trade-off: allowlist local só, vai precisar trocar pela URL real no deploy (Vercel/Render) |
| Revisão geral do projeto contra o PDF do desafio | Confirmado alinhamento — nenhuma decisão até agora contraria o desafio ou é over-engineered | Reler o PDF original junto com `PROJETO.md` a cada início de módulo novo, não só no começo do projeto, evita scope creep silencioso (ver seção 4.31/4.32 como exemplo desse hábito) |
| Quantidade de salas | Sala única fixa, seedada, 40 assentos (5×8) | Schema já suporta múltiplas salas (Room/Seat separados de Session), mas o PDF não exige mais de um local; manter simples poupa tempo pra parte que mais pesa na nota (concorrência, QR, portaria) — ver `PROJETO.md` 4.31 |
| Como o organizador cria uma sessão | Tela própria do organizador (`/admin/...`), com busca de filme dedicada — não um botão embutido na Home pública do Catálogo | Mantém a navegação do cliente separada da área de gestão, coerente com os 3 papéis distintos do desafio |
| Conflito de horário na sala | Bloqueado — validação de sobreposição na aplicação (sem constraint de banco, já que é regra de negócio sobre intervalo de tempo) | Com sala única, é a única forma de o sistema não vender duas sessões impossíveis de acontecer ao mesmo tempo |
| Visibilidade de sessões para o cliente | Só sessões futuras (`startTime >= now`) | Evita cliente tentar reservar sessão que já passou; não há tela de histórico no escopo |
| Uso do enum `SessionStatus` (`SCHEDULED`/`CANCELLED`/`FINISHED`) | Escopo mínimo: só `SCHEDULED`/`CANCELLED` geridos pela aplicação (organizador pode cancelar sessão sem deletar a linha); conflito de horário passa a ignorar sessões `CANCELLED`. `FINISHED` nunca é persistido — é calculado on-the-fly na consulta | Sem `CANCELLED`, a validação de conflito de horário (4.32) não teria como reabrir um horário sem deletar a `Session` e arriscar quebrar `Reservation`/`ReservationSeat`. `FINISHED` calculado evita job/cron periódico, desproporcional ao escopo do desafio |

Justificativa completa de cada decisão do backend está em `docs/PROJETO.md`, seção 4 (decisões 4.14 a 4.19 do módulo Auth já transcritas). **As decisões novas de frontend desta sessão (roteamento, formulários, tema visual, escopo de "esqueci a senha") ainda não foram transcritas para `docs/PROJETO.md` — pendente.**

---

## 3. Estrutura do repositório até agora

```
cinema-arcano/
├── README.md              → visão geral do produto
├── CONTRIBUTING.md         → padrão de commits
├── .gitignore
├── docs/
│   └── PROJETO.md           → decisões de produto e arquitetura, com justificativas
├── backend/                 → API NestJS + PostgreSQL / Prisma (Auth + Catálogo completos e commitados)
│   └── src/
│       ├── main.ts           → bootstrap + CORS liberado p/ localhost:3000 e :3001 (novo nesta sessão)
│       └── movies/           → MoviesModule/Controller/Service (backend do Catálogo, sessão anterior)
└── frontend/                 → Next.js 16 (Turbopack) + TypeScript + Tailwind v4
    ├── next.config.ts        → remotePatterns liberando image.tmdb.org (novo nesta sessão)
    ├── package.json
    ├── app/
    │   ├── globals.css        → Tema Neo-brutalista e paleta Arcano definidos no Tailwind v4
    │   ├── page.tsx            → Home: lista populares (GET /movies) + busca (GET /movies/search) (novo)
    │   ├── movies/
    │   │   └── [id]/
    │   │       └── page.tsx    → Detalhes do filme (GET /movies/:id), server component (novo)
    │   ├── services/
    │   │   └── api.ts         → fetch() para /auth/* e agora também /movies* (getMovies, searchMovies, getMovieDetails)
    │   ├── login/
    │   │   └── page.tsx       → UI de Login c/ Zod + react-hook-form + consumo da API
    │   └── register/
    │       └── page.tsx       → UI de Cadastro c/ Zod + react-hook-form + consumo da API
    └── README.md
```

> **Nota**: a partir desta sessão, todo arquivo novo/editado pelo Claude traz o caminho real como comentário na primeira linha (ver decisão na seção 2), então copiar do chat pro repo fica direto.

> **Nota**: os 4 arquivos do frontend (`globals.css`, `app/services/api.ts`, `app/login/page.tsx`, `app/register/page.tsx`) foram lidos e revisados diretamente nesta sessão pelo Claude (não só descritos por texto) — ver correções aplicadas na seção 2 e no changelog. `globals.css` ainda tem boilerplate morto do `create-next-app` (`:root`, `@theme inline`, `@media (prefers-color-scheme: dark)`) que não é usado em lugar nenhum; não foi removido ainda, fica como limpeza opcional futura.

---

## 4. Estado atual

- [x] PDF do desafio e e-mail de convocação analisados
- [x] Stack, catálogo externo, modelo de reserva e identidade do produto decididos
- [x] Backend estruturado, DB Docker rodando, Prisma modelado e migrado (10 tabelas)
- [x] Módulo Backend Auth completo (register, login, `JwtAuthGuard`, `RolesGuard`, `/auth/me`, seed) — implementado, testado manualmente ponta a ponta e **commitado**
- [x] `docs/PROJETO.md` atualizado com as decisões do módulo Auth (seções 4.14–4.19)
- [x] **[Sessão com Gemini] Frontend: roteamento confirmado (App Router)**
- [x] **[Sessão com Gemini] Frontend: tema Tailwind v4 configurado com variáveis CSS da paleta Cinema Arcano (Neo-brutalismo)**
- [x] **[Sessão com Gemini] Frontend: dependências de formulário instaladas (`react-hook-form`, `zod`, `@hookform/resolvers`)**
- [x] **[Sessão com Gemini] Frontend: serviço de API criado (`app/services/api.ts`), integrando `login` e `registerUser`**
- [x] **[Sessão com Gemini] Frontend: páginas `/login` e `/register` criadas, funcionando e conversando com o backend**
- [x] **Código do frontend conferido/lido diretamente pelo Claude** — 4 arquivos revisados
- [x] **Correções aplicadas**: erro de `login` em `api.ts` padronizado com `registerUser`; `htmlFor`/`id` adicionados em todos os labels (login e registro); botão morto "Esqueci minha senha" removido do login
- [x] **Frontend de Auth commitado** — `feat(auth): implementação das telas de login e cadastro no front`
- [x] `docs/PROJETO.md` atualizado com as decisões de frontend do módulo Auth (roteamento, formulários, tema visual, escopo "esqueci a senha", correções da revisão) — seções 4.20 a 4.24
- [x] Limpeza do `globals.css`: removido boilerplate morto do `create-next-app` (`:root` com `--background`/`--foreground`, `@media prefers-color-scheme`). Mantido o mapeamento de fonte (`--font-sans`/`--font-mono` → Geist), pois `font-mono` é usado de fato nas telas de login/registro
- [x] **Estratégia de pós-login implementada e commitada**: `AuthContext`/`AuthProvider` (Context API) criado em `app/context/AuthContext.tsx`, envolvendo a aplicação em `layout.tsx`. Lê `localStorage` ao montar, expõe `user`/`token`/`login`/`logout`. `login/page.tsx` busca o usuário via `GET /auth/me` após login e redireciona para `/`. `api.ts` ganhou a função `getMe`. Decisão documentada em `docs/PROJETO.md` (seção 4.25)
- [x] `globals.css` limpo e commitado junto com o pós-login
- [x] **Módulo Catálogo (backend) implementado e commitado**: `MoviesModule` em `backend/src/movies/` — `MoviesService` faz proxy do TMDb via `fetch` nativo (sem lib nova), `MoviesController` expõe `GET /movies` (populares), `GET /movies/search?query=` e `GET /movies/:id`, todas públicas. Resposta do TMDb mapeada para formato próprio (`Movie`/`MovieDetails`). `TMDB_API_KEY` já configurada no `.env` do backend. Testado ponta a ponta via `Invoke-RestMethod` (populares, busca, detalhes, 404 de filme inexistente, 400 de busca sem query) — todos os casos passaram
- [x] **Bug de porta identificado e corrigido pelo developer**: fallback de `API_URL` em `app/services/api.ts` apontava para `localhost:3001`, mas o backend sobe na `3000`. Corrigido manualmente no front para `localhost:3000`
- [x] **Módulo Catálogo (frontend) implementado**: `app/page.tsx` (Home, lista populares + busca), `app/movies/[id]/page.tsx` (detalhes, server component), `getMovies`/`searchMovies`/`getMovieDetails` adicionadas em `app/services/api.ts`, seguindo o mesmo padrão de erro das funções de Auth já existentes
- [x] **Bug de CORS corrigido**: `main.ts` do backend não tinha `app.enableCors()` — front (porta 3001) sendo bloqueado ao chamar o back (porta 3000). Corrigido liberando `localhost:3000` e `localhost:3001`
- [x] **Bug visual corrigido**: `Image` com `fill` na página de detalhes vazando pela página inteira por falta de `position: relative` no elemento pai — `div` corrigida com a classe `relative`
- [x] **Testado manualmente no navegador, ponta a ponta**: Home carregando populares, busca com resultado/sem resultado/vazia, navegação pro detalhe, 404 de filme inexistente — tudo OK
- [x] **Módulo Catálogo (frontend) commitado** — em dois commits separados (`feat(catalog)` e `fix(backend)` do CORS). Este item estava desatualizado como pendente numa versão anterior deste arquivo; corrigido nesta atualização (o commit já havia acontecido e já estava refletido no changelog e no `docs/PROJETO.md`, só não tinha sido tirado desta lista)
- [x] Decisões do módulo Catálogo (backend e frontend) transcritas para `docs/PROJETO.md` (seções 4.26 a 4.30)
- [x] **`schema.prisma` conferido contra as decisões do módulo Salas/Sessões** (4.31/4.32) — sem inconsistência, sem migration de estrutura nova necessária
- [x] **Uso do enum `SessionStatus` decidido** — escopo mínimo (`SCHEDULED`/`CANCELLED` ativos, `FINISHED` calculado) — ver seção 2 e `docs/PROJETO.md` 4.33
- [ ] **Seed de `Room`/`Seat` (sala única, 40 assentos) ainda não escrita** — próxima ação antes de iniciar o `SessionsModule`
- [ ] Restante do escopo (Reserva, Pagamento, Ticket/QR, Portaria) pendente

---

## 5. Próximos passos (em ordem sugerida)

1. **Escrever a seed de `Room`/`Seat`** (sala única "Cinema Arcano — Sala 1", 40 assentos em grade 5×8, decisão 4.31) — ainda não foi enviada por nenhuma sessão anterior. Rodar a migration também, caso ainda não esteja aplicada.
2. **Implementar o `SessionsModule`** (backend): CRUD de sessão pelo organizador, validação de conflito de horário ignorando sessões `CANCELLED` (decisões 4.32/4.33), listagem pública filtrando só sessões futuras.
3. Lembrar que `POST /sessions` (publicar sessão de filme) é candidato natural para `@Roles('ADMIN')` — primeira aplicação "real" da `RolesGuard` fora de teste.
4. Depois do backend de Salas/Sessões: frontend consumindo (tela do organizador + exibição de sessões no catálogo) e início do módulo de Reserva (dia 3 do plano).

---

## 6. Perfil do developer (para calibrar o nível de explicação)

Israel Menezes de Andrade — Full Stack Jr, autodidata, já usou React/Next.js, Node, Supabase, TypeScript em produção (projetos: Linkael, Painel de Cadastro de Produtos, Roteirizador PetroKar). Confortável com IA como ferramenta de apoio no dia a dia. Em sessões recentes tem pedido código pronto direto, sem explicação prévia passo a passo — parece preferência mais estável agora, não só pressa pontual. Nunca tinha trabalhado em monorepo nem usado Docker antes desta etapa — ambos aprendidos do zero. Ambiente: Windows 11, terminal principal é **PowerShell**, VS Code. Ganhou fluência com `Invoke-RestMethod`, incluindo o padrão de guardar resposta em variável (`$login = ...`, `$token = $login.accessToken`) para evitar problemas de token truncado na exibição de tabela do PowerShell.

Testou o Gemini Pro por uma sessão (módulo de frontend) e está voltando a usar o Claude a partir de agora — vale manter naturalidade na retomada, sem repetir decisões já fechadas nem questionar as escolhas feitas na sessão com o Gemini sem motivo novo.

---

## Changelog deste arquivo

| Data | O que mudou |
|---|---|
| 19/08/2026 | Criação do arquivo de handoff, ao final da primeira sessão de planejamento. |
| 20/08/2026 | Frontend e backend criados; schema modelado; Docker configurado; READMEs escritos. |
| 20/08/2026 | Segundo commit confirmado. Banco subido via Docker. Downgrade Prisma 7→6. Primeira migration aplicada. |
| 20/08/2026 | Terceiro commit (`b9ec5f5`). Prisma Studio conferido. Payload JWT do ticket fechado. |
| 20/08/2026 | Fluxo de desenvolvimento intercalado decidido. Plano dia-a-dia fechado (5 dias). Hospedagem escolhida (Render). Decisão de registro por papel fechada. DTOs criados. |
| 20/08/2026 | `PrismaService`/`PrismaModule` criados. `@nestjs/jwt`/`@nestjs/config` instalados. `AuthModule`, `AuthService`, `AuthController` escritos. |
| 20/08/2026 | Campo `passwordHash` corrigido. Erro de tipagem em `auth.module.ts` corrigido. Testes manuais via PowerShell — register, login, e-mail duplicado (409), senha errada (401) — todos OK. |
| 20/08/2026 | `JwtAuthGuard` e `RolesGuard` criadas (sem Passport). `@Roles()` decorator criado. `GET /auth/me` criada e protegida. `JwtAuthGuard` testada com sucesso. |
| 20/08/2026 | `prisma/seed.ts` criado e rodado com sucesso. `RolesGuard` testada com usuários reais do seed. `/auth/me` sem restrição de papel. `docs/PROJETO.md` atualizado com decisões 4.14–4.19. Módulo Auth pronto para commit único. |
| 20/08/2026 | **Módulo Auth (backend) commitado.** Sessão feita fora do Claude, com **Gemini Pro**: início do Frontend — App Router confirmado, tema Neo-brutalista (Tailwind v4) aplicado, `react-hook-form` + `zod` instalados, `app/services/api.ts` criado, páginas `/login` e `/register` criadas e integradas com o backend. Escopo "Esqueci a Senha" descartado. Frontend de Auth **ainda não commitado**. Developer retorna ao Claude para continuar o projeto — contexto reconstruído a partir do resumo em texto enviado pelo Gemini (arquivo .md não foi gerado por ele). |
| 20/08/2026 | **Claude revisou os 4 arquivos reais do frontend feitos com o Gemini** (não só descrição textual). Encontrado e corrigido: `login()` em `api.ts` lançava erro genérico fixo em vez de ler a mensagem real do backend (padronizado com `registerUser`); labels sem `htmlFor`/`id` em login e registro (acessibilidade); botão "Esqueci minha senha" removido do login por ser não-funcional (`alert()`) e a feature já estar descartada — evita "botão morto" na avaliação do desafio. `globals.css` identificado com boilerplate morto do `create-next-app`, não removido ainda (limpeza opcional). **Frontend de Auth commitado pelo developer**: `feat(auth): implementação das telas de login e cadastro no front`. Decisões novas de frontend ainda não transcritas para `docs/PROJETO.md` — pendente. |
| 20/08/2026 | Decisões de frontend do módulo Auth transcritas para `docs/PROJETO.md` (seções 4.20–4.24). **Estratégia de pós-login fechada e implementada**: Context API nativa (não Zustand, não checagem manual por página) — `AuthContext`/`AuthProvider` em `app/context/AuthContext.tsx`, envolvendo o app em `layout.tsx`; `login/page.tsx` passou a buscar o usuário via `GET /auth/me` após login e redirecionar para `/`; `api.ts` ganhou `getMe`. Decisão documentada em `docs/PROJETO.md` (seção 4.25). `globals.css` limpo: removido boilerplate morto do `create-next-app` (`:root` de `--background`/`--foreground`, `@media prefers-color-scheme`), mantido o mapeamento de fonte (`font-mono` é usado de fato nas telas). Regra de atualização deste arquivo de contexto ajustada: a IA só atualiza quando o developer pedir explicitamente, mas deve sinalizar quando um bloco de trabalho relevante ficar fora de sincronia com o registrado aqui. Trabalho desta sessão ainda não commitado. |
| 20/08/2026 | **Estratégia de pós-login e limpeza do `globals.css` commitadas** pelo developer. Módulo Auth fica 100% concluído (backend + frontend, incluindo persistência de sessão). **Módulo Catálogo (backend) implementado**: `MoviesModule`/`MoviesController`/`MoviesService` em `backend/src/movies/`, proxy do TMDb via `fetch` nativo (sem `axios`), rotas públicas `GET /movies`, `GET /movies/search?query=`, `GET /movies/:id`, resposta mapeada para formato próprio (`Movie`/`MovieDetails`) em vez de repassar o payload bruto do TMDb, idioma `pt-BR` fixo nas chamadas. Testado ponta a ponta via `Invoke-RestMethod` (populares, busca, detalhes, 404, 400) — tudo OK. Developer identificou e corrigiu manualmente um descompasso de porta: fallback de `API_URL` em `api.ts` apontava para `3001`, backend sobe na `3000`. **Módulo Catálogo (backend) commitado.** |
| 20/08/2026 | **Módulo Catálogo (frontend) implementado**, a partir da leitura direta dos arquivos reais do projeto (`api.ts`, `page.tsx`, `layout.tsx`, `AuthContext.tsx`, `globals.css`, `movies.service.ts`, `search-movies.dto.ts`). Criados: `app/page.tsx` (Home com populares + busca), `app/movies/[id]/page.tsx` (detalhes, server component), funções `getMovies`/`searchMovies`/`getMovieDetails` em `app/services/api.ts`. Pôsteres via `next/image`, exigindo `remotePatterns` novo em `next.config.ts` liberando `image.tmdb.org`. **Nova convenção fechada**: todo arquivo entregue pelo Claude leva o caminho real do repo como comentário na primeira linha. Testes manuais no navegador revelaram e corrigiram dois bugs: (1) `Failed to fetch`/CORS — `main.ts` não tinha `app.enableCors()`, corrigido liberando `localhost:3000` e `:3001`; (2) `Image` com `fill` vazando pela página de detalhes por falta de `position: relative` no elemento pai, corrigido. Após os fixes, roteiro completo testado com sucesso: populares, busca (com resultado, sem resultado, vazia), navegação pro detalhe, 404 de filme inexistente. **Módulo Catálogo (frontend) ainda não commitado** pelo developer. |
| 21/08/2026 | **Módulo Catálogo (frontend) commitado** pelo developer, em dois commits (`feat(catalog)` e `fix(backend)` do CORS) — confirmado contra o histórico real do repositório. `schema.prisma` conferido contra as decisões do módulo Salas/Sessões (4.31/4.32): sem inconsistência, sem migration de estrutura nova necessária. **Corrigida inconsistência interna deste arquivo**: as seções 4 e 5 ainda listavam o commit do Catálogo (frontend) como pendente/próxima ação, mesmo já estando commitado e refletido no changelog e no `docs/PROJETO.md` — ajustado. **Decisão fechada sobre o enum `SessionStatus`** (identificado no schema na sessão anterior, sem decisão registrada até então): escopo mínimo — só `SCHEDULED`/`CANCELLED` geridos ativamente pela aplicação (organizador pode cancelar sessão sem deletar a linha, e a validação de conflito de horário passa a ignorar sessões `CANCELLED`); `FINISHED` nunca é persistido, é calculado on-the-fly na consulta. Documentado em `docs/PROJETO.md` (seção 4.33). **Seed de `Room`/`Seat` ainda não foi escrita/enviada** — próxima ação real antes de iniciar o `SessionsModule`. |