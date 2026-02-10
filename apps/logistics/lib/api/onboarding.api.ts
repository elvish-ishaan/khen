import { apiClient } from './client';

export interface SubmitBankDetailsRequest {
  accountTitle: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string;
}

export const logisticsOnboardingApi = {
  submitDocuments: async (formData: FormData) => {
    return apiClient.post<{ onboardingStatus: string }>(
      '/logistics-onboarding/documents',
      formData
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
