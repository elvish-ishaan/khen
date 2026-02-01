import { apiClient } from './client';

export interface SendOtpRequest {
  phone: string;
}

export interface VerifyOtpRequest {
  phone: string;
  otp: string;
  name?: string;
  email?: string;
}

export interface User {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  createdAt: string;
}

export const authApi = {
  sendOtp: (data: SendOtpRequest) => {
    return apiClient.post('/auth/send-otp', data);
  },

  verifyOtp: (data: VerifyOtpRequest) => {
    return apiClient.post<{ user: User }>('/auth/verify-otp', data);
  },

  logout: () => {
    return apiClient.post('/auth/logout');
  },

  getMe: () => {
    return apiClient.get<{ user: User }>('/auth/me');
  },
};
