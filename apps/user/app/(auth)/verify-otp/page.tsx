'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { authApi } from '@/lib/api/auth.api';
import { useAuthStore } from '@/stores/auth-store';
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from '@/lib/firebase';

// Extend Window interface
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: any;
  }
}

export default function VerifyOtpPage() {
  const router = useRouter();
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

    // Check if confirmationResult exists
    if (!window.confirmationResult) {
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

    if (!window.confirmationResult) {
      setError('Session expired. Please restart login.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      // Verify OTP with Firebase
      const result = await window.confirmationResult.confirm(otpCode);
      const user = result.user;

      // Get Firebase ID token
      const idToken = await user.getIdToken();

      // Send token to backend
      const response = await authApi.verifyToken({ idToken });

      if (response.success && response.data) {
        // Update auth store
        setUser(response.data.user);

        // Clear session data
        sessionStorage.removeItem('phone');
        window.confirmationResult = undefined;

        // Redirect to home or callback URL
        const callbackUrl = sessionStorage.getItem('callbackUrl');
        if (callbackUrl) {
          sessionStorage.removeItem('callbackUrl');
          window.location.href = callbackUrl;
        } else {
          window.location.href = '/';
        }
      } else {
        setError(response.error || 'Authentication failed');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err: any) {
      console.error('OTP verification error:', err);

      if (err.code === 'auth/invalid-verification-code') {
        setError('Invalid OTP. Please try again.');
      } else if (err.code === 'auth/code-expired') {
        setError('OTP expired. Please request a new one.');
      } else {
        setError('Verification failed. Please try again.');
      }

      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setResendTimer(30);

    try {
      // Initialize reCAPTCHA if not present
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
        });
      }

      const appVerifier = window.recaptchaVerifier;

      // Resend OTP via Firebase
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phone,
        appVerifier
      );

      window.confirmationResult = confirmationResult;
    } catch (err: any) {
      console.error('Resend OTP error:', err);
      setError('Failed to resend OTP. Please try again.');
      setResendTimer(0);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-3 sm:px-4 py-6">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
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
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
            Verify OTP
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
            Enter the code sent to {phone}
          </p>

          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4 sm:space-y-6">
            <div>
              <div className="flex gap-2 justify-between" onPaste={handlePaste}>
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
                    className="w-12 h-12 sm:w-14 sm:h-14 text-center text-xl sm:text-2xl font-semibold border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                    disabled={isLoading}
                    autoFocus={index === 0}
                  />
                ))}
              </div>
            </div>

            {/* Invisible reCAPTCHA container for resend */}
            <div id="recaptcha-container"></div>

            {error && (
              <div className="rounded-md bg-red-50 p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-red-800">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || otp.join('').length !== 6}
              className="w-full flex justify-center py-2 sm:py-3 px-4 border border-transparent rounded-md shadow-sm text-sm sm:text-base font-medium text-white bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <div className="text-center">
              {resendTimer > 0 ? (
                <p className="text-xs sm:text-sm text-gray-600">
                  Resend OTP in{' '}
                  <span className="font-semibold text-yellow-600">{resendTimer}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-xs sm:text-sm font-medium text-yellow-600 hover:text-yellow-700"
                >
                  Resend OTP
                </button>
              )}
            </div>
          </form>

          <div className="mt-4 sm:mt-6 text-center">
            <button
              onClick={() => router.push('/login')}
              className="text-xs sm:text-sm text-gray-600 hover:text-gray-800"
            >
              ← Back to login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
