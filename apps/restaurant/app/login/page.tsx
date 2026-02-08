'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, ArrowRight } from 'lucide-react';
import { authApi } from '@/lib/api/auth.api';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
      const response = await authApi.sendOtp({ phone });

      if (response.success) {
        // Store phone in sessionStorage for OTP verification
        sessionStorage.setItem('restaurant_phone', phone);
        router.push('/verify-otp');
      } else {
        setError(response.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
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

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Development Mode: OTP will be 123456</p>
        </div>
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
