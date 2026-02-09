import { apiClient, type ApiResponse } from './client';

export interface VerifyTokenRequest {
  idToken: string;
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

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
}

export const authApi = {
  verifyToken: (data: VerifyTokenRequest): Promise<ApiResponse<{ user: User }>> => {
    return apiClient.post<{ user: User }>('/auth/verify-token', data);
  },

  logout: (): Promise<ApiResponse> => {
    return apiClient.post('/auth/logout');
  },

  getMe: (): Promise<ApiResponse<{ user: User }>> => {
    return apiClient.get<{ user: User }>('/auth/me');
  },

  updateProfile: (data: UpdateProfileRequest): Promise<ApiResponse<{ user: User }>> => {
    return apiClient.patch<{ user: User }>('/users/profile', data);
  },
};
