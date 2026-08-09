import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { pokeApiService } from '../services/pokeapi.service';
import { cacheService } from '../services/cache.service';

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(60).default(24),
  search: z.string().trim().optional(),
  type: z.string().trim().optional(),
});

async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listQuerySchema.parse(req.query);
    const data = await pokeApiService.listPokemon(query);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

async function detail(req: Request, res: Response, next: NextFunction) {
  try {
    const idOrName = req.params.idOrName;
    const data = await pokeApiService.getPokemonDetail(idOrName);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

async function types(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await pokeApiService.listTypes();
    res.json({ types: data });
  } catch (error) {
    next(error);
  }
}

function health(_req: Request, res: Response) {
  res.json({ status: 'ok', cache: cacheService.stats() });
}

export const pokemonController = { list, detail, types, health };
