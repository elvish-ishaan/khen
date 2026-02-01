import { Response } from 'express';
import { prisma } from '@repo/db';
import { LogisticsAuthenticatedRequest } from '../types';
import { updateLocationSchema } from '../validators/logistics.validator';
import { AppError, asyncHandler } from '../middleware/error-handler';

export const updateLocationHandler = asyncHandler(
  async (req: LogisticsAuthenticatedRequest, res: Response) => {
    if (!req.personnel) {
      throw new AppError(401, 'Not authenticated');
    }

    const { latitude, longitude } = updateLocationSchema.parse(req.body);

    // Update personnel location and save to history
    await prisma.$transaction([
      prisma.deliveryPersonnel.update({
        where: { id: req.personnel.id },
        data: {
          latitude,
          longitude,
          lastLocationUpdate: new Date(),
        },
      }),
      prisma.deliveryLocationHistory.create({
        data: {
          personnelId: req.personnel.id,
          latitude,
          longitude,
        },
      }),
    ]);

    res.json({
      success: true,
      message: 'Location updated',
    });
  }
);

export const getLocationHistoryHandler = asyncHandler(
  async (req: LogisticsAuthenticatedRequest, res: Response) => {
    if (!req.personnel) {
      throw new AppError(401, 'Not authenticated');
    }

    const { limit = 50 } = req.query;

    const history = await prisma.deliveryLocationHistory.findMany({
      where: { personnelId: req.personnel.id },
      orderBy: { recordedAt: 'desc' },
      take: Number(limit),
      select: {
        latitude: true,
        longitude: true,
        recordedAt: true,
      },
    });

    res.json({
      success: true,
      data: { history },
    });
  }
);
