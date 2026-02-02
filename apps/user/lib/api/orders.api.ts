import { apiClient } from './client';

export interface CreateOrderRequest {
  addressId: string;
  paymentMethod: 'RAZORPAY' | 'CASH_ON_DELIVERY';
  deliveryInstructions?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  restaurantId: string;
  addressId: string;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY_FOR_PICKUP' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'RAZORPAY' | 'CASH_ON_DELIVERY';
  deliveryInstructions?: string;
  estimatedDeliveryTime: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  restaurant?: {
    id: string;
    name: string;
    slug: string;
    phone?: string;
    addressLine1?: string;
    imageUrl?: string | null;
  };
  address?: {
    label: string;
    addressLine1: string;
    addressLine2: string | null;
    landmark: string | null;
    city: string;
    state: string;
    postalCode: string;
  };
  payment?: any;
  review?: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
  };
}

export const ordersApi = {
  getOrders: () => {
    return apiClient.get<{ orders: Order[] }>('/orders');
  },

  getOrderById: (id: string) => {
    return apiClient.get<{ order: Order }>(`/orders/${id}`);
  },

  createOrder: (data: CreateOrderRequest) => {
    return apiClient.post<{ order: Order }>('/orders', data);
  },

  reorder: (orderId: string, addressId?: string) => {
    return apiClient.post(`/orders/${orderId}/reorder`, { addressId });
  },
};
