'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { logisticsOnboardingApi } from '@/lib/api/onboarding.api';
import { validators, errorMessages } from '@/lib/validators';

export default function DocumentsPage() {
  const router = useRouter();
  const [aadharFile, setAadharFile] = useState<File | null>(null);
  const [dlFile, setDlFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    aadharNumber: '',
    dlNumber: '',
    vehicleType: '',
    vehicleNumber: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (file: File | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('File must be JPG, PNG, WEBP, or PDF');
        return;
      }

      setter(file);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate files are selected
    if (!aadharFile) {
      setError('Aadhar card image is required');
      return;
    }
    if (!dlFile) {
      setError('Driving license image is required');
      return;
    }

    // Validate Aadhar number
    if (!validators.aadhar(formData.aadharNumber)) {
      setError(errorMessages.aadhar);
      return;
    }

    // Validate DL number
    if (!validators.dlNumber(formData.dlNumber)) {
      setError(errorMessages.dlNumber);
      return;
    }

    // Validate vehicle type
    if (!formData.vehicleType || formData.vehicleType === '') {
      setError('Please select a vehicle type');
      return;
    }

    // Validate vehicle number
    if (!validators.vehicleNumber(formData.vehicleNumber)) {
      setError(errorMessages.vehicleNumber);
      return;
    }

    setIsLoading(true);

    try {
      // Create FormData
      const formDataToSend = new FormData();

      // Append files
      formDataToSend.append('aadharFile', aadharFile);
      formDataToSend.append('dlFile', dlFile);

      // Append text fields
      formDataToSend.append('aadharNumber', formData.aadharNumber);
      formDataToSend.append('dlNumber', formData.dlNumber);
      formDataToSend.append('vehicleType', formData.vehicleType);
      formDataToSend.append('vehicleNumber', formData.vehicleNumber);

      const response = await logisticsOnboardingApi.submitDocuments(formDataToSend);

      if (response.success) {
        router.push('/bank-details');
      } else {
        setError(response.error || 'Failed to upload documents');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Document Verification</h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              Please provide your Aadhar card, driving license, and vehicle details
            </p>
            <div className="mt-4 hidden sm:flex items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                  1
                </div>
                <span className="ml-2 font-medium text-primary">Documents</span>
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

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
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
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="Enter 12-digit Aadhar number"
                    value={formData.aadharNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, aadharNumber: e.target.value.replace(/\D/g, '') })
                    }
                    maxLength={12}
                  />
                  <p className="mt-1 text-xs text-gray-500">Enter 12-digit Aadhar number</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Aadhar Card Image <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e, setAadharFile)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    required
                  />
                  {aadharFile && (
                    <p className="mt-1 text-sm text-green-600">✓ {aadharFile.name}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Upload JPG, PNG, WEBP, or PDF (max 5MB)
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
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="e.g., DL0120190012345"
                    value={formData.dlNumber}
                    onChange={(e) => setFormData({ ...formData, dlNumber: e.target.value.toUpperCase() })}
                  />
                  <p className="mt-1 text-xs text-gray-500">Format: DL0120190012345</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    DL Image <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e, setDlFile)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    required
                  />
                  {dlFile && (
                    <p className="mt-1 text-sm text-green-600">✓ {dlFile.name}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Upload JPG, PNG, WEBP, or PDF (max 5MB)
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
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
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
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
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
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Submitting...' : 'Continue to Bank Details'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
