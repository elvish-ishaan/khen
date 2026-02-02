import { apiClient } from './client';

export interface UpdateLocationRequest {
  latitude: number;
  longitude: number;
}

export interface AcceptOrderRequest {
  orderId: string;
}

export interface RequestWithdrawalRequest {
  amount: number;
}

export interface DeliveryUser {
  id: string;
  phone: string;
  name: string | null;
}

export const logisticsApi = {
  // Duty management
  startDuty: async () => {
    return apiClient.post('/logistics/duty/start');
  },

  endDuty: async () => {
    return apiClient.post('/logistics/duty/end');
  },

  // FCM token
  updateFcmToken: async (fcmToken: string) => {
    return apiClient.post('/logistics/fcm-token', { fcmToken });
  },

  // Location
  updateLocation: async (data: UpdateLocationRequest) => {
    return apiClient.post('/logistics/location', data);
  },

  getLocationHistory: async (limit?: number) => {
    return apiClient.get(`/logistics/location/history${limit ? `?limit=${limit}` : ''}`);
  },

  // Orders
  getAvailableOrders: async () => {
    return apiClient.get('/logistics/orders/available');
  },

  acceptOrder: async (data: AcceptOrderRequest) => {
    return apiClient.post('/logistics/orders/accept', data);
  },

  // Deliveries
  getActiveDeliveries: async () => {
    return apiClient.get('/logistics/deliveries/active');
  },

  getDeliveryHistory: async (page = 1, limit = 20) => {
    return apiClient.get(`/logistics/deliveries/history?page=${page}&limit=${limit}`);
  },

  markPickedUp: async (deliveryId: string) => {
    return apiClient.post(`/logistics/deliveries/${deliveryId}/pickup`);
  },

  markDelivered: async (deliveryId: string) => {
    return apiClient.post(`/logistics/deliveries/${deliveryId}/deliver`);
  },

  // Earnings
  getEarnings: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return apiClient.get(`/logistics/earnings?${params.toString()}`);
  },

  // Withdrawals
  requestWithdrawal: async (data: RequestWithdrawalRequest) => {
    return apiClient.post('/logistics/withdrawals/request', data);
  },

  getWithdrawals: async (page = 1, limit = 20) => {
    return apiClient.get(`/logistics/withdrawals?page=${page}&limit=${limit}`);
  },

  // Analytics
  getDashboardStats: async () => {
    return apiClient.get('/logistics/analytics/dashboard');
  },

  // Profile
  getProfile: async () => {
    return apiClient.get('/logistics/profile');
  },
};
