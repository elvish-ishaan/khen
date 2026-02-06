'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { onboardingApi } from '@/lib/api/onboarding.api';
import { Stepper } from '@/components/onboarding/stepper';

const cuisineOptions = [
  'Indian',
  'Chinese',
  'Italian',
  'Mexican',
  'Thai',
  'Japanese',
  'Fast Food',
  'South Indian',
  'North Indian',
  'Desserts',
  'Beverages',
];

export default function RestaurantInfoPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cuisineType: [] as string[],
    phone: '',
    email: '',
    opensAt: '09:00',
    closesAt: '22:00',
    minOrderAmount: 0,
    deliveryFee: 0,
    estimatedDeliveryTime: 30,
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const toggleCuisine = (cuisine: string) => {
    setFormData((prev) => ({
      ...prev,
      cuisineType: prev.cuisineType.includes(cuisine)
        ? prev.cuisineType.filter((c) => c !== cuisine)
        : [...prev.cuisineType, cuisine],
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      setCoverImage(file);
      setCoverImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.cuisineType.length === 0) {
      setError('Please select at least one cuisine type');
      return;
    }

    setIsLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      if (formData.description) submitData.append('description', formData.description);
      submitData.append('cuisineType', JSON.stringify(formData.cuisineType));
      submitData.append('phone', formData.phone);
      if (formData.email) submitData.append('email', formData.email);
      submitData.append('opensAt', formData.opensAt);
      submitData.append('closesAt', formData.closesAt);
      submitData.append('minOrderAmount', formData.minOrderAmount.toString());
      submitData.append('deliveryFee', formData.deliveryFee.toString());
      submitData.append('estimatedDeliveryTime', formData.estimatedDeliveryTime.toString());

      if (coverImage) {
        submitData.append('coverImage', coverImage);
      }

      const response = await onboardingApi.createRestaurant(submitData);

      if (response.success) {
        router.push('/menu');
      } else {
        setError(response.error || 'Failed to save restaurant info');
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
        <Stepper currentStep={3} />

        <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-2">Restaurant Information</h1>
        <p className="text-gray-600 mb-6">
          Tell us about your restaurant
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Restaurant Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter restaurant name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe your restaurant..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cuisine Types <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {cuisineOptions.map((cuisine) => (
                <button
                  key={cuisine}
                  type="button"
                  onClick={() => toggleCuisine(cuisine)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${
                      formData.cuisineType.includes(cuisine)
                        ? 'bg-yellow-500 text-gray-900'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="9876543210"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="restaurant@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="opensAt" className="block text-sm font-medium text-gray-700 mb-2">
                Opening Time <span className="text-red-500">*</span>
              </label>
              <input
                id="opensAt"
                type="time"
                value={formData.opensAt}
                onChange={(e) => handleChange('opensAt', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="closesAt" className="block text-sm font-medium text-gray-700 mb-2">
                Closing Time <span className="text-red-500">*</span>
              </label>
              <input
                id="closesAt"
                type="time"
                value={formData.closesAt}
                onChange={(e) => handleChange('closesAt', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="minOrderAmount" className="block text-sm font-medium text-gray-700 mb-2">
                Min Order (₹)
              </label>
              <input
                id="minOrderAmount"
                type="number"
                min="0"
                value={formData.minOrderAmount}
                onChange={(e) => handleChange('minOrderAmount', Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label htmlFor="deliveryFee" className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Fee (₹)
              </label>
              <input
                id="deliveryFee"
                type="number"
                min="0"
                value={formData.deliveryFee}
                onChange={(e) => handleChange('deliveryFee', Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label htmlFor="estimatedDeliveryTime" className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Time (min) <span className="text-red-500">*</span>
              </label>
              <input
                id="estimatedDeliveryTime"
                type="number"
                min="10"
                value={formData.estimatedDeliveryTime}
                onChange={(e) => handleChange('estimatedDeliveryTime', Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
            {coverImagePreview && (
              <div className="mt-4">
                <img
                  src={coverImagePreview}
                  alt="Cover preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
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
              onClick={() => router.push('/bank-details')}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              ← Back
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-yellow-500 text-gray-900 py-3 px-6 rounded-lg font-medium hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Saving...' : 'Continue to Menu'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
