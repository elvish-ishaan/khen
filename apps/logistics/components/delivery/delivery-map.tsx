'use client';

import { useEffect, useMemo } from 'react';
import { APIProvider, Map, Marker, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { useDirections } from '@/hooks/use-directions';

interface DeliveryMapProps {
  delivery: {
    status: string;
    distance?: number;
    order: {
      restaurant: {
        latitude: number;
        longitude: number;
        name: string;
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
}

function MapContent({ delivery, driverLocation }: DeliveryMapProps) {
  const map = useMap();
  const routesLibrary = useMapsLibrary('routes');

  // Validate and convert coordinates to numbers
  const restaurantLat = Number(delivery.order.restaurant.latitude);
  const restaurantLng = Number(delivery.order.restaurant.longitude);
  const addressLat = Number(delivery.order.address.latitude);
  const addressLng = Number(delivery.order.address.longitude);

  // Check if coordinates are valid
  const hasValidRestaurantCoords = !isNaN(restaurantLat) && !isNaN(restaurantLng) && restaurantLat !== 0 && restaurantLng !== 0;
  const hasValidAddressCoords = !isNaN(addressLat) && !isNaN(addressLng) && addressLat !== 0 && addressLng !== 0;

  // Determine route endpoints based on delivery status
  const routeEndpoints = useMemo(() => {
    if (!driverLocation.lat || !driverLocation.lng) return null;
    if (!hasValidRestaurantCoords || !hasValidAddressCoords) return null;

    const currentPos = { lat: driverLocation.lat, lng: driverLocation.lng };
    const restaurant = {
      lat: restaurantLat,
      lng: restaurantLng,
    };
    const customer = {
      lat: addressLat,
      lng: addressLng,
    };

    // Before pickup: show route to restaurant
    if (delivery.status === 'ACCEPTED') {
      return { origin: currentPos, destination: restaurant, label: 'To Restaurant' };
    }

    // After pickup: show route to customer
    if (delivery.status === 'PICKED_UP' || delivery.status === 'IN_TRANSIT') {
      return { origin: currentPos, destination: customer, label: 'To Customer' };
    }

    return null;
  }, [driverLocation, delivery.status, restaurantLat, restaurantLng, addressLat, addressLng, hasValidRestaurantCoords, hasValidAddressCoords]);

  // Fetch directions
  const directions = useDirections(routeEndpoints?.origin || null, routeEndpoints?.destination || null);

  // Draw route on map
  useEffect(() => {
    if (!map || !routesLibrary || !directions.route) return;

    const directionsRenderer = new google.maps.DirectionsRenderer({
      map,
      directions: { routes: [directions.route] },
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: delivery.status === 'ACCEPTED' ? '#f97316' : '#22c55e',
        strokeWeight: 5,
        strokeOpacity: 0.8,
      },
    });

    return () => {
      directionsRenderer.setMap(null);
    };
  }, [map, routesLibrary, directions.route, delivery.status]);

  // Auto-fit bounds to show all markers
  useEffect(() => {
    if (!map || !driverLocation.lat || !driverLocation.lng) return;
    if (!hasValidRestaurantCoords || !hasValidAddressCoords) return;

    const bounds = new google.maps.LatLngBounds();
    bounds.extend({ lat: driverLocation.lat, lng: driverLocation.lng });
    bounds.extend({
      lat: restaurantLat,
      lng: restaurantLng,
    });
    bounds.extend({
      lat: addressLat,
      lng: addressLng,
    });

    map.fitBounds(bounds, { padding: 50 });
  }, [map, driverLocation, restaurantLat, restaurantLng, addressLat, addressLng, hasValidRestaurantCoords, hasValidAddressCoords]);

  if (!driverLocation.lat || !driverLocation.lng) {
    return null;
  }

  return (
    <>
      {/* Driver Marker */}
      <Marker
        position={{ lat: driverLocation.lat, lng: driverLocation.lng }}
        icon={{
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#3b82f6',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        }}
        title="Your Location"
      />

      {/* Restaurant Marker */}
      {hasValidRestaurantCoords && (
        <Marker
          position={{
            lat: restaurantLat,
            lng: restaurantLng,
          }}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#f97316',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          }}
          title={delivery.order.restaurant.name}
        />
      )}

      {/* Customer Marker */}
      {hasValidAddressCoords && (
        <Marker
          position={{
            lat: addressLat,
            lng: addressLng,
          }}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#22c55e',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          }}
          title="Delivery Address"
        />
      )}
    </>
  );
}

export function DeliveryMap({ delivery, driverLocation }: DeliveryMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-600">Google Maps API key not configured</p>
      </div>
    );
  }

  if (!driverLocation.lat || !driverLocation.lng) {
    return (
      <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-600">Waiting for location...</p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">Navigation</h2>
      <APIProvider apiKey={apiKey}>
        <div className="h-96 w-full rounded-lg overflow-hidden shadow-md">
          <Map
            defaultCenter={{ lat: driverLocation.lat, lng: driverLocation.lng }}
            defaultZoom={14}
            mapId="delivery-map"
            gestureHandling="greedy"
            disableDefaultUI={false}
            zoomControl={true}
          >
            <MapContent delivery={delivery} driverLocation={driverLocation} />
          </Map>
        </div>
      </APIProvider>
    </div>
  );
}
