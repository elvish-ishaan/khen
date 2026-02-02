import { Response } from 'express';
import { prisma } from '@repo/db';
import { LogisticsAuthenticatedRequest } from '../types';
import { AppError, asyncHandler } from '../middleware/error-handler';

export const getDashboardStatsHandler = asyncHandler(
  async (req: LogisticsAuthenticatedRequest, res: Response) => {
    if (!req.personnel) {
      throw new AppError(401, 'Not authenticated');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    // Get today's stats
    const [todayDeliveries, todayEarnings] = await Promise.all([
      prisma.delivery.count({
        where: {
          personnelId: req.personnel.id,
          status: 'DELIVERED',
          updatedAt: {
            gte: today,
          },
        },
      }),
      prisma.deliveryEarning.aggregate({
        where: {
          personnelId: req.personnel.id,
          createdAt: {
            gte: today,
          },
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    // Get weekly stats
    const [weeklyDeliveries, weeklyEarnings] = await Promise.all([
      prisma.delivery.count({
        where: {
          personnelId: req.personnel.id,
          status: 'DELIVERED',
          updatedAt: {
            gte: thisWeek,
          },
        },
      }),
      prisma.deliveryEarning.aggregate({
        where: {
          personnelId: req.personnel.id,
          createdAt: {
            gte: thisWeek,
          },
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    // Get monthly stats
    const [monthlyDeliveries, monthlyEarnings] = await Promise.all([
      prisma.delivery.count({
        where: {
          personnelId: req.personnel.id,
          status: 'DELIVERED',
          updatedAt: {
            gte: thisMonth,
          },
        },
      }),
      prisma.deliveryEarning.aggregate({
        where: {
          personnelId: req.personnel.id,
          createdAt: {
            gte: thisMonth,
          },
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    // Get active deliveries
    const activeDeliveries = await prisma.delivery.count({
      where: {
        personnelId: req.personnel.id,
        status: {
          in: ['ACCEPTED', 'PICKED_UP', 'IN_TRANSIT'],
        },
      },
    });

    // Get total lifetime stats
    const [totalDeliveries, totalEarnings] = await Promise.all([
      prisma.delivery.count({
        where: {
          personnelId: req.personnel.id,
          status: 'DELIVERED',
        },
      }),
      prisma.deliveryEarning.aggregate({
        where: {
          personnelId: req.personnel.id,
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    // Get pending balance
    const withdrawals = await prisma.withdrawal.aggregate({
      where: {
        personnelId: req.personnel.id,
        status: {
          in: ['COMPLETED', 'PROCESSING'],
        },
      },
      _sum: {
        amount: true,
      },
    });

    const pendingBalance = (totalEarnings._sum.amount || 0) - (withdrawals._sum.amount || 0);

    res.json({
      success: true,
      data: {
        today: {
          deliveries: todayDeliveries,
          earnings: todayEarnings._sum.amount || 0,
        },
        weekly: {
          deliveries: weeklyDeliveries,
          earnings: weeklyEarnings._sum.amount || 0,
        },
        monthly: {
          deliveries: monthlyDeliveries,
          earnings: monthlyEarnings._sum.amount || 0,
        },
        lifetime: {
          deliveries: totalDeliveries,
          earnings: totalEarnings._sum.amount || 0,
        },
        activeDeliveries,
        pendingBalance,
      },
    });
  }
);
