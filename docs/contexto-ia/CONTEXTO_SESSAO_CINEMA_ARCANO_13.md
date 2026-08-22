# Contexto de Sessão — Cinema Arcano

> **Para a IA que está lendo isto agora**: este arquivo existe porque o desenvolvedor troca de sessão/ferramenta de IA por limitação de créditos. Ele vai colar este arquivo inteiro no início de uma nova conversa. Sua função é continuar o projeto exatamente de onde a sessão anterior parou — sem repetir perguntas já respondidas nem propor decisões já tomadas (elas estão fechadas, ver seção 2). No fim desta sessão (quando o desenvolvedor avisar que vai trocar de sessão de novo), **atualize este arquivo** — não o reescreva do zero: ajuste "Estado atual", mova itens concluídos, atualize a seção 5 (próximos passos) e adicione uma linha no changelog no fim. Mantenha o restante do arquivo estável para não confundir a leitura entre sessões.

**Última atualização**: 20/08/2026
**Repositório**: github.com/raelmz/cinema-arcano (Módulo de Auth — backend e frontend — **commitados e concluídos**, mensagem do commit de frontend: `feat(auth): implementação das telas de login e cadastro no front`). O frontend de Auth foi feito com Gemini Pro em sessão anterior, e **revisado e corrigido nesta sessão pelo Claude** antes do commit (ver seção 2 e changelog). Próximo passo real: estratégia de pós-login (redirecionamento + persistência de sessão), depois iniciar o Módulo Catálogo. Ver seção 4/5.

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
├── backend/                 → API NestJS + PostgreSQL / Prisma (Módulo Auth completo e commitado)
└── frontend/                 → Next.js + TypeScript + Tailwind v4
    ├── package.json
    ├── app/
    │   ├── globals.css        → Tema Neo-brutalista e paleta Arcano definidos no Tailwind v4
    │   ├── services/
    │   │   └── api.ts         → Centraliza fetch() para /auth/login e /auth/register
    │   ├── login/
    │   │   └── page.tsx       → UI de Login c/ Zod + react-hook-form + consumo da API
    │   └── register/
    │       └── page.tsx       → UI de Cadastro c/ Zod + react-hook-form + consumo da API
    └── README.md
```

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
- [ ] Transcrever para `docs/PROJETO.md` as decisões de frontend (roteamento, formulários, tema visual, escopo "esqueci a senha", correções da revisão desta sessão)
- [ ] Limpeza opcional: remover boilerplate morto do `globals.css` (`:root`, `@theme inline`, `@media prefers-color-scheme`)
- [ ] Definir estratégia de pós-login: redirecionamento e persistência do estado de autenticação (Context, Zustand, ou validação simples de token salvo)
- [ ] Módulo Catálogo (listagem TMDb / página Home) não iniciado
- [ ] Restante do escopo (Reserva, Pagamento, Ticket/QR, Portaria) pendente

---

## 5. Próximos passos (em ordem sugerida)

1. **Definir e implementar a estratégia de pós-login** (redirecionamento após login/cadastro + como as demais páginas saberão que o usuário está autenticado — Context API, Zustand, ou checagem direta do token). **Este é o próximo passo imediato**, maior buraco funcional restante do módulo Auth.
2. Transcrever para `docs/PROJETO.md` as decisões de frontend (roteamento, formulários, tema visual, escopo "esqueci a senha", e as correções da revisão: tratamento de erro em `api.ts`, acessibilidade dos labels, remoção do botão morto).
3. (Opcional) Limpar boilerplate morto do `globals.css`.
4. Iniciar o **Módulo Catálogo**: página Home no Next.js listando filmes via TMDb + módulo correspondente no NestJS.
5. Lembrar que `POST /sessions` (publicar sessão de filme) é candidato natural para `@Roles('ADMIN')` — primeira aplicação "real" da `RolesGuard` fora de teste.

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
