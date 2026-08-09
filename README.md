# Pokédex — full-stack (Angular + Node.js/Express)

Uma Pokédex funcional construída como projeto de portfólio: front-end em
Angular consumindo uma API própria em Node.js/Express, que por sua vez agrega
e cacheia dados da [PokeAPI](https://pokeapi.co/). O objetivo não foi só
"listar Pokémon", e sim demonstrar decisões reais de arquitetura full-stack:
uma camada de BFF com cache, busca/filtro implementados no backend, testes
automatizados e uma interface com identidade visual própria.

## O problema

A PokeAPI é excelente como fonte de dados, mas tem limitações reais para
construir um produto em cima dela:

- O endpoint de listagem não suporta busca por nome nem filtro por tipo —
  só paginação simples sobre a ordem da Pokédex nacional.
- O detalhe de um Pokémon está espalhado em 2–3 recursos diferentes
  (`pokemon`, `pokemon-species`, `evolution-chain`), cada um com seu próprio
  formato de resposta.
- Não existe conceito de usuário, então não há onde persistir favoritos.
- Bater direto na PokeAPI a cada carregamento de tela desperdiça chamadas
  para dados que praticamente nunca mudam.

## A solução

Uma API própria (`backend/`) fica entre o Angular e a PokeAPI, resolvendo os
quatro pontos acima: agrega os três recursos em uma resposta única e já
pronta para a tela, implementa busca e filtro por tipo sobre um índice
cacheado da Pokédex nacional, expõe endpoints de favoritos persistidos em
disco por `clientId`, e cacheia agressivamente em memória — o endpoint
`/api/pokemon/health` expõe `hits`/`misses`/`hitRate` do cache para
acompanhar o ganho na prática.

O front-end (`frontend/`) consome só essa API própria, nunca a PokeAPI
diretamente — o que também significa que trocar a fonte de dados no futuro
(ou adicionar um banco de verdade) não exige tocar em uma linha do Angular.

## Arquitetura

```
┌───────────────────┐        ┌────────────────────────┐        ┌─────────────┐
│  Angular (SPA)    │  HTTP  │  Node.js / Express    │  HTTP  │   PokeAPI   │
│  frontend/         │ ─────▶ │  backend/              │ ─────▶ │  (externa)  │
│                    │        │                        │        │             │
│  standalone comps  │        │  cache em memória       │        │             │
│  signals + RxJS    │ ◀───── │  busca/filtro/favoritos │ ◀───── │             │
└───────────────────┘        └────────────────────────┘        └─────────────┘
```

## Stack

| Camada     | Tecnologias                                                            |
| ---------- | ------------------------------------------------------------------------ |
| Front-end  | Angular 19 (standalone components, signals, control flow `@if/@for`), TypeScript, SCSS |
| Back-end   | Node.js, Express, TypeScript, Zod, node-cache, Helmet, express-rate-limit |
| Testes     | Jest (backend), Karma/Jasmine (frontend)                                 |
| Infra      | Docker/Docker Compose para rodar os dois serviços juntos                  |

## Funcionalidades

- Listagem paginada com busca por nome e filtro por tipo (24 por página)
- Ficha de detalhe: stats em barras, habilidades, movimentos, cadeia
  evolutiva navagável, badge de lendário/mítico
- Favoritos persistidos no backend, sincronizados por um `clientId` gerado
  no primeiro acesso (sem necessidade de login)
- Interface bilingüe PT/EN com troca em tempo real, sem reload
- Identidade visual própria — "terminal de campo de pesquisador" (paleta
  teal/coral, tipografia serifada + monoespaçada), não o visual genérico de
  fã-site

## Rodando localmente

### Opção A — Docker Compose (sobe os dois serviços)

```bash
docker compose up --build
# front-end: http://localhost:4200
# API:       http://localhost:3333
```

### Opção B — manual

```bash
# backend
cd backend
cp .env.example .env
npm install
npm run dev          # http://localhost:3333

# frontend, em outro terminal
cd frontend
npm install
npm start             # http://localhost:4200
```

## Deploy em produção

Front-end na Vercel, API no Render — os dois com camada gratuita. A API não
foi feita para rodar como função serverless (o cache em memória e os
favoritos em arquivo dependem de um processo Node persistente), por isso
fica no Render em vez de também ir para a Vercel.

### 1. API no Render

1. No painel do Render: **New +** → **Blueprint** → conecte este
   repositório. O `render.yaml` na raiz já configura o serviço (`rootDir:
   backend`, build/start commands, health check em `/api/pokemon/health`).
2. Depois do primeiro deploy, copie a URL gerada (ex.:
   `https://pokedex-api.onrender.com`).

### 2. Front-end na Vercel

1. Em vercel.com: **Add New** → **Project** → importe este repositório.
2. Em **Root Directory**, selecione `frontend`. O `frontend/vercel.json` já
   define build command, output directory e o rewrite necessário para as
   rotas do Angular Router funcionarem em produção.
3. Antes do deploy, atualize `frontend/src/environments/environment.prod.ts`
   com a URL da API do Render (passo 1) e faça commit — a Vercel builda a
   partir do repositório, então a URL precisa estar no código antes do build.

### 3. Fechar o CORS

Com as duas URLs em mãos, volte no Render e defina a variável `CORS_ORIGIN`
com a URL exata da Vercel (sem barra no final), para a API só aceitar
requisições do seu front-end.

## Testes

```bash
cd backend && npm test    # Jest — service de agregação/cache com fetch mockado
cd frontend && npm test   # Karma/Jasmine — componentes standalone
```

## Estrutura do repositório

```
pokedex/
  backend/     API Node.js/Express — ver backend/README.md para detalhes
  frontend/    SPA Angular — componentes em core/, shared/, features/
  docker-compose.yml
  render.yaml   Blueprint de deploy da API no Render
```

## Decisões e trade-offs

- **BFF com cache em memória, não um proxy transparente**: o ganho de
  performance (menos chamadas externas, resposta mais rápida em acessos
  repetidos) valeu mais, para este escopo, do que a simplicidade de expor a
  PokeAPI direto no front-end.
- **Favoritos por `clientId` em vez de autenticação completa**: entrega o
  recurso de forma persistente sem exigir cadastro/login, adequado para uma
  demo de portfólio; a camada está isolada (`favorites.service.ts`) para uma
  eventual migração para login real.
- **i18n com dicionários TypeScript embutidos, não arquivos JSON via
  HTTP**: evita problemas de `base href` em deploys estáticos (GitHub Pages)
  e mantém a troca de idioma instantânea, sem requisição extra.
- **API no Render, não na Vercel**: o cache em memória e os favoritos em
  arquivo só fazem sentido com um processo Node persistente; rodar isso como
  função serverless exigiria trocar essas duas peças por Redis/KV e um banco
  de verdade.

## Próximos passos

- Trocar a persistência de favoritos de arquivo JSON para um banco real
  (Postgres/SQLite) quando o projeto justificar
- Cobertura de testes E2E (Playwright) para os fluxos de busca e favoritos
