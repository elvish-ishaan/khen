import { apiClient, type ApiResponse } from './client';

export interface DeliveryPersonnel {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  onboardingStatus: string;
  vehicleType?: string;
  vehicleNumber?: string;
  isOnDuty: boolean;
}

export interface VerifyTokenRequest {
  idToken: string;
  name?: string;
  email?: string;
}

export const logisticsAuthApi = {
  verifyToken: async (data: VerifyTokenRequest): Promise<ApiResponse<{ personnel: DeliveryPersonnel }>> => {
    return apiClient.post<{ personnel: DeliveryPersonnel }>(
      '/logistics-auth/verify-token',
      data
    );
  },

  logout: async (): Promise<ApiResponse> => {
    return apiClient.post('/logistics-auth/logout');
  },

  getMe: async (): Promise<ApiResponse<{ personnel: DeliveryPersonnel }>> => {
    return apiClient.get<{ personnel: DeliveryPersonnel }>('/logistics-auth/me');
  },
};
