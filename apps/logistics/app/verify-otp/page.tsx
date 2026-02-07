'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState('');
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone') || '';
  const router = useRouter();
  const { verifyOtp, personnel, isLoading, error } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await verifyOtp(phone, otp);

      // After successful verification, redirect based on onboarding status
      // The personnel state is updated by verifyOtp, so we need to wait a bit for it to update
      setTimeout(() => {
        const personnelData = useAuthStore.getState().personnel;

        if (!personnelData) {
          // Fallback: if personnel is still null, redirect to documents
          router.push('/documents');
          return;
        }

        const status = personnelData.onboardingStatus;

        // Redirect based on onboarding status
        if (!status || status === 'NOT_STARTED') {
          // New user - start onboarding
          router.push('/documents');
        } else if (status === 'PENDING') {
          // Under review - show pending page
          router.push('/pending-review');
        } else if (status === 'APPROVED') {
          // Approved - go to dashboard
          router.push('/dashboard');
        } else {
          // Default fallback
          router.push('/documents');
        }
      }, 100);
    } catch (error) {
      console.error('Failed to verify OTP:', error);
    }
  };

  useEffect(() => {
    if (!phone) {
      router.push('/login');
    }
  }, [phone, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8 p-6 sm:p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="text-center text-2xl sm:text-3xl font-bold text-gray-900">
            Verify OTP
          </h2>
          <p className="mt-2 text-center text-xs sm:text-sm text-gray-600">
            Enter the 6-digit code sent to {phone}
          </p>
        </div>

        <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
              OTP
            </label>
            <input
              id="otp"
              name="otp"
              type="text"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-center text-xl sm:text-2xl tracking-widest"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              maxLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.length !== 6}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </button>

          <div className="text-center">
            <button
              type="button"
              className="text-sm text-primary hover:text-primary/80"
              onClick={() => router.push('/login')}
            >
              Change phone number
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
