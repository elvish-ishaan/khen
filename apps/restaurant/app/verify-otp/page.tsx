'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth.api';
import { useAuthStore } from '@/stores/auth-store';

export default function VerifyOtpPage() {
  const router = useRouter();
  const { setOwner } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    // Get phone from sessionStorage
    const storedPhone = sessionStorage.getItem('restaurant_phone');
    if (!storedPhone) {
      router.push('/login');
      return;
    }
    setPhone(storedPhone);

    // Start countdown for resend
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.verifyOtp({
        phone,
        otp,
        name: name || undefined,
        email: email || undefined,
      });

      if (response.success && response.data) {
        // Update auth store
        setOwner(response.data.owner);

        // Clear phone from storage
        sessionStorage.removeItem('restaurant_phone');

        // Redirect based on onboarding status
        const status = response.data.owner.onboardingStatus;

        if (status === 'COMPLETED') {
          router.push('/dashboard');
        } else if (status === 'PENDING_DOCUMENTS') {
          router.push('/documents');
        } else if (status === 'PENDING_BANK_DETAILS') {
          router.push('/bank-details');
        } else if (status === 'PENDING_MENU') {
          router.push('/restaurant-info');
        } else if (status === 'PENDING_LOCATION') {
          router.push('/menu');
        } else {
          router.push('/documents'); // Default to first step
        }
      } else {
        setError(response.error || 'Invalid OTP');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setCanResend(false);
    setCountdown(60);

    try {
      const response = await authApi.sendOtp({ phone });

      if (response.success) {
        // Restart countdown
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              setCanResend(true);
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(response.error || 'Failed to resend OTP');
        setCanResend(true);
      }
    } catch (err) {
      setError('Failed to resend OTP');
      setCanResend(true);
    }
  };

  const handleOtpChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    setOtp(numericValue);
    setError('');
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Verify OTP
        </h1>
        <p className="text-gray-600">
          Enter the 6-digit code sent to
        </p>
        <p className="text-primary-600 font-medium">+91 {phone}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
            OTP
          </label>
          <input
            id="otp"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => handleOtpChange(e.target.value)}
            placeholder="123456"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-widest focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            required
            disabled={isLoading}
            autoFocus
          />
          <p className="mt-1 text-xs text-gray-500 text-center">
            Development Mode: Use 123456
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Name (Optional)
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Restaurant Owner Name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email (Optional)
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@restaurant.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              disabled={isLoading}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || otp.length !== 6}
          className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Verifying...' : 'Verify & Continue'}
        </button>

        <div className="text-center">
          {canResend ? (
            <button
              type="button"
              onClick={handleResendOtp}
              className="text-primary-600 hover:text-primary-700 font-medium text-sm"
            >
              Resend OTP
            </button>
          ) : (
            <p className="text-gray-500 text-sm">
              Resend OTP in {countdown}s
            </p>
          )}
        </div>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => router.push('/login')}
          className="text-gray-600 hover:text-gray-900 text-sm"
        >
          ← Change phone number
        </button>
      </div>
    </div>
  );
}
