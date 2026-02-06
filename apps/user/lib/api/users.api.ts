import { apiClient, type ApiResponse } from './client';
import type { Restaurant } from './restaurants.api';

export interface FavoriteRestaurant {
  id: string;
  userId: string;
  restaurantId: string;
  restaurant: Restaurant;
  createdAt: string;
}

export const usersApi = {
  getFavorites: (): Promise<ApiResponse<{ favorites: FavoriteRestaurant[] }>> => {
    return apiClient.get<{ favorites: FavoriteRestaurant[] }>('/users/favorites');
  },

  addFavorite: (restaurantId: string): Promise<ApiResponse> => {
    return apiClient.post(`/users/favorites/${restaurantId}`);
  },

  removeFavorite: (restaurantId: string): Promise<ApiResponse> => {
    return apiClient.delete(`/users/favorites/${restaurantId}`);
  },

  checkFavorite: (restaurantId: string): Promise<ApiResponse<{ isFavorite: boolean }>> => {
    return apiClient.get<{ isFavorite: boolean }>(`/users/favorites/${restaurantId}/check`);
  },
};
