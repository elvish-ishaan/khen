import { Response } from 'express';
import { prisma } from '@repo/db';
import { LogisticsAuthenticatedRequest } from '../types';
import { requestWithdrawalSchema, getEarningsSchema } from '../validators/logistics.validator';
import { AppError, asyncHandler } from '../middleware/error-handler';

export const getEarningsHandler = asyncHandler(
  async (req: LogisticsAuthenticatedRequest, res: Response) => {
    if (!req.personnel) {
      throw new AppError(401, 'Not authenticated');
    }

    const { startDate, endDate } = req.query;

    const whereClause: any = {
      personnelId: req.personnel.id,
    };

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(startDate as string);
      if (endDate) whereClause.createdAt.lte = new Date(endDate as string);
    }

    const [earnings, totalEarnings, totalDeliveries] = await Promise.all([
      prisma.deliveryEarning.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc',
        },
        take: 50,
        select: {
          id: true,
          amount: true,
          distance: true,
          createdAt: true,
          orderId: true,
        },
      }),
      prisma.deliveryEarning.aggregate({
        where: whereClause,
        _sum: {
          amount: true,
        },
      }),
      prisma.delivery.count({
        where: {
          personnelId: req.personnel.id,
          status: 'DELIVERED',
        },
      }),
    ]);

    // Get withdrawn amount
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

    const totalWithdrawn = withdrawals._sum.amount || 0;
    const pendingBalance = (totalEarnings._sum.amount || 0) - totalWithdrawn;

    res.json({
      success: true,
      data: {
        earnings,
        summary: {
          totalEarnings: totalEarnings._sum.amount || 0,
          totalWithdrawn,
          pendingBalance,
          totalDeliveries,
        },
      },
    });
  }
);

export const requestWithdrawalHandler = asyncHandler(
  async (req: LogisticsAuthenticatedRequest, res: Response) => {
    if (!req.personnel) {
      throw new AppError(401, 'Not authenticated');
    }

    const { amount } = requestWithdrawalSchema.parse(req.body);

    // Calculate available balance
    const [totalEarnings, totalWithdrawals] = await Promise.all([
      prisma.deliveryEarning.aggregate({
        where: {
          personnelId: req.personnel.id,
        },
        _sum: {
          amount: true,
        },
      }),
      prisma.withdrawal.aggregate({
        where: {
          personnelId: req.personnel.id,
          status: {
            in: ['COMPLETED', 'PROCESSING', 'PENDING'],
          },
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    const availableBalance = (totalEarnings._sum.amount || 0) - (totalWithdrawals._sum.amount || 0);

    if (amount > availableBalance) {
      throw new AppError(400, `Insufficient balance. Available: ₹${availableBalance}`);
    }

    // Check if bank details are verified
    const bankDetails = await prisma.deliveryBankDetails.findUnique({
      where: { personnelId: req.personnel.id },
    });

    if (!bankDetails || !bankDetails.verified) {
      throw new AppError(400, 'Please verify your bank details before requesting withdrawal');
    }

    // Create withdrawal request
    const withdrawal = await prisma.withdrawal.create({
      data: {
        personnelId: req.personnel.id,
        amount,
        status: 'PENDING',
      },
    });

    res.json({
      success: true,
      message: 'Withdrawal request submitted. Processing will be completed within 7 business days.',
      data: { withdrawal },
    });
  }
);

export const getWithdrawalsHandler = asyncHandler(
  async (req: LogisticsAuthenticatedRequest, res: Response) => {
    if (!req.personnel) {
      throw new AppError(401, 'Not authenticated');
    }

    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [withdrawals, total] = await Promise.all([
      prisma.withdrawal.findMany({
        where: {
          personnelId: req.personnel.id,
        },
        orderBy: {
          requestedAt: 'desc',
        },
        skip,
        take: Number(limit),
      }),
      prisma.withdrawal.count({
        where: {
          personnelId: req.personnel.id,
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        withdrawals,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  }
);
