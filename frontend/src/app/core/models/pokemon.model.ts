export interface PokemonListItem {
  id: number;
  name: string;
  sprite: string | null;
  types: string[];
}

export interface PokemonListResponse {
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
  results: PokemonListItem[];
}

export interface PokemonStat {
  name: string;
  baseStat: number;
}

export interface PokemonMove {
  name: string;
  learnMethod: string;
  levelLearnedAt: number;
}

export interface EvolutionNode {
  id: number;
  name: string;
  sprite: string | null;
  minLevel: number | null;
  trigger: string | null;
}

export interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprite: string | null;
  artwork: string | null;
  cry: string | null;
  types: string[];
  abilities: { name: string; isHidden: boolean }[];
  stats: PokemonStat[];
  moves: PokemonMove[];
  species: {
    genus: string | null;
    flavorText: string | null;
    isLegendary: boolean;
    isMythical: boolean;
    captureRate: number;
  };
  evolutionChain: EvolutionNode[];
}

export interface FavoriteEntry {
  id: number;
  name: string;
  sprite: string | null;
  addedAt: string;
}

export const MAX_STAT_VALUE = 255;
