'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { addressesApi, type Address } from '@/lib/api/addresses.api';
import { LocationPicker } from '@/components/maps/location-picker';

export default function AddressesPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

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

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData({
      ...formData,
      latitude: lat,
      longitude: lng,
    });
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

            {/* Location Picker Section */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Delivery Location (Optional)
                </label>
                {formData.latitude && formData.longitude && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    Location Set
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Set the exact location on map for accurate delivery
              </p>

              <button
                type="button"
                onClick={() => setShowLocationPicker(true)}
                className="w-full md:w-auto bg-yellow-50 text-yellow-600 border border-yellow-200 px-4 py-2 rounded-md hover:bg-yellow-100 flex items-center justify-center gap-2"
              >
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
                {formData.latitude && formData.longitude
                  ? 'Update Location on Map'
                  : 'Set Location on Map'}
              </button>

              {formData.latitude && formData.longitude && (
                <div className="mt-2 text-xs font-mono text-gray-600">
                  <div>Lat: {formData.latitude.toFixed(6)}</div>
                  <div>Lng: {formData.longitude.toFixed(6)}</div>
                </div>
              )}
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
                    {address.latitude && address.longitude ? (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                        Location Set
                      </span>
                    ) : (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
                        No Location
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
                  {!address.latitude && !address.longitude && (
                    <p className="text-amber-600 text-xs mt-1">
                      Consider setting location for better delivery accuracy
                    </p>
                  )}
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
