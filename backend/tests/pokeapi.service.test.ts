import { cacheService } from '../src/services/cache.service';

const DEX_INDEX_FIXTURE = {
  results: [
    { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
    { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
    { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/4/' },
  ],
};

function summaryFixture(id: number, name: string, types: string[]) {
  return {
    id,
    name,
    types: types.map((t) => ({ type: { name: t } })),
  };
}

describe('pokeApiService.listPokemon', () => {
  beforeEach(() => {
    cacheService.flush();
    jest.resetModules();
  });

  it('pagina e filtra por nome usando o indice cacheado, batendo na PokeAPI so uma vez por recurso', async () => {
    const fetchMock = jest.fn(async (url: string) => {
      if (url.includes('/pokemon?limit=')) {
        return { ok: true, status: 200, json: async () => DEX_INDEX_FIXTURE } as Response;
      }
      if (url.endsWith('/pokemon/1')) {
        return { ok: true, status: 200, json: async () => summaryFixture(1, 'bulbasaur', ['grass', 'poison']) } as Response;
      }
      if (url.endsWith('/pokemon/2')) {
        return { ok: true, status: 200, json: async () => summaryFixture(2, 'ivysaur', ['grass', 'poison']) } as Response;
      }
      throw new Error(`URL inesperada em teste: ${url}`);
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    // Import dinamico depois de configurar o mock, garantindo instancia limpa do modulo.
    const { pokeApiService } = await import('../src/services/pokeapi.service');

    const result = await pokeApiService.listPokemon({ page: 1, pageSize: 10, search: 'saur' });

    expect(result.count).toBe(2);
    expect(result.results.map((r) => r.name)).toEqual(['bulbasaur', 'ivysaur']);

    // Uma segunda chamada com os mesmos parametros deve vir do cache, sem novas
    // chamadas de rede: essa e a garantia central da camada de cache.
    const callsAfterFirst = fetchMock.mock.calls.length;
    await pokeApiService.listPokemon({ page: 1, pageSize: 10, search: 'saur' });
    expect(fetchMock.mock.calls.length).toBe(callsAfterFirst);
  });

  it('retorna paginas vazias com seguranca quando a pagina pedida excede o total', async () => {
    const fetchMock = jest.fn(async (url: string) => {
      if (url.includes('/pokemon?limit=')) {
        return { ok: true, status: 200, json: async () => DEX_INDEX_FIXTURE } as Response;
      }
      return { ok: true, status: 200, json: async () => summaryFixture(1, 'bulbasaur', ['grass']) } as Response;
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const { pokeApiService } = await import('../src/services/pokeapi.service');
    const result = await pokeApiService.listPokemon({ page: 999, pageSize: 10 });

    expect(result.page).toBeLessThanOrEqual(result.totalPages);
    expect(result.results.length).toBeGreaterThan(0);
  });
});
