'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { onboardingApi } from '@/lib/api/onboarding.api';
import { Stepper } from '@/components/onboarding/stepper';

export default function DocumentsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // File states
  const [fssaiFile, setFssaiFile] = useState<File | null>(null);
  const [panFile, setPanFile] = useState<File | null>(null);
  const [aadharFile, setAadharFile] = useState<File | null>(null);
  const [gstinFile, setGstinFile] = useState<File | null>(null);

  // Document number states
  const [fssaiNumber, setFssaiNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [aadharNumber, setAadharNumber] = useState('');
  const [gstinNumber, setGstinNumber] = useState('');

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

    // Validation
    if (!fssaiFile) {
      setError('FSSAI certificate is required');
      return;
    }
    if (!panFile) {
      setError('PAN card is required');
      return;
    }
    if (!aadharNumber || aadharNumber.length !== 12) {
      setError('Valid 12-digit Aadhar number is required');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();

      // Append files
      if (fssaiFile) formData.append('fssaiCertificate', fssaiFile);
      if (panFile) formData.append('panCard', panFile);
      if (aadharFile) formData.append('aadhar', aadharFile);
      if (gstinFile) formData.append('gstin', gstinFile);

      // Append document numbers
      if (fssaiNumber) formData.append('fssaiNumber', fssaiNumber);
      if (panNumber) formData.append('panNumber', panNumber);
      formData.append('aadharNumber', aadharNumber);
      if (gstinNumber) formData.append('gstinNumber', gstinNumber);

      const response = await onboardingApi.uploadDocuments(formData);

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
    <div>
      <Stepper currentStep={1} />

      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-2">Upload Business Documents</h1>
        <p className="text-gray-600 mb-6">
          Please upload the required documents to verify your restaurant
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* FSSAI Certificate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              FSSAI Certificate <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => handleFileChange(e, setFssaiFile)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
            {fssaiFile && (
              <p className="mt-1 text-sm text-green-600">✓ {fssaiFile.name}</p>
            )}
            <input
              type="text"
              value={fssaiNumber}
              onChange={(e) => setFssaiNumber(e.target.value)}
              placeholder="FSSAI License Number (optional)"
              className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>

          {/* PAN Card */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PAN Card <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => handleFileChange(e, setPanFile)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
            {panFile && (
              <p className="mt-1 text-sm text-green-600">✓ {panFile.name}</p>
            )}
            <input
              type="text"
              value={panNumber}
              onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
              placeholder="PAN Number (optional)"
              maxLength={10}
              className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none uppercase"
            />
          </div>

          {/* Aadhar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aadhar Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={aadharNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setAadharNumber(value);
              }}
              placeholder="123456789012"
              maxLength={12}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              required
            />
            <p className="mt-1 text-xs text-gray-500">Enter 12-digit Aadhar number</p>

            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => handleFileChange(e, setAadharFile)}
              className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {aadharFile && (
              <p className="mt-1 text-sm text-green-600">✓ {aadharFile.name}</p>
            )}
          </div>

          {/* GSTIN (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GSTIN (Optional)
            </label>
            <input
              type="text"
              value={gstinNumber}
              onChange={(e) => setGstinNumber(e.target.value.toUpperCase())}
              placeholder="22AAAAA0000A1Z5"
              maxLength={15}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none uppercase"
            />
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => handleFileChange(e, setGstinFile)}
              className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {gstinFile && (
              <p className="mt-1 text-sm text-green-600">✓ {gstinFile.name}</p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Uploading...' : 'Continue to Bank Details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
