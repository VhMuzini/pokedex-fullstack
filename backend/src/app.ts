import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { openApiSpec } from './openapi';
import { pokemonRouter } from './routes/pokemon.routes';
import { favoritesRouter } from './routes/favorites.routes';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { rateLimiter } from './middleware/rateLimiter';

// CORS_ORIGIN aceita uma lista separada por virgulas (util para permitir o
// dominio de producao E localhost ao mesmo tempo).
const explicitOrigins = env.CORS_ORIGIN.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// A Vercel gera uma URL unica a cada deploy (ex.:
// pokedex-9m8rb540m-vitor-muzinis-projects.vercel.app), alem do dominio
// estavel de producao. Aceitar esse padrao evita ter que atualizar
// CORS_ORIGIN manualmente a cada novo deploy/preview.
const vercelPreviewPattern = /^https:\/\/pokedex(-[a-z0-9]+)?-vitor-muzinis-projects\.vercel\.app$/i;

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true; // requisicoes sem header Origin (curl, health checks, etc.)
  return explicitOrigins.includes(origin) || vercelPreviewPattern.test(origin);
}

export function createApp() {
  const app = express();

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(
    cors({
      origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`Origem nao permitida pelo CORS: ${origin}`));
        }
      },
    }),
  );
  app.use(express.json());
  if (env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }
  app.use(rateLimiter);

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, { customSiteTitle: 'Pokedex API — docs' }));
  app.get('/openapi.json', (_req, res) => res.json(openApiSpec));

  app.use('/api/pokemon', pokemonRouter);
  app.use('/api/favorites', favoritesRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
