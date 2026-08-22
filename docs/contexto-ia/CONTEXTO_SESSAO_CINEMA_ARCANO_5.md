# Contexto de Sessão — Cinema Arcano

> **Para a IA que está lendo isto agora**: este arquivo existe porque o desenvolvedor troca de sessão/ferramenta de IA por limitação de créditos. Ele vai colar este arquivo inteiro no início de uma nova conversa. Sua função é continuar o projeto exatamente de onde a sessão anterior parou — sem repetir perguntas já respondidas nem propor decisões já tomadas (elas estão fechadas, ver seção 2). No fim desta sessão (quando o desenvolvedor avisar que vai trocar de sessão de novo), **atualize este arquivo** — não o reescreva do zero: ajuste "Estado atual", mova itens concluídos, atualize a seção 5 (próximos passos) e adicione uma linha no changelog no fim. Mantenha o restante do arquivo estável para não confundir a leitura entre sessões.

**Última atualização**: 20/08/2026
**Repositório**: github.com/raelmz/cinema-arcano (terceiro commit feito e pushado — `b9ec5f5`: migration inicial + downgrade Prisma + docs atualizados)

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
| Deploy | Vercel (front) + hospedagem gerenciada a definir (back) + Postgres gerenciado | +1 ponto garantido no critério oficial do desafio |
| Padrão de commits | Conventional Commits simplificado (`feat`, `fix`, `docs`, `refactor`, `chore`) | Ver `CONTRIBUTING.md` no repo |
| Ambiente de banco local | Docker Compose (Postgres 16 em container) | Sem instalar Postgres direto no SO; ambiente descartável e reproduzível |
| QR do ingresso | JWT assinado (HS256), não HMAC cru | Expiração embutida (`exp`), reaproveita a mesma lib/mental model já usada na autenticação, menos código próprio pra debugar dado o prazo |
| Concorrência no assento | Constraint `UNIQUE(sessionId, seatId)` na tabela `ReservationSeat`, via transação Prisma | Garantia no nível do banco, não lock manual/otimista na aplicação |
| Arquivos de config de IA (`.claude/`, `.windsurf/`, `AGENTS.md`, etc.) | Ficam no `.gitignore`, não versionados | Evitar reforçar percepção de "AI slop" no repositório público avaliado |
| Versão do Prisma | Downgrade de 7 para **6.x** | Documentação/tutoriais mais maduros, sem `prisma.config.ts` obrigatório, menos superfície de coisa nova pra debugar dado o prazo de 7 dias |
| Payload do JWT do ticket | `{ ticketId, sessionId, seatId, iat, exp }` | Campos mínimos pra validar o ingresso na portaria; `exp` = horário da sessão + duração do filme + margem de tolerância (evita ingresso "expirar" ainda dentro da exibição) |
| Fluxo de desenvolvimento (a partir de 20/08) | Intercalado por módulo (backend do módulo → frontend consumindo → próximo módulo), não backend inteiro primeiro | Reduz risco de prazo, sempre entrega algo ponta a ponta funcional, evita descobrir problema de contrato de API só no fim |

Justificativa completa de cada uma está em `docs/PROJETO.md`, seção 4 — **schema do banco e trade-off do QR já foram transcritos para lá nesta atualização**.

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
│   ├── docker-compose.yml    → sobe Postgres 16 local em container (testado, funcionando)
│   ├── .env                  → local, fora do Git (DATABASE_URL local, corrigido nesta sessão)
│   └── README.md             → instruções de setup específicas do backend
└── frontend/                 → Next.js + TypeScript + Tailwind
    └── README.md             → instruções de setup específicas do frontend
```

Este arquivo (`CONTEXTO_SESSAO.md`) é de uso interno entre sessões de IA — decidir se ele entra no repositório versionado ou fica só local é uma escolha do developer, ainda em aberto.

---

## 4. Estado atual

- [x] PDF do desafio e e-mail de convocação analisados
- [x] Stack, catálogo externo, modelo de reserva e identidade do produto decididos
- [x] `docs/PROJETO.md` criado e atualizado com todas as decisões da seção 2, incluindo schema e trade-off do QR
- [x] `README.md`, `CONTRIBUTING.md`, `.gitignore` criados
- [x] Repositório GitHub criado e **primeiro commit feito** (docs iniciais)
- [x] Node.js, Next.js (`frontend/`) e NestJS (`backend/`) instalados e criados
- [x] Schema completo desenhado (User, Movie, Room, Seat, Session, Reservation, ReservationSeat, Ticket, ValidationLog, Payment)
- [x] Docker Desktop instalado no Windows 11 (via WSL2), testado com `hello-world`
- [x] `docker-compose.yml` criado no backend para Postgres 16 local
- [x] `.gitignore` de front e back revisados, incluindo exclusão de pastas de config de IA
- [x] READMEs de `frontend/` e `backend/` escritos
- [x] **Segundo commit feito e pushado** (`chore: adiciona estrutura inicial do monorepo (frontend Next.js e backend NestJS com Prisma e Docker Compose)`)
- [x] `docker compose up -d` executado — `cinema-arcano-db` confirmado `Up` via `docker ps`
- [x] `.env` corrigido para `postgresql://postgres:postgres@localhost:5432/cinema_arcano`
- [x] Downgrade de Prisma 7 → 6.x realizado (`prisma@6`, `@prisma/client@6`), `prisma.config.ts` removido (não necessário na v6)
- [x] **`npx prisma migrate dev --name init` rodado com sucesso** — migration `20260820132852_init` aplicada, Prisma Client v6.19.3 gerado, banco sincronizado com o schema
- [x] Terceiro commit feito e pushado (`b9ec5f5`): migration inicial aplicada, downgrade do Prisma confirmado, `docs/PROJETO.md` e `README.md` raiz atualizados
- [x] Tabelas conferidas visualmente no Prisma Studio — 10 modelos presentes, todas vazias, estrutura confere com o schema
- [x] Payload do JWT do ticket detalhado (`ticketId`, `sessionId`, `seatId`, `iat`, `exp`), com regra de expiração fechada
- [x] Fluxo de desenvolvimento decidido: intercalado por módulo (backend → frontend consumindo → próximo módulo)
- [x] Plano dia-a-dia montado para os 5 dias restantes (ver seção 5)
- [ ] Provedor de hospedagem gerenciada para backend + PostgreSQL ainda não escolhido
- [ ] Nenhuma linha de código de aplicação (controllers, services, componentes) escrita ainda

---

## 5. Próximos passos (em ordem sugerida)

**Plano dia-a-dia fechado nesta sessão** (fluxo intercalado backend↔frontend; prazo final 25/08 13:03):

- **Dia 1 — 20/08 (restante do dia)**: Backend — módulo Auth (User + JWT + Argon2id + RBAC), aplicando o payload do JWT já fechado onde fizer sentido (tokens de sessão de usuário, distinto do JWT do ticket). Deploy — escolher provedor de hospedagem gerenciada. Commit sugerido: `feat: implementa autenticacao (registro, login, JWT)`.
- **Dia 2 — 21/08**: Frontend — telas de login/cadastro consumindo a Auth API. Backend — módulo Catálogo (integração TMDb).
- **Dia 3 — 22/08**: Frontend — vitrine de filmes/sessões. Backend — Salas/Assentos/Sessões (CRUD do organizador) + início do módulo de Reserva (constraint `UNIQUE(sessionId, seatId)` + transação Prisma).
- **Dia 4 — 23/08**: Frontend — mapa de assentos interativo. Backend — Pagamento simulado + Ticket (geração do QR/JWT com o payload fechado). Frontend — tela do ingresso com QR + compartilhamento por link.
- **Dia 5 — 24/08**: Backend — módulo Portaria (validação: válido/inválido/já usado/evento errado). Frontend — tela de portaria (câmera + digitação manual). Deploy — subir backend + frontend + Postgres gerenciado, testar fluxo real ponta a ponta.
- **25/08 até 13:03**: margem de folga — ajustes finais, revisão de `docs/PROJETO.md`/READMEs, entrega.

Próximo passo imediato: escolher o provedor de hospedagem gerenciada (Railway, Render, Fly.io, Neon, etc. — nenhum escolhido ainda) e então começar o módulo de Auth no backend.

---

## 6. Perfil do developer (para calibrar o nível de explicação)

Israel Menezes de Andrade — Full Stack Jr, autodidata, já usou React/Next.js, Node, Supabase, TypeScript em produção (projetos: Linkael, Painel de Cadastro de Produtos, Roteirizador PetroKar). Confortável com IA como ferramenta de apoio no dia a dia. Prefere entender o porquê das decisões antes de aceitar sugestões — não é o tipo de developer que quer código pronto sem explicação. Nunca tinha trabalhado em monorepo (front + back em pastas separadas no mesmo repositório) nem usado Docker antes desta etapa — ambos aprendidos durante esta sessão, do zero, com explicação passo a passo. Ambiente de desenvolvimento: Windows 11 com WSL2, PowerShell.

---

## Changelog deste arquivo

| Data | O que mudou |
|---|---|
| 19/08/2026 | Criação do arquivo de handoff, ao final da primeira sessão de planejamento (decisões de stack, identidade e estrutura inicial do repo fechadas). |
| 20/08/2026 | Frontend (Next.js) e backend (NestJS) criados; schema do Prisma modelado (10 tabelas); decisão de QR (JWT) e concorrência (constraint unique) fechadas; Docker Desktop instalado e configurado via `docker-compose.yml`; `.gitignore` revisado para excluir arquivos de ferramentas de IA; READMEs de front/back escritos. Pendente: rodar a primeira migration e confirmar o segundo commit. |
| 20/08/2026 | Segundo commit confirmado e pushado. Banco subido via Docker, `.env` corrigido. Downgrade de Prisma 7 para 6.x realizado (decisão registrada). Primeira migration (`init`) aplicada com sucesso — banco sincronizado com o schema. `docs/PROJETO.md` e `README.md` raiz atualizados para refletir esse progresso. Pendente: terceiro commit, `prisma studio`, payload do JWT do ticket, plano dia-a-dia. |
| 20/08/2026 | Terceiro commit feito e pushado (`b9ec5f5`). Tabelas conferidas no Prisma Studio (10 modelos, vazias, estrutura ok). Payload do JWT do ticket fechado (`ticketId`, `sessionId`, `seatId`, `iat`, `exp`; expiração = fim da sessão + margem). Pendente: escolher hospedagem gerenciada, montar plano dia-a-dia (urgente, prazo correndo), começar código (auth primeiro). |
| 20/08/2026 | Fluxo de desenvolvimento decidido: intercalado por módulo (backend → frontend consumindo → próximo módulo), não backend inteiro primeiro. Plano dia-a-dia fechado para os 5 dias restantes (Auth → Catálogo → Salas/Assentos/Sessões/Reserva → Pagamento/Ticket → Portaria/Deploy, com 25/08 de folga). Pendente: escolher hospedagem gerenciada, começar módulo de Auth. |
