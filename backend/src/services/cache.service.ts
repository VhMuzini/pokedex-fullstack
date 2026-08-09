import NodeCache from 'node-cache';
import { env } from '../config/env';

/**
 * Cache em memoria para respostas ja normalizadas da PokeAPI.
 *
 * A PokeAPI publica dados praticamente estaticos (uma Pikachu de hoje e a
 * mesma de amanha), entao cachear agressivamente evita bater na API externa
 * a cada requisicao e derruba o tempo de resposta percebido de forma
 * consistente apos o primeiro acesso a cada recurso.
 */
class CacheService {
  private readonly cache: NodeCache;
  private hits = 0;
  private misses = 0;

  constructor() {
    this.cache = new NodeCache({
      stdTTL: env.CACHE_TTL_SECONDS,
      checkperiod: Math.max(60, Math.floor(env.CACHE_TTL_SECONDS / 10)),
      useClones: false,
    });
  }

  get<T>(key: string): T | undefined {
    const value = this.cache.get<T>(key);
    if (value === undefined) {
      this.misses += 1;
    } else {
      this.hits += 1;
    }
    return value;
  }

  set<T>(key: string, value: T): void {
    this.cache.set(key, value);
  }

  async getOrSet<T>(key: string, loader: () => Promise<T>): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }
    const fresh = await loader();
    this.set(key, fresh);
    return fresh;
  }

  stats() {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: total === 0 ? 0 : Number((this.hits / total).toFixed(2)),
      keys: this.cache.keys().length,
    };
  }

  flush(): void {
    this.cache.flushAll();
    this.hits = 0;
    this.misses = 0;
  }
}

export const cacheService = new CacheService();
