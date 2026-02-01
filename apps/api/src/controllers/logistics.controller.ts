import { Response } from 'express';
import { prisma } from '@repo/db';
import { LogisticsAuthenticatedRequest } from '../types';
import { updateFcmTokenSchema } from '../validators/logistics.validator';
import { AppError, asyncHandler } from '../middleware/error-handler';

export const startDutyHandler = asyncHandler(
  async (req: LogisticsAuthenticatedRequest, res: Response) => {
    if (!req.personnel) {
      throw new AppError(401, 'Not authenticated');
    }

    // Check if personnel is approved
    const personnel = await prisma.deliveryPersonnel.findUnique({
      where: { id: req.personnel.id },
    });

    if (!personnel) {
      throw new AppError(404, 'Personnel not found');
    }

    if (personnel.onboardingStatus !== 'APPROVED') {
      throw new AppError(403, 'Your account is not approved yet');
    }

    // Update duty status
    await prisma.deliveryPersonnel.update({
      where: { id: req.personnel.id },
      data: { isOnDuty: true },
    });

    res.json({
      success: true,
      message: 'You are now on duty',
      data: { isOnDuty: true },
    });
  }
);

export const endDutyHandler = asyncHandler(
  async (req: LogisticsAuthenticatedRequest, res: Response) => {
    if (!req.personnel) {
      throw new AppError(401, 'Not authenticated');
    }

    // Check for active deliveries
    const activeDelivery = await prisma.delivery.findFirst({
      where: {
        personnelId: req.personnel.id,
        status: {
          in: ['ASSIGNED', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT'],
        },
      },
    });

    if (activeDelivery) {
      throw new AppError(400, 'You have active deliveries. Please complete them before going off duty.');
    }

    // Update duty status
    await prisma.deliveryPersonnel.update({
      where: { id: req.personnel.id },
      data: { isOnDuty: false },
    });

    res.json({
      success: true,
      message: 'You are now off duty',
      data: { isOnDuty: false },
    });
  }
);

export const updateFcmTokenHandler = asyncHandler(
  async (req: LogisticsAuthenticatedRequest, res: Response) => {
    if (!req.personnel) {
      throw new AppError(401, 'Not authenticated');
    }

    const { fcmToken } = updateFcmTokenSchema.parse(req.body);

    await prisma.deliveryPersonnel.update({
      where: { id: req.personnel.id },
      data: { fcmToken },
    });

    res.json({
      success: true,
      message: 'FCM token updated',
    });
  }
);

export const getProfileHandler = asyncHandler(
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
        vehicleType: true,
        vehicleNumber: true,
        isOnDuty: true,
        onboardingStatus: true,
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
