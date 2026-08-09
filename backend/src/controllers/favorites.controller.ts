import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { favoritesService } from '../services/favorites.service';

function clientIdOf(req: Request): string {
  const header = req.header('x-client-id');
  if (!header) {
    throw Object.assign(new Error('Cabecalho x-client-id e obrigatorio'), { status: 400 });
  }
  return header;
}

const addSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  sprite: z.string().url().nullable(),
});

async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const clientId = clientIdOf(req);
    const favorites = await favoritesService.list(clientId);
    res.json({ favorites });
  } catch (error) {
    next(error);
  }
}

async function add(req: Request, res: Response, next: NextFunction) {
  try {
    const clientId = clientIdOf(req);
    const body = addSchema.parse(req.body);
    const favorites = await favoritesService.add(clientId, { ...body, addedAt: new Date().toISOString() });
    res.status(201).json({ favorites });
  } catch (error) {
    next(error);
  }
}

async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const clientId = clientIdOf(req);
    const pokemonId = Number(req.params.id);
    const favorites = await favoritesService.remove(clientId, pokemonId);
    res.json({ favorites });
  } catch (error) {
    next(error);
  }
}

export const favoritesController = { list, add, remove };
