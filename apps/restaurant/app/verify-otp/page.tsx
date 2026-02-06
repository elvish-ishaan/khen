'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth.api';
import { useAuthStore } from '@/stores/auth-store';

export default function VerifyOtpPage() {
  const router = useRouter();
  const { setOwner } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every((digit) => digit !== '') && index === 5) {
      handleSubmit(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
    setOtp(newOtp.slice(0, 6));

    if (pastedData.length === 6) {
      handleSubmit(pastedData);
    }
  };

  const handleSubmit = async (otpValue?: string) => {
    const otpCode = otpValue || otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await authApi.verifyOtp({
        phone,
        otp: otpCode,
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
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500 rounded-full mb-4">
              <span className="text-2xl font-bold text-gray-900">K</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verify OTP
            </h1>
            <p className="text-gray-600">
              Enter the 6-digit code sent to
            </p>
            <p className="text-yellow-600 font-medium">+91 {phone}</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                Enter OTP
              </label>
              <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                    disabled={isLoading}
                    autoFocus={index === 0}
                  />
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-500 text-center">
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
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
      </div>
    </div>
  );
}
