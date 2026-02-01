import { z } from 'zod';

export const restaurantListSchema = z.object({
  latitude: z.string().optional().transform((val) => val ? parseFloat(val) : undefined),
  longitude: z.string().optional().transform((val) => val ? parseFloat(val) : undefined),
  cuisine: z.string().optional(),
  minRating: z.string().optional().transform((val) => val ? parseFloat(val) : undefined),
  search: z.string().optional(),
  page: z.string().optional().transform((val) => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform((val) => val ? parseInt(val, 10) : 20),
});

export const restaurantSearchSchema = z.object({
  q: z.string().min(1, 'Search query is required'),
  latitude: z.string().optional().transform((val) => val ? parseFloat(val) : undefined),
  longitude: z.string().optional().transform((val) => val ? parseFloat(val) : undefined),
});

export type RestaurantListInput = z.infer<typeof restaurantListSchema>;
export type RestaurantSearchInput = z.infer<typeof restaurantSearchSchema>;
