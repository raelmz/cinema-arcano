<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:1a161d,50:7b1fa2,100:ff8f00&height=160&text=Cinema%20Arcano&fontSize=46&fontColor=ffd54f&animation=fadeIn&fontAlignY=42" width="100%" />

<img src="./frontend/public/logo.png" width="140" alt="Logo Cinema Arcano" />

### Plataforma de eventos e ingressos com identidade própria

*Cada ingresso é um pequeno ritual de entrada no mundo do filme.*

<br />

[![Status](https://img.shields.io/badge/Status-Deploy_realizado-ffd54f?style=for-the-badge&labelColor=1a161d)](#status)
[![Entrega](https://img.shields.io/badge/Entregue-22%2F08%2F2026-7b1fa2?style=for-the-badge&labelColor=1a161d)](#status)
[![Processo](https://img.shields.io/badge/Elite_Dev-Verzel-ff8f00?style=for-the-badge&labelColor=1a161d)](#sobre)

<br />

<a href="https://cinema-arcano.vercel.app"><b>🎬 Ver projeto em produção</b></a>
&nbsp;•&nbsp;
<a href="./docs/PROJETO.md"><b>📖 Documentação de decisões</b></a>
&nbsp;•&nbsp;
<a href="#como-rodar"><b>⚙️ Rodar localmente</b></a>

</div>

<img src="https://capsule-render.vercel.app/api?type=rect&color=0:1a161d,50:7b1fa2,100:ff8f00&height=4&section=header" width="100%" />

## Índice

- [Sobre](#sobre)
- [Status](#status)
- [Links de produção](#links-de-produção)
- [Stack](#stack)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Como rodar](#como-rodar)
- [Contas de teste](#contas-de-teste)
- [Roteiro rápido de teste em produção](#roteiro-rápido-de-teste-em-produção)
- [Uso de IA neste projeto](#uso-de-ia-neste-projeto)

<a id="sobre"></a>
## 🎭 Sobre

Projeto técnico desenvolvido para a etapa 3/6 do processo seletivo **Elite Dev** (Verzel — Desenvolvedor Full Stack Jr).

O **Cinema Arcano** é uma sala de cinema fictícia com identidade própria: cada ingresso comprado é tratado como um pequeno ritual de entrada no mundo do filme, não como um checkout qualquer. O sistema permite que um organizador publique sessões a partir do catálogo do TMDb, que clientes reservem assentos num mapa, paguem (de forma simulada) e recebam ingressos com QR code, e que a portaria valide esses ingressos na entrada — com retorno claro de válido, inválido, já utilizado ou evento errado.

> 📄 Documentação completa do processo de decisão — requisitos, arquitetura, trade-offs considerados e justificados um a um — está em [`docs/PROJETO.md`](./docs/PROJETO.md).

<a id="status"></a>
## 🚀 Status

**Projeto entregue** — desenvolvido de 19/08/2026 a 22/08/2026, 3 dias antes do prazo final (25/08/2026).

<table>
<tr>
<td valign="top" width="50%">

**Infraestrutura & Auth**
- ✅ Monorepo estruturado (`frontend/` + `backend/`)
- ✅ PostgreSQL 16 via Docker Compose, schema migrado (10 tabelas)
- ✅ Módulo de autenticação completo: registro, login, `/auth/me`
- ✅ Guards JWT + RBAC (`JwtAuthGuard`, `RolesGuard`)
- ✅ Seed de usuários (1 organizador, 2 clientes, 1 portaria)
- ✅ Deploy (Vercel + Render)

**Domínio do negócio**
- ✅ Catálogo de filmes (integração TMDb)
- ✅ Backend de salas, assentos e sessões
- ✅ Backend de reserva + pagamento simulado
- ✅ Backend de ingresso com QR code assinado (JWT)
- ✅ Validação de ingresso na portaria

</td>
<td valign="top" width="50%">

**Frontend**
- ✅ Base de componentes reutilizáveis
- ✅ Tela do organizador para criar/gerenciar sessões
- ✅ Mapa de assentos + reserva
- ✅ Checkout com cartão/PIX, aprovação/recusa e ticket com QR
- ✅ Validação por QR com câmera e fallback manual copiável
- ✅ "Meus ingressos" / "Minhas reservas" para clientes
- ✅ Páginas privadas com bloqueio visual por papel

**Polimento**
- ✅ Página 404 personalizada e estados globais de loading/erro
- ✅ Revisão de responsividade, acessibilidade e estados visuais
- ✅ Home premium, trailers, filtros e páginas institucionais

</td>
</tr>
</table>

<a id="links-de-produção"></a>
## 🔗 Links de produção

| Ambiente | URL |
|---|---|
| Frontend | [cinema-arcano.vercel.app](https://cinema-arcano.vercel.app) |
| Backend | [cinema-arcano-api.onrender.com](https://cinema-arcano-api.onrender.com) |

> ⚠️ O backend está no free tier do Render. A primeira requisição após um período de inatividade pode demorar por causa do cold start; a Home exibe um aviso temático quando isso acontece.

Plano dia-a-dia detalhado em [`docs/PROJETO.md`](./docs/PROJETO.md#413-fluxo-de-desenvolvimento-e-plano-dia-a-dia).

<img src="https://capsule-render.vercel.app/api?type=rect&color=0:1a161d,50:7b1fa2,100:ff8f00&height=4&section=header" width="100%" />

<a id="stack"></a>
## 🛠️ Stack

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-1a161d?style=for-the-badge&logo=next.js&logoColor=ffd54f)
![TypeScript](https://img.shields.io/badge/TypeScript-1a161d?style=for-the-badge&logo=typescript&logoColor=ffd54f)
![NestJS](https://img.shields.io/badge/NestJS-1a161d?style=for-the-badge&logo=nestjs&logoColor=ff8f00)
![Prisma](https://img.shields.io/badge/Prisma-1a161d?style=for-the-badge&logo=prisma&logoColor=ff8f00)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-1a161d?style=for-the-badge&logo=postgresql&logoColor=7b1fa2)
![Docker](https://img.shields.io/badge/Docker-1a161d?style=for-the-badge&logo=docker&logoColor=7b1fa2)
![JWT](https://img.shields.io/badge/JWT-1a161d?style=for-the-badge&logo=jsonwebtokens&logoColor=ffd54f)

</div>

Autenticação e autorização (JWT + Argon2id + RBAC) implementadas na própria API, sem BaaS de terceiro — decisão proposital, ver [`docs/PROJETO.md`](./docs/PROJETO.md#44-arquitetura-de-backend--api-própria-sem-baas). Detalhes de arquitetura e justificativa de cada escolha em [`docs/PROJETO.md`, seção 4](./docs/PROJETO.md#4-decisões-técnicas-tomadas-até-agora).

<img src="https://capsule-render.vercel.app/api?type=rect&color=0:1a161d,50:7b1fa2,100:ff8f00&height=4&section=header" width="100%" />

<a id="estrutura-do-repositório"></a>
## 📂 Estrutura do repositório

```
cinema-arcano/
├── docs/PROJETO.md   → decisões de produto e arquitetura, com justificativas
├── backend/           → API NestJS + Prisma + PostgreSQL
└── frontend/          → Next.js + TypeScript
```

<img src="https://capsule-render.vercel.app/api?type=rect&color=0:1a161d,50:7b1fa2,100:ff8f00&height=4&section=header" width="100%" />

<a id="como-rodar"></a>
## ⚙️ Como rodar

Instruções completas de setup (front, back e variáveis de ambiente) estão nos READMEs de cada pacote: [`backend/README.md`](./backend/README.md) e [`frontend/README.md`](./frontend/README.md).

Resumo do backend:

```bash
cd backend
docker compose up -d        # sobe PostgreSQL 16 local
npx prisma migrate dev      # aplica o schema ao banco
npx prisma db seed          # cria usuários iniciais (1 organizador, 2 clientes, 1 portaria)
```

Instruções de setup completas (variáveis de ambiente, migrations, TMDb API key) estão em cada README de pacote.

<img src="https://capsule-render.vercel.app/api?type=rect&color=0:1a161d,50:7b1fa2,100:ff8f00&height=4&section=header" width="100%" />

<a id="contas-de-teste"></a>
## 🔑 Contas de teste

Após rodar o seed (`npx prisma db seed`), estas contas ficam disponíveis para testar os três papéis do sistema:

| Papel | E-mail | Senha | Uso sugerido |
|---|---|---|---|
| Organizador | `admin@cinemaarcano.com` | `Admin@123` | Criar sessões em `/admin/sessions/new` |
| Cliente | `cliente1@cinemaarcano.com` | `Cliente1@123` | Reservar assentos, pagar e gerar ticket |
| Cliente | `cliente2@cinemaarcano.com` | `Cliente2@123` | Testar disputa de assento/reserva com outro cliente |
| Portaria | `portaria@cinemaarcano.com` | `Portaria@123` | Usuário preparado para o módulo de validação de ingressos |

<a id="roteiro-rápido-de-teste-em-produção"></a>
### 🎟️ Roteiro rápido de teste em produção

1. Acesse [cinema-arcano.vercel.app](https://cinema-arcano.vercel.app).
2. Entre como organizador e crie uma sessão em `/admin/sessions/new`.
3. Gerencie sessões em `/admin/sessions`, incluindo cancelamento.
4. Saia, entre como cliente e abra um filme com sessão disponível.
5. Clique em **Escolher assentos**, selecione lugares no mapa e crie a reserva.
6. No checkout, escolha cartão ou PIX e simule aprovação ou recusa do pagamento.
7. Reabra seus tickets em `/reservations`.
8. Entre como portaria ou admin em `/gate`, cole o token do QR ou use a câmera, e valide o ingresso.
9. Valide o mesmo ingresso novamente para confirmar o retorno de ingresso já utilizado.
10. Navegue por `/sobre`, `/contato` e `/termos` para conferir as páginas institucionais finais.

<img src="https://capsule-render.vercel.app/api?type=rect&color=0:1a161d,50:7b1fa2,100:ff8f00&height=4&section=header" width="100%" />

<a id="uso-de-ia-neste-projeto"></a>
## 🤖 Uso de IA neste projeto

Este projeto foi desenvolvido com apoio de IA para organização de ideias, revisão de trade-offs, geração de código de apoio, revisão geral e documentação. Todas as decisões de produto e arquitetura são registradas com justificativa própria em [`docs/PROJETO.md`](./docs/PROJETO.md) — não apenas o resultado final, mas o porquê de cada escolha.

Usei Claude Sonnet 5 como principal apoio de desenvolvimento, Gemini Pro pontualmente para alguns testes e ChatGPT Codex 5.5 para revisão geral do projeto e ajuda na correção de falhas. Como usei essas ferramentas em planos gratuitos, e também por escolha própria, não terceirizei planejamento nem decisões técnicas para IA: as decisões de arquitetura, escopo, produto e priorização foram minhas.

As decisões de design e identidade visual também foram guiadas pelo meu gosto pessoal. Usei IA como apoio operacional, mas o visual do Cinema Arcano — paleta, tom, estética neo-brutalista e direção de interface — foi definido por mim.

Também evitei propositalmente depender de muitos frameworks ou soluções prontas. Mantive o projeto enxuto para demonstrar que entendo o que estou construindo e consigo criar as peças principais do zero quando isso faz sentido. Isso não significa rejeitar ferramentas prontas em outros contextos; elas têm muito valor para acelerar entregas. Neste desafio, preferi mostrar o processo manual e as decisões por trás da implementação.

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:1a161d,50:7b1fa2,100:ff8f00&height=100&section=footer" width="100%" />
