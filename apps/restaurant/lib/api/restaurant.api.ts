import { apiClient } from './client';

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description?: string;
  cuisineType: string[];
  coverImageUrl?: string;
  phone: string;
  email?: string;
  opensAt: string;
  closesAt: string;
  isActive: boolean;
  isAcceptingOrders: boolean;
  categories?: Category[];
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  items?: MenuItem[];
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isVeg: boolean;
  isAvailable: boolean;
  sortOrder: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  user: {
    id: string;
    name?: string;
    phone: string;
  };
  items: any[];
  address: any;
}

export const restaurantApi = {
  getProfile: async () => {
    return apiClient.get<{ restaurant: Restaurant }>(
      '/restaurant-manage/profile'
    );
  },

  updateProfile: async (formData: FormData) => {
    return apiClient.put<{ restaurant: Restaurant }>(
      '/restaurant-manage/profile',
      formData
    );
  },

  getMenu: async () => {
    return apiClient.get<{ categories: Category[] }>('/restaurant-manage/menu');
  },

  getOrders: async (params?: { status?: string; page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const endpoint = `/restaurant-manage/orders${
      queryParams.toString() ? `?${queryParams}` : ''
    }`;

    return apiClient.get<{
      orders: Order[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(endpoint);
  },

  getOrderById: async (orderId: string) => {
    return apiClient.get<{ order: Order }>(
      `/restaurant-manage/orders/${orderId}`
    );
  },

  updateOrderStatus: async (orderId: string, status: string) => {
    return apiClient.put<{ order: Order }>(
      `/restaurant-manage/orders/${orderId}/status`,
      { status }
    );
  },

  toggleAcceptingOrders: async (isAcceptingOrders: boolean) => {
    return apiClient.patch<{ restaurant: Restaurant; message: string }>(
      '/restaurant-manage/orders/toggle',
      { isAcceptingOrders }
    );
  },

  registerFcmToken: async (fcmToken: string) => {
    console.log('📤 [API] Registering FCM token...');
    console.log('📱 [API] Token (first 20 chars):', fcmToken.substring(0, 20) + '...');

    const response = await apiClient.post<{ message: string }>(
      '/restaurant-manage/fcm-token',
      { fcmToken }
    );

    console.log('✅ [API] FCM token registration response:', response);
    return response;
  },

  testPushNotification: async () => {
    console.log('🧪 [API] Testing push notification...');

    const response = await apiClient.post<{
      message: string;
      data: { messageId: string; timestamp: string };
    }>('/restaurant-manage/test-notification');

    console.log('✅ [API] Test notification response:', response);
    return response;
  },
};
