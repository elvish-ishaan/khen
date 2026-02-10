import { Router } from 'express';
import {
  startDutyHandler,
  endDutyHandler,
  updateFcmTokenHandler,
  getProfileHandler,
  updateProfileHandler,
} from '../controllers/logistics.controller';
import {
  updateLocationHandler,
  getLocationHistoryHandler,
} from '../controllers/logistics-location.controller';
import {
  getAvailableOrdersHandler,
  acceptOrderHandler,
  markPickedUpHandler,
  markDeliveredHandler,
  getActiveDeliveriesHandler,
  getDeliveryHistoryHandler,
} from '../controllers/logistics-delivery.controller';
import {
  getEarningsHandler,
  requestWithdrawalHandler,
  getWithdrawalsHandler,
} from '../controllers/logistics-earnings.controller';
import { getDashboardStatsHandler } from '../controllers/logistics-analytics.controller';
import { authenticateLogistics } from '../middleware/logistics-auth';

const router = Router();

// All routes require authentication
router.use(authenticateLogistics);

// Profile routes
router.get('/profile', getProfileHandler);
router.put('/profile', updateProfileHandler);

// Duty management routes
router.post('/duty/start', startDutyHandler);
router.post('/duty/end', endDutyHandler);

// FCM token route
router.post('/fcm-token', updateFcmTokenHandler);

// Location routes
router.post('/location', updateLocationHandler);
router.get('/location/history', getLocationHistoryHandler);

// Order routes
router.get('/orders/available', getAvailableOrdersHandler);
router.post('/orders/accept', acceptOrderHandler);

// Delivery routes
router.get('/deliveries/active', getActiveDeliveriesHandler);
router.get('/deliveries/history', getDeliveryHistoryHandler);
router.post('/deliveries/:id/pickup', markPickedUpHandler);
router.post('/deliveries/:id/deliver', markDeliveredHandler);

// Earnings routes
router.get('/earnings', getEarningsHandler);
router.post('/withdrawals/request', requestWithdrawalHandler);
router.get('/withdrawals', getWithdrawalsHandler);

// Analytics routes
router.get('/analytics/dashboard', getDashboardStatsHandler);

export default router;
