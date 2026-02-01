'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { logisticsOnboardingApi } from '@/lib/api/onboarding.api';

export default function DocumentsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    aadharNumber: '',
    aadharFileUrl: '',
    dlNumber: '',
    dlFileUrl: '',
    vehicleType: '',
    vehicleNumber: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      setIsLoading(true);
      const response = await logisticsOnboardingApi.submitDocuments(formData);

      if (response.success) {
        router.push('/bank-details');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit documents');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Document Verification</h1>
            <p className="mt-2 text-gray-600">
              Please provide your Aadhar card, driving license, and vehicle details
            </p>
            <div className="mt-4 flex items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                  1
                </div>
                <span className="ml-2 font-medium text-blue-600">Documents</span>
              </div>
              <div className="mx-4 flex-1 border-t-2 border-gray-300"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center">
                  2
                </div>
                <span className="ml-2 text-gray-600">Bank Details</span>
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

            {/* Aadhar Card */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Aadhar Card</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Aadhar Number
                  </label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter 12-digit Aadhar number"
                    value={formData.aadharNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, aadharNumber: e.target.value.replace(/\D/g, '') })
                    }
                    maxLength={12}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Aadhar Card Image URL
                  </label>
                  <input
                    type="url"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/aadhar.jpg"
                    value={formData.aadharFileUrl}
                    onChange={(e) => setFormData({ ...formData, aadharFileUrl: e.target.value })}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    For demo: Use any image URL (e.g., https://via.placeholder.com/400x200)
                  </p>
                </div>
              </div>
            </div>

            {/* Driving License */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Driving License</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    DL Number
                  </label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter driving license number"
                    value={formData.dlNumber}
                    onChange={(e) => setFormData({ ...formData, dlNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    DL Image URL
                  </label>
                  <input
                    type="url"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/dl.jpg"
                    value={formData.dlFileUrl}
                    onChange={(e) => setFormData({ ...formData, dlFileUrl: e.target.value })}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    For demo: Use any image URL (e.g., https://via.placeholder.com/400x200)
                  </p>
                </div>
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Vehicle Type
                  </label>
                  <select
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                  >
                    <option value="">Select vehicle type</option>
                    <option value="Bike">Bike</option>
                    <option value="Scooter">Scooter</option>
                    <option value="Car">Car</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Vehicle Number
                  </label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., MH01AB1234"
                    value={formData.vehicleNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })
                    }
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Submitting...' : 'Continue to Bank Details'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
