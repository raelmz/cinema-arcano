# Cinema Arcano — Backend

API do Cinema Arcano, construída com **NestJS + TypeScript**, banco **PostgreSQL** via **Prisma**.

Para a visão geral do produto, decisões de arquitetura e justificativas, ver o [`README.md`](../README.md) e o [`docs/PROJETO.md`](../docs/PROJETO.md) na raiz do repositório.

## Stack

- NestJS + TypeScript
- PostgreSQL + Prisma ORM
- Autenticação própria (JWT + Argon2id + RBAC)

## Rodando localmente

1. Subir o banco de dados (requer [Docker](https://www.docker.com/products/docker-desktop/) instalado):

```bash
docker compose up -d
```

2. Copiar `.env.example` para `.env` e ajustar se necessário (por padrão já aponta para o banco do `docker-compose.yml`).

3. Instalar dependências e rodar as migrations:

```bash
npm install
npx prisma migrate dev
```

4. Rodar a API:

```bash
npm run start:dev
```

API disponível em `http://localhost:3000` (ou porta configurada).

## Banco de dados

O schema completo está em `prisma/schema.prisma`. Para inspecionar os dados visualmente:

```bash
npx prisma studio
```