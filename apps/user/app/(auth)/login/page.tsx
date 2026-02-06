'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth.api';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Normalize phone number
      const normalizedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;

      const response = await authApi.sendOtp({ phone: normalizedPhone });

      if (response.success) {
        // Store phone in session storage for OTP page
        sessionStorage.setItem('phone', normalizedPhone);
        router.push('/verify-otp');
      } else {
        setError(response.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="inline-block px-6 py-2 bg-yellow-500 rounded-full mb-4">
            <h1 className="text-4xl font-bold text-gray-900">Khen</h1>
          </div>
          <p className="mt-2 text-gray-600">Food delivery made simple</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Login with Phone
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">+91</span>
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  maxLength={10}
                  pattern="[0-9]{10}"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="block w-full pl-14 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="9876543210"
                  disabled={isLoading}
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Enter your 10-digit mobile number
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || phone.length !== 10}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-900 bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Development mode: Use OTP <strong>123456</strong></p>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
