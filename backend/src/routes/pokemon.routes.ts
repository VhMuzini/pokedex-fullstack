import { Router } from 'express';
import { pokemonController } from '../controllers/pokemon.controller';

export const pokemonRouter = Router();

pokemonRouter.get('/health', pokemonController.health);
pokemonRouter.get('/types', pokemonController.types);
pokemonRouter.get('/', pokemonController.list);
pokemonRouter.get('/:idOrName', pokemonController.detail);
