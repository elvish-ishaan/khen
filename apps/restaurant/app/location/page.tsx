'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { onboardingApi } from '@/lib/api/onboarding.api';
import { Stepper } from '@/components/onboarding/stepper';

export default function LocationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);

  const [formData, setFormData] = useState({
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    latitude: 0,
    longitude: 0,
  });

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const getCurrentLocation = () => {
    setGettingLocation(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
        setGettingLocation(false);
      },
      (error) => {
        setError('Unable to get location. Please enter coordinates manually.');
        setGettingLocation(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!/^\d{6}$/.test(formData.postalCode)) {
      setError('Please enter a valid 6-digit postal code');
      return;
    }

    if (formData.latitude === 0 || formData.longitude === 0) {
      setError('Please set restaurant location coordinates');
      return;
    }

    setIsLoading(true);

    try {
      // Update location
      const locationResponse = await onboardingApi.updateLocation(formData);

      if (!locationResponse.success) {
        setError(locationResponse.error || 'Failed to update location');
        setIsLoading(false);
        return;
      }

      // Complete onboarding
      const completeResponse = await onboardingApi.completeOnboarding();

      if (completeResponse.success) {
        router.push('/dashboard');
      } else {
        setError(completeResponse.error || 'Failed to complete onboarding');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Stepper currentStep={5} />

      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-2">Restaurant Location</h1>
        <p className="text-gray-600 mb-6">
          Set your restaurant's address and location
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 mb-2">
              Address Line 1 <span className="text-red-500">*</span>
            </label>
            <input
              id="addressLine1"
              type="text"
              value={formData.addressLine1}
              onChange={(e) => handleChange('addressLine1', e.target.value)}
              placeholder="Building name, street name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 mb-2">
              Address Line 2
            </label>
            <input
              id="addressLine2"
              type="text"
              value={formData.addressLine2}
              onChange={(e) => handleChange('addressLine2', e.target.value)}
              placeholder="Landmark, area (optional)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <input
                id="city"
                type="text"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="City"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                State <span className="text-red-500">*</span>
              </label>
              <input
                id="state"
                type="text"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
                placeholder="State"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                Postal Code <span className="text-red-500">*</span>
              </label>
              <input
                id="postalCode"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={formData.postalCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  handleChange('postalCode', value);
                }}
                placeholder="123456"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                required
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Location Coordinates</h3>
            <p className="text-sm text-gray-600 mb-4">
              These coordinates help customers find you accurately on the map.
            </p>

            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={gettingLocation}
              className="mb-4 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {gettingLocation ? 'Getting Location...' : '📍 Use Current Location'}
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude <span className="text-red-500">*</span>
                </label>
                <input
                  id="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => handleChange('latitude', Number(e.target.value))}
                  placeholder="0.000000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude <span className="text-red-500">*</span>
                </label>
                <input
                  id="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => handleChange('longitude', Number(e.target.value))}
                  placeholder="0.000000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                  required
                />
              </div>
            </div>

            {formData.latitude !== 0 && formData.longitude !== 0 && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">
                  ✓ Location set: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => router.push('/menu')}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              ← Back
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-yellow-500 text-gray-900 py-3 px-6 rounded-lg font-medium hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Completing...' : 'Complete Onboarding 🎉'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
