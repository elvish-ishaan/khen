import { Response } from 'express';
import { prisma } from '@repo/db';
import { AuthenticatedRequest } from '../types';
import { verifyFirebaseTokenSchema } from '../validators/auth.validator';
import { verifyFirebaseIdToken } from '../services/firebase.service';
import { generateToken, getTokenExpiry } from '../services/jwt.service';
import { AppError, asyncHandler } from '../middleware/error-handler';
import { env } from '../config/env';

export const verifyFirebaseTokenHandler = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { idToken, name, email } = verifyFirebaseTokenSchema.parse(req.body);

    // Verify Firebase ID token and extract phone number
    const decodedToken = await verifyFirebaseIdToken(idToken);
    const phoneNumber = decodedToken.phone_number;

    if (!phoneNumber) {
      throw new AppError(400, 'Phone number not found in Firebase token');
    }

    // Normalize phone number (ensure +91 prefix)
    const normalizedPhone = phoneNumber.startsWith('+91') ? phoneNumber : `+91${phoneNumber}`;

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { phone: normalizedPhone },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone: normalizedPhone,
          name,
          email,
        },
      });
    } else if (name || email) {
      // Update user info if provided
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          ...(name && { name }),
          ...(email && { email }),
        },
      });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      phone: user.phone,
    });

    // Set cookie
    const cookieOptions: any = {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'lax' : 'lax',
      maxAge: getTokenExpiry(),
      path: '/',
    };

    // Set cookie domain for subdomain sharing
    if (env.NODE_ENV === 'production' && env.COOKIE_DOMAIN) {
      cookieOptions.domain = env.COOKIE_DOMAIN;
    }

    res.cookie('auth_token', token, cookieOptions);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          email: user.email,
        },
      },
    });
  }
);

export const logoutHandler = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    // Cookie options must match the ones used when setting the cookie
    const cookieOptions: any = {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'lax' : 'lax',
      path: '/',
    };

    // Important: domain must match the one used when setting the cookie
    if (env.NODE_ENV === 'production' && env.COOKIE_DOMAIN) {
      cookieOptions.domain = env.COOKIE_DOMAIN;
    }

    // Clear the cookie with exact same options (except maxAge/expires)
    res.clearCookie('auth_token', cookieOptions);

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  }
);

export const getMeHandler = asyncHandler(
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
