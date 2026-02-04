import { Client, TravelMode } from '@googlemaps/google-maps-services-js';
import { env } from '../config/env';
import { calculateDistance } from './location.service';

interface RouteCalculation {
  distanceKm: number;
  durationMinutes: number;
  distanceText: string;
  durationText: string;
}

class GoogleMapsService {
  private client: Client;

  constructor() {
    this.client = new Client({});
  }

  async calculateRouteDistance(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): Promise<RouteCalculation> {
    try {
      const response = await this.client.distancematrix({
        params: {
          origins: [`${origin.lat},${origin.lng}`],
          destinations: [`${destination.lat},${destination.lng}`],
          mode: TravelMode.driving,
          key: env.GOOGLE_MAPS_API_KEY,
        },
        timeout: 5000,
      });

      const element = response.data.rows[0]?.elements[0];

      if (!element || element.status !== 'OK') {
        throw new Error(`Distance Matrix API error: ${element?.status || 'NO_RESULT'}`);
      }

      const distanceKm = element.distance.value / 1000;
      const durationMinutes = Math.ceil(element.duration.value / 60);

      return {
        distanceKm: Math.round(distanceKm * 100) / 100,
        durationMinutes,
        distanceText: element.distance.text,
        durationText: element.duration.text,
      };
    } catch (error) {
      console.error('❌ Google Maps API failed, using Haversine fallback:', error);

      // Fallback to straight-line distance × 1.3 (approximation for road distance)
      const straightDistance = calculateDistance(
        origin.lat,
        origin.lng,
        destination.lat,
        destination.lng
      );
      const approxDistance = straightDistance * 1.3;

      return {
        distanceKm: Math.round(approxDistance * 100) / 100,
        durationMinutes: Math.ceil(approxDistance * 3), // ~20 km/h average speed
        distanceText: `~${approxDistance.toFixed(1)} km`,
        durationText: `~${Math.ceil(approxDistance * 3)} mins`,
      };
    }
  }
}

export const googleMapsService = new GoogleMapsService();
