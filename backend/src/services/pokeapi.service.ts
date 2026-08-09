import { env } from '../config/env';
import { cacheService } from './cache.service';
import type {
  EvolutionNode,
  PokemonDetail,
  PokemonListItem,
  PokemonListResponse,
} from '../types/pokemon.types';

const BASE_URL = env.POKEAPI_BASE_URL;

// A PokeAPI cobre todas as geracoes ja lancadas; 1302 cobre ate a gen 9
// (incluindo formas). Se novas geracoes forem lancadas, so subir esse numero.
const NATIONAL_DEX_LIMIT = 1302;

interface DexIndexEntry {
  id: number;
  name: string;
}

class PokeApiError extends Error {
  constructor(message: string, public readonly status = 502) {
    super(message);
    this.name = 'PokeApiError';
  }
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 404) {
      throw new PokeApiError('Pokemon nao encontrado', 404);
    }
    throw new PokeApiError(`PokeAPI respondeu ${response.status} para ${url}`);
  }
  return response.json() as Promise<T>;
}

function idFromUrl(url: string): number {
  const match = url.match(/\/(\d+)\/?$/);
  return match ? Number(match[1]) : 0;
}

function spriteFor(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

function artworkFor(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

/** Indice completo {id, name} da Pokedex nacional. Carregado uma vez e cacheado por muito tempo. */
async function getDexIndex(): Promise<DexIndexEntry[]> {
  return cacheService.getOrSet('dex:index', async () => {
    const data = await fetchJson<{ results: { name: string; url: string }[] }>(
      `${BASE_URL}/pokemon?limit=${NATIONAL_DEX_LIMIT}&offset=0`,
    );
    return data.results.map((entry) => ({ id: idFromUrl(entry.url), name: entry.name }));
  });
}

/** Conjunto de nomes de pokemon pertencentes a um tipo, usado para o filtro por tipo. */
async function getNamesByType(type: string): Promise<Set<string>> {
  return cacheService.getOrSet(`type:${type}`, async () => {
    const data = await fetchJson<{ pokemon: { pokemon: { name: string } }[] }>(
      `${BASE_URL}/type/${type}`,
    );
    return new Set(data.pokemon.map((entry) => entry.pokemon.name));
  });
}

/** Resumo leve de um pokemon (usado nos cards de listagem). */
async function getListItem(idOrName: string | number): Promise<PokemonListItem> {
  return cacheService.getOrSet(`pokemon:summary:${idOrName}`, async () => {
    const data = await fetchJson<{
      id: number;
      name: string;
      types: { type: { name: string } }[];
    }>(`${BASE_URL}/pokemon/${idOrName}`);
    return {
      id: data.id,
      name: data.name,
      sprite: spriteFor(data.id),
      types: data.types.map((t) => t.type.name),
    };
  });
}

export interface ListPokemonParams {
  page: number;
  pageSize: number;
  search?: string;
  type?: string;
}

async function listPokemon({ page, pageSize, search, type }: ListPokemonParams): Promise<PokemonListResponse> {
  let index = await getDexIndex();

  if (search) {
    const term = search.trim().toLowerCase();
    index = index.filter((entry) => entry.name.includes(term));
  }

  if (type) {
    const namesInType = await getNamesByType(type.toLowerCase());
    index = index.filter((entry) => namesInType.has(entry.name));
  }

  const count = index.length;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  const pageSlice = index.slice(start, start + pageSize);

  // Busca os resumos em paralelo, mas so para a pagina atual: mantem o custo
  // por requisicao constante independente do tamanho do indice.
  const results = await Promise.all(pageSlice.map((entry) => getListItem(entry.id)));

  return {
    count,
    page: safePage,
    pageSize,
    totalPages,
    results,
  };
}

function parseEvolutionChain(node: any): EvolutionNode[] {
  const chain: EvolutionNode[] = [];

  function walk(current: any) {
    const id = idFromUrl(current.species.url);
    const detail = current.evolution_details?.[0];
    chain.push({
      id,
      name: current.species.name,
      sprite: spriteFor(id),
      minLevel: detail?.min_level ?? null,
      trigger: detail?.trigger?.name ?? null,
    });
    current.evolves_to?.forEach(walk);
  }

  walk(node);
  return chain;
}

async function getPokemonDetail(idOrName: string): Promise<PokemonDetail> {
  const key = `pokemon:detail:${idOrName.toLowerCase()}`;
  return cacheService.getOrSet(key, async () => {
    const pokemon = await fetchJson<any>(`${BASE_URL}/pokemon/${idOrName.toLowerCase()}`);
    const species = await fetchJson<any>(pokemon.species.url);
    const evolution = species.evolution_chain?.url
      ? await fetchJson<any>(species.evolution_chain.url)
      : null;

    const flavorEntry = species.flavor_text_entries?.find(
      (entry: any) => entry.language.name === 'en',
    );
    const genusEntry = species.genera?.find((entry: any) => entry.language.name === 'en');

    const detail: PokemonDetail = {
      id: pokemon.id,
      name: pokemon.name,
      height: pokemon.height,
      weight: pokemon.weight,
      sprite: spriteFor(pokemon.id),
      artwork: artworkFor(pokemon.id),
      cry: pokemon.cries?.latest ?? null,
      types: pokemon.types.map((t: any) => t.type.name),
      abilities: pokemon.abilities.map((a: any) => ({
        name: a.ability.name,
        isHidden: a.is_hidden,
      })),
      stats: pokemon.stats.map((s: any) => ({
        name: s.stat.name,
        baseStat: s.base_stat,
      })),
      moves: pokemon.moves.slice(0, 20).map((m: any) => {
        const detail = m.version_group_details?.[0];
        return {
          name: m.move.name,
          learnMethod: detail?.move_learn_method?.name ?? 'unknown',
          levelLearnedAt: detail?.level_learned_at ?? 0,
        };
      }),
      species: {
        genus: genusEntry?.genus ?? null,
        flavorText: flavorEntry?.flavor_text?.replace(/[\n\f\r]/g, ' ') ?? null,
        isLegendary: species.is_legendary,
        isMythical: species.is_mythical,
        captureRate: species.capture_rate,
      },
      evolutionChain: evolution ? parseEvolutionChain(evolution.chain) : [],
    };

    return detail;
  });
}

async function listTypes(): Promise<string[]> {
  return cacheService.getOrSet('dex:types', async () => {
    const data = await fetchJson<{ results: { name: string }[] }>(`${BASE_URL}/type`);
    return data.results
      .map((t) => t.name)
      .filter((name) => !['unknown', 'shadow'].includes(name));
  });
}

export const pokeApiService = {
  listPokemon,
  getPokemonDetail,
  listTypes,
};

export { PokeApiError };
