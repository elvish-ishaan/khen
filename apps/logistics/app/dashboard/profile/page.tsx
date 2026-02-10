'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { logisticsApi } from '@/lib/api/logistics.api';
import { User, Mail, Phone, Truck, CheckCircle, XCircle, Edit2, Save, X } from 'lucide-react';

export default function ProfilePage() {
  const { personnel, fetchMe } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    vehicleNumber: '',
  });

  // Initialize form data when personnel loads
  useEffect(() => {
    if (personnel) {
      setFormData({
        name: personnel.name || '',
        email: personnel.email || '',
        vehicleNumber: personnel.vehicleNumber || '',
      });
    }
  }, [personnel]);

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    if (personnel) {
      setFormData({
        name: personnel.name || '',
        email: personnel.email || '',
        vehicleNumber: personnel.vehicleNumber || '',
      });
    }
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    try {
      setIsUpdating(true);
      setError('');
      setSuccess('');

      // Validate name if provided
      if (formData.name && formData.name.trim().length < 2) {
        setError('Name must be at least 2 characters');
        return;
      }

      // Validate email if provided
      if (formData.email && formData.email.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          setError('Please enter a valid email address');
          return;
        }
      }

      const response = await logisticsApi.updateProfile({
        name: formData.name || undefined,
        email: formData.email || undefined,
        vehicleNumber: formData.vehicleNumber || undefined,
      });

      if (response.success) {
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        // Refresh personnel data
        await fetchMe();
      } else {
        setError(response.error || 'Failed to update profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!personnel) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-gray-500">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Profile</h1>
            <p className="text-gray-600 mt-1">Manage your personal information</p>
          </div>
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                disabled={isUpdating}
                className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSave}
                disabled={isUpdating}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isUpdating ? 'Saving...' : 'Save'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-start gap-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2">
            <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Personal Information Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Personal Information
          </h2>
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name {isEditing && <span className="text-red-500">*</span>}
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your name"
                />
              ) : (
                <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                  {personnel.name || 'Not provided'}
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your email (optional)"
                />
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span>{personnel.email || 'Not provided'}</span>
                </div>
              )}
            </div>

            {/* Phone (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{personnel.phone}</span>
                <span className="ml-auto text-xs text-gray-500">(Cannot be changed)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Information Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Vehicle Information
          </h2>
          <div className="space-y-4">
            {/* Vehicle Type (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
              <div className="px-4 py-2 bg-gray-100 rounded-lg text-gray-600">
                {personnel.vehicleType || 'Not specified'}
                <span className="ml-2 text-xs text-gray-500">(Set during onboarding)</span>
              </div>
            </div>

            {/* Vehicle Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Number
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.vehicleNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent uppercase"
                  placeholder="e.g., MH02AB1234"
                />
              ) : (
                <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900 font-mono">
                  {personnel.vehicleNumber || 'Not provided'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Account Status Section */}
        <div>
          <h2 className="text-xl font-bold mb-4">Account Status</h2>
          <div className="space-y-3">
            {/* Onboarding Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Onboarding Status</div>
                <div className="text-sm text-gray-600">Your account verification status</div>
              </div>
              <div className="flex items-center gap-2">
                {personnel.onboardingStatus === 'APPROVED' ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-600">Approved</span>
                  </>
                ) : personnel.onboardingStatus === 'PENDING' ? (
                  <>
                    <div className="w-5 h-5 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-medium text-yellow-600">Pending</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-gray-600">Not Started</span>
                  </>
                )}
              </div>
            </div>

            {/* On Duty Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Duty Status</div>
                <div className="text-sm text-gray-600">Your current availability</div>
              </div>
              <div className="flex items-center gap-2">
                {personnel.isOnDuty ? (
                  <>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium text-green-600">On Duty</span>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <span className="font-medium text-gray-600">Off Duty</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
