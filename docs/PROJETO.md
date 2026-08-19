# Documentação do Projeto — Cinema Arcano

> Este é o meu diário de decisões para o desafio técnico da Verzel (Elite Dev). Uso IA como apoio para organizar ideias, revisar trade-offs e manter esse registro atualizado a cada sessão — mas as decisões de produto e arquitetura são minhas. Mantenho isso versionado no repositório porque o próprio desafio pede transparência sobre processo, e porque documentar o "porquê" evita que decisões corretas pareçam arbitrárias numa leitura rápida do código.

**Última atualização**: 19/08/2026
**Autor**: Israel Menezes de Andrade
**Status**: Fase de planejamento — nenhuma linha de código escrita ainda

---

## 1. Contexto do desafio

Etapa 3 de 6 do processo seletivo **Elite Dev** (Verzel — vaga de Desenvolvedor Full Stack Jr).

**E-mail recebido**: 18/08/2026, 13:03 (via Pipefy).
**Prazo**: 7 dias corridos a partir do recebimento → **entrega até 25/08/2026, 13:03**.

Fases do processo:
1. Candidatura (Triagem)
2. Teste Técnico Online (Coderbyte)
3. **Projeto de desenvolvimento (GitHub) ← estamos aqui**
4. Papo com o time de Pessoas (RH)
5. Dinâmica Final
6. Contratação

### O que avaliam de verdade

O PDF do desafio é explícito: eles já receberam candidatos que colaram o enunciado numa IA e devolveram "o sistema pronto" — e isso é tratado como o principal erro a evitar. O texto usa o termo **"AI slop"**: interfaces genéricas, sem nenhuma decisão de produto por trás, reconhecíveis de longe.

O que pesa na nota, segundo o próprio PDF:
- **As decisões tomadas e o porquê** — não o volume de features entregue.
- Fluxo completo e simples > fluxo sofisticado pela metade.
- Documentação clara de processo, incluindo uso de IA (não é punido, é esperado — desde que explicado).
- README detalhado, inclusive listando o que **não** funciona.
- Histórico de commits ao longo da semana (mostra processo, não só resultado final).

**Implicação prática**: este documento e as decisões registradas nele são, em si, parte do que será avaliado — não é só bagagem de bastidores.

---

## 2. Proposta do produto

**Plataforma de Eventos e Ingressos**: organizador publica eventos a partir de um catálogo externo; cliente navega, reserva, paga (simulado) e recebe ingresso com QR code; portaria valida o ingresso na entrada.

### 2.1 Identidade: Cinema Arcano

Decidi dar identidade própria ao produto em vez de entregar um cinema genérico. Toda referência de mercado que olhei (sites de venda de ingresso) segue o mesmo padrão visual e de copy — o que reforça o risco que o próprio desafio descreve como "AI slop": interfaces que qualquer um reconhece de longe.

**Conceito**: Cinema Arcano — uma sala de cinema com identidade "arcana"/mística, que trata a compra do ingresso como um pequeno ritual de entrada no mundo do filme, não como um checkout qualquer.

**Como isso entra no projeto, na prática**:
- Nome, paleta de cores e tipografia próprios (a definir na fase de UI).
- Microcopy temática nas telas principais (ex.: confirmação de ingresso, tela de portaria) em vez de textos genéricos de sistema.
- **Decisão de escopo**: o tema fica restrito a identidade visual e copy, aplicado sobre uma estrutura de componentes simples. Não vou usar o tema para justificar UX não-convencional ou fluxos alternativos — o fluxo continua sendo o fluxo padrão de compra de ingresso, só que com uma casca própria. Isso porque, com 7 dias e ainda bastante trabalho de back-end pela frente (QR, concorrência, auth própria), polimento visual tem custo de tempo que cresce rápido se não for limitado — e a nota pesa mais sobre fluxo completo e decisões técnicas do que sobre acabamento visual.

### Papéis (3 perfis distintos, com autenticação)
- **Organizador**: cria e gerencia eventos.
- **Cliente**: navega, reserva, paga, recebe e compartilha ingressos.
- **Portaria**: valida ingressos na entrada do evento.

---

## 3. Requisitos funcionais

### Front-End
- [ ] Navegação e busca de eventos publicados (data, local, preço)
- [ ] Criação e gerenciamento de eventos (organizador)
- [ ] Fluxo de reserva com seleção de lugar em mapa de assentos
- [ ] Pagamento simulado — com caminho de confirmação **e** de recusa
- [ ] "Meus ingressos" com exibição do QR code
- [ ] Tela de portaria com retorno claro: válido / inválido / já utilizado / evento errado
- [ ] Leitura de QR via câmera na portaria, com digitação manual como alternativa

### Back-End
- [ ] Integração com API externa de catálogo (ver decisão na seção 4)
- [ ] Autenticação com os 3 papéis
- [ ] Persistência de eventos, reservas e ingressos
- [ ] Garantia de que o mesmo assento não seja vendido duas vezes (concorrência)
- [ ] QR code não forjável (não pode ser um ID cru — precisa de assinatura/hash verificável)
- [ ] Geração de link compartilhável do ingresso
- [ ] Validação de ingresso impedindo reuso

### Fora de escopo (explícito no desafio — não implementar)
Nota fiscal, revenda entre usuários, aplicativo nativo, recuperação de senha, envio de ingresso por e-mail.

### Opcionais (somam nota, não obrigatórios)
Busca/filtro avançado, painel do organizador mais completo, cancelamento com devolução ao estoque, mapa de assentos em tempo real, Docker Compose, testes automatizados, deploy publicado (**+1 ponto garantido no critério oficial**).

---

## 4. Decisões técnicas tomadas até agora

Cada decisão abaixo inclui o motivo — é o material bruto para a seção "como pensei" do README final.

### 4.1 Stack final

```
                     INTERNET
                        │
                        ▼
              ┌──────────────────┐
              │     Next.js      │
              │   Frontend Web   │
              └────────┬─────────┘
                       │
                   REST / HTTPS
                       │
                       ▼
              ┌──────────────────┐
              │      NestJS      │
              │    Backend API   │
              └────────┬─────────┘
                       │
                    Prisma
                       │
                       ▼
              ┌──────────────────┐
              │   PostgreSQL     │
              │ Managed Database │
              └──────────────────┘
                       ▲
                       │
              ┌──────────────────┐
              │       TMDb       │
              │  External API    │
              └──────────────────┘
```

Escolhi essa stack para maximizar a demonstração de engenharia de software dentro dos 7 dias de prazo, sem adicionar complexidade desnecessária:

- **Next.js + TypeScript**: base sólida para a aplicação web, com deploy simples na Vercel.
- **NestJS + TypeScript**: estrutura o backend em módulos e concentra ali toda a lógica de negócio — autenticação, autorização, reservas, pagamentos, ingressos e portaria.
- **PostgreSQL**: banco relacional adequado ao domínio, e especialmente apropriado para garantir integridade e concorrência na venda de assentos (a regra "o mesmo lugar não pode ser vendido duas vezes" se apoia em transações/constraints do próprio banco).
- **Prisma**: camada de acesso ao banco fortemente integrada ao TypeScript, com migrations e modelagem tipada.
- **JWT + Argon2id + RBAC**: autenticação e autorização implementadas diretamente na API, em vez de delegadas a um BaaS — isso é proposital: o desafio pede para ver a camada de backend que eu projetei, não uma configuração de terceiro.
- **TMDb**: catálogo externo com baixo risco de integração (ver decisão 4.2), liberando tempo para as regras de negócio mais relevantes.
- **Docker Compose**: facilita reprodução do ambiente de desenvolvimento por quem for avaliar o projeto.
- **Vercel (front) + hospedagem gerenciada para o backend + Postgres gerenciado**: entrega uma aplicação de fato acessível pela internet, sem depender de manter infraestrutura ou computador pessoal ligado. *(Provedor específico do backend/banco — Railway, Render, Fly.io, Neon etc. — a definir; ver seção 6.)*

Evitei deliberadamente microserviços, Redis, filas, Kubernetes e qualquer tecnologia que não agregasse valor proporcional ao escopo. O objetivo aqui é mostrar boas decisões arquiteturais, segurança, consistência de dados, tratamento de concorrência e um fluxo completo — não quantidade de tecnologias.

**Nota sobre a evolução dessa decisão**: cheguei a considerar Supabase como banco gerenciado por trás de uma API própria (ver decisão original no changelog de 19/08). Descartei essa camada intermediária: se o objetivo é mostrar autenticação e autorização projetadas por mim, faz mais sentido a Auth também ser minha (JWT + Argon2id + RBAC) em vez de depender do Auth de um BaaS — mesmo que ele fique "escondido" atrás da minha API.

### 4.2 API externa de catálogo — TMDb, não Ticketmaster
**Decisão**: usar TMDb (filmes), tratando cada filme como uma "sessão" configurada pelo organizador (define horário, sala/local e preço).

**Porquê**:
- Ticketmaster Discovery tem mais fricção de integração (rate limit mais apertado, dados de venue inconsistentes/incompletos).
- TMDb tem documentação madura, resposta rápida de aprovação de key, dados ricos (poster, sinopse) que melhoram a UI sem esforço extra.
- Com 7 dias de prazo, a fricção técnica economizada é redirecionada para as partes mais avaliadas: QR não forjável, concorrência de assentos, portaria, README.
- **Risco identificado e aceito conscientemente**: cinema é o cenário mais "óbvio" para filme + assentos, correndo o risco de parecer padrão. Mitigação: a diferenciação não vem da API escolhida, e sim de como as telas de reserva, recusa de pagamento e portaria são desenhadas — isso é decisão de produto, não de fonte de dados.

### 4.3 Modelo de reserva — mapa de assentos, sem pista
**Decisão**: implementar apenas mapa de assentos (não implementar reserva por quantidade/pista).

**Porquê**:
- Coerente com a escolha de TMDb/cinema.
- É a parte tecnicamente mais rica do desafio (concorrência real: dois clientes disputando o mesmo assento), e por isso a que mais demonstra capacidade técnica.
- O próprio desafio recomenda fluxo completo e simples em vez de dois fluxos pela metade — fazer só um bem feito reduz risco de entrega capenga no prazo.

### 4.4 Arquitetura de backend — API própria, sem BaaS
Consolidado dentro da stack final (seção 4.1): NestJS concentra toda a lógica de negócio, com Auth própria (JWT + Argon2id + RBAC). O PDF do desafio lista explicitamente frameworks de API (NestJS, Express, FastAPI, Django, Spring Boot) como as opções de back-end — não cita BaaS como alternativa, o que reforça que querem ver uma camada de API projetada pelo candidato, não configurada a partir de um provedor.

**Vercel para deploy do front**: decisão de baixo risco — é a opção literalmente sugerida no PDF ("Vercel ou plataforma similar"), vale +1 ponto no critério oficial.

### 4.5 Pendente de decisão
- Provedor de hospedagem gerenciada para backend + PostgreSQL (Railway, Render, Fly.io, Neon, etc.)
- Estratégia exata de assinatura do QR code (ex: JWT assinado, HMAC com segredo do servidor — a detalhar)
- Estrutura de tabelas / schema do banco (a detalhar)
- Estratégia de lock/transação para evitar venda dupla do assento (a detalhar)
- Identidade visual concreta do Cinema Arcano: paleta, tipografia, nome das telas/estados (a detalhar)
- Plano dia-a-dia para os 7 dias (a detalhar)

---

## 5. Requisitos não funcionais

- **Prazo**: 7 dias corridos a partir do recebimento do e-mail
- **README**: detalhado, com passo a passo de setup, incluindo configuração do banco escolhido; qualquer coisa que não funcione como esperado deve ser mencionada
- **Dados semeados (seed) obrigatórios**: 1 organizador, 2 clientes, 1 usuário de portaria, ao menos 1 evento publicado com ingressos disponíveis
- **Deploy**: opcional, mas +1 ponto na nota final se publicado (Vercel ou similar)
- **Repositório GitHub público**, com commits descritivos ao longo da semana (não um commit único no fim)
- **Documentação do uso de IA**: seção no README ou arquivo dedicado explicando quais ferramentas foram usadas, em que partes, e o que foi feito sem IA. Artefatos de processo (specs, PRD, arquivos de contexto como este) devem ser versionados no repositório.

---

## 6. Perguntas em aberto / a resolver nas próximas sessões

- [ ] Escolher provedor de hospedagem para backend + Postgres gerenciado
- [ ] Desenhar schema do banco (tabelas: usuários/papéis, eventos, sessões, assentos, reservas, ingressos)
- [ ] Definir estratégia técnica do QR não forjável
- [ ] Definir estratégia de concorrência no assento (transação SQL, lock otimista, etc.)
- [ ] Definir identidade visual do Cinema Arcano (paleta, tipografia, tom de voz das telas)
- [ ] Montar plano dia-a-dia dos 7 dias (prazo final: 25/08/2026, 13:03)
- [ ] Definir estrutura de pastas do monorepo (front + back)

---

## 7. Changelog

| Data | Mudança |
|---|---|
| 19/08/2026 | Criação do documento. Decisões iniciais: TMDb, mapa de assentos. |
| 19/08/2026 | Confirmado prazo real (e-mail recebido 18/08 13:03 → entrega até 25/08 13:03). Definida identidade do produto: Cinema Arcano. Stack final fechada: Next.js + NestJS + Prisma + PostgreSQL + JWT/Argon2id/RBAC próprios (substitui a hipótese anterior de Supabase como banco por trás de uma API própria). Documento reescrito em primeira pessoa. |
