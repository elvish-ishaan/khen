import { googleMapsService } from './google-maps.service';
import { env } from '../config/env';
import { AppError } from '../middleware/error-handler';

interface DeliveryFeeCalculation {
  deliveryFee: number;
  distanceKm: number;
  durationMinutes: number;
  distanceText: string;
  durationText: string;
}

export const calculateDeliveryFee = async (
  restaurantLat: number,
  restaurantLng: number,
  addressLat: number,
  addressLng: number
): Promise<DeliveryFeeCalculation> => {
  // Calculate route distance using Google Maps
  const route = await googleMapsService.calculateRouteDistance(
    { lat: restaurantLat, lng: restaurantLng },
    { lat: addressLat, lng: addressLng }
  );

  // Check maximum distance limit
  if (route.distanceKm > env.MAX_DELIVERY_DISTANCE) {
    throw new AppError(
      400,
      `Sorry, we don't deliver beyond ${env.MAX_DELIVERY_DISTANCE}km. This restaurant is ${route.distanceKm.toFixed(1)}km away.`
    );
  }

  // Calculate fee: distance × cost per km
  let deliveryFee = route.distanceKm * env.COST_PER_KM;

  // Apply minimum delivery fee
  deliveryFee = Math.max(deliveryFee, env.MIN_DELIVERY_FEE);

  // Round to nearest rupee
  deliveryFee = Math.round(deliveryFee);

  console.log(`✅ Delivery fee calculated: ₹${deliveryFee} for ${route.distanceKm}km`);

  return {
    deliveryFee,
    distanceKm: route.distanceKm,
    durationMinutes: route.durationMinutes,
    distanceText: route.distanceText,
    durationText: route.durationText,
  };
};
