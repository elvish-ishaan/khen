'use client';

import { useState, useEffect, useCallback } from 'react';
import { APIProvider, Map, Marker, useMap } from '@vis.gl/react-google-maps';
import { useLocationStore } from '@/stores/location-store';

interface LocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number) => void;
  onClose: () => void;
}

function MapContent({
  selectedLocation,
  onLocationChange,
}: {
  selectedLocation: { lat: number; lng: number };
  onLocationChange: (lat: number, lng: number) => void;
}) {
  const map = useMap();

  // Handle map click to set marker
  useEffect(() => {
    if (!map) return;

    const listener = map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        onLocationChange(e.latLng.lat(), e.latLng.lng());
      }
    });

    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [map, onLocationChange]);

  return (
    <Marker
      position={selectedLocation}
      draggable={true}
      onDragEnd={(e) => {
        if (e.latLng) {
          onLocationChange(e.latLng.lat(), e.latLng.lng());
        }
      }}
      title="Delivery Location"
    />
  );
}

export function LocationPicker({
  initialLat,
  initialLng,
  onLocationSelect,
  onClose,
}: LocationPickerProps) {
  const { coordinates, requestLocation } = useLocationStore();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Initialize with provided location or user's current location
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  }>({
    lat: initialLat || coordinates?.latitude || 28.6139,
    lng: initialLng || coordinates?.longitude || 77.209,
  });

  // Update when user location is available
  useEffect(() => {
    if (!initialLat && !initialLng && coordinates) {
      setSelectedLocation({
        lat: coordinates.latitude,
        lng: coordinates.longitude,
      });
    }
  }, [coordinates, initialLat, initialLng]);

  const handleLocationChange = useCallback((lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
  }, []);

  const handleUseCurrentLocation = async () => {
    await requestLocation();
    if (coordinates) {
      setSelectedLocation({
        lat: coordinates.latitude,
        lng: coordinates.longitude,
      });
    }
  };

  const handleConfirm = () => {
    onLocationSelect(selectedLocation.lat, selectedLocation.lng);
    onClose();
  };

  if (!apiKey) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 className="text-lg font-semibold mb-2">Configuration Required</h3>
          <p className="text-gray-600 mb-4">
            Google Maps API key is not configured. Please add it to your environment variables.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-lg font-semibold">Set Delivery Location</h3>
          <p className="text-sm text-gray-600 mt-1">
            Click on the map or drag the marker to set the exact delivery location
          </p>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative overflow-hidden">
          <APIProvider
            apiKey={apiKey}
            onLoad={() => console.log('Maps API loaded')}
          >
            <div className="w-full h-full">
              <Map
                defaultCenter={selectedLocation}
                center={selectedLocation}
                defaultZoom={15}
                gestureHandling="greedy"
                disableDefaultUI={false}
                zoomControl={true}
                mapTypeControl={false}
                streetViewControl={false}
                fullscreenControl={false}
                mapId="DEMO_MAP_ID"
                style={{ width: '100%', height: '100%' }}
                reuseMaps={true}
              >
                <MapContent
                  selectedLocation={selectedLocation}
                  onLocationChange={handleLocationChange}
                />
              </Map>
            </div>
          </APIProvider>

          {/* Use Current Location Button */}
          <button
            onClick={handleUseCurrentLocation}
            className="absolute top-4 right-4 bg-white shadow-md px-4 py-2 rounded-md hover:bg-gray-50 flex items-center gap-2"
          >
            <svg
              className="w-5 h-5 text-blue-600"
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
            <span className="text-sm font-medium">Use Current Location</span>
          </button>
        </div>

        {/* Selected Coordinates Display */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex-shrink-0">
          <p className="text-sm text-gray-600 mb-2">Selected Coordinates:</p>
          <div className="flex gap-4 text-sm font-mono">
            <div>
              <span className="text-gray-500">Lat:</span>{' '}
              <span className="text-gray-900">{selectedLocation.lat.toFixed(6)}</span>
            </div>
            <div>
              <span className="text-gray-500">Lng:</span>{' '}
              <span className="text-gray-900">{selectedLocation.lng.toFixed(6)}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 flex gap-3 justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
}
