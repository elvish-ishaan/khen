import { Router } from 'express';
import authRoutes from './auth.routes';
import restaurantRoutes from './restaurant.routes';
import cartRoutes from './cart.routes';
import orderRoutes from './order.routes';
import paymentRoutes from './payment.routes';
import userRoutes from './user.routes';
import addressRoutes from './address.routes';
import reviewRoutes from './review.routes';
import deliveryRoutes from './delivery.routes';
import restaurantAuthRoutes from './restaurant-auth.routes';
import onboardingRoutes from './onboarding.routes';
import restaurantManageRoutes from './restaurant-manage.routes';
import logisticsAuthRoutes from './logistics-auth.routes';
import logisticsOnboardingRoutes from './logistics-onboarding.routes';
import logisticsRoutes from './logistics.routes';
import testRoutes from './test.routes'; // DELETE after debugging

const router = Router();

// User-facing routes
router.use('/auth', authRoutes);
router.use('/restaurants', restaurantRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/users', userRoutes);
router.use('/addresses', addressRoutes);
router.use('/reviews', reviewRoutes);
router.use('/delivery', deliveryRoutes);

// Restaurant-facing routes
router.use('/restaurant-auth', restaurantAuthRoutes);
router.use('/onboarding', onboardingRoutes);
router.use('/restaurant-manage', restaurantManageRoutes);

// Logistics/Delivery partner routes
router.use('/logistics-auth', logisticsAuthRoutes);
router.use('/logistics-onboarding', logisticsOnboardingRoutes);
router.use('/logistics', logisticsRoutes);

// Debug routes - DELETE after debugging
router.use('/test', testRoutes);

export default router;
