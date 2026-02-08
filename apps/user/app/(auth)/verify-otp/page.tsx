'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { authApi } from '@/lib/api/auth.api';
import { useAuthStore } from '@/stores/auth-store';

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { setUser } = useAuthStore();

  useEffect(() => {
    const storedPhone = sessionStorage.getItem('phone');
    if (!storedPhone) {
      router.push('/login');
      return;
    }
    setPhone(storedPhone);
  }, [router]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

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
    setOtp(newOtp);

    if (pastedData.length === 6) {
      handleSubmit(pastedData);
    }
  };

  const handleSubmit = async (otpValue?: string) => {
    const otpCode = otpValue || otp.join('');
    if (otpCode.length !== 6) return;

    setError('');
    setIsLoading(true);

    try {
      const response = await authApi.verifyOtp({
        phone,
        otp: otpCode,
      });

      if (response.success && response.data?.user) {
        setUser(response.data.user);
        sessionStorage.removeItem('phone');

        const redirect = searchParams.get('redirect') || '/';
        router.push(redirect);
      } else {
        setError(response.error || 'Invalid OTP');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify OTP');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    setError('');
    setIsLoading(true);

    try {
      const response = await authApi.sendOtp({ phone });

      if (response.success) {
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        setResendTimer(30); // Reset timer
      } else {
        setError(response.error || 'Failed to resend OTP');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Suspense fallback={<span>loading...</span>}>
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-3 sm:px-4 py-6">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        {/* Themed Logo Section */}
        <div className="text-center">
          <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 mb-4 sm:mb-6">
            <div className="flex justify-center">
              <Image
                src="https://res.cloudinary.com/diqurtmad/image/upload/v1770539638/black_dawat-removebg-preview_bppqvz.png"
                alt="Daavat Logo"
                width={180}
                height={70}
                className="h-12 sm:h-16 w-auto object-contain drop-shadow-lg"
                priority
              />
            </div>
          </div>
          <p className="mt-2 text-sm sm:text-base text-gray-600 font-medium">Food delivery made simple</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          <div className="mb-4 sm:mb-6">
            <button
              onClick={() => router.push('/login')}
              className="text-yellow-600 hover:text-yellow-700 text-sm font-medium"
            >
              ← Change number
            </button>
          </div>

          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
            Enter OTP
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 break-words">
            Sent to {phone}
          </p>

          <div className="space-y-4 sm:space-y-6">
            <div className="flex gap-1.5 sm:gap-2 justify-center">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={isLoading}
                  className="w-10 h-10 sm:w-12 sm:h-12 text-center text-lg sm:text-xl font-semibold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              ))}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={isLoading || otp.some((digit) => digit === '')}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-900 bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isLoading || resendTimer > 0}
                className="text-yellow-600 hover:text-yellow-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Development mode: Use OTP <strong>123456</strong></p>
          </div>
        </div>
      </div>
    </div>
    </Suspense>
  );
}
