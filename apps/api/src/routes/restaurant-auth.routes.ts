import { Router } from 'express';
import {
  verifyFirebaseTokenHandler,
  logoutHandler,
  getMeHandler,
} from '../controllers/restaurant-auth.controller';
import { authenticateRestaurant } from '../middleware/restaurant-auth';

const router = Router();

router.post('/verify-token', verifyFirebaseTokenHandler);
router.post('/logout', authenticateRestaurant, logoutHandler);
router.get('/me', authenticateRestaurant, getMeHandler);

export default router;
