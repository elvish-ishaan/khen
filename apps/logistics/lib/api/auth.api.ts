import { apiClient } from './client';

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
  sendOtp: async (data: SendOtpRequest) => {
    return apiClient.post<{ phone: string; expiresIn: number }>(
      '/logistics-auth/send-otp',
      data
    );
  },

  verifyOtp: async (data: VerifyOtpRequest) => {
    return apiClient.post<{ personnel: DeliveryPersonnel }>(
      '/logistics-auth/verify-otp',
      data
    );
  },

  logout: async () => {
    return apiClient.post('/logistics-auth/logout');
  },

  getMe: async () => {
    return apiClient.get<{ personnel: DeliveryPersonnel }>('/logistics-auth/me');
  },
};
