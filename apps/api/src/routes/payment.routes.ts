import { Router } from 'express';
import {
  createPaymentOrderHandler,
  verifyPaymentHandler,
  getPaymentStatusHandler,
} from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All payment routes require authentication
router.use(authenticate);

router.post('/create-order', createPaymentOrderHandler);
router.post('/verify', verifyPaymentHandler);
router.get('/:orderId/status', getPaymentStatusHandler);

export default router;
