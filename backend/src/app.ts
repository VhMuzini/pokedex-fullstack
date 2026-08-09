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

export function createApp() {
  const app = express();

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: env.CORS_ORIGIN }));
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
