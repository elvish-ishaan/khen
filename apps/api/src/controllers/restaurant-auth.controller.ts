import { Response } from 'express';
import { prisma } from '@repo/db';
import { RestaurantAuthenticatedRequest } from '../types';
import { verifyFirebaseTokenSchema } from '../validators/restaurant-auth.validator';
import { verifyFirebaseIdToken } from '../services/firebase.service';
import { generateToken, getTokenExpiry } from '../services/jwt.service';
import { AppError, asyncHandler } from '../middleware/error-handler';
import { env } from '../config/env';

export const verifyFirebaseTokenHandler = asyncHandler(
  async (req: RestaurantAuthenticatedRequest, res: Response) => {
    const { idToken, name, email } = verifyFirebaseTokenSchema.parse(req.body);

    // Verify Firebase ID token and extract phone number
    const decodedToken = await verifyFirebaseIdToken(idToken);
    const phoneNumber = decodedToken.phone_number;

    if (!phoneNumber) {
      throw new AppError(400, 'Phone number not found in Firebase token');
    }

    // Normalize phone number (ensure +91 prefix)
    const normalizedPhone = phoneNumber.startsWith('+91') ? phoneNumber : `+91${phoneNumber}`;

    // Find or create restaurant owner
    let owner = await prisma.restaurantOwner.findUnique({
      where: { phone: normalizedPhone },
      include: {
        restaurant: true,
      },
    });

    if (!owner) {
      owner = await prisma.restaurantOwner.create({
        data: {
          phone: normalizedPhone,
          name,
          email,
        },
        include: {
          restaurant: true,
        },
      });
    } else if (name || email) {
      // Update owner info if provided
      owner = await prisma.restaurantOwner.update({
        where: { id: owner.id },
        data: {
          ...(name && { name }),
          ...(email && { email }),
        },
        include: {
          restaurant: true,
        },
      });
    }

    // Generate JWT token
    const token = generateToken({
      ownerId: owner.id,
      phone: owner.phone,
      role: 'restaurant',
      restaurantId: owner.restaurantId || undefined,
    });

    // Set cookie
    const cookieOptions: any = {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: getTokenExpiry(),
      path: '/',
    };

    // Add domain in production if configured
    if (env.NODE_ENV === 'production' && env.COOKIE_DOMAIN) {
      cookieOptions.domain = env.COOKIE_DOMAIN;
    }

    res.cookie('restaurant_auth_token', token, cookieOptions);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        owner: {
          id: owner.id,
          phone: owner.phone,
          name: owner.name,
          email: owner.email,
          onboardingStatus: owner.onboardingStatus,
          restaurantId: owner.restaurantId,
        },
      },
    });
  }
);

export const logoutHandler = asyncHandler(
  async (req: RestaurantAuthenticatedRequest, res: Response) => {
    const cookieOptions: any = {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    };

    if (env.NODE_ENV === 'production' && env.COOKIE_DOMAIN) {
      cookieOptions.domain = env.COOKIE_DOMAIN;
    }

    res.clearCookie('restaurant_auth_token', cookieOptions);

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  }
);

export const getMeHandler = asyncHandler(
  async (req: RestaurantAuthenticatedRequest, res: Response) => {
    if (!req.owner) {
      throw new AppError(401, 'Not authenticated');
    }

    const owner = await prisma.restaurantOwner.findUnique({
      where: { id: req.owner.id },
      select: {
        id: true,
        phone: true,
        name: true,
        email: true,
        onboardingStatus: true,
        restaurantId: true,
        createdAt: true,
      },
    });

    if (!owner) {
      throw new AppError(404, 'Owner not found');
    }

    res.json({
      success: true,
      data: { owner },
    });
  }
);
