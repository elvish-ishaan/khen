import { Router } from 'express';
import {
  getProfileHandler,
  updateProfileHandler,
  getMenuHandler,
  getOrdersHandler,
  getOrderByIdHandler,
  updateOrderStatusHandler,
} from '../controllers/restaurant-manage.controller';
import { authenticateRestaurant } from '../middleware/restaurant-auth';
import { uploadSingle } from '../middleware/upload';
import {
  addCategoryHandler,
  updateCategoryHandler,
  deleteCategoryHandler,
  addMenuItemHandler,
  updateMenuItemHandler,
  deleteMenuItemHandler,
} from '../controllers/onboarding.controller';

const router = Router();

// All restaurant management routes require authentication
router.use(authenticateRestaurant);

// Restaurant profile
router.get('/profile', getProfileHandler);
router.put('/profile', uploadSingle('coverImage'), updateProfileHandler);

// Menu management (reuse onboarding controllers)
router.get('/menu', getMenuHandler);
router.post('/menu/categories', addCategoryHandler);
router.put('/menu/categories/:categoryId', updateCategoryHandler);
router.delete('/menu/categories/:categoryId', deleteCategoryHandler);

router.post('/menu/items', uploadSingle('itemImage'), addMenuItemHandler);
router.put('/menu/items/:itemId', uploadSingle('itemImage'), updateMenuItemHandler);
router.delete('/menu/items/:itemId', deleteMenuItemHandler);

// Order management
router.get('/orders', getOrdersHandler);
router.get('/orders/:orderId', getOrderByIdHandler);
router.put('/orders/:orderId/status', updateOrderStatusHandler);

export default router;
