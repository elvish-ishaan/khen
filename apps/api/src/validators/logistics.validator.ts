import { z } from 'zod';

export const updateFcmTokenSchema = z.object({
  fcmToken: z.string().min(10, 'Invalid FCM token'),
});

export const updateLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const acceptOrderSchema = z.object({
  orderId: z.string().cuid(),
});

export const updateDeliveryStatusSchema = z.object({
  status: z.enum(['PICKED_UP', 'IN_TRANSIT', 'DELIVERED']),
});

export const requestWithdrawalSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
});

export const getEarningsSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  vehicleNumber: z.string().optional().or(z.literal('')),
});

export type UpdateFcmTokenInput = z.infer<typeof updateFcmTokenSchema>;
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;
export type AcceptOrderInput = z.infer<typeof acceptOrderSchema>;
export type UpdateDeliveryStatusInput = z.infer<typeof updateDeliveryStatusSchema>;
export type RequestWithdrawalInput = z.infer<typeof requestWithdrawalSchema>;
export type GetEarningsInput = z.infer<typeof getEarningsSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
