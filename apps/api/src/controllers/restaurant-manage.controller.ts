import { Response } from 'express';
import { prisma } from '@repo/db';
import { RestaurantAuthenticatedRequest } from '../types';
import {
  updateRestaurantProfileSchema,
  updateOrderStatusSchema,
  toggleAcceptingOrdersSchema,
} from '../validators/restaurant-manage.validator';
import { AppError, asyncHandler } from '../middleware/error-handler';
import { getFileUrl, RequestWithFileUrl } from '../middleware/upload';

// Get restaurant profile
export const getProfileHandler = asyncHandler(
  async (req: RestaurantAuthenticatedRequest, res: Response) => {
    if (!req.owner || !req.owner.restaurantId) {
      throw new AppError(400, 'Restaurant not found');
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: req.owner.restaurantId },
      include: {
        categories: {
          include: {
            items: true,
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    });

    if (!restaurant) {
      throw new AppError(404, 'Restaurant not found');
    }

    res.json({
      success: true,
      data: { restaurant },
    });
  }
);

// Update restaurant profile
export const updateProfileHandler = asyncHandler(
  async (req: RestaurantAuthenticatedRequest & RequestWithFileUrl, res: Response) => {
    if (!req.owner || !req.owner.restaurantId) {
      throw new AppError(400, 'Restaurant not found');
    }

    // Parse FormData - convert strings to proper types
    const parsedBody: any = {};

    if (req.body.name) parsedBody.name = req.body.name;
    if (req.body.description) parsedBody.description = req.body.description;
    if (req.body.cuisineType) parsedBody.cuisineType = JSON.parse(req.body.cuisineType);
    if (req.body.phone) parsedBody.phone = req.body.phone;
    if (req.body.email) parsedBody.email = req.body.email;
    if (req.body.opensAt) parsedBody.opensAt = req.body.opensAt;
    if (req.body.closesAt) parsedBody.closesAt = req.body.closesAt;
    if (req.body.minOrderAmount !== undefined) parsedBody.minOrderAmount = Number(req.body.minOrderAmount);
    if (req.body.deliveryFee !== undefined) parsedBody.deliveryFee = Number(req.body.deliveryFee);
    if (req.body.estimatedDeliveryTime !== undefined) parsedBody.estimatedDeliveryTime = Number(req.body.estimatedDeliveryTime);
    if (req.body.isActive !== undefined) parsedBody.isActive = req.body.isActive === 'true';
    if (req.body.isAcceptingOrders !== undefined) parsedBody.isAcceptingOrders = req.body.isAcceptingOrders === 'true';

    const data = updateRestaurantProfileSchema.parse(parsedBody);
    const coverImageUrl = req.fileUrl || null; // Get URL from middleware

    const restaurant = await prisma.restaurant.update({
      where: { id: req.owner.restaurantId },
      data: {
        ...data,
        ...(coverImageUrl && { coverImageUrl }),
      },
    });

    res.json({
      success: true,
      message: 'Restaurant profile updated successfully',
      data: { restaurant },
    });
  }
);

// Get all menu
export const getMenuHandler = asyncHandler(
  async (req: RestaurantAuthenticatedRequest, res: Response) => {
    if (!req.owner || !req.owner.restaurantId) {
      throw new AppError(400, 'Restaurant not found');
    }

    const categories = await prisma.category.findMany({
      where: { restaurantId: req.owner.restaurantId },
      include: {
        items: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    res.json({
      success: true,
      data: { categories },
    });
  }
);

// Get restaurant orders
export const getOrdersHandler = asyncHandler(
  async (req: RestaurantAuthenticatedRequest, res: Response) => {
    if (!req.owner || !req.owner.restaurantId) {
      throw new AppError(400, 'Restaurant not found');
    }

    const { status, page = '1', limit = '20' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      restaurantId: req.owner.restaurantId,
      ...(status && { status: status as any }),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
          address: true,
          items: {
            include: {
              menuItem: true,
            },
          },
          payment: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: Number(limit),
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  }
);

// Get order by ID
export const getOrderByIdHandler = asyncHandler(
  async (req: RestaurantAuthenticatedRequest, res: Response) => {
    if (!req.owner || !req.owner.restaurantId) {
      throw new AppError(400, 'Restaurant not found');
    }

    const { orderId } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        restaurantId: req.owner.restaurantId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        address: true,
        items: {
          include: {
            menuItem: true,
          },
        },
        payment: true,
      },
    });

    if (!order) {
      throw new AppError(404, 'Order not found');
    }

    res.json({
      success: true,
      data: { order },
    });
  }
);

// Update order status
export const updateOrderStatusHandler = asyncHandler(
  async (req: RestaurantAuthenticatedRequest, res: Response) => {
    if (!req.owner || !req.owner.restaurantId) {
      throw new AppError(400, 'Restaurant not found');
    }

    const { orderId } = req.params;
    const { status } = updateOrderStatusSchema.parse(req.body);

    // Verify order belongs to this restaurant
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        restaurantId: req.owner.restaurantId,
      },
    });

    if (!order) {
      throw new AppError(404, 'Order not found');
    }

    // Update order status and increment completed orders if delivered
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id: orderId },
        data: {
          status,
          ...(status === 'DELIVERED' && { deliveredAt: new Date() }),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
          items: true,
          restaurant: {
            select: {
              id: true,
            },
          },
        },
      });

      // Increment restaurant's total completed orders when marked delivered
      if (status === 'DELIVERED') {
        await tx.restaurant.update({
          where: { id: order.restaurant.id },
          data: {
            totalCompletedOrders: { increment: 1 },
          },
        });
      }

      return order;
    });

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order: updatedOrder },
    });
  }
);

// Toggle accepting orders status
export const toggleAcceptingOrdersHandler = asyncHandler(
  async (req: RestaurantAuthenticatedRequest, res: Response) => {
    if (!req.owner || !req.owner.restaurantId) {
      throw new AppError(400, 'Restaurant not found');
    }

    const { isAcceptingOrders } = toggleAcceptingOrdersSchema.parse(req.body);

    const restaurant = await prisma.restaurant.update({
      where: { id: req.owner.restaurantId },
      data: { isAcceptingOrders },
      select: {
        id: true,
        name: true,
        isActive: true,
        isAcceptingOrders: true,
      },
    });

    res.json({
      success: true,
      message: `Restaurant is now ${isAcceptingOrders ? 'accepting' : 'not accepting'} orders`,
      data: { restaurant },
    });
  }
);
