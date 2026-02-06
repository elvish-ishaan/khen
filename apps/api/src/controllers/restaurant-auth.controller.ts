import { Response } from 'express';
import { prisma } from '@repo/db';
import { RestaurantAuthenticatedRequest } from '../types';
import { sendOtpSchema, verifyOtpSchema } from '../validators/restaurant-auth.validator';
import { sendOtp } from '../services/msg91.service';
import { generateToken, getTokenExpiry } from '../services/jwt.service';
import { AppError, asyncHandler } from '../middleware/error-handler';

export const sendOtpHandler = asyncHandler(
  async (req: RestaurantAuthenticatedRequest, res: Response) => {
    const { phone } = sendOtpSchema.parse(req.body);

    // Normalize phone number (add +91 if not present)
    const normalizedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;

    // Check for recent OTP request (rate limiting)
    const recentOtp = await prisma.otpVerification.findFirst({
      where: {
        phone: normalizedPhone,
        createdAt: {
          gte: new Date(Date.now() - 60 * 1000), // Last 1 minute
        },
      },
    });

    if (recentOtp) {
      throw new AppError(429, 'Please wait before requesting another OTP');
    }

    // Generate 6-digit OTP (use 123456 in development for easier testing)
    const otp = process.env.NODE_ENV === 'development'
      ? '123456'
      : Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP to database
    await prisma.otpVerification.create({
      data: {
        phone: normalizedPhone,
        otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });

    // Send OTP via MSG91
    const sent = await sendOtp(normalizedPhone);

    if (!sent) {
      throw new AppError(500, 'Failed to send OTP');
    }

    res.json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        phone: normalizedPhone,
        expiresIn: 600, // seconds
      },
    });
  }
);

export const verifyOtpHandler = asyncHandler(
  async (req: RestaurantAuthenticatedRequest, res: Response) => {
    const { phone, otp, name, email } = verifyOtpSchema.parse(req.body);

    // Normalize phone number
    const normalizedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;

    // Find valid OTP
    const otpRecord = await prisma.otpVerification.findFirst({
      where: {
        phone: normalizedPhone,
        otp,
        expiresAt: {
          gte: new Date(),
        },
        verified: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otpRecord) {
      throw new AppError(400, 'Invalid or expired OTP');
    }

    // Mark OTP as verified
    await prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });

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
    res.cookie('restaurant_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: getTokenExpiry(),
    });

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
    res.clearCookie('restaurant_auth_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

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
