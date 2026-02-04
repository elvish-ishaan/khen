import { Response } from 'express';
import { prisma, OrderStatus } from '@repo/db';
import { AuthenticatedRequest } from '../types';
import { createReviewSchema } from '../validators/review.validator';
import { AppError, asyncHandler } from '../middleware/error-handler';

export const createReviewHandler = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Not authenticated');
    }

    const { orderId, rating, comment } = createReviewSchema.parse(req.body);

    // Verify order belongs to user and is delivered
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: req.user.id,
      },
      include: {
        review: true,
      },
    });

    if (!order) {
      throw new AppError(404, 'Order not found');
    }

    if (order.status !== OrderStatus.DELIVERED) {
      throw new AppError(400, 'Can only review delivered orders');
    }

    if (order.review) {
      throw new AppError(400, 'Order already reviewed');
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        orderId,
        userId: req.user.id,
        restaurantId: order.restaurantId,
        rating,
        comment,
      },
    });

    // Update restaurant rating
    const reviews = await prisma.review.findMany({
      where: {
        restaurantId: order.restaurantId,
      },
      select: {
        rating: true,
      },
    });

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await prisma.restaurant.update({
      where: { id: order.restaurantId },
      data: {
        rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
        totalReviews: reviews.length,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: { review },
    });
  }
);

export const getRestaurantReviewsHandler = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const restaurantId = req.params.restaurantId as string;

    const reviews = await prisma.review.findMany({
      where: {
        restaurantId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    res.json({
      success: true,
      data: { reviews },
    });
  }
);
