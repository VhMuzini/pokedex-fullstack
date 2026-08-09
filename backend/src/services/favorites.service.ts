import { promises as fs } from 'fs';
import path from 'path';
import type { FavoriteEntry } from '../types/pokemon.types';

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'favorites.json');

type FavoritesByClient = Record<string, FavoriteEntry[]>;

/**
 * Persistencia simples em arquivo JSON.
 *
 * Para um projeto de portfolio isso evita a dependencia de um banco externo
 * mantendo a API 100% funcional out-of-the-box; a camada fica isolada atras
 * de um modulo dedicado, entao trocar para Postgres/Mongo depois significa
 * reimplementar so este arquivo, sem tocar em controllers ou rotas.
 */
class FavoritesService {
  private cache: FavoritesByClient | null = null;
  private writeQueue: Promise<void> = Promise.resolve();

  private async ensureLoaded(): Promise<FavoritesByClient> {
    if (this.cache) return this.cache;

    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      const raw = await fs.readFile(DATA_FILE, 'utf-8');
      this.cache = JSON.parse(raw) as FavoritesByClient;
    } catch {
      this.cache = {};
    }
    return this.cache;
  }

  private async persist(): Promise<void> {
    const snapshot = this.cache ?? {};
    this.writeQueue = this.writeQueue.then(async () => {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(DATA_FILE, JSON.stringify(snapshot, null, 2), 'utf-8');
    });
    return this.writeQueue;
  }

  async list(clientId: string): Promise<FavoriteEntry[]> {
    const data = await this.ensureLoaded();
    return data[clientId] ?? [];
  }

  async add(clientId: string, entry: FavoriteEntry): Promise<FavoriteEntry[]> {
    const data = await this.ensureLoaded();
    const current = data[clientId] ?? [];
    if (!current.some((fav) => fav.id === entry.id)) {
      data[clientId] = [...current, entry];
      await this.persist();
    }
    return data[clientId];
  }

  async remove(clientId: string, pokemonId: number): Promise<FavoriteEntry[]> {
    const data = await this.ensureLoaded();
    const current = data[clientId] ?? [];
    data[clientId] = current.filter((fav) => fav.id !== pokemonId);
    await this.persist();
    return data[clientId];
  }
}

export const favoritesService = new FavoritesService();
