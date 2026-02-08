import { Response } from 'express';
import { prisma } from '@repo/db';
import { AuthenticatedRequest } from '../types';
import { addToCartSchema, updateCartItemSchema } from '../validators/cart.validator';
import { AppError, asyncHandler } from '../middleware/error-handler';

export const getCartHandler = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Not authenticated');
    }

    const cart = await prisma.cart.findFirst({
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
                description: true,
                price: true,
                imageUrl: true,
                isVeg: true,
                isAvailable: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      return res.json({
        success: true,
        data: {
          cart: null,
          subtotal: 0,
          itemCount: 0,
        },
      });
    }

    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => {
      return sum + item.menuItem.price * item.quantity;
    }, 0);

    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    res.json({
      success: true,
      data: {
        cart,
        subtotal,
        itemCount,
      },
    });
  }
);

export const addToCartHandler = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Not authenticated');
    }

    const { restaurantId, menuItemId, quantity } = addToCartSchema.parse(req.body);

    // Verify menu item exists and belongs to restaurant
    const menuItem = await prisma.menuItem.findFirst({
      where: {
        id: menuItemId,
        category: {
          restaurantId,
        },
        isAvailable: true,
      },
    });

    if (!menuItem) {
      throw new AppError(404, 'Menu item not found or unavailable');
    }

    // Verify restaurant is accepting orders
    const restaurant = await prisma.restaurant.findFirst({
      where: {
        id: restaurantId,
        isActive: true,
        isAcceptingOrders: true,
      },
      select: { id: true, name: true },
    });

    if (!restaurant) {
      throw new AppError(400, 'Restaurant is not accepting orders at this time');
    }

    // Check if user has existing cart
    let cart = await prisma.cart.findFirst({
      where: {
        userId: req.user.id,
      },
    });

    // If cart exists but for different restaurant, clear it
    if (cart && cart.restaurantId !== restaurantId) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      cart = await prisma.cart.update({
        where: { id: cart.id },
        data: { restaurantId },
      });
    }

    // Create cart if doesn't exist
    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: req.user.id,
          restaurantId,
        },
      });
    }

    // Add or update cart item
    const cartItem = await prisma.cartItem.upsert({
      where: {
        cartId_menuItemId: {
          cartId: cart.id,
          menuItemId,
        },
      },
      create: {
        cartId: cart.id,
        menuItemId,
        quantity,
      },
      update: {
        quantity: {
          increment: quantity,
        },
      },
      include: {
        menuItem: true,
      },
    });

    res.json({
      success: true,
      message: 'Item added to cart',
      data: { cartItem },
    });
  }
);

export const updateCartItemHandler = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Not authenticated');
    }

    const itemId = req.params.itemId as string;
    const { quantity } = updateCartItemSchema.parse(req.body);

    // Verify cart item belongs to user
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: {
          userId: req.user.id,
        },
      },
    });

    if (!cartItem) {
      throw new AppError(404, 'Cart item not found');
    }

    // Update quantity
    const updatedItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: {
        menuItem: true,
      },
    });

    res.json({
      success: true,
      message: 'Cart item updated',
      data: { cartItem: updatedItem },
    });
  }
);

export const removeCartItemHandler = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Not authenticated');
    }

    const itemId = req.params.itemId as string;

    // Verify cart item belongs to user
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: {
          userId: req.user.id,
        },
      },
    });

    if (!cartItem) {
      throw new AppError(404, 'Cart item not found');
    }

    // Delete cart item
    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    res.json({
      success: true,
      message: 'Item removed from cart',
    });
  }
);

export const clearCartHandler = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Not authenticated');
    }

    // Find user's cart
    const cart = await prisma.cart.findFirst({
      where: {
        userId: req.user.id,
      },
    });

    if (cart) {
      // Delete all cart items
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    res.json({
      success: true,
      message: 'Cart cleared',
    });
  }
);
