import { z } from 'zod';

export const updateRestaurantProfileSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  cuisineType: z.array(z.string()).optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  email: z.string().email().optional(),
  opensAt: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
  closesAt: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
  minOrderAmount: z.number().min(0).optional(),
  deliveryFee: z.number().min(0).optional(),
  estimatedDeliveryTime: z.number().int().min(10).optional(),
  isActive: z.boolean().optional(),
  isAcceptingOrders: z.boolean().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'PENDING',
    'CONFIRMED',
    'PREPARING',
    'READY_FOR_PICKUP',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
  ]),
});

export const toggleAcceptingOrdersSchema = z.object({
  isAcceptingOrders: z.boolean(),
});

export type UpdateRestaurantProfileInput = z.infer<typeof updateRestaurantProfileSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type ToggleAcceptingOrdersInput = z.infer<typeof toggleAcceptingOrdersSchema>;
