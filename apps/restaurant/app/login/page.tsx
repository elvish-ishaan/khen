'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from '@/lib/firebase';

// Extend Window interface for confirmation result
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: any;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Initialize invisible reCAPTCHA
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved - will proceed with submit
        },
        'expired-callback': () => {
          setError('reCAPTCHA expired. Please try again.');
        },
      });
    }

    return () => {
      // Cleanup on unmount
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = undefined;
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate phone number
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      setError('Please enter a valid 10-digit Indian phone number');
      return;
    }

    setIsLoading(true);

    try {
      const phoneNumber = `+91${phone}`;
      const appVerifier = window.recaptchaVerifier!;

      // Send OTP via Firebase
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        appVerifier
      );

      // Store confirmation result for verification page
      window.confirmationResult = confirmationResult;
      sessionStorage.setItem('restaurant_phone', phone);

      router.push('/verify-otp');
    } catch (err: any) {
      console.error('Firebase phone auth error:', err);

      if (err.code === 'auth/invalid-phone-number') {
        setError('Invalid phone number format');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later.');
      } else if (err.code === 'auth/quota-exceeded') {
        setError('SMS quota exceeded. Please contact support.');
      } else {
        setError('Failed to send OTP. Please try again.');
      }

      // Reset reCAPTCHA on error
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
        });
      }
    } finally {
      setIsLoading(false);
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
              Restaurant Portal
            </h1>
            <p className="text-gray-600">Sign in to manage your restaurant</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  +91
                </span>
                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setPhone(value);
                    setError('');
                  }}
                  placeholder="9876543210"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                  required
                  disabled={isLoading}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Enter your 10-digit mobile number
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Invisible reCAPTCHA container */}
            <div id="recaptcha-container"></div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              icon={ArrowRight}
              iconPosition="right"
              disabled={phone.length !== 10}
              isLoading={isLoading}
              className="w-full"
            >
              Send OTP
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
            <p>
              Customer? Visit{' '}
              <a
                href={process.env.NEXT_PUBLIC_USER_APP_URL || 'http://localhost:3000'}
                className="text-yellow-600 hover:text-yellow-700 font-medium"
              >
                User App
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
