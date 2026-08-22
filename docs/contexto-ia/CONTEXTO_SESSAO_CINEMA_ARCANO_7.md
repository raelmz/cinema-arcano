# Contexto de Sessão — Cinema Arcano

> **Para a IA que está lendo isto agora**: este arquivo existe porque o desenvolvedor troca de sessão/ferramenta de IA por limitação de créditos. Ele vai colar este arquivo inteiro no início de uma nova conversa. Sua função é continuar o projeto exatamente de onde a sessão anterior parou — sem repetir perguntas já respondidas nem propor decisões já tomadas (elas estão fechadas, ver seção 2). No fim desta sessão (quando o desenvolvedor avisar que vai trocar de sessão de novo), **atualize este arquivo** — não o reescreva do zero: ajuste "Estado atual", mova itens concluídos, atualize a seção 5 (próximos passos) e adicione uma linha no changelog no fim. Mantenha o restante do arquivo estável para não confundir a leitura entre sessões.

**Última atualização**: 20/08/2026
**Repositório**: github.com/raelmz/cinema-arcano (terceiro commit feito e pushado — `b9ec5f5`: migration inicial + downgrade Prisma + docs atualizados). **Módulo de Auth em andamento, ainda sem commit** — ver seção 4/5.

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
| Granularidade de commit do módulo Auth | Um commit só, ao final do módulo funcionando ponta a ponta (register + login retornando JWT), não um commit por arquivo | Commit deve representar unidade coerente/funcional de trabalho, não apenas "arquivos que existem" |

Justificativa completa de cada uma está em `docs/PROJETO.md`, seção 4 — **a decisão de registro por papel e a de granularidade de commit ainda não foram transcritas para lá, fazer isso ao fechar o módulo Auth**.

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
│   │   ├── schema.prisma     → schema completo modelado e já migrado pro banco
│   │   └── migrations/
│   │       └── 20260820132852_init/  → primeira migration aplicada com sucesso
│   ├── src/
│   │   └── auth/
│   │       └── dto/
│   │           ├── register.dto.ts   → criado (name, email, password — sem campo role, de propósito)
│   │           └── login.dto.ts      → criado (email, password)
│   ├── docker-compose.yml    → sobe Postgres 16 local em container (testado, funcionando)
│   ├── .env                  → local, fora do Git (DATABASE_URL local)
│   └── README.md             → instruções de setup específicas do backend
└── frontend/                 → Next.js + TypeScript + Tailwind
    └── README.md             → instruções de setup específicas do frontend
```

Este arquivo (`CONTEXTO_SESSAO.md`) é de uso interno entre sessões de IA — decidir se ele entra no repositório versionado ou fica só local é uma escolha do developer, ainda em aberto.

---

## 4. Estado atual

- [x] PDF do desafio e e-mail de convocação analisados
- [x] Stack, catálogo externo, modelo de reserva e identidade do produto decididos
- [x] `docs/PROJETO.md` criado e atualizado (schema, QR, concorrência já transcritos; registro por papel e granularidade de commit ainda não)
- [x] `README.md`, `CONTRIBUTING.md`, `.gitignore` criados
- [x] Repositório GitHub criado, **3 commits feitos e pushados** até agora
- [x] Frontend (Next.js) e Backend (NestJS) criados e rodando
- [x] Schema completo modelado e migrado (10 tabelas) — Prisma Studio conferido
- [x] Docker Compose funcionando (Postgres 16 local)
- [x] Downgrade Prisma 7 → 6.x feito
- [x] Payload do JWT do ticket fechado
- [x] Plano dia-a-dia dos 5 dias restantes fechado (ver `docs/PROJETO.md` ou changelog anterior deste arquivo)
- [x] Hospedagem escolhida: Render (backend + Postgres gerenciado)
- [x] **Decisão de registro por papel fechada**: só `CUSTOMER` via `/auth/register`, `ADMIN`/`GATE` só via seed
- [x] **Decisão de fluxo de trabalho tomada nesta sessão**: passo a passo, com contexto atualizado a cada marco relevante (não a cada micro-passo), para resiliência entre sessões de IA
- [x] `class-validator`, `class-transformer` e `argon2` instalados no backend (`npm install` confirmado)
- [x] `backend/src/auth/dto/register.dto.ts` criado (name, email, password — validado com class-validator)
- [x] `backend/src/auth/dto/login.dto.ts` criado (email, password)
- [ ] `PrismaService` (integração do Prisma ao ciclo de vida do Nest) — próximo passo imediato
- [ ] Hash de senha com Argon2id no `AuthService` — não implementado ainda
- [ ] `AuthModule`, `AuthController`, `AuthService` — não criados ainda
- [ ] `JwtAuthGuard`, `RolesGuard`, decorator `@Roles()` — não implementados ainda
- [ ] `prisma/seed.ts` (cria ADMIN e GATE diretamente no banco) — não criado ainda
- [ ] **Módulo Auth não commitado ainda** — commitar só quando register + login estiverem funcionando ponta a ponta (decisão desta sessão)
- [ ] Nenhum outro módulo de aplicação (catálogo, reserva, pagamento, ticket, portaria) iniciado

---

## 5. Próximos passos (em ordem sugerida)

Dentro do módulo Auth (Dia 1 do plano dia-a-dia):

1. **`PrismaService`** — service que estende `PrismaClient` e se conecta/desconecta no ciclo de vida do Nest (`onModuleInit`/`onModuleDestroy`); vira injetável em qualquer módulo que precise do banco
2. **`AuthService`** — lógica de registro (hash da senha com Argon2id, força `role: CUSTOMER`, salva no banco) e login (busca usuário, verifica senha com `argon2.verify`, gera JWT)
3. **`AuthController`** — expõe `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
4. **`AuthModule`** — amarra tudo, importado no `AppModule`
5. **`JwtAuthGuard`** (valida token em rotas protegidas) e **`RolesGuard`** + `@Roles()` (restringe por papel) — necessários antes de qualquer módulo futuro que precise restringir por ADMIN/GATE
6. **`prisma/seed.ts`** — cria 1 ADMIN, 2 CUSTOMERs, 1 GATE (requisito não-funcional do desafio, seção 5 do PROJETO.md)
7. Testar manualmente o fluxo completo (register → login → rota protegida com token) antes de commitar
8. Commit único: `feat(auth): implementa registro e login com JWT`
9. Atualizar `docs/PROJETO.md` com a decisão de registro por papel e de granularidade de commit
10. Depois disso: seguir o plano dia-a-dia já fechado — Dia 2 é frontend de login/cadastro + início do módulo Catálogo (TMDb)

---

## 6. Perfil do developer (para calibrar o nível de explicação)

Israel Menezes de Andrade — Full Stack Jr, autodidata, já usou React/Next.js, Node, Supabase, TypeScript em produção (projetos: Linkael, Painel de Cadastro de Produtos, Roteirizador PetroKar). Confortável com IA como ferramenta de apoio no dia a dia. Prefere entender o porquê das decisões antes de aceitar sugestões — não é o tipo de developer que quer código pronto sem explicação. Nunca tinha trabalhado em monorepo nem usado Docker antes desta etapa — ambos aprendidos do zero, com explicação passo a passo. Ambiente: Windows 11 com WSL2, PowerShell, VS Code. Nesta sessão, pediu para seguir a implementação passo a passo (não tudo de uma vez), com atualização frequente deste arquivo de contexto para resiliência entre sessões.

---

## Changelog deste arquivo

| Data | O que mudou |
|---|---|
| 19/08/2026 | Criação do arquivo de handoff, ao final da primeira sessão de planejamento. |
| 20/08/2026 | Frontend e backend criados; schema modelado; Docker configurado; READMEs escritos. |
| 20/08/2026 | Segundo commit confirmado. Banco subido via Docker. Downgrade Prisma 7→6. Primeira migration aplicada. |
| 20/08/2026 | Terceiro commit (`b9ec5f5`). Prisma Studio conferido. Payload JWT do ticket fechado. |
| 20/08/2026 | Fluxo de desenvolvimento intercalado decidido. Plano dia-a-dia fechado (5 dias). |
| 20/08/2026 | Hospedagem escolhida (Render). Início do módulo Auth: decisão de registro por papel (só CUSTOMER livre) fechada. `class-validator`/`class-transformer`/`argon2` instalados. DTOs de register e login criados. Decisão de commitar o módulo Auth inteiro de uma vez (não por arquivo) tomada. Próximo passo: `PrismaService`. |
