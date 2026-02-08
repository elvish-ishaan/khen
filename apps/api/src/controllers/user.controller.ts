import { Response } from 'express';
import { prisma } from '@repo/db';
import { AuthenticatedRequest } from '../types';
import { updateProfileSchema } from '../validators/user.validator';
import { AppError, asyncHandler } from '../middleware/error-handler';

export const getProfileHandler = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Not authenticated');
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        phone: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    res.json({
      success: true,
      data: { user },
    });
  }
);

export const updateProfileHandler = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Not authenticated');
    }

    const updates = updateProfileSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updates,
      select: {
        id: true,
        phone: true,
        name: true,
        email: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user },
    });
  }
);

export const getFavoritesHandler = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Not authenticated');
    }

    const favorites = await prisma.favoriteRestaurant.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        restaurant: {
          select: {
            id: true,
            slug: true,
            name: true,
            description: true,
            cuisineType: true,
            imageUrl: true,
            coverImageUrl: true,
            rating: true,
            totalReviews: true,
            totalCompletedOrders: true,
            latitude: true,
            longitude: true,
            isAcceptingOrders: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: {
        favorites: favorites.map((fav) => fav.restaurant),
      },
    });
  }
);

export const addFavoriteHandler = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Not authenticated');
    }

    const restaurantId = req.params.restaurantId as string;

    // Check if restaurant exists
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new AppError(404, 'Restaurant not found');
    }

    // Check if already favorited
    const existing = await prisma.favoriteRestaurant.findUnique({
      where: {
        userId_restaurantId: {
          userId: req.user.id,
          restaurantId,
        },
      },
    });

    if (existing) {
      return res.json({
        success: true,
        message: 'Restaurant already in favorites',
      });
    }

    await prisma.favoriteRestaurant.create({
      data: {
        userId: req.user.id,
        restaurantId,
      },
    });

    res.json({
      success: true,
      message: 'Restaurant added to favorites',
    });
  }
);

export const removeFavoriteHandler = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Not authenticated');
    }

    const restaurantId = req.params.restaurantId as string;

    await prisma.favoriteRestaurant.deleteMany({
      where: {
        userId: req.user.id,
        restaurantId,
      },
    });

    res.json({
      success: true,
      message: 'Restaurant removed from favorites',
    });
  }
);
