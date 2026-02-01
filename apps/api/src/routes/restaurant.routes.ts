import { Router } from 'express';
import {
  getRestaurantsHandler,
  searchRestaurantsHandler,
  getRestaurantBySlugHandler,
  getRestaurantMenuHandler,
} from '../controllers/restaurant.controller';

const router = Router();

router.get('/', getRestaurantsHandler);
router.get('/search', searchRestaurantsHandler);
router.get('/:slug', getRestaurantBySlugHandler);
router.get('/:slug/menu', getRestaurantMenuHandler);

export default router;
