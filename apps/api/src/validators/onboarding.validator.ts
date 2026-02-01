import { z } from 'zod';

export const uploadDocumentsSchema = z.object({
  fssaiNumber: z.string().optional(),
  panNumber: z.string().optional(),
  aadharNumber: z.string().length(12, 'Aadhar must be 12 digits').optional(),
  gstinNumber: z.string().length(15, 'GSTIN must be 15 characters').optional(),
});

export const bankDetailsSchema = z.object({
  accountTitle: z.string().min(2, 'Account title must be at least 2 characters'),
  accountNumber: z.string().min(8, 'Account number must be at least 8 digits'),
  confirmAccountNumber: z.string(),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code'),
  branchName: z.string().min(2, 'Branch name must be at least 2 characters'),
}).refine((data) => data.accountNumber === data.confirmAccountNumber, {
  message: 'Account numbers do not match',
  path: ['confirmAccountNumber'],
});

export const restaurantInfoSchema = z.object({
  name: z.string().min(2, 'Restaurant name must be at least 2 characters'),
  description: z.string().optional(),
  cuisineType: z.array(z.string()).min(1, 'Select at least one cuisine type'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  email: z.string().email().optional(),
  opensAt: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)'),
  closesAt: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)'),
  minOrderAmount: z.number().min(0).optional(),
  deliveryFee: z.number().min(0).optional(),
  estimatedDeliveryTime: z.number().int().min(10, 'Minimum 10 minutes'),
});

export const addCategorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  description: z.string().optional(),
  sortOrder: z.number().int().default(0),
});

export const updateCategorySchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const addMenuItemSchema = z.object({
  categoryId: z.string().cuid('Invalid category ID'),
  name: z.string().min(2, 'Item name must be at least 2 characters'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  isVeg: z.boolean().default(true),
  isAvailable: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const updateMenuItemSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  isVeg: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const locationSchema = z.object({
  addressLine1: z.string().min(5, 'Address must be at least 5 characters'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City name required'),
  state: z.string().min(2, 'State name required'),
  postalCode: z.string().regex(/^\d{6}$/, 'Postal code must be 6 digits'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export type UploadDocumentsInput = z.infer<typeof uploadDocumentsSchema>;
export type BankDetailsInput = z.infer<typeof bankDetailsSchema>;
export type RestaurantInfoInput = z.infer<typeof restaurantInfoSchema>;
export type AddCategoryInput = z.infer<typeof addCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type AddMenuItemInput = z.infer<typeof addMenuItemSchema>;
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>;
export type LocationInput = z.infer<typeof locationSchema>;
