import { Response } from 'express';
import { prisma, OrderStatus, PaymentStatus } from '@repo/db';
import { AuthenticatedRequest } from '../types';
import { createOrderSchema, reorderSchema } from '../validators/order.validator';
import { AppError, asyncHandler } from '../middleware/error-handler';
import { calculateDeliveryFee } from '../services/delivery-fee.service';

const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD${timestamp}${random}`;
};

export const getOrdersHandler = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Not authenticated');
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        restaurant: {
          select: {
            id: true,
            slug: true,
            name: true,
            imageUrl: true,
          },
        },
        items: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: { orders },
    });
  }
);

export const getOrderByIdHandler = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Not authenticated');
    }

    const id = req.params.id as string;

    const order = await prisma.order.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
      include: {
        restaurant: true,
        address: true,
        items: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                isVeg: true,
              },
            },
          },
        },
        payment: true,
        review: true,
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

export const createOrderHandler = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Not authenticated');
    }

    const { addressId, paymentMethod, deliveryInstructions } = createOrderSchema.parse(req.body);

    // Verify address belongs to user
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: req.user.id,
      },
    });

    if (!address) {
      throw new AppError(404, 'Address not found');
    }

    // Get user's cart
    const cart = await prisma.cart.findFirst({
      where: {
        userId: req.user.id,
      },
      include: {
        restaurant: true,
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new AppError(400, 'Cart is empty');
    }

    // Verify restaurant is still accepting orders
    if (!cart.restaurant.isActive || !cart.restaurant.isAcceptingOrders) {
      throw new AppError(400, 'Restaurant is not accepting orders at this time');
    }

    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => {
      return sum + item.menuItem.price * item.quantity;
    }, 0);

    // Validate address has coordinates for delivery fee calculation
    if (!address.latitude || !address.longitude) {
      throw new AppError(
        400,
        'Delivery address must have valid coordinates. Please update your address with a location.'
      );
    }

    // Calculate delivery fee based on Google Maps route distance
    const { deliveryFee, distanceKm, durationMinutes } = await calculateDeliveryFee(
      cart.restaurant.latitude,
      cart.restaurant.longitude,
      address.latitude,
      address.longitude
    );

    const tax = subtotal * 0.05; // 5% tax
    const total = subtotal + deliveryFee + tax;

    console.log(`📦 Order calculation - Distance: ${distanceKm}km, Fee: ₹${deliveryFee}, Total: ₹${total}`);

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: req.user.id,
        restaurantId: cart.restaurantId,
        addressId,
        status: OrderStatus.PENDING,
        subtotal,
        deliveryFee,
        deliveryDistance: distanceKm,
        deliveryDuration: durationMinutes,
        tax,
        total,
        paymentMethod,
        deliveryInstructions,
        estimatedDeliveryTime: new Date(
          Date.now() + durationMinutes * 60 * 1000
        ),
        items: {
          create: cart.items.map((item) => ({
            menuItemId: item.menuItemId,
            name: item.menuItem.name,
            price: item.menuItem.price,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        restaurant: {
          select: {
            id: true,
            slug: true,
            name: true,
            imageUrl: true,
          },
        },
        items: true,
      },
    });

    // Clear cart
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order },
    });
  }
);

export const reorderHandler = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Not authenticated');
    }

    const id = req.params.id as string;
    const { addressId } = reorderSchema.parse(req.body);

    // Get original order
    const originalOrder = await prisma.order.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        restaurant: true,
      },
    });

    if (!originalOrder) {
      throw new AppError(404, 'Order not found');
    }

    // Check if all items are still available
    const unavailableItems = originalOrder.items.filter(
      (item) => !item.menuItem.isAvailable
    );

    if (unavailableItems.length > 0) {
      throw new AppError(
        400,
        'Some items from your order are no longer available'
      );
    }

    // Clear existing cart
    const existingCart = await prisma.cart.findFirst({
      where: { userId: req.user.id },
    });

    if (existingCart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: existingCart.id },
      });
    }

    // Create or update cart with order items
    const cart = await prisma.cart.upsert({
      where: {
        userId_restaurantId: {
          userId: req.user.id,
          restaurantId: originalOrder.restaurantId,
        },
      },
      create: {
        userId: req.user.id,
        restaurantId: originalOrder.restaurantId,
        items: {
          create: originalOrder.items.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
          })),
        },
      },
      update: {
        items: {
          create: originalOrder.items.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'Items added to cart',
      data: { cart },
    });
  }
);
