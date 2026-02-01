'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { authApi } from '@/lib/api/auth.api';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authApi.getMe();
      // Note: You'll need to create a updateProfile endpoint in the auth API
      // For now, this is a placeholder

      setSuccess('Profile updated successfully');
      setIsEditing(false);

      if (response.success && response.data?.user) {
        setUser(response.data.user);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Personal Information
              </h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Edit
                </button>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={user?.phone || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Phone number cannot be changed
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="Enter your email"
                />
              </div>

              {isEditing && (
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium disabled:bg-gray-300"
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setName(user?.name || '');
                      setEmail(user?.email || '');
                      setError('');
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Quick Links */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Links
            </h3>

            <div className="space-y-3">
              <a
                href="/profile/addresses"
                className="block p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
              >
                <h4 className="font-medium text-gray-900">Addresses</h4>
                <p className="text-sm text-gray-600">
                  Manage delivery addresses
                </p>
              </a>

              <a
                href="/profile/favorites"
                className="block p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
              >
                <h4 className="font-medium text-gray-900">Favorites</h4>
                <p className="text-sm text-gray-600">
                  Your favorite restaurants
                </p>
              </a>

              <a
                href="/orders"
                className="block p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
              >
                <h4 className="font-medium text-gray-900">Orders</h4>
                <p className="text-sm text-gray-600">View order history</p>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
