/**
 * Especificacao OpenAPI 3.0 escrita a mao (em vez de gerada via JSDoc).
 *
 * Para uma API deste tamanho, manter o spec como um objeto TypeScript
 * tipado e mais previsivel do que anotacoes JSDoc espalhadas pelas rotas:
 * fica tudo em um lugar so, com autocomplete, e sem risco de comentarios
 * ficarem fora de sincronia com o codigo sem que o build acuse nada.
 */
export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Pokedex API',
    version: '1.0.0',
    description:
      'API que agrega e cacheia dados da PokeAPI (listagem com busca/filtro, detalhe agregado) e expoe um recurso proprio de favoritos.',
  },
  servers: [{ description: 'Servidor atual', url: '/' }],
  tags: [
    { name: 'Pokemon', description: 'Listagem, detalhe e tipos' },
    { name: 'Favoritos', description: 'CRUD de favoritos por clientId' },
  ],
  paths: {
    '/api/pokemon': {
      get: {
        tags: ['Pokemon'],
        summary: 'Lista pokemon com paginacao, busca e filtro por tipo',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'pageSize', in: 'query', schema: { type: 'integer', default: 24, maximum: 60 } },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Substring do nome' },
          { name: 'type', in: 'query', schema: { type: 'string' }, description: 'Ex.: fire, water' },
        ],
        responses: {
          '200': {
            description: 'Pagina de resultados',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/PokemonListResponse' } } },
          },
        },
      },
    },
    '/api/pokemon/types': {
      get: {
        tags: ['Pokemon'],
        summary: 'Lista os tipos elementais disponiveis para o filtro',
        responses: {
          '200': {
            description: 'Lista de tipos',
            content: {
              'application/json': {
                schema: { type: 'object', properties: { types: { type: 'array', items: { type: 'string' } } } },
              },
            },
          },
        },
      },
    },
    '/api/pokemon/health': {
      get: {
        tags: ['Pokemon'],
        summary: 'Status da API e estatisticas do cache em memoria',
        responses: {
          '200': {
            description: 'Status ok',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    cache: {
                      type: 'object',
                      properties: {
                        hits: { type: 'integer' },
                        misses: { type: 'integer' },
                        hitRate: { type: 'number' },
                        keys: { type: 'integer' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/pokemon/{idOrName}': {
      get: {
        tags: ['Pokemon'],
        summary: 'Detalhe agregado de um pokemon (stats, habilidades, evolucao, especie)',
        parameters: [
          {
            name: 'idOrName',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Numero da Pokedex nacional ou nome (ex.: 25 ou pikachu)',
          },
        ],
        responses: {
          '200': {
            description: 'Detalhe do pokemon',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/PokemonDetail' } } },
          },
          '404': { description: 'Pokemon nao encontrado' },
        },
      },
    },
    '/api/favorites': {
      get: {
        tags: ['Favoritos'],
        summary: 'Lista os favoritos do clientId informado',
        parameters: [{ $ref: '#/components/parameters/ClientId' }],
        responses: {
          '200': {
            description: 'Lista de favoritos',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { favorites: { type: 'array', items: { $ref: '#/components/schemas/FavoriteEntry' } } },
                },
              },
            },
          },
          '400': { description: 'Header x-client-id ausente' },
        },
      },
      post: {
        tags: ['Favoritos'],
        summary: 'Adiciona um pokemon aos favoritos',
        parameters: [{ $ref: '#/components/parameters/ClientId' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['id', 'name', 'sprite'],
                properties: {
                  id: { type: 'integer', example: 25 },
                  name: { type: 'string', example: 'pikachu' },
                  sprite: { type: 'string', format: 'uri', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Favorito adicionado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { favorites: { type: 'array', items: { $ref: '#/components/schemas/FavoriteEntry' } } },
                },
              },
            },
          },
        },
      },
    },
    '/api/favorites/{id}': {
      delete: {
        tags: ['Favoritos'],
        summary: 'Remove um pokemon dos favoritos',
        parameters: [
          { $ref: '#/components/parameters/ClientId' },
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          '200': {
            description: 'Favorito removido',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { favorites: { type: 'array', items: { $ref: '#/components/schemas/FavoriteEntry' } } },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    parameters: {
      ClientId: {
        name: 'x-client-id',
        in: 'header',
        required: true,
        schema: { type: 'string', format: 'uuid' },
        description: 'Identificador do cliente, gerado e persistido no localStorage do front-end',
      },
    },
    schemas: {
      PokemonListItem: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          sprite: { type: 'string', format: 'uri', nullable: true },
          types: { type: 'array', items: { type: 'string' } },
        },
      },
      PokemonListResponse: {
        type: 'object',
        properties: {
          count: { type: 'integer' },
          page: { type: 'integer' },
          pageSize: { type: 'integer' },
          totalPages: { type: 'integer' },
          results: { type: 'array', items: { $ref: '#/components/schemas/PokemonListItem' } },
        },
      },
      PokemonDetail: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          height: { type: 'integer' },
          weight: { type: 'integer' },
          sprite: { type: 'string', nullable: true },
          artwork: { type: 'string', nullable: true },
          cry: { type: 'string', nullable: true },
          types: { type: 'array', items: { type: 'string' } },
          abilities: {
            type: 'array',
            items: {
              type: 'object',
              properties: { name: { type: 'string' }, isHidden: { type: 'boolean' } },
            },
          },
          stats: {
            type: 'array',
            items: {
              type: 'object',
              properties: { name: { type: 'string' }, baseStat: { type: 'integer' } },
            },
          },
          moves: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                learnMethod: { type: 'string' },
                levelLearnedAt: { type: 'integer' },
              },
            },
          },
          species: {
            type: 'object',
            properties: {
              genus: { type: 'string', nullable: true },
              flavorText: { type: 'string', nullable: true },
              isLegendary: { type: 'boolean' },
              isMythical: { type: 'boolean' },
              captureRate: { type: 'integer' },
            },
          },
          evolutionChain: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                name: { type: 'string' },
                sprite: { type: 'string', nullable: true },
                minLevel: { type: 'integer', nullable: true },
                trigger: { type: 'string', nullable: true },
              },
            },
          },
        },
      },
      FavoriteEntry: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          sprite: { type: 'string', nullable: true },
          addedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
} as const;
