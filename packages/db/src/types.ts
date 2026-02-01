import type { Prisma } from '@prisma/client';

// Re-export Prisma types for convenience
export type { Prisma };

// Custom types can be added here as needed
export type UserWithAddresses = Prisma.UserGetPayload<{
  include: { addresses: true };
}>;

export type RestaurantWithMenu = Prisma.RestaurantGetPayload<{
  include: {
    categories: {
      include: {
        items: true;
      };
    };
  };
}>;

export type CartWithItems = Prisma.CartGetPayload<{
  include: {
    items: {
      include: {
        menuItem: true;
      };
    };
    restaurant: true;
  };
}>;

export type OrderWithItems = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: {
        menuItem: true;
      };
    };
    restaurant: true;
    address: true;
    payment: true;
  };
}>;
