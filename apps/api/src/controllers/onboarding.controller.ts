import { Response } from 'express';
import { prisma } from '@repo/db';
import { RestaurantAuthenticatedRequest } from '../types';
import {
  uploadDocumentsSchema,
  bankDetailsSchema,
  restaurantInfoSchema,
  addCategorySchema,
  updateCategorySchema,
  addMenuItemSchema,
  updateMenuItemSchema,
  locationSchema,
} from '../validators/onboarding.validator';
import { AppError, asyncHandler } from '../middleware/error-handler';
import { getFileUrl, RequestWithFileUrl } from '../middleware/upload';

// Get onboarding status
export const getStatusHandler = asyncHandler(
  async (req: RestaurantAuthenticatedRequest, res: Response) => {
    if (!req.owner) {
      throw new AppError(401, 'Not authenticated');
    }

    const owner = await prisma.restaurantOwner.findUnique({
      where: { id: req.owner.id },
      include: {
        documents: true,
        bankDetails: true,
        restaurant: {
          include: {
            categories: {
              include: {
                items: true,
              },
            },
          },
        },
      },
    });

    if (!owner) {
      throw new AppError(404, 'Owner not found');
    }

    res.json({
      success: true,
      data: {
        onboardingStatus: owner.onboardingStatus,
        hasDocuments: owner.documents.length > 0,
        hasBankDetails: !!owner.bankDetails,
        hasRestaurant: !!owner.restaurant,
        hasMenu: owner.restaurant ? owner.restaurant.categories.length > 0 : false,
        restaurant: owner.restaurant,
      },
    });
  }
);

// Upload documents
export const uploadDocumentsHandler = asyncHandler(
  async (req: RestaurantAuthenticatedRequest & RequestWithFileUrl, res: Response) => {
    if (!req.owner) {
      throw new AppError(401, 'Not authenticated');
    }

    const uploadedFiles = (req as any).uploadedFiles as { [fieldname: string]: string[] };
    const data = uploadDocumentsSchema.parse(req.body);

    if (!uploadedFiles || Object.keys(uploadedFiles).length === 0) {
      throw new AppError(400, 'At least one document is required');
    }

    // Map of field names to document types
    const documentTypeMap: { [key: string]: string } = {
      fssaiCertificate: 'FSSAI_CERTIFICATE',
      panCard: 'PAN_CARD',
      aadhar: 'AADHAR',
      gstin: 'GSTIN',
    };

    // Create document records
    const documentPromises = Object.entries(uploadedFiles).map(([fieldName, fileUrls]) => {
      const fileUrl = fileUrls[0]; // Get first file URL
      const docType = documentTypeMap[fieldName];

      if (!docType) return null;

      const documentNumber =
        fieldName === 'aadhar' ? data.aadharNumber :
        fieldName === 'gstin' ? data.gstinNumber :
        fieldName === 'panCard' ? data.panNumber :
        fieldName === 'fssaiCertificate' ? data.fssaiNumber :
        undefined;

      return prisma.restaurantDocument.upsert({
        where: {
          ownerId_type: {
            ownerId: req.owner!.id,
            type: docType as any,
          },
        },
        update: {
          fileUrl,
          documentNumber,
        },
        create: {
          ownerId: req.owner!.id,
          type: docType as any,
          fileUrl,
          documentNumber,
        },
      });
    });

    await Promise.all(documentPromises.filter(Boolean));

    // Update onboarding status
    await prisma.restaurantOwner.update({
      where: { id: req.owner.id },
      data: { onboardingStatus: 'PENDING_BANK_DETAILS' },
    });

    res.json({
      success: true,
      message: 'Documents uploaded successfully',
    });
  }
);

// Submit bank details
export const submitBankDetailsHandler = asyncHandler(
  async (req: RestaurantAuthenticatedRequest, res: Response) => {
    if (!req.owner) {
      throw new AppError(401, 'Not authenticated');
    }

    const { accountTitle, accountNumber, ifscCode, branchName } = bankDetailsSchema.parse(req.body);

    // Create or update bank details
    await prisma.bankDetails.upsert({
      where: { ownerId: req.owner.id },
      update: {
        accountTitle,
        accountNumber,
        ifscCode,
        branchName,
      },
      create: {
        ownerId: req.owner.id,
        accountTitle,
        accountNumber,
        ifscCode,
        branchName,
      },
    });

    // Update onboarding status
    await prisma.restaurantOwner.update({
      where: { id: req.owner.id },
      data: { onboardingStatus: 'PENDING_MENU' },
    });

    res.json({
      success: true,
      message: 'Bank details saved successfully',
    });
  }
);

// Create restaurant
export const createRestaurantHandler = asyncHandler(
  async (req: RestaurantAuthenticatedRequest & RequestWithFileUrl, res: Response) => {
    if (!req.owner) {
      throw new AppError(401, 'Not authenticated');
    }

    // Parse FormData - convert strings to proper types
    const parsedBody = {
      name: req.body.name,
      description: req.body.description,
      cuisineType: JSON.parse(req.body.cuisineType), // Parse JSON string to array
      phone: req.body.phone,
      email: req.body.email,
      opensAt: req.body.opensAt,
      closesAt: req.body.closesAt,
      minOrderAmount: Number(req.body.minOrderAmount), // Convert string to number
      deliveryFee: Number(req.body.deliveryFee), // Convert string to number
      estimatedDeliveryTime: Number(req.body.estimatedDeliveryTime), // Convert string to number
    };

    const data = restaurantInfoSchema.parse(parsedBody);
    const coverImageUrl = req.fileUrl || null; // Get URL from middleware

    // Check if restaurant already exists
    const existingRestaurant = await prisma.restaurant.findFirst({
      where: { owner: { id: req.owner.id } },
    });

    if (existingRestaurant) {
      // Update existing restaurant
      const restaurant = await prisma.restaurant.update({
        where: { id: existingRestaurant.id },
        data: {
          name: data.name,
          description: data.description,
          cuisineType: data.cuisineType,
          phone: data.phone,
          email: data.email,
          opensAt: data.opensAt,
          closesAt: data.closesAt,
          minOrderAmount: data.minOrderAmount || 0,
          deliveryFee: data.deliveryFee || 0,
          estimatedDeliveryTime: data.estimatedDeliveryTime,
          ...(coverImageUrl && { coverImageUrl }),
        },
      });

      res.json({
        success: true,
        message: 'Restaurant info updated successfully',
        data: { restaurant },
      });
    } else {
      // Create slug from name
      const slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      // Ensure slug is unique
      let uniqueSlug = slug;
      let counter = 1;
      while (await prisma.restaurant.findUnique({ where: { slug: uniqueSlug } })) {
        uniqueSlug = `${slug}-${counter}`;
        counter++;
      }

      // Create restaurant with placeholder location (will be updated in location step)
      const restaurant = await prisma.restaurant.create({
        data: {
          name: data.name,
          slug: uniqueSlug,
          description: data.description,
          cuisineType: data.cuisineType,
          phone: data.phone,
          email: data.email,
          opensAt: data.opensAt,
          closesAt: data.closesAt,
          minOrderAmount: data.minOrderAmount || 0,
          deliveryFee: data.deliveryFee || 0,
          estimatedDeliveryTime: data.estimatedDeliveryTime,
          coverImageUrl: coverImageUrl || undefined,
          // Placeholder location (will be updated in location step)
          addressLine1: 'Pending',
          city: 'Pending',
          state: 'Pending',
          postalCode: '000000',
          latitude: 0,
          longitude: 0,
          isActive: false, // Inactive until onboarding complete
        },
      });

      // Link restaurant to owner
      await prisma.restaurantOwner.update({
        where: { id: req.owner.id },
        data: { restaurantId: restaurant.id },
      });

      res.json({
        success: true,
        message: 'Restaurant created successfully',
        data: { restaurant },
      });
    }
  }
);

// Add category
export const addCategoryHandler = asyncHandler(
  async (req: RestaurantAuthenticatedRequest, res: Response) => {
    if (!req.owner || !req.owner.restaurantId) {
      throw new AppError(400, 'Restaurant not created yet');
    }

    const data = addCategorySchema.parse(req.body);

    const category = await prisma.category.create({
      data: {
        restaurantId: req.owner.restaurantId,
        name: data.name,
        description: data.description,
        sortOrder: data.sortOrder,
      },
    });

    res.json({
      success: true,
      message: 'Category added successfully',
      data: { category },
    });
  }
);

// Update category
export const updateCategoryHandler = asyncHandler(
  async (req: RestaurantAuthenticatedRequest, res: Response) => {
    if (!req.owner || !req.owner.restaurantId) {
      throw new AppError(400, 'Restaurant not created yet');
    }

    const categoryId = req.params.categoryId as string;
    const data = updateCategorySchema.parse(req.body);

    // Verify category belongs to this restaurant
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        restaurantId: req.owner.restaurantId,
      },
    });

    if (!category) {
      throw new AppError(404, 'Category not found');
    }

    const updated = await prisma.category.update({
      where: { id: categoryId },
      data,
    });

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: { category: updated },
    });
  }
);

// Delete category
export const deleteCategoryHandler = asyncHandler(
  async (req: RestaurantAuthenticatedRequest, res: Response) => {
    if (!req.owner || !req.owner.restaurantId) {
      throw new AppError(400, 'Restaurant not created yet');
    }

    const categoryId = req.params.categoryId as string;

    // Verify category belongs to this restaurant
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        restaurantId: req.owner.restaurantId,
      },
    });

    if (!category) {
      throw new AppError(404, 'Category not found');
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });

    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  }
);

// Add menu item
export const addMenuItemHandler = asyncHandler(
  async (req: RestaurantAuthenticatedRequest & RequestWithFileUrl, res: Response) => {
    if (!req.owner || !req.owner.restaurantId) {
      throw new AppError(400, 'Restaurant not created yet');
    }

    // Parse FormData - convert strings to proper types
    const parsedBody = {
      categoryId: req.body.categoryId,
      name: req.body.name,
      description: req.body.description,
      price: Number(req.body.price), // Convert string to number
      isVeg: req.body.isVeg === 'true', // Convert string to boolean
      isAvailable: req.body.isAvailable !== 'false', // Default to true
      sortOrder: req.body.sortOrder ? Number(req.body.sortOrder) : 0,
    };

    const data = addMenuItemSchema.parse(parsedBody);
    const itemImageUrl = req.fileUrl || null; // Get URL from middleware

    // Verify category belongs to this restaurant
    const category = await prisma.category.findFirst({
      where: {
        id: data.categoryId,
        restaurantId: req.owner.restaurantId,
      },
    });

    if (!category) {
      throw new AppError(404, 'Category not found');
    }

    const menuItem = await prisma.menuItem.create({
      data: {
        categoryId: data.categoryId,
        name: data.name,
        description: data.description,
        price: data.price,
        isVeg: data.isVeg,
        isAvailable: data.isAvailable,
        sortOrder: data.sortOrder,
        ...(itemImageUrl && { imageUrl: itemImageUrl }),
      },
    });

    res.json({
      success: true,
      message: 'Menu item added successfully',
      data: { menuItem },
    });
  }
);

// Update menu item
export const updateMenuItemHandler = asyncHandler(
  async (req: RestaurantAuthenticatedRequest & RequestWithFileUrl, res: Response) => {
    if (!req.owner || !req.owner.restaurantId) {
      throw new AppError(400, 'Restaurant not created yet');
    }

    const itemId = req.params.itemId as string;

    // Parse FormData - convert strings to proper types (only include provided fields)
    const parsedBody: any = {};
    if (req.body.name) parsedBody.name = req.body.name;
    if (req.body.description !== undefined) parsedBody.description = req.body.description;
    if (req.body.price !== undefined) parsedBody.price = Number(req.body.price);
    if (req.body.isVeg !== undefined) parsedBody.isVeg = req.body.isVeg === 'true';
    if (req.body.isAvailable !== undefined) parsedBody.isAvailable = req.body.isAvailable === 'true';
    if (req.body.sortOrder !== undefined) parsedBody.sortOrder = Number(req.body.sortOrder);

    const data = updateMenuItemSchema.parse(parsedBody);
    const itemImageUrl = req.fileUrl || null; // Get URL from middleware

    // Verify menu item belongs to this restaurant
    const menuItem = await prisma.menuItem.findFirst({
      where: {
        id: itemId,
        category: {
          restaurantId: req.owner.restaurantId,
        },
      },
    });

    if (!menuItem) {
      throw new AppError(404, 'Menu item not found');
    }

    const updated = await prisma.menuItem.update({
      where: { id: itemId },
      data: {
        ...data,
        ...(itemImageUrl && { imageUrl: itemImageUrl }),
      },
    });

    res.json({
      success: true,
      message: 'Menu item updated successfully',
      data: { menuItem: updated },
    });
  }
);

// Delete menu item
export const deleteMenuItemHandler = asyncHandler(
  async (req: RestaurantAuthenticatedRequest, res: Response) => {
    if (!req.owner || !req.owner.restaurantId) {
      throw new AppError(400, 'Restaurant not created yet');
    }

    const itemId = req.params.itemId as string;

    // Verify menu item belongs to this restaurant
    const menuItem = await prisma.menuItem.findFirst({
      where: {
        id: itemId,
        category: {
          restaurantId: req.owner.restaurantId,
        },
      },
    });

    if (!menuItem) {
      throw new AppError(404, 'Menu item not found');
    }

    await prisma.menuItem.delete({
      where: { id: itemId },
    });

    res.json({
      success: true,
      message: 'Menu item deleted successfully',
    });
  }
);

// Update location
export const updateLocationHandler = asyncHandler(
  async (req: RestaurantAuthenticatedRequest, res: Response) => {
    if (!req.owner || !req.owner.restaurantId) {
      throw new AppError(400, 'Restaurant not created yet');
    }

    const data = locationSchema.parse(req.body);

    await prisma.restaurant.update({
      where: { id: req.owner.restaurantId },
      data: {
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        latitude: data.latitude,
        longitude: data.longitude,
      },
    });

    // Update onboarding status to PENDING_LOCATION if not already completed
    const owner = await prisma.restaurantOwner.findUnique({
      where: { id: req.owner.id },
    });

    if (owner?.onboardingStatus !== 'COMPLETED') {
      await prisma.restaurantOwner.update({
        where: { id: req.owner.id },
        data: { onboardingStatus: 'PENDING_LOCATION' },
      });
    }

    res.json({
      success: true,
      message: 'Location updated successfully',
    });
  }
);

// Complete onboarding
export const completeOnboardingHandler = asyncHandler(
  async (req: RestaurantAuthenticatedRequest, res: Response) => {
    if (!req.owner || !req.owner.restaurantId) {
      throw new AppError(400, 'Restaurant not created yet');
    }

    // Verify all steps are complete
    const owner = await prisma.restaurantOwner.findUnique({
      where: { id: req.owner.id },
      include: {
        documents: true,
        bankDetails: true,
        restaurant: {
          include: {
            categories: {
              include: {
                items: true,
              },
            },
          },
        },
      },
    });

    if (!owner) {
      throw new AppError(404, 'Owner not found');
    }

    // Validation checks
    if (owner.documents.length === 0) {
      throw new AppError(400, 'Please upload required documents');
    }

    if (!owner.bankDetails) {
      throw new AppError(400, 'Please provide bank details');
    }

    if (!owner.restaurant) {
      throw new AppError(400, 'Please create restaurant profile');
    }

    if (owner.restaurant.categories.length === 0) {
      throw new AppError(400, 'Please add at least one menu category');
    }

    const hasMenuItems = owner.restaurant.categories.some(cat => cat.items.length > 0);
    if (!hasMenuItems) {
      throw new AppError(400, 'Please add at least one menu item');
    }

    if (owner.restaurant.latitude === 0 || owner.restaurant.longitude === 0) {
      throw new AppError(400, 'Please set restaurant location');
    }

    // Mark onboarding as complete and activate restaurant
    await prisma.restaurantOwner.update({
      where: { id: req.owner.id },
      data: { onboardingStatus: 'COMPLETED' },
    });

    await prisma.restaurant.update({
      where: { id: req.owner.restaurantId },
      data: { isActive: true },
    });

    res.json({
      success: true,
      message: 'Onboarding completed successfully! Your restaurant is now active.',
    });
  }
);
