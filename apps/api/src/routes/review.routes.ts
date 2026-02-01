import { Router } from 'express';
import {
  createReviewHandler,
  getRestaurantReviewsHandler,
} from '../controllers/review.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, createReviewHandler);
router.get('/restaurant/:restaurantId', getRestaurantReviewsHandler);

export default router;
