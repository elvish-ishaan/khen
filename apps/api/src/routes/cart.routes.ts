import { Router } from 'express';
import {
  getCartHandler,
  addToCartHandler,
  updateCartItemHandler,
  removeCartItemHandler,
  clearCartHandler,
} from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All cart routes require authentication
router.use(authenticate);

router.get('/', getCartHandler);
router.post('/items', addToCartHandler);
router.patch('/items/:itemId', updateCartItemHandler);
router.delete('/items/:itemId', removeCartItemHandler);
router.delete('/', clearCartHandler);

export default router;
