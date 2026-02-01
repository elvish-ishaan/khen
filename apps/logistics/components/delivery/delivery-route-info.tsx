'use client';

import { useEffect, useMemo } from 'react';
import Script from 'next/script';
import { useDistanceCalculator } from './delivery-distance-calculator';

interface DeliveryRouteInfoProps {
  delivery: {
    status: string;
    order: {
      restaurant: {
        latitude: number;
        longitude: number;
      };
      address: {
        latitude: number;
        longitude: number;
      };
    };
  };
  driverLocation: {
    lat: number | null;
    lng: number | null;
  };
  costPerKm?: number;
}

export function DeliveryRouteInfo({
  delivery,
  driverLocation,
  costPerKm = 10,
}: DeliveryRouteInfoProps) {
  const getStatusLabel = () => {
    if (delivery.status === 'ACCEPTED') return 'Route to Restaurant';
    if (delivery.status === 'PICKED_UP' || delivery.status === 'IN_TRANSIT') return 'Route to Customer';
    return 'Route';
  };

  // Determine route endpoints based on delivery status
  const routeEndpoints = useMemo(() => {
    if (!driverLocation.lat || !driverLocation.lng) return { origin: null, destination: null };

    const currentPos = { lat: driverLocation.lat, lng: driverLocation.lng };
    const restaurant = {
      lat: Number(delivery.order.restaurant.latitude),
      lng: Number(delivery.order.restaurant.longitude),
    };
    const customer = {
      lat: Number(delivery.order.address.latitude),
      lng: Number(delivery.order.address.longitude),
    };

    // Before pickup: show route to restaurant
    if (delivery.status === 'ACCEPTED') {
      return { origin: currentPos, destination: restaurant };
    }

    // After pickup: show route to customer
    if (delivery.status === 'PICKED_UP' || delivery.status === 'IN_TRANSIT') {
      return { origin: currentPos, destination: customer };
    }

    return { origin: null, destination: null };
  }, [driverLocation, delivery.status, delivery.order]);

  const { distance, duration, distanceKm, isLoading, error } = useDistanceCalculator({
    origin: routeEndpoints.origin,
    destination: routeEndpoints.destination,
  });

  const earnings = distanceKm * costPerKm;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{getStatusLabel()}</h3>
          <span className="text-xs text-gray-600 bg-white px-3 py-1 rounded-full">
            {delivery.status.replace('_', ' ')}
          </span>
        </div>

        {error && (
          <div className="text-sm text-red-600 mb-3 bg-red-50 p-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <div className="text-xs text-gray-600 mb-1">Distance</div>
            <div className="text-2xl font-bold text-blue-900">
              {isLoading ? (
                <span className="text-base text-gray-500">Calculating...</span>
              ) : distance ? (
                distance
              ) : (
                <span className="text-base text-gray-500">N/A</span>
              )}
            </div>
            {distanceKm > 0 && (
              <div className="text-xs text-gray-500 mt-1">
                {distanceKm.toFixed(2)} km
              </div>
            )}
          </div>

          <div className="bg-white p-4 rounded-lg">
            <div className="text-xs text-gray-600 mb-1">ETA</div>
            <div className="text-2xl font-bold text-purple-900">
              {isLoading ? (
                <span className="text-base text-gray-500">Calculating...</span>
              ) : duration ? (
                duration
              ) : (
                <span className="text-base text-gray-500">N/A</span>
              )}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg">
            <div className="text-xs text-gray-600 mb-1">Estimated Earnings</div>
            <div className="text-2xl font-bold text-green-900">
              ₹{earnings.toFixed(0)}
            </div>
            {distanceKm > 0 && (
              <div className="text-xs text-gray-500 mt-1">
                ₹{costPerKm}/km × {distanceKm.toFixed(2)} km
              </div>
            )}
          </div>
        </div>
      </div>
  );
}
