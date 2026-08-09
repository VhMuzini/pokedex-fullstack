import { Router } from 'express';
import { favoritesController } from '../controllers/favorites.controller';

export const favoritesRouter = Router();

favoritesRouter.get('/', favoritesController.list);
favoritesRouter.post('/', favoritesController.add);
favoritesRouter.delete('/:id', favoritesController.remove);
