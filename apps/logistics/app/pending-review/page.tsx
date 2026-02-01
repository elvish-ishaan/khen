'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { logisticsOnboardingApi } from '@/lib/api/onboarding.api';

export default function PendingReviewPage() {
  const router = useRouter();
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const response = await logisticsOnboardingApi.getStatus();
      if (response.success && response.data) {
        setStatus(response.data.personnel);
      }
    } catch (error) {
      console.error('Failed to load status:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Application Under Review</h1>
            <p className="mt-2 text-gray-600">
              Your application is being reviewed by our team
            </p>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center mb-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center">
                  ✓
                </div>
                <span className="ml-2 text-gray-600">Documents</span>
              </div>
              <div className="mx-4 flex-1 border-t-2 border-green-600"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center">
                  ✓
                </div>
                <span className="ml-2 text-gray-600">Bank Details</span>
              </div>
              <div className="mx-4 flex-1 border-t-2 border-green-600"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center">
                  ⏱
                </div>
                <span className="ml-2 font-medium text-yellow-600">Review</span>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">What happens next?</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Our team will verify your documents within 24-48 hours</li>
                      <li>We'll verify your Aadhar card and driving license</li>
                      <li>Bank account details will be validated</li>
                      <li>You'll receive a notification once approved</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {status && (
              <div className="bg-gray-50 rounded-md p-4 mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Submitted Information</h3>
                <dl className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-600">Vehicle Type:</dt>
                    <dd className="font-medium text-gray-900">{status.vehicleType || 'N/A'}</dd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-600">Vehicle Number:</dt>
                    <dd className="font-medium text-gray-900">{status.vehicleNumber || 'N/A'}</dd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-600">Documents Verified:</dt>
                    <dd className="font-medium text-gray-900">
                      {status.documents?.filter((d: any) => d.verified).length || 0} / {status.documents?.length || 0}
                    </dd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-600">Bank Details Verified:</dt>
                    <dd className="font-medium text-gray-900">
                      {status.bankDetails?.verified ? 'Yes' : 'Pending'}
                    </dd>
                  </div>
                </dl>
              </div>
            )}

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
                  <h3 className="text-sm font-medium text-blue-800">Need Help?</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      If you have any questions or need to update your information, please contact
                      our support team.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push('/dashboard')}
              className="mt-6 w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
