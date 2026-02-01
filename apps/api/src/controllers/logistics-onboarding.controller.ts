import { Response } from 'express';
import { prisma } from '@repo/db';
import { LogisticsAuthenticatedRequest } from '../types';
import {
  submitDocumentsSchema,
  submitBankDetailsSchema,
} from '../validators/logistics-onboarding.validator';
import { AppError, asyncHandler } from '../middleware/error-handler';

export const submitDocumentsHandler = asyncHandler(
  async (req: LogisticsAuthenticatedRequest, res: Response) => {
    if (!req.personnel) {
      throw new AppError(401, 'Not authenticated');
    }

    const { aadharNumber, aadharFileUrl, dlNumber, dlFileUrl, vehicleType, vehicleNumber } =
      submitDocumentsSchema.parse(req.body);

    // Check current onboarding status
    const personnel = await prisma.deliveryPersonnel.findUnique({
      where: { id: req.personnel.id },
    });

    if (!personnel) {
      throw new AppError(404, 'Personnel not found');
    }

    if (personnel.onboardingStatus !== 'PENDING_DOCUMENTS') {
      throw new AppError(400, 'Documents already submitted');
    }

    // Create documents
    await prisma.$transaction([
      // Create Aadhar document
      prisma.deliveryDocument.upsert({
        where: {
          personnelId_type: {
            personnelId: req.personnel.id,
            type: 'AADHAR_CARD',
          },
        },
        create: {
          personnelId: req.personnel.id,
          type: 'AADHAR_CARD',
          documentNumber: aadharNumber,
          fileUrl: aadharFileUrl,
        },
        update: {
          documentNumber: aadharNumber,
          fileUrl: aadharFileUrl,
        },
      }),
      // Create DL document
      prisma.deliveryDocument.upsert({
        where: {
          personnelId_type: {
            personnelId: req.personnel.id,
            type: 'DRIVING_LICENSE',
          },
        },
        create: {
          personnelId: req.personnel.id,
          type: 'DRIVING_LICENSE',
          documentNumber: dlNumber,
          fileUrl: dlFileUrl,
        },
        update: {
          documentNumber: dlNumber,
          fileUrl: dlFileUrl,
        },
      }),
      // Update personnel
      prisma.deliveryPersonnel.update({
        where: { id: req.personnel.id },
        data: {
          vehicleType,
          vehicleNumber,
          onboardingStatus: 'PENDING_BANK_DETAILS',
        },
      }),
    ]);

    res.json({
      success: true,
      message: 'Documents submitted successfully',
      data: {
        onboardingStatus: 'PENDING_BANK_DETAILS',
      },
    });
  }
);

export const submitBankDetailsHandler = asyncHandler(
  async (req: LogisticsAuthenticatedRequest, res: Response) => {
    if (!req.personnel) {
      throw new AppError(401, 'Not authenticated');
    }

    const { accountTitle, accountNumber, ifscCode, branchName } =
      submitBankDetailsSchema.parse(req.body);

    // Check current onboarding status
    const personnel = await prisma.deliveryPersonnel.findUnique({
      where: { id: req.personnel.id },
    });

    if (!personnel) {
      throw new AppError(404, 'Personnel not found');
    }

    if (personnel.onboardingStatus !== 'PENDING_BANK_DETAILS') {
      throw new AppError(400, 'Please submit documents first');
    }

    // Create or update bank details
    await prisma.$transaction([
      prisma.deliveryBankDetails.upsert({
        where: { personnelId: req.personnel.id },
        create: {
          personnelId: req.personnel.id,
          accountTitle,
          accountNumber,
          ifscCode,
          branchName,
        },
        update: {
          accountTitle,
          accountNumber,
          ifscCode,
          branchName,
        },
      }),
      prisma.deliveryPersonnel.update({
        where: { id: req.personnel.id },
        data: {
          onboardingStatus: 'PENDING_REVIEW',
        },
      }),
    ]);

    res.json({
      success: true,
      message: 'Bank details submitted successfully. Your application is under review.',
      data: {
        onboardingStatus: 'PENDING_REVIEW',
      },
    });
  }
);

export const getOnboardingStatusHandler = asyncHandler(
  async (req: LogisticsAuthenticatedRequest, res: Response) => {
    if (!req.personnel) {
      throw new AppError(401, 'Not authenticated');
    }

    const personnel = await prisma.deliveryPersonnel.findUnique({
      where: { id: req.personnel.id },
      select: {
        id: true,
        onboardingStatus: true,
        vehicleType: true,
        vehicleNumber: true,
        documents: {
          select: {
            type: true,
            documentNumber: true,
            verified: true,
          },
        },
        bankDetails: {
          select: {
            accountTitle: true,
            ifscCode: true,
            branchName: true,
            verified: true,
          },
        },
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
