'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
    setIsLoading(true);

    try {
      // Normalize phone number
      const normalizedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;
      const appVerifier = window.recaptchaVerifier!;

      // Send OTP via Firebase
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        normalizedPhone,
        appVerifier
      );

      // Store confirmation result for verification page
      window.confirmationResult = confirmationResult;
      sessionStorage.setItem('phone', normalizedPhone);

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
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">
            Login with Phone
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
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
                  className="block w-full pl-12 pr-3 py-2 sm:py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent sm:text-base"
                  placeholder="9876543210"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Invisible reCAPTCHA container */}
            <div id="recaptcha-container"></div>

            {error && (
              <div className="rounded-md bg-red-50 p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-red-800">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || phone.length !== 10}
              className="w-full flex justify-center py-2 sm:py-3 px-4 border border-transparent rounded-md shadow-sm text-sm sm:text-base font-medium text-white bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
