# Pokédex — frontend (Angular)

SPA em Angular 19 (standalone components, signals, `@if`/`@for`) que consome
a [API própria](../backend) deste projeto. Veja o README na raiz do
repositório para o contexto completo (problema, arquitetura, decisões).

## Comandos

```bash
npm install
npm start          # http://localhost:4200 — espera a API em localhost:3333
npm test            # Karma/Jasmine
npm run build        # build de produção em dist/frontend
```

## Estrutura

```
src/app/
  core/        modelos, serviços HTTP, i18n, interceptor de erro
  shared/       componentes reutilizáveis (card, badge, nav, spinner) e o pipe de tradução
  features/      telas: pokemon-list, pokemon-detail, favorites
```
