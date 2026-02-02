import { Router } from 'express';
import { calculateDeliveryFeeHandler } from '../controllers/delivery.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// POST /api/delivery/calculate-fee
router.post('/calculate-fee', authenticate, calculateDeliveryFeeHandler);

export default router;
