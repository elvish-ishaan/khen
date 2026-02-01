import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    phone: string;
  };
}

export interface RestaurantAuthenticatedRequest extends Request {
  owner?: {
    id: string;
    phone: string;
    restaurantId?: string;
  };
}

export interface LogisticsAuthenticatedRequest extends Request {
  personnel?: {
    id: string;
    phone: string;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface LocationParams {
  latitude?: number;
  longitude?: number;
  radius?: number; // in kilometers
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface RazorpayOrderOptions {
  amount: number;
  currency: string;
  receipt: string;
}

export interface RazorpayVerifyPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}
