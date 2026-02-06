'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { onboardingApi } from '@/lib/api/onboarding.api';
import { Stepper } from '@/components/onboarding/stepper';

export default function BankDetailsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    accountTitle: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    branchName: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.accountNumber !== formData.confirmAccountNumber) {
      setError('Account numbers do not match');
      return;
    }

    // IFSC code validation (XXXXYYYYYY format)
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(formData.ifscCode)) {
      setError('Invalid IFSC code format');
      return;
    }

    setIsLoading(true);

    try {
      const response = await onboardingApi.submitBankDetails(formData);

      if (response.success) {
        router.push('/restaurant-info');
      } else {
        setError(response.error || 'Failed to save bank details');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Stepper currentStep={2} />

        <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-2">Bank Account Details</h1>
        <p className="text-gray-600 mb-6">
          Enter your bank account information for receiving payments
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="accountTitle" className="block text-sm font-medium text-gray-700 mb-2">
              Account Holder Name <span className="text-red-500">*</span>
            </label>
            <input
              id="accountTitle"
              type="text"
              value={formData.accountTitle}
              onChange={(e) => handleChange('accountTitle', e.target.value)}
              placeholder="Full name as per bank records"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Account Number <span className="text-red-500">*</span>
            </label>
            <input
              id="accountNumber"
              type="text"
              inputMode="numeric"
              value={formData.accountNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                handleChange('accountNumber', value);
              }}
              placeholder="Enter account number"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmAccountNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Account Number <span className="text-red-500">*</span>
            </label>
            <input
              id="confirmAccountNumber"
              type="text"
              inputMode="numeric"
              value={formData.confirmAccountNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                handleChange('confirmAccountNumber', value);
              }}
              placeholder="Re-enter account number"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
              required
            />
            {formData.confirmAccountNumber && formData.accountNumber !== formData.confirmAccountNumber && (
              <p className="mt-1 text-sm text-red-600">Account numbers do not match</p>
            )}
            {formData.confirmAccountNumber && formData.accountNumber === formData.confirmAccountNumber && (
              <p className="mt-1 text-sm text-green-600">✓ Account numbers match</p>
            )}
          </div>

          <div>
            <label htmlFor="ifscCode" className="block text-sm font-medium text-gray-700 mb-2">
              IFSC Code <span className="text-red-500">*</span>
            </label>
            <input
              id="ifscCode"
              type="text"
              value={formData.ifscCode}
              onChange={(e) => handleChange('ifscCode', e.target.value.toUpperCase())}
              placeholder="SBIN0001234"
              maxLength={11}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none uppercase"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              11-character code (e.g., SBIN0001234)
            </p>
          </div>

          <div>
            <label htmlFor="branchName" className="block text-sm font-medium text-gray-700 mb-2">
              Branch Name <span className="text-red-500">*</span>
            </label>
            <input
              id="branchName"
              type="text"
              value={formData.branchName}
              onChange={(e) => handleChange('branchName', e.target.value)}
              placeholder="Enter branch name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => router.push('/documents')}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              ← Back
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-yellow-500 text-gray-900 py-3 px-6 rounded-lg font-medium hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Saving...' : 'Continue to Restaurant Info'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
