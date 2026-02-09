'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { authApi } from '@/lib/api/auth.api';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
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
  const { setOwner } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
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

    // Check if confirmationResult exists
    if (!window.confirmationResult) {
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
        setOwner(response.data.owner);

        // Clear session data
        sessionStorage.removeItem('restaurant_phone');
        window.confirmationResult = undefined;

        // Redirect based on onboarding status
        const status = response.data.owner.onboardingStatus;

        // Use window.location.href to force a full page reload
        // This ensures the cookie is properly sent with the next request
        if (status === 'COMPLETED') {
          window.location.href = '/dashboard';
        } else if (status === 'PENDING_DOCUMENTS') {
          window.location.href = '/documents';
        } else if (status === 'PENDING_BANK_DETAILS') {
          window.location.href = '/bank-details';
        } else if (status === 'PENDING_MENU') {
          window.location.href = '/restaurant-info';
        } else if (status === 'PENDING_LOCATION') {
          window.location.href = '/menu';
        } else {
          window.location.href = '/documents'; // Default to first step
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
    setCanResend(false);
    setCountdown(60);

    try {
      // Initialize reCAPTCHA if not present
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
        });
      }

      const phoneNumber = `+91${phone}`;
      const appVerifier = window.recaptchaVerifier;

      // Resend OTP via Firebase
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        appVerifier
      );

      window.confirmationResult = confirmationResult;

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
    } catch (err: any) {
      console.error('Resend OTP error:', err);
      setError('Failed to resend OTP. Please try again.');
      setCanResend(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-white px-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full mb-4 shadow-lg">
              <span className="text-3xl font-bold text-white">K</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Verify OTP
            </h1>
            <p className="text-gray-600">
              Enter the 6-digit code sent to
            </p>
            <p className="text-yellow-600 font-semibold mt-1">+91 {phone}</p>
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
            </div>

            {/* Invisible reCAPTCHA container for resend */}
            <div id="recaptcha-container"></div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              icon={CheckCircle}
              iconPosition="right"
              disabled={otp.join('').length !== 6}
              isLoading={isLoading}
              className="w-full"
            >
              Verify & Continue
            </Button>

            <div className="text-center">
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-yellow-600 hover:text-yellow-700 font-medium text-sm transition-colors"
                >
                  Resend OTP
                </button>
              ) : (
                <p className="text-gray-500 text-sm">
                  Resend OTP in <span className="font-semibold text-gray-700">{countdown}s</span>
                </p>
              )}
            </div>
          </form>

          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              icon={ArrowLeft}
              onClick={() => router.push('/login')}
              className="text-sm"
            >
              Change phone number
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
