# Pokedex API

API em Node.js + Express + TypeScript que serve de camada intermediaria (BFF)
entre o front-end Angular e a [PokeAPI](https://pokeapi.co/), agregando e
cacheando os dados e adicionando um recurso proprio de favoritos.

## Por que uma API intermediaria, e nao consumir a PokeAPI direto do front?

A PokeAPI e otima mas tem duas limitacoes para um app de listagem/busca:
paginacao simples (sem busca por nome ou filtro por tipo no endpoint de
listagem) e nenhuma forma de persistir dados do usuario (como favoritos).
Este backend resolve os dois problemas:

- **Agregacao**: a rota de detalhe combina `pokemon`, `pokemon-species` e a
  cadeia de evolucao em uma unica resposta, ja no formato que a tela precisa.
- **Cache em memoria** (`node-cache`): como os dados da PokeAPI raramente
  mudam, cada recurso e cacheado apos a primeira busca. Isso reduz
  drasticamente o tempo de resposta em acessos subsequentes e o numero de
  chamadas externas — o endpoint `/api/pokemon/health` expõe `hits`, `misses`
  e `hitRate` do cache para acompanhar esse ganho.
- **Busca e filtro por tipo**: implementados no backend sobre o indice
  completo da Pokedex nacional (cacheado), algo que a PokeAPI nao oferece
  nativamente.
- **Favoritos**: persistidos em disco por `clientId`, um recurso que so faz
  sentido existir no seu proprio backend.

## Stack

Node.js, Express, TypeScript, Zod (validacao), node-cache, Helmet,
express-rate-limit, Swagger/OpenAPI, Jest (testes).

## Rodando localmente

```bash
cp .env.example .env
npm install
npm run dev      # http://localhost:3333
```

## Scripts

| Comando         | O que faz                                   |
| --------------- | -------------------------------------------- |
| `npm run dev`   | Sobe o servidor com hot-reload (ts-node-dev)  |
| `npm run build` | Compila para `dist/` com o `tsc`              |
| `npm start`     | Roda a build compilada                        |
| `npm test`      | Roda a suite de testes (Jest)                 |
| `npm run lint`  | Checagem de tipos sem gerar arquivos          |

## Documentação interativa (Swagger)

Com o servidor rodando, a documentação OpenAPI fica disponível em:

- **`/api-docs`** — Swagger UI, com "Try it out" para testar as rotas direto do navegador
- **`/openapi.json`** — o spec cru, caso queira importar no Postman/Insomnia

Em produção: `https://pokedex-wkvl.onrender.com/api-docs`

## Endpoints

| Metodo | Rota                        | Descricao                                          |
| ------ | --------------------------- | --------------------------------------------------- |
| GET    | `/api/pokemon`               | Lista paginada. Query: `page`, `pageSize`, `search`, `type` |
| GET    | `/api/pokemon/:idOrName`     | Detalhe agregado (stats, habilidades, evolucao, especie) |
| GET    | `/api/pokemon/types`         | Lista de tipos disponiveis para o filtro            |
| GET    | `/api/pokemon/health`        | Status da API e estatisticas do cache               |
| GET    | `/api/favorites`             | Lista favoritos do `x-client-id`                     |
| POST   | `/api/favorites`             | Adiciona um favorito                                 |
| DELETE | `/api/favorites/:id`         | Remove um favorito                                   |

Todas as rotas de favoritos exigem o header `x-client-id` (um UUID gerado e
guardado pelo front-end no `localStorage`, sem necessidade de login).

## Arquitetura

```
src/
  config/env.ts        Leitura e validacao de variaveis de ambiente (Zod)
  openapi.ts             Spec OpenAPI usado pelo Swagger UI em /api-docs
  services/             Regra de negocio: pokeapi.service, cache.service, favorites.service
  controllers/           Validam entrada e formatam saida HTTP
  routes/                 Mapeiam rotas para controllers
  middleware/              Rate limit, 404, tratamento central de erros
tests/                      Testes de unidade com fetch mockado
```

## Decisoes e trade-offs

- **Cache em memoria, nao Redis**: suficiente para um servico single-instance
  como este; documentado aqui como o proximo passo caso o projeto precise
  escalar horizontalmente.
- **Favoritos em arquivo JSON, nao banco de dados**: mantem o projeto
  rodando sem infraestrutura externa; a camada `favorites.service.ts` isola
  essa decisao para que trocar por Postgres/Mongo seja uma mudanca local.
- **Spec OpenAPI escrito a mao (`openapi.ts`), nao gerado via JSDoc**: para
  uma API deste tamanho, um objeto TypeScript tipado e mais facil de manter
  em sincronia com o codigo do que comentarios JSDoc espalhados pelas rotas.
