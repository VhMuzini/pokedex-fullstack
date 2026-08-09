import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { PokeApiError } from '../services/pokeapi.service';

interface HttpError extends Error {
  status?: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: HttpError, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'ValidationError',
      message: 'Parametros invalidos na requisicao',
      details: err.flatten().fieldErrors,
    });
    return;
  }

  if (err instanceof PokeApiError) {
    res.status(err.status).json({ error: 'PokeApiError', message: err.message });
    return;
  }

  const status = err.status ?? 500;
  if (status >= 500) {
    console.error('[unhandled error]', err);
  }

  res.status(status).json({
    error: err.name || 'InternalError',
    message: status >= 500 ? 'Erro interno inesperado' : err.message,
  });
}
