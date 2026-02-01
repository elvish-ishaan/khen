import { apiClient } from './client';

export interface CreatePaymentOrderRequest {
  orderId: string;
}

export interface VerifyPaymentRequest {
  orderId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface Payment {
  id: string;
  orderId: string;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  razorpaySignature: string | null;
  amount: number;
  currency: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  method: 'RAZORPAY' | 'CASH_ON_DELIVERY';
  createdAt: string;
  updatedAt: string;
}

export const paymentsApi = {
  createPaymentOrder: (data: CreatePaymentOrderRequest) => {
    return apiClient.post<{
      razorpayOrderId: string;
      amount: number;
      currency: string;
      paymentId: string;
    }>('/payments/create-order', data);
  },

  verifyPayment: (data: VerifyPaymentRequest) => {
    return apiClient.post<{
      orderId: string;
      orderNumber: string;
    }>('/payments/verify', data);
  },

  getPaymentStatus: (orderId: string) => {
    return apiClient.get<{ payment: Payment | null }>(`/payments/${orderId}/status`);
  },
};
