import { Router } from 'express';
import {
  getOrdersHandler,
  getOrderByIdHandler,
  createOrderHandler,
  reorderHandler,
} from '../controllers/order.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All order routes require authentication
router.use(authenticate);

router.get('/', getOrdersHandler);
router.post('/', createOrderHandler);
router.get('/:id', getOrderByIdHandler);
router.post('/:id/reorder', reorderHandler);

export default router;
