import { apiClient } from './client';

export interface OnboardingStatus {
  onboardingStatus: string;
  hasDocuments: boolean;
  hasBankDetails: boolean;
  hasRestaurant: boolean;
  hasMenu: boolean;
  restaurant?: any;
}

export interface BankDetailsRequest {
  accountTitle: string;
  accountNumber: string;
  confirmAccountNumber: string;
  ifscCode: string;
  branchName: string;
}

export interface RestaurantInfoRequest {
  name: string;
  description?: string;
  cuisineType: string[];
  phone: string;
  email?: string;
  opensAt: string;
  closesAt: string;
  minOrderAmount?: number;
  deliveryFee?: number;
  estimatedDeliveryTime: number;
}

export interface CategoryRequest {
  name: string;
  description?: string;
  sortOrder?: number;
}

export interface MenuItemRequest {
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  isVeg?: boolean;
  isAvailable?: boolean;
  sortOrder?: number;
}

export interface LocationRequest {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  latitude: number;
  longitude: number;
}

export const onboardingApi = {
  getStatus: async () => {
    return apiClient.get<OnboardingStatus>('/onboarding/status');
  },

  uploadDocuments: async (formData: FormData) => {
    return apiClient.post('/onboarding/documents', formData);
  },

  submitBankDetails: async (data: BankDetailsRequest) => {
    return apiClient.post('/onboarding/bank-details', data);
  },

  createRestaurant: async (formData: FormData) => {
    return apiClient.post('/onboarding/restaurant', formData);
  },

  addCategory: async (data: CategoryRequest) => {
    return apiClient.post('/onboarding/menu/categories', data);
  },

  updateCategory: async (categoryId: string, data: Partial<CategoryRequest>) => {
    return apiClient.put(`/onboarding/menu/categories/${categoryId}`, data);
  },

  deleteCategory: async (categoryId: string) => {
    return apiClient.delete(`/onboarding/menu/categories/${categoryId}`);
  },

  addMenuItem: async (formData: FormData) => {
    return apiClient.post('/onboarding/menu/items', formData);
  },

  updateMenuItem: async (itemId: string, formData: FormData) => {
    return apiClient.put(`/onboarding/menu/items/${itemId}`, formData);
  },

  deleteMenuItem: async (itemId: string) => {
    return apiClient.delete(`/onboarding/menu/items/${itemId}`);
  },

  updateLocation: async (data: LocationRequest) => {
    return apiClient.put('/onboarding/location', data);
  },

  completeOnboarding: async () => {
    return apiClient.post('/onboarding/complete');
  },
};
