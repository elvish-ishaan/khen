import { useState, useEffect, useRef } from 'react';

interface DirectionsResult {
  route: google.maps.DirectionsRoute | null;
  distance: string;
  duration: string;
  distanceValue: number; // in meters
  durationValue: number; // in seconds
  error: string | null;
  isLoading: boolean;
}

export function useDirections(
  origin: google.maps.LatLngLiteral | null,
  destination: google.maps.LatLngLiteral | null
): DirectionsResult {
  const [result, setResult] = useState<DirectionsResult>({
    route: null,
    distance: '',
    duration: '',
    distanceValue: 0,
    durationValue: 0,
    error: null,
    isLoading: false,
  });

  const lastFetchTimeRef = useRef<number>(0);
  const THROTTLE_MS = 30000; // 30 seconds throttle

  useEffect(() => {
    if (!origin || !destination) {
      setResult({
        route: null,
        distance: '',
        duration: '',
        distanceValue: 0,
        durationValue: 0,
        error: null,
        isLoading: false,
      });
      return;
    }

    // Check if Google Maps API is loaded
    if (typeof google === 'undefined' || !google.maps) {
      setResult((prev) => ({
        ...prev,
        error: 'Google Maps API not loaded',
        isLoading: false,
      }));
      return;
    }

    // Throttle API calls
    const now = Date.now();
    if (now - lastFetchTimeRef.current < THROTTLE_MS) {
      return;
    }
    lastFetchTimeRef.current = now;

    const directionsService = new google.maps.DirectionsService();

    setResult((prev) => ({ ...prev, isLoading: true, error: null }));

    directionsService.route(
      {
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
        avoidTolls: false,
        avoidHighways: false,
      },
      (response, status) => {
        if (status === 'OK' && response) {
          const leg = response.routes[0].legs[0];
          setResult({
            route: response.routes[0],
            distance: leg.distance?.text || '',
            duration: leg.duration?.text || '',
            distanceValue: leg.distance?.value || 0,
            durationValue: leg.duration?.value || 0,
            error: null,
            isLoading: false,
          });
        } else {
          setResult((prev) => ({
            ...prev,
            error: `Directions request failed: ${status}`,
            isLoading: false,
          }));
        }
      }
    );
  }, [origin?.lat, origin?.lng, destination?.lat, destination?.lng]);

  return result;
}
