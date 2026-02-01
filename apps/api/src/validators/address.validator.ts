import { z } from 'zod';

export const createAddressSchema = z.object({
  label: z.string().min(1),
  addressLine1: z.string().min(5),
  addressLine2: z.string().optional(),
  landmark: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().regex(/^\d{6}$/, 'Invalid postal code'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  isDefault: z.boolean().default(false),
});

export const updateAddressSchema = z.object({
  label: z.string().min(1).optional(),
  addressLine1: z.string().min(5).optional(),
  addressLine2: z.string().optional(),
  landmark: z.string().optional(),
  city: z.string().min(2).optional(),
  state: z.string().min(2).optional(),
  postalCode: z.string().regex(/^\d{6}$/, 'Invalid postal code').optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  isDefault: z.boolean().optional(),
});

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
