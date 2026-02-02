import { Response } from 'express';
import { prisma } from '@repo/db';
import { AuthenticatedRequest } from '../types';
import { AppError, asyncHandler } from '../middleware/error-handler';
import { calculateDeliveryFeeSchema } from '../validators/delivery.validator';
import { calculateDeliveryFee } from '../services/delivery-fee.service';

export const calculateDeliveryFeeHandler = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    // Validate request body
    const { addressId } = calculateDeliveryFeeSchema.parse(req.body);

    // Get user's cart with restaurant details
    const cart = await prisma.cart.findFirst({
      where: { userId: req.user.id },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            latitude: true,
            longitude: true,
          },
        },
        items: true,
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new AppError(404, 'No items in cart');
    }

    // Get delivery address and verify ownership
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: req.user.id,
      },
    });

    if (!address) {
      throw new AppError(404, 'Address not found or you don\'t have access');
    }

    // Validate that address has coordinates
    if (!address.latitude || !address.longitude) {
      throw new AppError(
        400,
        'Address location not set. Please update your address with a valid location.'
      );
    }

    // Calculate delivery fee using Google Maps route distance
    const result = await calculateDeliveryFee(
      cart.restaurant.latitude,
      cart.restaurant.longitude,
      address.latitude,
      address.longitude
    );

    res.json({
      success: true,
      data: result,
    });
  }
);
