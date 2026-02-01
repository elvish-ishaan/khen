'use client';

import { useEffect, useState } from 'react';

interface DistanceCalculatorProps {
  origin: { lat: number; lng: number } | null;
  destination: { lat: number; lng: number } | null;
  onDistanceCalculated?: (distanceKm: number, durationMins: number) => void;
}

export function useDistanceCalculator({
  origin,
  destination,
  onDistanceCalculated,
}: DistanceCalculatorProps) {
  const [distance, setDistance] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [durationMins, setDurationMins] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);

  // Wait for Google Maps to load
  useEffect(() => {
    const checkGoogleMaps = () => {
      if (typeof window !== 'undefined' && typeof google !== 'undefined' && google.maps) {
        setIsGoogleMapsLoaded(true);
        return true;
      }
      return false;
    };

    if (checkGoogleMaps()) {
      return;
    }

    // Poll for Google Maps to be available
    const interval = setInterval(() => {
      if (checkGoogleMaps()) {
        clearInterval(interval);
      }
    }, 100);

    // Timeout after 10 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (!checkGoogleMaps()) {
        setError('Google Maps API failed to load');
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (!origin || !destination) {
      setDistance('');
      setDuration('');
      setDistanceKm(0);
      setDurationMins(0);
      return;
    }

    // Wait for Google Maps to be loaded
    if (!isGoogleMapsLoaded) {
      setIsLoading(true);
      return;
    }

    const service = new google.maps.DistanceMatrixService();
    setIsLoading(true);
    setError(null);

    service.getDistanceMatrix(
      {
        origins: [origin],
        destinations: [destination],
        travelMode: google.maps.TravelMode.DRIVING, // Can be changed to TWO_WHEELER if needed
        unitSystem: google.maps.UnitSystem.METRIC,
      },
      (response, status) => {
        setIsLoading(false);

        if (status === 'OK' && response) {
          const result = response.rows[0]?.elements[0];

          if (result && result.status === 'OK') {
            const distanceText = result.distance?.text || '';
            const durationText = result.duration?.text || '';
            const distanceMeters = result.distance?.value || 0;
            const durationSeconds = result.duration?.value || 0;

            const distanceInKm = distanceMeters / 1000;
            const durationInMins = Math.ceil(durationSeconds / 60);

            setDistance(distanceText);
            setDuration(durationText);
            setDistanceKm(distanceInKm);
            setDurationMins(durationInMins);

            if (onDistanceCalculated) {
              onDistanceCalculated(distanceInKm, durationInMins);
            }
          } else {
            setError('Route not found');
          }
        } else {
          setError(`Failed to calculate distance: ${status}`);
        }
      }
    );
  }, [origin?.lat, origin?.lng, destination?.lat, destination?.lng, onDistanceCalculated]);

  return {
    distance,
    duration,
    distanceKm,
    durationMins,
    isLoading,
    error,
  };
}
