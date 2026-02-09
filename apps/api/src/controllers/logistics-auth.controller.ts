import { Response } from 'express';
import { prisma } from '@repo/db';
import { LogisticsAuthenticatedRequest } from '../types';
import { verifyFirebaseTokenSchema } from '../validators/logistics-auth.validator';
import { verifyFirebaseIdToken } from '../services/firebase.service';
import { generateToken, getTokenExpiry } from '../services/jwt.service';
import { AppError, asyncHandler } from '../middleware/error-handler';
import { env } from '../config/env';

export const verifyFirebaseTokenHandler = asyncHandler(
  async (req: LogisticsAuthenticatedRequest, res: Response) => {
    const { idToken, name, email } = verifyFirebaseTokenSchema.parse(req.body);

    // Verify Firebase ID token and extract phone number
    const decodedToken = await verifyFirebaseIdToken(idToken);
    const phoneNumber = decodedToken.phone_number;

    if (!phoneNumber) {
      throw new AppError(400, 'Phone number not found in Firebase token');
    }

    // Normalize phone number (ensure +91 prefix)
    const normalizedPhone = phoneNumber.startsWith('+91') ? phoneNumber : `+91${phoneNumber}`;

    // Find or create delivery personnel
    let personnel = await prisma.deliveryPersonnel.findUnique({
      where: { phone: normalizedPhone },
    });

    if (!personnel) {
      personnel = await prisma.deliveryPersonnel.create({
        data: {
          phone: normalizedPhone,
          name,
          email,
        },
      });
    } else if (name || email) {
      // Update personnel info if provided
      personnel = await prisma.deliveryPersonnel.update({
        where: { id: personnel.id },
        data: {
          ...(name && { name }),
          ...(email && { email }),
        },
      });
    }

    // Generate JWT token
    const token = generateToken({
      personnelId: personnel.id,
      phone: personnel.phone,
      role: 'logistics',
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

    res.cookie('logistics_auth_token', token, cookieOptions);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        personnel: {
          id: personnel.id,
          phone: personnel.phone,
          name: personnel.name,
          email: personnel.email,
          onboardingStatus: personnel.onboardingStatus,
        },
      },
    });
  }
);

export const logoutHandler = asyncHandler(
  async (req: LogisticsAuthenticatedRequest, res: Response) => {
    const cookieOptions: any = {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    };

    if (env.NODE_ENV === 'production' && env.COOKIE_DOMAIN) {
      cookieOptions.domain = env.COOKIE_DOMAIN;
    }

    res.clearCookie('logistics_auth_token', cookieOptions);

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  }
);

export const getMeHandler = asyncHandler(
  async (req: LogisticsAuthenticatedRequest, res: Response) => {
    if (!req.personnel) {
      throw new AppError(401, 'Not authenticated');
    }

    const personnel = await prisma.deliveryPersonnel.findUnique({
      where: { id: req.personnel.id },
      select: {
        id: true,
        phone: true,
        name: true,
        email: true,
        onboardingStatus: true,
        isActive: true,
        isOnDuty: true,
        createdAt: true,
      },
    });

    if (!personnel) {
      throw new AppError(404, 'Delivery personnel not found');
    }

    res.json({
      success: true,
      data: { personnel },
    });
  }
);
