'use client';

import { useEffect, useState } from 'react';
import { User, Store, Info, Save, LogOut, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { restaurantApi } from '@/lib/api/restaurant.api';
import { Button } from '@/components/ui/button';

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

export default function SettingsPage() {
  const { owner, logout } = useAuthStore();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cuisineType: [] as string[],
    phone: '',
    email: '',
    isActive: true,
    isAcceptingOrders: true,
  });

  const [coverImage, setCoverImage] = useState<File | null>(null);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const response = await restaurantApi.getProfile();
        if (response.success && response.data) {
          const rest = response.data.restaurant;
          setRestaurant(rest);
          setFormData({
            name: rest.name || '',
            description: rest.description || '',
            cuisineType: rest.cuisineType || [],
            phone: rest.phone || '',
            email: rest.email || '',
            isActive: rest.isActive ?? true,
            isAcceptingOrders: rest.isAcceptingOrders ?? true,
          });
        }
      } catch (error) {
        console.error('Failed to fetch restaurant:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurant();
  }, []);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');
  };

  const toggleCuisine = (cuisine: string) => {
    setFormData((prev) => ({
      ...prev,
      cuisineType: prev.cuisineType.includes(cuisine)
        ? prev.cuisineType.filter((c) => c !== cuisine)
        : [...prev.cuisineType, cuisine],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      if (formData.description) submitData.append('description', formData.description);
      submitData.append('cuisineType', JSON.stringify(formData.cuisineType));
      submitData.append('phone', formData.phone);
      if (formData.email) submitData.append('email', formData.email);
      submitData.append('isActive', formData.isActive.toString());
      submitData.append('isAcceptingOrders', formData.isAcceptingOrders.toString());

      if (coverImage) {
        submitData.append('coverImage', coverImage);
      }

      const response = await restaurantApi.updateProfile(submitData);

      if (response.success) {
        setSuccess('Restaurant profile updated successfully!');
        setCoverImage(null);
      } else {
        setError(response.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading settings...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600">Manage your restaurant settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-xl shadow-md">
            <div className="flex items-center gap-2 mb-6">
              <Store className="w-6 h-6 text-yellow-600" />
              <h2 className="text-2xl font-bold text-gray-900">Restaurant Profile</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurant Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cuisine Types
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Update Cover Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100 cursor-pointer"
                />
                {coverImage && (
                  <p className="mt-2 flex items-center gap-1 text-sm text-green-600 font-medium">
                    <CheckCircle className="w-4 h-4" />
                    New image selected
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => handleChange('isActive', e.target.checked)}
                    className="w-4 h-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
                    Restaurant is active (Account status)
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isAcceptingOrders"
                    checked={formData.isAcceptingOrders}
                    onChange={(e) => handleChange('isAcceptingOrders', e.target.checked)}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label htmlFor="isAcceptingOrders" className="ml-2 text-sm font-medium text-gray-700">
                    Currently accepting orders
                  </label>
                </div>
                <p className="text-xs text-gray-500 ml-6">
                  Use the toggle on the dashboard for quick on/off switching
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                  {success}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                icon={Save}
                isLoading={isSaving}
                className="w-full"
              >
                Save Changes
              </Button>
            </form>
          </div>
        </div>

        {/* Account Section */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-bold text-gray-900">Account</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-600">Owner:</span>
                <p className="font-medium text-gray-900">{owner?.name || 'Not set'}</p>
              </div>
              <div>
                <span className="text-gray-600">Phone:</span>
                <p className="font-medium text-gray-900">{owner?.phone}</p>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>
                <p className="font-medium text-gray-900">{owner?.email || 'Not set'}</p>
              </div>
            </div>

            <Button
              variant="danger"
              icon={LogOut}
              onClick={handleLogout}
              className="mt-6 w-full"
            >
              Logout
            </Button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-bold text-gray-900">Restaurant Info</h2>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Restaurant ID:</span>
                <p className="font-mono text-xs break-all">{restaurant?.id}</p>
              </div>
              <div>
                <span className="text-gray-600">Account Status:</span>
                <p className={`font-medium ${restaurant?.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {restaurant?.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Order Status:</span>
                <p className={`font-medium ${restaurant?.isAcceptingOrders ? 'text-green-600' : 'text-orange-600'}`}>
                  {restaurant?.isAcceptingOrders ? 'Accepting Orders' : 'Not Accepting'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
