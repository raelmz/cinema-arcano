# Contexto de Sessão — Cinema Arcano

> **Para a IA que está lendo isto agora**: este arquivo existe porque o desenvolvedor troca de sessão/ferramenta de IA por limitação de créditos. Ele vai colar este arquivo inteiro no início de uma nova conversa. Sua função é continuar o projeto exatamente de onde a sessão anterior parou — sem repetir perguntas já respondidas nem propor decisões já tomadas (elas estão fechadas, ver seção 2). No fim desta sessão (quando o desenvolvedor avisar que vai trocar de sessão de novo), **atualize este arquivo** — não o reescreva do zero: ajuste "Estado atual", mova itens concluídos, atualize a seção 5 (próximos passos) e adicione uma linha no changelog no fim. Mantenha o restante do arquivo estável para não confundir a leitura entre sessões.

**Última atualização**: 20/08/2026
**Repositório**: github.com/raelmz/cinema-arcano (terceiro commit feito e pushado — `b9ec5f5`: migration inicial + downgrade Prisma + docs atualizados). **Módulo de Auth completo, prestes a receber o commit único combinado**: register, login, `/auth/me` protegida (sem restrição de papel — ver decisão nova abaixo), `JwtAuthGuard` e `RolesGuard` implementadas e testadas ponta a ponta com usuários reais do seed, `prisma/seed.ts` criado e rodado com sucesso (1 ADMIN, 2 CUSTOMERs, 1 GATE, Argon2id). `docs/PROJETO.md` já atualizado com todas as decisões pendentes do módulo (seções 4.14 a 4.19). Falta só rodar `git commit` + `git push`. Ver seção 4/5.

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
| Granularidade de commit do módulo Auth | Um commit só, ao final do módulo completo (register + login + guards + seed funcionando ponta a ponta) | **Decisão confirmada nesta sessão**: em vez de dividir em dois commits, o developer optou por completar o módulo todo (faltando só o seed) antes de commitar — mantém a ideia original de "commit = unidade funcional coerente" |
| PrismaModule como `@Global()` | Módulo do Prisma marcado global no Nest, importado uma única vez no `AppModule` | Praticamente todo módulo futuro (Auth, Catálogo, Sessão, Reserva, Ticket, Portaria) precisa do banco; evita reimportar em cada um. Exceção consciente à prática padrão do Nest de módulos explícitos — **ainda não transcrita para `docs/PROJETO.md`** |
| Geração/validação do JWT de sessão do usuário | `@nestjs/jwt` + `@nestjs/config`, secret e tempo de expiração lidos do `.env` (`JWT_SECRET`, `JWT_EXPIRES_IN`), nunca hardcoded | Padrão idiomático do Nest; separa claramente esse JWT (sessão de login) do JWT do ticket do ingresso, que tem payload e propósito diferentes |
| Nome do campo de senha no model `User` | `passwordHash` (não `password`) | Nome já existia no `schema.prisma` desde a modelagem inicial; `auth.service.ts` foi corrigido para bater com o schema real |
| Ferramenta de teste manual dos endpoints | `Invoke-RestMethod` do PowerShell, não `curl` | `curl.exe` no PowerShell reprocessa aspas de forma inconsistente e corrompe o corpo JSON; `Invoke-RestMethod` é nativo do PowerShell e lida bem com JSON sem gambiarra de escape |
| Implementação da guard de autenticação | `JwtAuthGuard` própria usando `JwtService.verifyAsync` direto, sem Passport (`passport`/`passport-jwt`) | Evita adicionar uma lib nova (Passport) só pra isso — menos superfície de coisa nova pra debugar dado o prazo de 7 dias; `@nestjs/jwt` sozinho já cobre a necessidade |
| Extração de token do request na guard | Lida manualmente do header `Authorization: Bearer <token>` dentro da própria `JwtAuthGuard`, sem strategy separada | Consistente com a decisão acima de não usar Passport; mantém a guard autocontida e simples de ler |
| Autorização por papel | `RolesGuard` + decorator `@Roles(...)` via `Reflector`, sempre usada em conjunto com `JwtAuthGuard` (`@UseGuards(JwtAuthGuard, RolesGuard)`) | Padrão idiomático do Nest para RBAC; `RolesGuard` sozinha não valida token, só lê `request['user']` populado pela `JwtAuthGuard` — por isso a ordem das guards importa |
| Validação da `RolesGuard` | Testada com os 4 usuários reais do seed (não com rota descartável), aplicando `@Roles('ADMIN')` temporariamente em `/auth/me` | ADMIN → 200 com payload; CUSTOMER e GATE → 403 Forbidden. Confirma que a guard bloqueia corretamente por papel, testando contra dados reais em vez de mock |
| Restrição de papel em `GET /auth/me` | Nenhuma — só exige `JwtAuthGuard` (estar logado), removido o `@Roles('ADMIN')` usado no teste acima | O dado retornado já vem do próprio token (`req['user']`), então cada usuário só vê os próprios dados — restringir por papel não adiciona segurança e quebraria a experiência de CUSTOMER/GATE verem o próprio perfil. `RolesGuard` fica reservada para rotas que mexem em dado de terceiros ou do sistema (ex: futuramente `POST /sessions`) |

Justificativa completa de cada uma está em `docs/PROJETO.md`, seção 4 — **todas as decisões do módulo Auth (registro por papel, granularidade de commit, PrismaModule global, guard sem Passport, validação da RolesGuard, e /auth/me sem restrição) já foram transcritas para lá nesta sessão, seções 4.14 a 4.19**.

---

## 3. Estrutura do repositório até agora

```
cinema-arcano/
├── README.md              → visão geral do produto
├── CONTRIBUTING.md         → padrão de commits
├── .gitignore
├── docs/
│   └── PROJETO.md           → decisões de produto e arquitetura, com justificativas (documento "oficial", visível ao avaliador)
├── backend/                 → API NestJS + TypeScript
│   ├── prisma/
│   │   ├── schema.prisma     → schema completo modelado e já migrado pro banco (campo de senha do User: `passwordHash`)
│   │   ├── seed.ts           → criado e rodado com sucesso (1 ADMIN, 2 CUSTOMERs, 1 GATE, Argon2id, via upsert)
│   │   └── migrations/
│   │       └── 20260820132852_init/  → primeira migration aplicada com sucesso
│   ├── src/
│   │   ├── app.module.ts      → importa ConfigModule (global), PrismaModule, AuthModule
│   │   ├── prisma/
│   │   │   ├── prisma.service.ts  → criado, testado
│   │   │   └── prisma.module.ts   → criado, marcado @Global()
│   │   └── auth/
│   │       ├── dto/
│   │       │   ├── register.dto.ts   → criado (name, email, password)
│   │       │   └── login.dto.ts      → criado (email, password)
│   │       ├── decorators/
│   │       │   └── roles.decorator.ts  → criado nesta sessão: `@Roles(...roles)` via SetMetadata
│   │       ├── guards/
│   │       │   ├── jwt-auth.guard.ts   → criado nesta sessão: valida Bearer token via JwtService, popula request['user'] — TESTADO (válido, sem token, token quebrado — todos OK)
│   │       │   └── roles.guard.ts      → criado nesta sessão: compara request['user'].role com @Roles() via Reflector — AINDA NÃO TESTADO com rota real (nenhuma rota usa @Roles() ainda)
│   │       ├── auth.service.ts   → register() e login() usando passwordHash — TESTADO E FUNCIONANDO
│   │       ├── auth.controller.ts → POST /auth/register, POST /auth/login, GET /auth/me (protegida com JwtAuthGuard) — TESTADO E FUNCIONANDO. Import de `Request` do express corrigido para `import type` (erro de isolatedModules/emitDecoratorMetadata)
│   │       └── auth.module.ts    → registra JwtModule.registerAsync (getOrThrow + as any no expiresIn); providers/exports incluem JwtAuthGuard e RolesGuard para uso em módulos futuros
│   ├── docker-compose.yml    → sobe Postgres 16 local em container (testado, funcionando)
│   ├── .env                  → local, fora do Git (DATABASE_URL local + JWT_SECRET + JWT_EXPIRES_IN)
│   └── README.md             → instruções de setup específicas do backend
└── frontend/                 → Next.js + TypeScript + Tailwind
    └── README.md             → instruções de setup específicas do frontend
```

Este arquivo (`CONTEXTO_SESSAO.md`) é de uso interno entre sessões de IA — decidir se ele entra no repositório versionado ou fica só local é uma escolha do developer, ainda em aberto.

---

## 4. Estado atual

- [x] PDF do desafio e e-mail de convocação analisados
- [x] Stack, catálogo externo, modelo de reserva e identidade do produto decididos
- [x] `docs/PROJETO.md` criado e atualizado (várias decisões recentes ainda pendentes de transcrição — ver seção 2)
- [x] `README.md`, `CONTRIBUTING.md`, `.gitignore` criados
- [x] Repositório GitHub criado, **3 commits feitos e pushados** até agora
- [x] Frontend (Next.js) e Backend (NestJS) criados e rodando
- [x] Schema completo modelado e migrado (10 tabelas) — Prisma Studio conferido
- [x] Docker Compose funcionando (Postgres 16 local)
- [x] Downgrade Prisma 7 → 6.x feito
- [x] Payload do JWT do ticket fechado
- [x] Plano dia-a-dia dos 5 dias restantes fechado
- [x] Hospedagem escolhida: Render (backend + Postgres gerenciado)
- [x] Decisão de registro por papel fechada: só `CUSTOMER` via `/auth/register`, `ADMIN`/`GATE` só via seed
- [x] `PrismaService`/`PrismaModule` criados e testados
- [x] `@nestjs/jwt`/`@nestjs/config` instalados e configurados
- [x] `AuthService`, `AuthController` (register + login) escritos, testados, funcionando
- [x] Bug `password` → `passwordHash` corrigido
- [x] Erro de tipagem `expiresIn` no `auth.module.ts` corrigido
- [x] **`JwtAuthGuard` criada** (sem Passport, usando `JwtService.verifyAsync` direto)
- [x] **`RolesGuard` + `@Roles()` decorator criados** (via `Reflector`)
- [x] **`GET /auth/me` criada e protegida com `JwtAuthGuard`**
- [x] **Erro de `import type` corrigido** no `auth.controller.ts` (Request do express)
- [x] **`JwtAuthGuard` testada e validada**: token válido retorna payload (`sub`, `role`, `iat`, `exp`) ✅; sem token → 401 "Token não fornecido" ✅; token quebrado → 401 "Token inválido ou expirado" ✅
- [x] **Decisão confirmada**: commit único do módulo Auth completo (não dividir em dois commits), esperando só o `seed.ts`
- [x] **`prisma/seed.ts` criado** — 1 ADMIN, 2 CUSTOMERs, 1 GATE, senhas hasheadas via Argon2id, usando `upsert` por email (idempotente, pode rodar de novo sem quebrar)
- [x] **Script de seed configurado no `package.json`** — bloco `"prisma": { "seed": "ts-node prisma/seed.ts" }` + script `"seed": "prisma db seed"`; rodado com sucesso via `npx prisma db seed`
- [x] **4 usuários conferidos no Prisma Studio** — papéis corretos, `passwordHash` com hash Argon2id real (não texto puro)
- [x] **`RolesGuard` testada com usuários reais do seed** — `@Roles('ADMIN')` aplicado temporariamente em `/auth/me`: ADMIN → 200, CUSTOMER → 403, GATE → 403. Guard validada ponta a ponta
- [x] **Decisão fechada**: `/auth/me` fica sem restrição de papel (só `JwtAuthGuard`) — qualquer usuário autenticado vê o próprio perfil; `@Roles('ADMIN')` do teste foi revertido
- [x] **`docs/PROJETO.md` atualizado** — decisões 4.14 a 4.19 transcritas (registro por papel, granularidade de commit, PrismaModule global, guard sem Passport, validação da RolesGuard, `/auth/me` sem restrição), seção 6 e changelog atualizados
- [ ] **Módulo Auth ainda não commitado** — próximo passo imediato: `git add . && git commit -m "feat(auth): implementa registro, login, guards JWT/RBAC e seed" && git push`
- [ ] Nenhum outro módulo de aplicação (catálogo, reserva, pagamento, ticket, portaria) iniciado

---

## 5. Próximos passos (em ordem sugerida)

1. **Commit único do módulo Auth completo** — `git add . && git commit -m "feat(auth): implementa registro, login, guards JWT/RBAC e seed" && git push` — **próximo passo imediato, tudo mais já pronto**
2. Depois do commit: seguir o plano dia-a-dia já fechado — Dia 2 é frontend de login/cadastro + início do módulo Catálogo (TMDb)
3. Ao iniciar o módulo Catálogo, lembrar que `POST /sessions` (publicar sessão de filme) é um bom candidato natural para `@Roles('ADMIN')`, já que é ação exclusiva do organizador — primeira aplicação "real" da `RolesGuard` fora de teste

---

## 6. Perfil do developer (para calibrar o nível de explicação)

Israel Menezes de Andrade — Full Stack Jr, autodidata, já usou React/Next.js, Node, Supabase, TypeScript em produção (projetos: Linkael, Painel de Cadastro de Produtos, Roteirizador PetroKar). Confortável com IA como ferramenta de apoio no dia a dia. Em sessões recentes tem pedido código pronto direto, sem explicação prévia passo a passo — parece preferência mais estável agora, não só pressa pontual. Nunca tinha trabalhado em monorepo nem usado Docker antes desta etapa — ambos aprendidos do zero. Ambiente: Windows 11, terminal principal é **PowerShell**, VS Code. Ganhou fluência nesta sessão com `Invoke-RestMethod`, incluindo o padrão de guardar resposta em variável (`$login = ...`, `$token = $login.accessToken`) para evitar problemas de token truncado na exibição de tabela do PowerShell.

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
| 20/08/2026 | Campo `passwordHash` corrigido. Erro de tipagem em `auth.module.ts` corrigido. Testes manuais via PowerShell (`Invoke-RestMethod`): register, login, e-mail duplicado (409), senha errada (401) — todos OK. |
| 20/08/2026 | `JwtAuthGuard` e `RolesGuard` criadas (sem Passport). `@Roles()` decorator criado. `GET /auth/me` criada e protegida. Erro de `import type` no controller corrigido. `JwtAuthGuard` testada com sucesso (token válido, sem token, token quebrado). Decisão confirmada: commit único do módulo Auth completo, aguardando só o `seed.ts`. Próximo passo: `prisma/seed.ts`. |
| 20/08/2026 | `prisma/seed.ts` criado (1 ADMIN, 2 CUSTOMERs, 1 GATE, Argon2id, `upsert`) e rodado com sucesso — 4 usuários conferidos no Prisma Studio. Script de seed configurado no `package.json`. `RolesGuard` testada com usuários reais via `@Roles('ADMIN')` temporário em `/auth/me` (ADMIN 200, CUSTOMER/GATE 403) e revertida em seguida. Decisão fechada: `/auth/me` sem restrição de papel. `docs/PROJETO.md` atualizado com as decisões 4.14–4.19 (registro por papel, granularidade de commit, PrismaModule global, guard sem Passport, validação RolesGuard, `/auth/me`). Módulo Auth pronto para o commit único — ainda não commitado ao fechar esta sessão. |
