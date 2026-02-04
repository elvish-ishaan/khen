import { apiClient, type ApiResponse } from './client';

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
  sendOtp: (data: SendOtpRequest): Promise<ApiResponse> => {
    return apiClient.post('/auth/send-otp', data);
  },

  verifyOtp: (data: VerifyOtpRequest): Promise<ApiResponse<{ user: User }>> => {
    return apiClient.post<{ user: User }>('/auth/verify-otp', data);
  },

  logout: (): Promise<ApiResponse> => {
    return apiClient.post('/auth/logout');
  },

  getMe: (): Promise<ApiResponse<{ user: User }>> => {
    return apiClient.get<{ user: User }>('/auth/me');
  },
};
