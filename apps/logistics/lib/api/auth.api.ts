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

export interface SendOtpRequest {
  phone: string;
}

export interface VerifyOtpRequest {
  phone: string;
  otp: string;
  name?: string;
  email?: string;
}

export const logisticsAuthApi = {
  sendOtp: async (data: SendOtpRequest): Promise<ApiResponse<{ phone: string; expiresIn: number }>> => {
    return apiClient.post<{ phone: string; expiresIn: number }>(
      '/logistics-auth/send-otp',
      data
    );
  },

  verifyOtp: async (data: VerifyOtpRequest): Promise<ApiResponse<{ personnel: DeliveryPersonnel }>> => {
    return apiClient.post<{ personnel: DeliveryPersonnel }>(
      '/logistics-auth/verify-otp',
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
