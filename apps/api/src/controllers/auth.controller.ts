import { Response } from 'express';
import { prisma } from '@repo/db';
import { AuthenticatedRequest } from '../types';
import { sendOtpSchema, verifyOtpSchema } from '../validators/auth.validator';
import { sendOtp, verifyOtp } from '../services/msg91.service';
import { generateToken, getTokenExpiry } from '../services/jwt.service';
import { AppError, asyncHandler } from '../middleware/error-handler';

export const sendOtpHandler = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
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
  async (req: AuthenticatedRequest, res: Response) => {
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
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: getTokenExpiry(),
    });

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
    res.clearCookie('auth_token');

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
