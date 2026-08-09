import type { Request, Response } from 'express';

export function notFound(req: Request, res: Response) {
  res.status(404).json({
    error: 'NotFound',
    message: `Rota ${req.method} ${req.originalUrl} nao existe`,
  });
}
