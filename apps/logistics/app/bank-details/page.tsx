'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { logisticsOnboardingApi } from '@/lib/api/onboarding.api';

export default function BankDetailsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    accountTitle: '',
    accountNumber: '',
    ifscCode: '',
    branchName: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      setIsLoading(true);
      const response = await logisticsOnboardingApi.submitBankDetails(formData);

      if (response.success) {
        router.push('/pending-review');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit bank details');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Bank Details</h1>
            <p className="mt-2 text-gray-600">
              Enter your bank account details for receiving payments
            </p>
            <div className="mt-4 flex items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center">
                  ✓
                </div>
                <span className="ml-2 text-gray-600">Documents</span>
              </div>
              <div className="mx-4 flex-1 border-t-2 border-green-600"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                  2
                </div>
                <span className="ml-2 font-medium text-blue-600">Bank Details</span>
              </div>
              <div className="mx-4 flex-1 border-t-2 border-gray-300"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center">
                  3
                </div>
                <span className="ml-2 text-gray-600">Review</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Account Holder Name
              </label>
              <input
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter account holder name"
                value={formData.accountTitle}
                onChange={(e) => setFormData({ ...formData, accountTitle: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Account Number
              </label>
              <input
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter bank account number"
                value={formData.accountNumber}
                onChange={(e) =>
                  setFormData({ ...formData, accountNumber: e.target.value.replace(/\D/g, '') })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                IFSC Code
              </label>
              <input
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., SBIN0001234"
                value={formData.ifscCode}
                onChange={(e) =>
                  setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })
                }
                maxLength={11}
              />
              <p className="mt-1 text-xs text-gray-500">
                11-character IFSC code (e.g., SBIN0001234)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Branch Name
              </label>
              <input
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter branch name"
                value={formData.branchName}
                onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Important Information</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>All earnings will be transferred to this account</li>
                      <li>Ensure the account details are correct</li>
                      <li>Account holder name should match your Aadhar card</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Submitting...' : 'Submit for Review'}
            </button>

            <button
              type="button"
              onClick={() => router.back()}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
