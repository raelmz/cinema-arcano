# Contexto de Sessão — Cinema Arcano

> **Para a IA que está lendo isto agora**: este arquivo existe porque o desenvolvedor troca de sessão/ferramenta de IA por limitação de créditos. Ele vai colar este arquivo inteiro no início de uma nova conversa. Sua função é continuar o projeto exatamente de onde a sessão anterior parou — sem repetir perguntas já respondidas nem propor decisões já tomadas (elas estão fechadas, ver seção 2). No fim desta sessão (quando o desenvolvedor avisar que vai trocar de sessão de novo), **atualize este arquivo** — não o reescreva do zero: ajuste "Estado atual", mova itens concluídos, atualize a seção 5 (próximos passos) e adicione uma linha no changelog no fim. Mantenha o restante do arquivo estável para não confundir a leitura entre sessões.

**Última atualização**: 19/08/2026
**Repositório**: github.com/raelmz/cinema-arcano (criado, ainda sem primeiro commit até o momento desta atualização)

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
| Banco | PostgreSQL + Prisma | Relacional, forte em integridade/concorrência (assento não pode duplicar venda) |
| Autenticação | JWT + Argon2id + RBAC, implementada na própria API | Nada de BaaS/Auth de terceiro — o PDF quer ver a camada de API projetada pelo candidato |
| Infra evitada de propósito | Sem microserviços, Redis, filas, Kubernetes | Desproporcional ao escopo do desafio |
| Deploy | Vercel (front) + hospedagem gerenciada a definir (back) + Postgres gerenciado | +1 ponto garantido no critério oficial do desafio |
| Padrão de commits | Conventional Commits simplificado (`feat`, `fix`, `docs`, `refactor`, `chore`) | Ver `CONTRIBUTING.md` no repo |

Justificativa completa de cada uma está em `docs/PROJETO.md`, seção 4.

---

## 3. Estrutura do repositório até agora

```
cinema-arcano/
├── README.md            → visão geral do produto
├── CONTRIBUTING.md       → padrão de commits
├── .gitignore
└── docs/
    └── PROJETO.md         → decisões de produto e arquitetura, com justificativas (documento "oficial", visível ao avaliador)
```

Este arquivo (`CONTEXTO_SESSAO.md`) é de uso interno entre sessões de IA — decidir se ele entra no repositório versionado ou fica só local é uma escolha do developer, ainda em aberto.

---

## 4. Estado atual

- [x] PDF do desafio e e-mail de convocação analisados
- [x] Stack, catálogo externo, modelo de reserva e identidade do produto decididos
- [x] `docs/PROJETO.md` criado e atualizado com todas as decisões acima
- [x] `README.md`, `CONTRIBUTING.md`, `.gitignore` criados
- [x] Repositório GitHub criado (público, vazio, sem README/gitignore automático)
- [ ] Primeiro commit ainda não confirmado como feito — checar com o developer antes de assumir
- [ ] Nenhuma linha de código de aplicação escrita ainda

---

## 5. Próximos passos (em ordem sugerida)

1. Confirmar que o primeiro commit (docs iniciais) foi feito e pushado
2. Desenhar o schema do banco (tabelas: usuários/papéis, eventos, sessões de filme, assentos, reservas, ingressos) — pendente, nenhuma modelagem feita ainda
3. Definir estratégia técnica do QR não forjável (ex: JWT assinado vs HMAC com segredo do servidor)
4. Definir estratégia de concorrência no assento (transação SQL vs lock otimista)
5. Escolher provedor de hospedagem gerenciada para backend + PostgreSQL (Railway, Render, Fly.io, Neon, etc. — nenhum escolhido ainda)
6. Montar plano dia-a-dia para os 7 dias corridos (ainda não feito — importante fazer logo, prazo já está correndo)
7. Definir estrutura de pastas do monorepo (front + back) e só então começar o código

---

## 6. Perfil do developer (para calibrar o nível de explicação)

Israel Menezes de Andrade — Full Stack Jr, autodidata, já usou React/Next.js, Node, Supabase, TypeScript em produção (projetos: Linkael, Painel de Cadastro de Produtos, Roteirizador PetroKar). Confortável com IA como ferramenta de apoio no dia a dia. Prefere entender o porquê das decisões antes de aceitar sugestões — não é o tipo de developer que quer código pronto sem explicação.

---

## Changelog deste arquivo

| Data | O que mudou |
|---|---|
| 19/08/2026 | Criação do arquivo de handoff, ao final da primeira sessão de planejamento (decisões de stack, identidade e estrutura inicial do repo fechadas). |
