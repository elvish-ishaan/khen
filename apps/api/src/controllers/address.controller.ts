import { Response } from 'express';
import { prisma } from '@repo/db';
import { AuthenticatedRequest } from '../types';
import { createAddressSchema, updateAddressSchema } from '../validators/address.validator';
import { AppError, asyncHandler } from '../middleware/error-handler';

export const getAddressesHandler = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Not authenticated');
    }

    const addresses = await prisma.address.findMany({
      where: {
        userId: req.user.id,
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    res.json({
      success: true,
      data: { addresses },
    });
  }
);

export const createAddressHandler = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Not authenticated');
    }

    const data = createAddressSchema.parse(req.body);

    // If this is set as default, unset other defaults
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: req.user.id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const address = await prisma.address.create({
      data: {
        ...data,
        userId: req.user.id,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Address created successfully',
      data: { address },
    });
  }
);

export const updateAddressHandler = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Not authenticated');
    }

    const { id } = req.params;
    const updates = updateAddressSchema.parse(req.body);

    // Verify address belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!existingAddress) {
      throw new AppError(404, 'Address not found');
    }

    // If setting as default, unset other defaults
    if (updates.isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: req.user.id,
          isDefault: true,
          NOT: { id },
        },
        data: {
          isDefault: false,
        },
      });
    }

    const address = await prisma.address.update({
      where: { id },
      data: updates,
    });

    res.json({
      success: true,
      message: 'Address updated successfully',
      data: { address },
    });
  }
);

export const deleteAddressHandler = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Not authenticated');
    }

    const { id } = req.params;

    // Verify address belongs to user
    const address = await prisma.address.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!address) {
      throw new AppError(404, 'Address not found');
    }

    await prisma.address.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Address deleted successfully',
    });
  }
);

export const setDefaultAddressHandler = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Not authenticated');
    }

    const { id } = req.params;

    // Verify address belongs to user
    const address = await prisma.address.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!address) {
      throw new AppError(404, 'Address not found');
    }

    // Unset all other defaults
    await prisma.address.updateMany({
      where: {
        userId: req.user.id,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });

    // Set this address as default
    const updatedAddress = await prisma.address.update({
      where: { id },
      data: { isDefault: true },
    });

    res.json({
      success: true,
      message: 'Default address updated',
      data: { address: updatedAddress },
    });
  }
);
