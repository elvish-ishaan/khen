import { Router } from 'express';
import {
  getProfileHandler,
  updateProfileHandler,
  getMenuHandler,
  getOrdersHandler,
  getOrderByIdHandler,
  updateOrderStatusHandler,
  toggleAcceptingOrdersHandler,
  registerFcmTokenHandler,
  testPushNotificationHandler,
} from '../controllers/restaurant-manage.controller';
import { authenticateRestaurant } from '../middleware/restaurant-auth';
import { uploadSingle, processAndUploadToGcs } from '../middleware/upload';
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
router.put(
  '/profile',
  uploadSingle('coverImage'),
  processAndUploadToGcs('restaurants', { isPublic: true, optimize: true }),
  updateProfileHandler
);
router.patch('/orders/toggle', toggleAcceptingOrdersHandler);

// Menu management (reuse onboarding controllers)
router.get('/menu', getMenuHandler);
router.post('/menu/categories', addCategoryHandler);
router.put('/menu/categories/:categoryId', updateCategoryHandler);
router.delete('/menu/categories/:categoryId', deleteCategoryHandler);

router.post(
  '/menu/items',
  uploadSingle('itemImage'),
  processAndUploadToGcs('menu-items', { isPublic: true, optimize: true }),
  addMenuItemHandler
);
router.put(
  '/menu/items/:itemId',
  uploadSingle('itemImage'),
  processAndUploadToGcs('menu-items', { isPublic: true, optimize: true }),
  updateMenuItemHandler
);
router.delete('/menu/items/:itemId', deleteMenuItemHandler);

// Order management
router.get('/orders', getOrdersHandler);
router.get('/orders/:orderId', getOrderByIdHandler);
router.put('/orders/:orderId/status', updateOrderStatusHandler);

// FCM token registration
router.post('/fcm-token', registerFcmTokenHandler);

// Test push notification (for debugging)
router.post('/test-notification', testPushNotificationHandler);

export default router;
