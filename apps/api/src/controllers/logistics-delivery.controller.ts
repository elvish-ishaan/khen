import { Response } from 'express';
import { prisma } from '@repo/db';
import { LogisticsAuthenticatedRequest } from '../types';
import { acceptOrderSchema, updateDeliveryStatusSchema } from '../validators/logistics.validator';
import { AppError, asyncHandler } from '../middleware/error-handler';
import { calculateDistance } from '../services/location.service';
import { env } from '../config/env';

export const getAvailableOrdersHandler = asyncHandler(
  async (req: LogisticsAuthenticatedRequest, res: Response) => {
    if (!req.personnel) {
      throw new AppError(401, 'Not authenticated');
    }

    const personnel = await prisma.deliveryPersonnel.findUnique({
      where: { id: req.personnel.id },
    });

    if (!personnel || !personnel.isOnDuty) {
      throw new AppError(403, 'You must be on duty to view available orders');
    }

    if (!personnel.latitude || !personnel.longitude) {
      throw new AppError(400, 'Please update your location first');
    }

    // Find orders that are ready for pickup and within 10km radius
    // Filter out restaurants with invalid coordinates (0, 0)
    const orders = await prisma.order.findMany({
      where: {
        status: 'READY_FOR_PICKUP',
        delivery: null, // Not assigned to any delivery partner
        restaurant: {
          latitude: { not: 0 },
          longitude: { not: 0 },
        },
      },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            addressLine1: true,
            city: true,
            latitude: true,
            longitude: true,
          },
        },
        address: {
          select: {
            addressLine1: true,
            addressLine2: true,
            city: true,
            latitude: true,
            longitude: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Filter by 10km radius and calculate distance
    const nearbyOrders = orders
      .map((order) => {
        // Validate restaurant coordinates
        if (
          !order.restaurant.latitude ||
          !order.restaurant.longitude ||
          order.restaurant.latitude === 0 ||
          order.restaurant.longitude === 0
        ) {
          console.warn(
            `Order ${order.id} has invalid restaurant coordinates: lat=${order.restaurant.latitude}, lng=${order.restaurant.longitude}`
          );
          return null;
        }

        const distanceToRestaurant = calculateDistance(
          personnel.latitude!,
          personnel.longitude!,
          order.restaurant.latitude,
          order.restaurant.longitude
        );

        // Filter out orders more than 10km away
        if (distanceToRestaurant > 10) return null;

        // Calculate delivery distance
        const deliveryDistance =
          order.address.latitude &&
          order.address.longitude &&
          order.address.latitude !== 0 &&
          order.address.longitude !== 0
            ? calculateDistance(
                order.restaurant.latitude,
                order.restaurant.longitude,
                order.address.latitude,
                order.address.longitude
              )
            : 0;

        return {
          ...order,
          distanceToRestaurant,
          deliveryDistance,
          estimatedEarnings: deliveryDistance * env.COST_PER_KM,
        };
      })
      .filter((order) => order !== null);

    res.json({
      success: true,
      data: { orders: nearbyOrders },
    });
  }
);

export const acceptOrderHandler = asyncHandler(
  async (req: LogisticsAuthenticatedRequest, res: Response) => {
    if (!req.personnel) {
      throw new AppError(401, 'Not authenticated');
    }

    const { orderId } = acceptOrderSchema.parse(req.body);

    const personnel = await prisma.deliveryPersonnel.findUnique({
      where: { id: req.personnel.id },
    });

    if (!personnel || !personnel.isOnDuty) {
      throw new AppError(403, 'You must be on duty to accept orders');
    }

    // Check if order exists and is available
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        delivery: true,
        restaurant: {
          select: {
            latitude: true,
            longitude: true,
          },
        },
        address: {
          select: {
            latitude: true,
            longitude: true,
          },
        },
      },
    });

    if (!order) {
      throw new AppError(404, 'Order not found');
    }

    if (order.status !== 'READY_FOR_PICKUP') {
      throw new AppError(400, 'Order is not ready for pickup');
    }

    if (order.delivery) {
      throw new AppError(400, 'Order has already been accepted by another delivery partner');
    }

    // Validate restaurant coordinates
    if (
      !order.restaurant.latitude ||
      !order.restaurant.longitude ||
      order.restaurant.latitude === 0 ||
      order.restaurant.longitude === 0
    ) {
      throw new AppError(400, 'Restaurant location is not set. Cannot accept this order.');
    }

    // Calculate delivery distance
    const deliveryDistance =
      order.address.latitude &&
      order.address.longitude &&
      order.address.latitude !== 0 &&
      order.address.longitude !== 0
        ? calculateDistance(
            order.restaurant.latitude,
            order.restaurant.longitude,
            order.address.latitude,
            order.address.longitude
          )
        : 0;

    const earnings = deliveryDistance * env.COST_PER_KM;

    // Create delivery and update order status
    const delivery = await prisma.$transaction(async (tx) => {
      const newDelivery = await tx.delivery.create({
        data: {
          orderId: order.id,
          personnelId: req.personnel!.id,
          status: 'ACCEPTED',
          distance: deliveryDistance,
          earnings,
        },
      });

      await tx.order.update({
        where: { id: orderId },
        data: { status: 'OUT_FOR_DELIVERY' },
      });

      // Record broadcast response
      await tx.orderBroadcast.create({
        data: {
          orderId: order.id,
          personnelId: req.personnel!.id,
          respondedAt: new Date(),
          accepted: true,
        },
      });

      return newDelivery;
    });

    res.json({
      success: true,
      message: 'Order accepted successfully',
      data: { delivery },
    });
  }
);

export const markPickedUpHandler = asyncHandler(
  async (req: LogisticsAuthenticatedRequest, res: Response) => {
    if (!req.personnel) {
      throw new AppError(401, 'Not authenticated');
    }

    const id = req.params.id as string;

    const delivery = await prisma.delivery.findUnique({
      where: { id },
      include: {
        order: true,
      },
    });

    if (!delivery) {
      throw new AppError(404, 'Delivery not found');
    }

    if (delivery.personnelId !== req.personnel.id) {
      throw new AppError(403, 'This delivery does not belong to you');
    }

    if (delivery.status !== 'ACCEPTED') {
      throw new AppError(400, 'Order has already been picked up');
    }

    await prisma.delivery.update({
      where: { id },
      data: {
        status: 'PICKED_UP',
        pickupTime: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Order marked as picked up',
    });
  }
);

export const markDeliveredHandler = asyncHandler(
  async (req: LogisticsAuthenticatedRequest, res: Response) => {
    if (!req.personnel) {
      throw new AppError(401, 'Not authenticated');
    }

    const id = req.params.id as string;

    const delivery = await prisma.delivery.findUnique({
      where: { id },
      include: {
        order: true,
      },
    });

    if (!delivery) {
      throw new AppError(404, 'Delivery not found');
    }

    if (delivery.personnelId !== req.personnel.id) {
      throw new AppError(403, 'This delivery does not belong to you');
    }

    if (delivery.status === 'DELIVERED') {
      throw new AppError(400, 'Order has already been delivered');
    }

    // Update delivery and order status, record earnings, increment completed orders
    await prisma.$transaction(async (tx) => {
      // Get order to find restaurantId
      const order = await tx.order.findUnique({
        where: { id: delivery.orderId },
        select: { restaurantId: true },
      });

      await Promise.all([
        tx.delivery.update({
          where: { id },
          data: {
            status: 'DELIVERED',
            deliveryTime: new Date(),
          },
        }),
        tx.order.update({
          where: { id: delivery.orderId },
          data: {
            status: 'DELIVERED',
            deliveredAt: new Date(),
          },
        }),
        tx.deliveryEarning.create({
          data: {
            personnelId: req.personnel.id,
            orderId: delivery.orderId,
            amount: delivery.earnings,
            distance: delivery.distance || 0,
          },
        }),
        // Increment restaurant's total completed orders
        tx.restaurant.update({
          where: { id: order!.restaurantId },
          data: {
            totalCompletedOrders: { increment: 1 },
          },
        }),
      ]);
    });

    res.json({
      success: true,
      message: 'Order marked as delivered',
      data: {
        earnings: delivery.earnings,
      },
    });
  }
);

export const getActiveDeliveriesHandler = asyncHandler(
  async (req: LogisticsAuthenticatedRequest, res: Response) => {
    if (!req.personnel) {
      throw new AppError(401, 'Not authenticated');
    }

    const deliveries = await prisma.delivery.findMany({
      where: {
        personnelId: req.personnel.id,
        status: {
          in: ['ACCEPTED', 'PICKED_UP', 'IN_TRANSIT'],
        },
      },
      include: {
        order: {
          include: {
            restaurant: {
              select: {
                name: true,
                addressLine1: true,
                city: true,
                latitude: true,
                longitude: true,
                phone: true,
              },
            },
            address: {
              select: {
                addressLine1: true,
                addressLine2: true,
                city: true,
                state: true,
                postalCode: true,
                landmark: true,
                latitude: true,
                longitude: true,
              },
            },
            user: {
              select: {
                id: true,
                phone: true,
                name: true,
              },
            },
            items: {
              include: {
                menuItem: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Debug logging
    console.log('=== Active Deliveries Debug ===');
    deliveries.forEach((d, i) => {
      console.log(`Delivery ${i}: status=${d.status}, hasUser=${!!d.order.user}`);
      if (d.order.user) {
        console.log(`  User: phone=${d.order.user.phone}, name=${d.order.user.name}`);
      }
    });

    // Apply privacy filter - only show user contact if picked up or in transit
    const deliveriesWithPrivacy = deliveries.map((delivery) => {
      console.log(`Privacy filter for delivery ${delivery.id}: status="${delivery.status}"`);
      console.log(`  Condition check: status !== 'PICKED_UP' = ${delivery.status !== 'PICKED_UP'}`);
      console.log(`  Condition check: status !== 'IN_TRANSIT' = ${delivery.status !== 'IN_TRANSIT'}`);

      // Only show user contact if picked up or in transit
      if (delivery.status !== 'PICKED_UP' && delivery.status !== 'IN_TRANSIT') {
        console.log('  -> Removing user data (status is not PICKED_UP/IN_TRANSIT)');
        // Destructure to exclude user data for ACCEPTED status
        const { user, ...orderWithoutUser } = delivery.order;
        return {
          ...delivery,
          order: orderWithoutUser,
        };
      }
      console.log('  -> Keeping user data (status is PICKED_UP or IN_TRANSIT)');
      return delivery;
    });

    res.json({
      success: true,
      data: { deliveries: deliveriesWithPrivacy },
    });
  }
);

export const getDeliveryHistoryHandler = asyncHandler(
  async (req: LogisticsAuthenticatedRequest, res: Response) => {
    if (!req.personnel) {
      throw new AppError(401, 'Not authenticated');
    }

    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [deliveries, total] = await Promise.all([
      prisma.delivery.findMany({
        where: {
          personnelId: req.personnel.id,
          status: 'DELIVERED',
        },
        include: {
          order: {
            select: {
              orderNumber: true,
              total: true,
              deliveredAt: true,
              restaurant: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          deliveryTime: 'desc',
        },
        skip,
        take: Number(limit),
      }),
      prisma.delivery.count({
        where: {
          personnelId: req.personnel.id,
          status: 'DELIVERED',
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        deliveries,
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
