import { apiClient } from './client';

export interface RestaurantOwner {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  onboardingStatus: string;
  restaurantId?: string;
  createdAt: string;
}

export interface SendOtpRequest {
  phone: string;
}

export interface VerifyOtpRequest {
  phone: string;
  otp: string;
  name?: string;
  email?: string;
}

export const authApi = {
  sendOtp: async (data: SendOtpRequest) => {
    return apiClient.post<{ phone: string; expiresIn: number }>(
      '/restaurant-auth/send-otp',
      data
    );
  },

  verifyOtp: async (data: VerifyOtpRequest) => {
    return apiClient.post<{ owner: RestaurantOwner }>(
      '/restaurant-auth/verify-otp',
      data
    );
  },

  logout: async () => {
    return apiClient.post('/restaurant-auth/logout');
  },

  getMe: async () => {
    return apiClient.get<{ owner: RestaurantOwner }>('/restaurant-auth/me');
  },
};
