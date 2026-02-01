import { apiClient } from './client';

export interface SubmitDocumentsRequest {
  aadharNumber: string;
  aadharFileUrl: string;
  dlNumber: string;
  dlFileUrl: string;
  vehicleType: string;
  vehicleNumber: string;
}

export interface SubmitBankDetailsRequest {
  accountTitle: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string;
}

export const logisticsOnboardingApi = {
  submitDocuments: async (data: SubmitDocumentsRequest) => {
    return apiClient.post<{ onboardingStatus: string }>(
      '/logistics-onboarding/documents',
      data
    );
  },

  submitBankDetails: async (data: SubmitBankDetailsRequest) => {
    return apiClient.post<{ onboardingStatus: string }>(
      '/logistics-onboarding/bank-details',
      data
    );
  },

  getStatus: async () => {
    return apiClient.get('/logistics-onboarding/status');
  },
};
