import { Response } from 'express';
import { prisma } from '@repo/db';
import { LogisticsAuthenticatedRequest } from '../types';
import { sendOtpSchema, verifyOtpSchema } from '../validators/logistics-auth.validator';
import { sendOtp } from '../services/msg91.service';
import { generateToken, getTokenExpiry } from '../services/jwt.service';
import { AppError, asyncHandler } from '../middleware/error-handler';
import { env } from '../config/env';

export const sendOtpHandler = asyncHandler(
  async (req: LogisticsAuthenticatedRequest, res: Response) => {
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
    const otp = env.NODE_ENV === 'development'
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
  async (req: LogisticsAuthenticatedRequest, res: Response) => {
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
        vehicleType: true,
        vehicleNumber: true,
        isOnDuty: true,
        createdAt: true,
      },
    });

    if (!personnel) {
      throw new AppError(404, 'Personnel not found');
    }

    res.json({
      success: true,
      data: { personnel },
    });
  }
);
