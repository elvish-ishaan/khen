'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { addressesApi, type Address } from '@/lib/api/addresses.api';
import { LocationPicker } from '@/components/maps/location-picker';
import { getCurrentLocationAddress } from '@/lib/utils/geocoding';

export default function AddressesPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [isUsingLocation, setIsUsingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    label: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    postalCode: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setIsLoading(true);
      const response = await addressesApi.getAddresses();
      if (response.success && response.data) {
        setAddresses(response.data.addresses);
      }
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        await addressesApi.updateAddress(editingId, formData);
      } else {
        await addressesApi.createAddress(formData);
      }

      await fetchAddresses();
      setShowForm(false);
      setEditingId(null);
      resetForm();
    } catch (err) {
      console.error('Failed to save address:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      await addressesApi.deleteAddress(id);
      await fetchAddresses();
    } catch (err) {
      console.error('Failed to delete address:', err);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await addressesApi.setDefaultAddress(id);
      await fetchAddresses();
    } catch (err) {
      console.error('Failed to set default address:', err);
    }
  };

  const handleEdit = (address: Address) => {
    setFormData({
      label: address.label,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      landmark: address.landmark || '',
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      latitude: address.latitude || undefined,
      longitude: address.longitude || undefined,
    });
    setEditingId(address.id);
    setShowForm(true);
  };

  const handleLocationSelect = async (lat: number, lng: number) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      setLocationError('Google Maps API key is not configured');
      return;
    }

    // First set coordinates
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));

    // Then reverse geocode to get address details
    setIsUsingLocation(true);

    try {
      const { reverseGeocode } = await import('@/lib/utils/geocoding');
      const result = await reverseGeocode(lat, lng, apiKey);

      if (result.success && result.address) {
        // Auto-fill form with reverse geocoded address
        setFormData((prev) => ({
          ...prev,
          addressLine1: result.address!.addressLine1 || prev.addressLine1,
          addressLine2: result.address!.addressLine2 || prev.addressLine2,
          landmark: result.address!.landmark || prev.landmark,
          city: result.address!.city || prev.city,
          state: result.address!.state || prev.state,
          postalCode: result.address!.postalCode || prev.postalCode,
          latitude: lat,
          longitude: lng,
        }));

        setLocationError(null);
      } else {
        setLocationError(result.error || 'Failed to get address details');
      }
    } catch (err) {
      console.error('Error reverse geocoding:', err);
      setLocationError('Failed to get address details. Please fill manually.');
    } finally {
      setIsUsingLocation(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    setIsUsingLocation(true);
    setLocationError(null);

    // Get current location first
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setIsUsingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        // Set initial coordinates and open map picker
        setFormData({
          ...formData,
          latitude: lat,
          longitude: lng,
        });

        setIsUsingLocation(false);
        // Open map picker for user to adjust if needed
        setShowLocationPicker(true);
      },
      (error) => {
        let errorMessage = 'Failed to get location';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }

        setLocationError(errorMessage);
        setIsUsingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const resetForm = () => {
    setFormData({
      label: '',
      addressLine1: '',
      addressLine2: '',
      landmark: '',
      city: '',
      state: '',
      postalCode: '',
      latitude: undefined,
      longitude: undefined,
    });
    setLocationError(null);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Addresses</h1>
        {!showForm && (
          <button
            onClick={() => {
              resetForm();
              setEditingId(null);
              setShowForm(true);
            }}
            className="bg-yellow-500 text-gray-900 px-4 sm:px-6 py-2 rounded-md hover:bg-yellow-600 font-medium text-sm sm:text-base whitespace-nowrap"
          >
            + Add Address
          </button>
        )}
      </div>

      {/* Address Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingId ? 'Edit Address' : 'Add New Address'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Use Current Location Button */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    Quick Fill with Current Location
                  </h3>
                  <p className="text-xs text-gray-600">
                    Automatically detect and fill your address details using your current location
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={isUsingLocation}
                  className="w-full sm:w-auto bg-yellow-500 text-gray-900 px-4 py-2.5 rounded-md hover:bg-yellow-600 font-medium flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isUsingLocation ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Getting Location...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span>Use Current Location</span>
                    </>
                  )}
                </button>
              </div>

              {/* Location Error Message */}
              {locationError && (
                <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-xs">
                  <strong>Error:</strong> {locationError}
                  <br />
                  <span className="text-red-600">You can still enter the address manually below.</span>
                </div>
              )}

              {/* Success indicator */}
              {formData.latitude && formData.longitude && !locationError && !isUsingLocation && (
                <div className="mt-3 bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded text-xs">
                  <div className="flex items-start gap-2">
                    <svg
                      className="w-4 h-4 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="flex-1">
                      <div className="font-medium">Location set successfully!</div>
                      <div className="mt-1">
                        Review and edit the auto-filled address below if needed. You can click "Use Current Location" again to adjust the map marker.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Label *
                </label>
                <input
                  type="text"
                  required
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="Home, Work, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Code *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={formData.postalCode}
                  onChange={(e) =>
                    setFormData({ ...formData, postalCode: e.target.value.replace(/\D/g, '') })
                  }
                  placeholder="400001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 1 *
              </label>
              <input
                type="text"
                required
                value={formData.addressLine1}
                onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                placeholder="Flat, House no, Building, Company"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 2
              </label>
              <input
                type="text"
                value={formData.addressLine2}
                onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                placeholder="Area, Street, Sector, Village"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Landmark
              </label>
              <input
                type="text"
                value={formData.landmark}
                onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                placeholder="Nearby landmark"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Mumbai"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="Maharashtra"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>


            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-yellow-500 text-gray-900 px-6 py-2 rounded-md hover:bg-yellow-600 font-medium"
              >
                {editingId ? 'Update Address' : 'Save Address'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  resetForm();
                }}
                className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Address List */}
      {addresses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500 mb-4">No addresses saved</p>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <div key={address.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {address.label}
                    </h3>
                    {address.isDefault && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700">
                    {address.addressLine1}
                    {address.addressLine2 && `, ${address.addressLine2}`}
                  </p>
                  {address.landmark && (
                    <p className="text-gray-600 text-sm">Near: {address.landmark}</p>
                  )}
                  <p className="text-gray-700">
                    {address.city}, {address.state} - {address.postalCode}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleEdit(address)}
                    className="text-yellow-600 hover:text-yellow-700 text-sm font-medium"
                  >
                    Edit
                  </button>
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Location Picker Modal */}
      {showLocationPicker && (
        <LocationPicker
          initialLat={formData.latitude}
          initialLng={formData.longitude}
          onLocationSelect={handleLocationSelect}
          onClose={() => setShowLocationPicker(false)}
        />
      )}
    </div>
  );
}
