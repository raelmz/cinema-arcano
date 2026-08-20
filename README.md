# 🎬 Cinema Arcano

> Plataforma de eventos e ingressos com identidade própria — desenvolvida como projeto técnico para o processo seletivo Elite Dev (Verzel).

**Status**: 🚧 Em desenvolvimento — projeto iniciado em 19/08/2026, prazo de entrega em 25/08/2026. Monorepo estruturado, banco local (PostgreSQL via Docker) rodando e schema já migrado. Código de aplicação (rotas, autenticação, telas) ainda não iniciado.

## Sobre

O Cinema Arcano é uma sala de cinema fictícia com identidade própria: cada ingresso comprado é tratado como um pequeno ritual de entrada no mundo do filme. O sistema permite que um organizador publique sessões a partir do catálogo do TMDb, que clientes reservem assentos, paguem (de forma simulada) e recebam ingressos com QR code, e que a portaria valide esses ingressos na entrada.

Documentação completa do processo de decisão — requisitos, arquitetura, trade-offs considerados — está em [`docs/PROJETO.md`](./docs/PROJETO.md).

## Stack

Next.js · NestJS · Prisma · PostgreSQL · TypeScript

Detalhes da arquitetura e justificativas de cada escolha em [`docs/PROJETO.md`](./docs/PROJETO.md#4-decisões-técnicas-tomadas-até-agora).

## Estrutura do repositório

```
cinema-arcano/
├── docs/PROJETO.md   → decisões de produto e arquitetura, com justificativas
├── backend/           → API NestJS + Prisma + PostgreSQL
└── frontend/          → Next.js + TypeScript
```

## Como rodar

Instruções completas (setup de front, back e variáveis de ambiente) estão nos READMEs de cada pacote: [`backend/README.md`](./backend/README.md) e [`frontend/README.md`](./frontend/README.md).

Resumo do backend (banco de dados):
```bash
cd backend
docker compose up -d        # sobe PostgreSQL 16 local
npx prisma migrate dev       # aplica o schema ao banco
```

_Instruções de setup completas de ponta a ponta (incluindo variáveis de ambiente e seed de dados) serão consolidadas aqui conforme o projeto avança._

## Uso de IA neste projeto

Este projeto foi planejado com apoio de IA para organização de ideias, revisão de trade-offs e documentação (ver [`docs/PROJETO.md`](./docs/PROJETO.md)). Detalhamento completo de onde e como IA foi usada — e o que foi feito sem ela — será adicionado ao final do desenvolvimento.