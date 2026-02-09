import { apiClient, type ApiResponse } from './client';

export interface RestaurantOwner {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  onboardingStatus: string;
  restaurantId?: string;
  createdAt: string;
}

export interface VerifyTokenRequest {
  idToken: string;
  name?: string;
  email?: string;
}

export const authApi = {
  verifyToken: async (data: VerifyTokenRequest): Promise<ApiResponse<{ owner: RestaurantOwner }>> => {
    return apiClient.post<{ owner: RestaurantOwner }>(
      '/restaurant-auth/verify-token',
      data
    );
  },

  logout: async (): Promise<ApiResponse> => {
    return apiClient.post('/restaurant-auth/logout');
  },

  getMe: async (): Promise<ApiResponse<{ owner: RestaurantOwner }>> => {
    return apiClient.get<{ owner: RestaurantOwner }>('/restaurant-auth/me');
  },
};
