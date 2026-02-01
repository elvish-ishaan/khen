import { apiClient } from './client';

export interface Address {
  id: string;
  userId: string;
  label: string;
  addressLine1: string;
  addressLine2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  postalCode: string;
  latitude: number | null;
  longitude: number | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressRequest {
  label: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

export interface UpdateAddressRequest extends Partial<CreateAddressRequest> {}

export const addressesApi = {
  getAddresses: () => {
    return apiClient.get<{ addresses: Address[] }>('/addresses');
  },

  createAddress: (data: CreateAddressRequest) => {
    return apiClient.post<{ address: Address }>('/addresses', data);
  },

  updateAddress: (id: string, data: UpdateAddressRequest) => {
    return apiClient.patch<{ address: Address }>(`/addresses/${id}`, data);
  },

  deleteAddress: (id: string) => {
    return apiClient.delete(`/addresses/${id}`);
  },

  setDefaultAddress: (id: string) => {
    return apiClient.post<{ address: Address }>(`/addresses/${id}/default`);
  },
};
