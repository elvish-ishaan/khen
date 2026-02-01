import { Router } from 'express';
import {
  getProfileHandler,
  updateProfileHandler,
  getFavoritesHandler,
  addFavoriteHandler,
  removeFavoriteHandler,
} from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All user routes require authentication
router.use(authenticate);

router.get('/profile', getProfileHandler);
router.patch('/profile', updateProfileHandler);
router.get('/favorites', getFavoritesHandler);
router.post('/favorites/:restaurantId', addFavoriteHandler);
router.delete('/favorites/:restaurantId', removeFavoriteHandler);

export default router;
