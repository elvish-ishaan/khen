import { Response, NextFunction } from 'express';
import { prisma } from '@repo/db';
import { RestaurantAuthenticatedRequest } from '../types';
import { verifyToken } from '../services/jwt.service';
import { AppError } from './error-handler';

export const authenticateRestaurant = async (
  req: RestaurantAuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.restaurant_auth_token;

    if (!token) {
      throw new AppError(401, 'Authentication required');
    }

    const decoded = verifyToken(token);

    // Verify this is a restaurant token
    if (decoded.role !== 'restaurant' || !decoded.ownerId) {
      throw new AppError(401, 'Invalid authentication credentials');
    }

    // Fetch the latest restaurantId from the database
    // This ensures we always have the current value, even if the JWT was issued before restaurant creation
    const owner = await prisma.restaurantOwner.findUnique({
      where: { id: decoded.ownerId },
      select: { restaurantId: true },
    });

    req.owner = {
      id: decoded.ownerId,
      phone: decoded.phone,
      restaurantId: owner?.restaurantId || undefined,
    };

    next();
  } catch (error) {
    next(new AppError(401, 'Invalid or expired token'));
  }
};
