# Contexto de Sessão — Cinema Arcano

> **Para a IA que está lendo isto agora**: este arquivo existe porque o desenvolvedor troca de sessão/ferramenta de IA por limitação de créditos. Ele vai colar este arquivo inteiro no início de uma nova conversa. Sua função é continuar o projeto exatamente de onde a sessão anterior parou — sem repetir perguntas já respondidas nem propor decisões já tomadas (elas estão fechadas, ver seção 2). No fim desta sessão (quando o desenvolvedor avisar que vai trocar de sessão de novo), **atualize este arquivo** — não o reescreva do zero: ajuste "Estado atual", mova itens concluídos, atualize a seção 5 (próximos passos) e adicione uma linha no changelog no fim. Mantenha o restante do arquivo estável para não confundir a leitura entre sessões.

**Última atualização**: 20/08/2026
**Repositório**: github.com/raelmz/cinema-arcano (terceiro commit feito e pushado — `b9ec5f5`: migration inicial + downgrade Prisma + docs atualizados). **Módulo de Auth funcionando ponta a ponta (register + login testados manualmente com sucesso), mas ainda sem commit** — decisão pendente sobre se completa guards+seed antes de commitar ou commita agora em duas partes. Ver seção 4/5.

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
| Granularidade de commit do módulo Auth | Um commit só, ao final do módulo funcionando ponta a ponta (register + login retornando JWT), não um commit por arquivo | Commit deve representar unidade coerente/funcional de trabalho, não apenas "arquivos que existem". **Reaberta para discussão nesta sessão**: register+login já testados e funcionando; developer está decidindo se espera guards+seed pra um único commit, ou faz dois commits dentro do mesmo módulo — ver seção 5 |
| PrismaModule como `@Global()` | Módulo do Prisma marcado global no Nest, importado uma única vez no `AppModule` | Praticamente todo módulo futuro (Auth, Catálogo, Sessão, Reserva, Ticket, Portaria) precisa do banco; evita reimportar em cada um. Exceção consciente à prática padrão do Nest de módulos explícitos — **ainda não transcrita para `docs/PROJETO.md`** |
| Geração/validação do JWT de sessão do usuário | `@nestjs/jwt` + `@nestjs/config`, secret e tempo de expiração lidos do `.env` (`JWT_SECRET`, `JWT_EXPIRES_IN`), nunca hardcoded | Padrão idiomático do Nest; separa claramente esse JWT (sessão de login) do JWT do ticket do ingresso, que tem payload e propósito diferentes |
| Nome do campo de senha no model `User` | `passwordHash` (não `password`) | Nome já existia no `schema.prisma` desde a modelagem inicial; `auth.service.ts` foi corrigido nesta sessão pra bater com o schema real, não o contrário |
| Ferramenta de teste manual dos endpoints | `Invoke-RestMethod` do PowerShell, não `curl` | `curl.exe` no PowerShell reprocessa aspas de forma inconsistente e corrompe o corpo JSON; `Invoke-RestMethod` é nativo do PowerShell e lida bem com JSON sem gambiarra de escape |

Justificativa completa de cada uma está em `docs/PROJETO.md`, seção 4 — **as decisões de registro por papel, granularidade de commit do módulo Auth, e PrismaModule global ainda não foram transcritas para lá, fazer isso ao fechar o módulo Auth**.

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
│   │   └── migrations/
│   │       └── 20260820132852_init/  → primeira migration aplicada com sucesso
│   ├── src/
│   │   ├── app.module.ts      → importa ConfigModule (global), PrismaModule, AuthModule
│   │   ├── prisma/
│   │   │   ├── prisma.service.ts  → criado, testado (app sobe limpo com ele)
│   │   │   └── prisma.module.ts   → criado, marcado @Global()
│   │   └── auth/
│   │       ├── dto/
│   │       │   ├── register.dto.ts   → criado (name, email, password — sem campo role, de propósito)
│   │       │   └── login.dto.ts      → criado (email, password)
│   │       ├── auth.service.ts   → CORRIGIDO nesta sessão para usar `passwordHash` (não `password`) em create/verify — TESTADO E FUNCIONANDO
│   │       ├── auth.controller.ts → POST /auth/register, POST /auth/login — TESTADO E FUNCIONANDO
│   │       └── auth.module.ts    → registra JwtModule.registerAsync; CORRIGIDO nesta sessão (getOrThrow + `as any` no expiresIn para contornar incompatibilidade de tipos entre string do .env e o tipo StringValue esperado pela lib)
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
- [x] `docs/PROJETO.md` criado e atualizado (schema, QR, concorrência já transcritos; registro por papel, granularidade de commit e PrismaModule global ainda não)
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
- [x] `class-validator`, `class-transformer`, `argon2` instalados no backend
- [x] `backend/src/auth/dto/register.dto.ts` e `login.dto.ts` criados
- [x] `PrismaService` e `PrismaModule` criados (`@Global()`), registrados no `AppModule`, testado subindo limpo
- [x] `@nestjs/jwt` e `@nestjs/config` instalados
- [x] `JWT_SECRET` e `JWT_EXPIRES_IN` adicionados ao `.env`
- [x] `ConfigModule.forRoot({ isGlobal: true })` registrado no `AppModule`
- [x] `AuthModule`, `AuthService`, `AuthController` escritos
- [x] **Erro de tipagem no `auth.module.ts` corrigido** (`getOrThrow` + `as any` no `expiresIn`, incompatibilidade entre `string` do `.env` e tipo `StringValue` da lib `@nestjs/jwt`)
- [x] **Bug de campo corrigido**: `auth.service.ts` usava `password`, schema real tem `passwordHash` — ajustado em `register()` e `login()`
- [x] **`npm run start:dev` confirmado subindo limpo** com `AuthModule` incluído
- [x] **`POST /auth/register` testado manualmente e funcionando** — retorna `accessToken` + dados do usuário
- [x] **`POST /auth/login` testado manualmente e funcionando** — retorna `accessToken` válido
- [x] **Caso de erro testado: e-mail duplicado** → 409 `E-mail já cadastrado` ✅
- [x] **Caso de erro testado: senha errada** → 401 `Credenciais inválidas` ✅
- [x] **Método de teste manual definido**: `Invoke-RestMethod` do PowerShell (não `curl.exe`, que corrompe aspas de JSON no PowerShell)
- [ ] `GET /auth/me` mencionado no plano original mas **não implementado** — decidir se entra nesta rodada do módulo Auth ou fica para depois das guards
- [ ] `JwtAuthGuard`, `RolesGuard`, decorator `@Roles()` — não implementados ainda
- [ ] `prisma/seed.ts` (cria ADMIN e GATE diretamente no banco) — não criado ainda
- [ ] **Módulo Auth não commitado ainda** — register+login já funcionam ponta a ponta; **decisão pendente no início da próxima sessão**: completar guards+seed antes de commitar (um commit só), ou commitar agora register+login e fazer um segundo commit depois para guards+seed
- [ ] Nenhum outro módulo de aplicação (catálogo, reserva, pagamento, ticket, portaria) iniciado

---

## 5. Próximos passos (em ordem sugerida)

**Primeira decisão a tomar na próxima sessão** (pergunta feita ao developer no fim desta sessão, resposta ainda não recebida quando este arquivo foi salvo):
- (a) Seguir agora para guards + seed, e só então fazer o commit único do módulo Auth completo; ou
- (b) Commitar já o que está funcionando (register + login) e fazer guards + seed depois, como trabalho adicional dentro do mesmo módulo (possivelmente um segundo commit)

Depois dessa decisão, seguir com:

1. **`JwtAuthGuard`** (valida token em rotas protegidas) e **`RolesGuard`** + `@Roles()` (restringe por papel) — necessários antes de qualquer módulo futuro que precise restringir por ADMIN/GATE
2. Decidir se `GET /auth/me` entra agora (usa a guard recém-criada) ou fica pra depois
3. **`prisma/seed.ts`** — cria 1 ADMIN, 2 CUSTOMERs, 1 GATE (requisito não-funcional do desafio, seção 5 do PROJETO.md)
4. Commit(s) do módulo Auth conforme decisão do item acima — mensagem sugerida: `feat(auth): implementa registro e login com JWT`
5. Atualizar `docs/PROJETO.md` com as decisões de registro por papel, granularidade de commit e PrismaModule global (ainda pendentes de transcrição)
6. Depois disso: seguir o plano dia-a-dia já fechado — Dia 2 é frontend de login/cadastro + início do módulo Catálogo (TMDb)

---

## 6. Perfil do developer (para calibrar o nível de explicação)

Israel Menezes de Andrade — Full Stack Jr, autodidata, já usou React/Next.js, Node, Supabase, TypeScript em produção (projetos: Linkael, Painel de Cadastro de Produtos, Roteirizador PetroKar). Confortável com IA como ferramenta de apoio no dia a dia. Prefere entender o porquê das decisões antes de aceitar sugestões, mas em sessões recentes pediu para receber código pronto direto, sem explicação prévia passo a passo — calibrar por sinais futuros se isso é preferência pontual (pressa) ou mudança de estilo permanente. Nunca tinha trabalhado em monorepo nem usado Docker antes desta etapa — ambos aprendidos do zero. Ambiente: Windows 11, terminal principal é **PowerShell** (não WSL2 nem cmd.exe puro — confirmado nesta sessão através dos testes de endpoint), VS Code. Iniciante em testar APIs manualmente via terminal (precisou de orientação passo a passo sobre `Invoke-RestMethod` vs. `curl` no PowerShell).

---

## Changelog deste arquivo

| Data | O que mudou |
|---|---|
| 19/08/2026 | Criação do arquivo de handoff, ao final da primeira sessão de planejamento. |
| 20/08/2026 | Frontend e backend criados; schema modelado; Docker configurado; READMEs escritos. |
| 20/08/2026 | Segundo commit confirmado. Banco subido via Docker. Downgrade Prisma 7→6. Primeira migration aplicada. |
| 20/08/2026 | Terceiro commit (`b9ec5f5`). Prisma Studio conferido. Payload JWT do ticket fechado. |
| 20/08/2026 | Fluxo de desenvolvimento intercalado decidido. Plano dia-a-dia fechado (5 dias). |
| 20/08/2026 | Hospedagem escolhida (Render). Início do módulo Auth: decisão de registro por papel fechada. DTOs de register e login criados. |
| 20/08/2026 | `PrismaService`/`PrismaModule` criados e testados. `@nestjs/jwt`/`@nestjs/config` instalados. `AuthModule`, `AuthService`, `AuthController` escritos — ainda não testados. Pendência aberta: nome do campo de senha no schema. |
| 20/08/2026 | Campo de senha confirmado como `passwordHash` — `auth.service.ts` corrigido. Erro de tipagem no `auth.module.ts` corrigido (`getOrThrow` + `as any`). Testes manuais feitos via PowerShell (`Invoke-RestMethod`, não `curl`): register, login, e-mail duplicado (409) e senha errada (401) — todos passaram. Módulo Auth funcional ponta a ponta, ainda sem commit. Decisão pendente: commitar já ou esperar guards+seed. |
