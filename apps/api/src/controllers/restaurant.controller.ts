import { Response } from 'express';
import { prisma } from '@repo/db';
import { AuthenticatedRequest } from '../types';
import { restaurantListSchema, restaurantSearchSchema } from '../validators/restaurant.validator';
import { AppError, asyncHandler } from '../middleware/error-handler';
import { calculateDistance, isWithinRadius } from '../services/location.service';

export const getRestaurantsHandler = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const {
      latitude,
      longitude,
      radius,
      cuisine,
      minRating,
      search,
      page = 1,
      limit = 20,
    } = restaurantListSchema.parse(req.query);

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isActive: true,
    };

    if (cuisine) {
      where.cuisineType = {
        has: cuisine,
      };
    }

    if (minRating) {
      where.rating = {
        gte: minRating,
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Fetch restaurants - if location provided, fetch more to account for radius filtering
    const fetchLimit = latitude && longitude ? limit * 5 : limit;
    const fetchSkip = latitude && longitude ? 0 : skip;

    const restaurants = await prisma.restaurant.findMany({
      where,
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        cuisineType: true,
        imageUrl: true,
        rating: true,
        totalReviews: true,
        minOrderAmount: true,
        deliveryFee: true,
        estimatedDeliveryTime: true,
        latitude: true,
        longitude: true,
        opensAt: true,
        closesAt: true,
      },
      skip: fetchSkip,
      take: fetchLimit,
      orderBy: {
        rating: 'desc',
      },
    });

    // Calculate distance and filter by radius if user location provided
    let restaurantsWithDistance = restaurants.map((restaurant) => {
      let distance: number | undefined;

      if (latitude && longitude) {
        distance = calculateDistance(
          latitude,
          longitude,
          restaurant.latitude,
          restaurant.longitude
        );
      }

      return {
        ...restaurant,
        distance,
      };
    });

    // Filter by radius if location provided
    if (latitude && longitude) {
      restaurantsWithDistance = restaurantsWithDistance.filter((restaurant) =>
        restaurant.distance !== undefined && restaurant.distance <= radius
      );

      // Sort by distance
      restaurantsWithDistance.sort((a, b) => {
        if (!a.distance) return 1;
        if (!b.distance) return -1;
        return a.distance - b.distance;
      });

      // Apply pagination after filtering
      const paginatedRestaurants = restaurantsWithDistance.slice(skip, skip + limit);
      const total = restaurantsWithDistance.length;

      res.json({
        success: true,
        data: {
          restaurants: paginatedRestaurants,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    } else {
      // No location filtering - use original total count
      const total = await prisma.restaurant.count({ where });

      res.json({
        success: true,
        data: {
          restaurants: restaurantsWithDistance,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    }
  }
);

export const searchRestaurantsHandler = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { q, latitude, longitude } = restaurantSearchSchema.parse(req.query);
    const radius = 20; // Default 20km radius for search

    // Search in restaurants and menu items
    const restaurants = await prisma.restaurant.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          {
            categories: {
              some: {
                items: {
                  some: {
                    name: { contains: q, mode: 'insensitive' },
                  },
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        cuisineType: true,
        imageUrl: true,
        rating: true,
        totalReviews: true,
        deliveryFee: true,
        estimatedDeliveryTime: true,
        latitude: true,
        longitude: true,
      },
      take: 100, // Fetch more to account for radius filtering
    });

    // Calculate distance if user location provided
    let restaurantsWithDistance = restaurants.map((restaurant) => {
      let distance: number | undefined;

      if (latitude && longitude) {
        distance = calculateDistance(
          latitude,
          longitude,
          restaurant.latitude,
          restaurant.longitude
        );
      }

      return {
        ...restaurant,
        distance,
      };
    });

    // Filter by radius if location provided
    if (latitude && longitude) {
      restaurantsWithDistance = restaurantsWithDistance.filter((restaurant) =>
        restaurant.distance !== undefined && restaurant.distance <= radius
      );

      // Sort by distance
      restaurantsWithDistance.sort((a, b) => {
        if (!a.distance) return 1;
        if (!b.distance) return -1;
        return a.distance - b.distance;
      });
    }

    // Limit results to 20
    restaurantsWithDistance = restaurantsWithDistance.slice(0, 20);

    res.json({
      success: true,
      data: {
        restaurants: restaurantsWithDistance,
        query: q,
      },
    });
  }
);

export const getRestaurantBySlugHandler = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { slug } = req.params;

    const restaurant = await prisma.restaurant.findUnique({
      where: { slug, isActive: true },
      include: {
        categories: {
          where: { isActive: true },
          include: {
            items: {
              where: { isAvailable: true },
              orderBy: { sortOrder: 'asc' },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!restaurant) {
      throw new AppError(404, 'Restaurant not found');
    }

    res.json({
      success: true,
      data: { restaurant },
    });
  }
);

export const getRestaurantMenuHandler = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { slug } = req.params;

    const restaurant = await prisma.restaurant.findUnique({
      where: { slug, isActive: true },
      select: {
        id: true,
        slug: true,
        name: true,
        categories: {
          where: { isActive: true },
          include: {
            items: {
              where: { isAvailable: true },
              orderBy: { sortOrder: 'asc' },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!restaurant) {
      throw new AppError(404, 'Restaurant not found');
    }

    res.json({
      success: true,
      data: {
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        categories: restaurant.categories,
      },
    });
  }
);
