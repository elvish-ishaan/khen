import { apiClient } from './client';

export interface Restaurant {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  cuisineType: string[];
  imageUrl: string | null;
  coverImageUrl?: string | null;
  rating: number;
  totalReviews: number;
  totalCompletedOrders: number;
  latitude: number;
  longitude: number;
  isAcceptingOrders: boolean;
  distance?: number;
  // Legacy fields (removed from new restaurants)
  minOrderAmount?: number;
  deliveryFee?: number;
  estimatedDeliveryTime?: number;
  opensAt?: string;
  closesAt?: string;
}

export interface RestaurantListParams {
  latitude?: number;
  longitude?: number;
  cuisine?: string;
  minRating?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isVeg: boolean;
  isAvailable: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  items: MenuItem[];
}

export interface RestaurantDetail extends Restaurant {
  categories: Category[];
  coverImageUrl?: string
}

export const restaurantsApi = {
  getRestaurants: (params: RestaurantListParams = {}) => {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });

    return apiClient.get<{
      restaurants: Restaurant[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`/restaurants?${queryParams}`);
  },

  searchRestaurants: (query: string, latitude?: number, longitude?: number) => {
    const params = new URLSearchParams({ q: query });
    if (latitude) params.append('latitude', String(latitude));
    if (longitude) params.append('longitude', String(longitude));

    return apiClient.get<{ restaurants: Restaurant[]; query: string }>(
      `/restaurants/search?${params}`
    );
  },

  getRestaurantBySlug: (slug: string) => {
    return apiClient.get<{ restaurant: RestaurantDetail }>(`/restaurants/${slug}`);
  },

  getRestaurantMenu: (slug: string) => {
    return apiClient.get<{
      restaurantId: string;
      restaurantName: string;
      categories: Category[];
    }>(`/restaurants/${slug}/menu`);
  },
};
