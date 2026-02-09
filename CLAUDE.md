# CLAUDE.md - Daavat Food Delivery Platform

> **Purpose**: This document provides comprehensive guidance for AI assistants (like Claude) and developers working on the Daavat food delivery platform. It covers architecture, coding standards, conventions, and best practices.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Coding Standards](#coding-standards)
6. [API Design Patterns](#api-design-patterns)
7. [Database Schema](#database-schema)
8. [Frontend Patterns](#frontend-patterns)
9. [State Management](#state-management)
10. [Error Handling](#error-handling)
11. [Common Tasks](#common-tasks)
12. [Development Workflow](#development-workflow)

---

## Project Overview

**Daavat** is a full-stack food delivery platform built as a monorepo using Turborepo. The platform consists of:

- **User App** (Next.js, port 3000) - Customer-facing application
- **Restaurant App** (Next.js, port 3001) - Restaurant partner dashboard
- **Logistics App** (Next.js, port 3002) - Delivery partner application
- **API Backend** (Express.js, port 4000) - RESTful API server
- **Database Package** (@repo/db) - Shared Prisma client and types
- **UI Package** (@workspace/ui) - Shared UI components (shadcn/ui)

### Key Features
- Phone OTP authentication (Firebase)
- Restaurant browsing with location-based filtering
- Shopping cart and order management
- Payment integration (Razorpay)
- Real-time order tracking
- User profiles, addresses, and favorites
- Restaurant dashboard for managing orders and menu
- Logistics tracking and delivery management
- Google Maps integration for location services
- Google Cloud Storage for asset management

---

## Architecture

### Monorepo Structure

```
daavat/
├── apps/
│   ├── api/                      # Express.js backend (port 4000)
│   ├── user/                     # Customer Next.js app (port 3000)
│   ├── restaurant/               # Restaurant Next.js app (port 3001)
│   └── logistics/                # Logistics Next.js app (port 3002)
├── packages/
│   ├── db/                       # Prisma client and database utilities
│   ├── ui/                       # Shared UI components (shadcn/ui)
│   ├── eslint-config/            # Shared ESLint configuration
│   └── typescript-config/        # Shared TypeScript configuration
├── docker-compose.yml            # Development PostgreSQL database
├── docker-compose.production.yml # Production deployment (all services)
├── .dockerignore                 # Docker build optimization
├── build-all.sh / .bat           # Build all Docker images
├── README.Docker.md              # Docker deployment guide
└── turbo.json                    # Turborepo configuration
```

### Communication Flow

```
┌──────────────────┐         ┌──────────────────┐
│  User App        │────────>│                  │
│  (port 3000)     │<────────│                  │
└──────────────────┘         │                  │         ┌────────────┐
                              │   Express.js    │────────>│ PostgreSQL │
┌──────────────────┐         │   API Backend   │<────────│  Database  │
│  Restaurant App  │────────>│   (port 4000)   │         │  (Prisma)  │
│  (port 3001)     │<────────│                  │         └────────────┘
└──────────────────┘         │                  │                │
                              │                  │                │
┌──────────────────┐         │                  │                ▼
│  Logistics App   │────────>│                  │         ┌────────────┐
│  (port 3002)     │<────────│                  │         │   Google   │
└──────────────────┘         └──────────────────┘         │   Cloud    │
                                      │                    │  Storage   │
                                      │                    └────────────┘
                                      ▼
                              ┌────────────┐
                              │  External  │
                              │  Services  │
                              ├────────────┤
                              │ Firebase   │
                              │ Razorpay   │
                              │ Google Maps│
                              └────────────┘
```

### Service Responsibilities

**User App (port 3000)**
- Customer authentication and profile management
- Restaurant browsing and search
- Shopping cart and checkout
- Order placement and tracking
- Payment processing
- Address management
- Favorites and reviews

**Restaurant App (port 3001)**
- Restaurant partner authentication
- Order management (accept/reject/prepare)
- Menu management (items, categories, pricing)
- Restaurant profile and settings
- Order status updates
- Toggle taking orders on/off
- View earnings and analytics

**Logistics App (port 3002)**
- Delivery partner authentication
- Order assignment and acceptance
- Real-time location tracking
- Delivery status updates
- Navigation and route optimization
- Earnings tracking
- On-duty status management

**API Backend (port 4000)**
- RESTful API for all applications
- Authentication (JWT, Firebase Phone Auth + Admin SDK)
- Business logic and data validation
- Database operations via Prisma
- Payment processing (Razorpay)
- File uploads (Google Cloud Storage)
- Location services (Google Maps API)
- Order lifecycle management

### Authentication Flow

1. User enters phone number → Firebase sends OTP via SMS
2. User enters OTP → Firebase verifies → Returns ID token
3. Frontend sends ID token to API → API verifies with Firebase Admin SDK
4. API generates JWT token → Stores in httpOnly cookie
5. Subsequent requests → JWT verified via middleware
6. Frontend checks auth state via Zustand store

### Payment Flow

1. User places order → API creates Order record
2. API creates Razorpay order → Returns order ID
3. Frontend opens Razorpay checkout modal
4. User completes payment → Razorpay callback
5. API verifies signature → Updates Order & Payment status

---

## Tech Stack

### Backend (apps/api)

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime |
| Express.js | ^4.21 | Web framework |
| TypeScript | ^5.7 | Type safety |
| Prisma | ^6.1 | ORM |
| Zod | ^3.24 | Validation |
| JWT | ^9.0 | Authentication |
| Razorpay | ^2.9 | Payments |
| Helmet | ^8.0 | Security |
| Morgan | ^1.10 | Logging |

### Frontend (apps/user)

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | ^15.5.4 | React framework |
| React | ^19.1 | UI library |
| TypeScript | ^5.9 | Type safety |
| Tailwind CSS | ^4.1 | Styling |
| Zustand | ^5.0 | State management |
| shadcn/ui | Latest | UI components |

### Database

| Technology | Purpose |
|------------|---------|
| PostgreSQL | Relational database |
| Prisma | ORM and migrations |

---

## Project Structure

### Backend Structure (apps/api/src/)

```
src/
├── config/
│   └── env.ts                    # Environment variable validation (Zod)
├── middleware/
│   ├── auth.ts                   # JWT authentication middleware
│   ├── cors.ts                   # CORS configuration
│   ├── error-handler.ts          # Global error handler & AppError class
│   └── rate-limiter.ts           # Rate limiting (express-rate-limit)
├── routes/
│   ├── index.ts                  # Route aggregator
│   ├── auth.routes.ts            # Authentication routes
│   ├── restaurant.routes.ts      # Restaurant routes
│   ├── cart.routes.ts            # Cart routes (protected)
│   ├── order.routes.ts           # Order routes (protected)
│   ├── payment.routes.ts         # Payment routes (protected)
│   ├── address.routes.ts         # Address routes (protected)
│   ├── user.routes.ts            # User routes (protected)
│   └── review.routes.ts          # Review routes
├── controllers/
│   ├── auth.controller.ts        # Auth logic (OTP, JWT)
│   ├── restaurant.controller.ts  # Restaurant business logic
│   ├── cart.controller.ts        # Cart management
│   ├── order.controller.ts       # Order creation & management
│   ├── payment.controller.ts     # Razorpay integration
│   ├── address.controller.ts     # Address CRUD
│   ├── user.controller.ts        # User profile & favorites
│   └── review.controller.ts      # Review submission
├── services/
│   ├── jwt.service.ts            # JWT generation & verification
│   ├── firebase.service.ts       # Firebase Admin SDK (auth + FCM push)
│   ├── razorpay.service.ts       # Razorpay order creation & verification
│   └── location.service.ts       # Distance calculation (Haversine)
├── validators/
│   ├── auth.validator.ts         # Zod schemas for auth
│   ├── restaurant.validator.ts   # Zod schemas for restaurants
│   ├── cart.validator.ts         # Zod schemas for cart
│   ├── order.validator.ts        # Zod schemas for orders
│   ├── payment.validator.ts      # Zod schemas for payments
│   ├── address.validator.ts      # Zod schemas for addresses
│   ├── user.validator.ts         # Zod schemas for user
│   └── review.validator.ts       # Zod schemas for reviews
├── types/
│   └── index.ts                  # TypeScript interfaces & types
├── app.ts                        # Express app configuration
└── index.ts                      # Server entry point
```

### Frontend Structure

#### User App (apps/user/)

```
apps/user/
├── app/
│   ├── (auth)/                   # Auth routes (no header)
│   │   ├── layout.tsx            # Auth layout
│   │   ├── login/page.tsx        # Phone login
│   │   └── verify-otp/page.tsx   # OTP verification
│   └── (main)/                   # Main app routes (with header)
│       ├── layout.tsx            # Main layout with header
│       ├── page.tsx              # Home - restaurant listing
│       ├── restaurant/[slug]/page.tsx  # Restaurant detail & menu
│       ├── cart/page.tsx         # Shopping cart
│       ├── checkout/page.tsx     # Checkout & payment
│       ├── orders/
│       │   ├── page.tsx          # Order history
│       │   └── [id]/page.tsx     # Order detail & tracking
│       └── profile/
│           ├── page.tsx          # User profile
│           ├── addresses/page.tsx # Address management
│           └── favorites/page.tsx # Favorite restaurants
├── components/
│   ├── header.tsx                # Main navigation header
│   └── restaurant/
│       └── restaurant-card.tsx   # Restaurant card component
├── lib/
│   └── api/                      # API client layer
│       ├── client.ts             # Base API client (fetch wrapper)
│       ├── auth.api.ts           # Auth API calls
│       ├── restaurants.api.ts    # Restaurant API calls
│       ├── cart.api.ts           # Cart API calls
│       ├── orders.api.ts         # Order API calls
│       ├── payments.api.ts       # Payment API calls
│       └── addresses.api.ts      # Address API calls
├── stores/                       # Zustand stores
│   ├── auth-store.ts             # Authentication state
│   ├── cart-store.ts             # Cart state
│   └── location-store.ts         # Location state
└── middleware.ts                 # Next.js route protection
```

#### Restaurant App (apps/restaurant/)

```
apps/restaurant/
├── app/
│   ├── (auth)/                   # Auth routes
│   │   ├── login/page.tsx        # Restaurant login
│   │   └── verify-otp/page.tsx   # OTP verification
│   └── (main)/                   # Restaurant dashboard
│       ├── layout.tsx            # Dashboard layout
│       ├── page.tsx              # Dashboard home
│       ├── orders/               # Order management
│       │   ├── page.tsx          # Active orders
│       │   └── [id]/page.tsx     # Order details
│       ├── menu/                 # Menu management
│       │   ├── page.tsx          # Menu items list
│       │   ├── categories/       # Category management
│       │   └── items/            # Menu item CRUD
│       ├── profile/              # Restaurant profile
│       └── settings/             # Restaurant settings
├── components/                   # Restaurant-specific components
├── stores/                       # Zustand stores
└── middleware.ts                 # Route protection
```

#### Logistics App (apps/logistics/)

```
apps/logistics/
├── app/
│   ├── (auth)/                   # Auth routes
│   │   ├── login/page.tsx        # Delivery partner login
│   │   └── verify-otp/page.tsx   # OTP verification
│   └── (main)/                   # Logistics dashboard
│       ├── layout.tsx            # Dashboard layout
│       ├── page.tsx              # Available orders map
│       ├── orders/               # Order management
│       │   ├── active/page.tsx   # Active deliveries
│       │   ├── history/page.tsx  # Delivery history
│       │   └── [id]/page.tsx     # Delivery details
│       ├── earnings/page.tsx     # Earnings tracking
│       └── profile/page.tsx      # Profile and settings
├── components/                   # Logistics-specific components
│   ├── map/                      # Map components
│   └── order-card.tsx            # Order card for delivery
├── stores/                       # Zustand stores
│   ├── location-store.ts         # Real-time location tracking
│   └── order-store.ts            # Active order state
└── middleware.ts                 # Route protection
```

---

## Coding Standards

### General Principles

1. **Type Safety First**: Always use TypeScript. Avoid `any` types.
2. **Explicit Over Implicit**: Write clear, readable code over clever code.
3. **Single Responsibility**: Functions/components should do one thing well.
4. **Don't Repeat Yourself (DRY)**: Extract common logic into utilities.
5. **Fail Fast**: Validate input early, throw errors explicitly.

### TypeScript Conventions

```typescript
// ✅ GOOD: Explicit return types
export const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

// ❌ BAD: Implicit any
export const calculateTotal = (items) => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

// ✅ GOOD: Proper interface naming
interface CreateOrderRequest {
  addressId: string;
  paymentMethod: PaymentMethod;
}

// ❌ BAD: Vague naming
interface OrderData {
  address: string;
  payment: string;
}
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `auth.controller.ts` |
| Components | PascalCase | `RestaurantCard.tsx` |
| Functions | camelCase | `fetchRestaurants()` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_ATTEMPTS` |
| Interfaces | PascalCase | `CreateOrderRequest` |
| Types | PascalCase | `OrderStatus` |
| Enums | PascalCase | `PaymentMethod` |

### File Organization

```typescript
// Order: imports → types → constants → main function → exports

// 1. External imports
import { Response } from 'express';
import { prisma } from '@repo/db';

// 2. Internal imports
import { AuthenticatedRequest } from '../types';
import { createOrderSchema } from '../validators/order.validator';

// 3. Type definitions
interface OrderCalculation {
  subtotal: number;
  tax: number;
  total: number;
}

// 4. Constants
const TAX_RATE = 0.05;

// 5. Main function
export const createOrderHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  // Implementation
};
```

### Error Handling Pattern

```typescript
// ✅ GOOD: Use AppError for operational errors
import { AppError, asyncHandler } from '../middleware/error-handler';

export const getOrderById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Not authenticated');
    }

    const order = await prisma.order.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!order) {
      throw new AppError(404, 'Order not found');
    }

    res.json({ success: true, data: { order } });
  }
);

// ❌ BAD: Generic errors without context
export const getOrderById = async (req, res) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id },
    });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Error' });
  }
};
```

---

## API Design Patterns

### Request/Response Format

All API responses follow this structure:

```typescript
// Success response
{
  "success": true,
  "data": {
    "user": { /* ... */ }
  },
  "message": "Optional success message"
}

// Error response
{
  "success": false,
  "error": "Error message",
  "details": { /* Optional validation errors */ }
}
```

### Authentication Pattern

```typescript
// Protected routes use authenticate middleware
router.get('/profile', authenticate, getProfileHandler);

// Middleware extracts user from JWT
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.auth_token;
  if (!token) throw new AppError(401, 'Authentication required');

  const decoded = verifyToken(token);
  req.user = { id: decoded.userId, phone: decoded.phone };
  next();
};

// Controllers access user via req.user
export const getProfile = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });
    res.json({ success: true, data: { user } });
  }
);
```

### Validation Pattern

```typescript
// Define Zod schema
export const createOrderSchema = z.object({
  addressId: z.string().cuid(),
  paymentMethod: z.nativeEnum(PaymentMethod),
  deliveryInstructions: z.string().optional(),
});

// Use in controller
export const createOrderHandler = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    // Zod throws on validation failure (caught by error handler)
    const data = createOrderSchema.parse(req.body);

    // Continue with validated data
    const order = await prisma.order.create({ data });
    res.json({ success: true, data: { order } });
  }
);
```

### Pagination Pattern

```typescript
export const getRestaurants = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [restaurants, total] = await Promise.all([
      prisma.restaurant.findMany({
        skip,
        take: Number(limit),
      }),
      prisma.restaurant.count(),
    ]);

    res.json({
      success: true,
      data: {
        restaurants,
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
```

---

## Database Schema

### Key Models

```prisma
// User authentication & profile
model User {
  id        String   @id @default(cuid())
  phone     String   @unique
  name      String?
  email     String?

  addresses         Address[]
  carts             Cart[]
  orders            Order[]
  reviews           Review[]
  favoriteRestaurants FavoriteRestaurant[]
}

// Restaurant with location
model Restaurant {
  id              String   @id @default(cuid())
  slug            String   @unique
  name            String
  cuisineType     String[]  // Array of cuisines
  latitude        Float
  longitude       Float
  rating          Float    @default(0)
  totalReviews    Int      @default(0)

  categories      Category[]
  orders          Order[]
}

// Shopping cart (one per user per restaurant)
model Cart {
  id           String   @id @default(cuid())
  userId       String
  restaurantId String

  items        CartItem[]

  @@unique([userId, restaurantId])
}

// Order with status tracking
model Order {
  id          String      @id @default(cuid())
  orderNumber String      @unique
  userId      String
  status      OrderStatus @default(PENDING)
  total       Float

  items       OrderItem[]
  payment     Payment?
}
```

### Relationships

- **User ↔ Restaurant**: Many-to-many via `FavoriteRestaurant`
- **User → Cart**: One-to-many (user can have multiple carts for different restaurants)
- **Cart → Restaurant**: Many-to-one (cart belongs to one restaurant)
- **Order → Payment**: One-to-one (each order has one payment)
- **Restaurant → Category → MenuItem**: Nested hierarchy

### Indexing Strategy

```prisma
// Frequently queried fields
@@index([latitude, longitude])  // Location-based queries
@@index([rating])                // Sorting by rating
@@index([userId])                // User's orders/carts
@@index([status])                // Order filtering
```

---

## Frontend Patterns

### Component Structure

```tsx
// ✅ GOOD: Clear structure with types
'use client';

import { useState, useEffect } from 'react';
import type { Restaurant } from '@/lib/api/restaurants.api';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onFavorite?: (id: string) => void;
}

export function RestaurantCard({ restaurant, onFavorite }: RestaurantCardProps) {
  // 1. Hooks
  const [isFavorite, setIsFavorite] = useState(false);

  // 2. Effects
  useEffect(() => {
    // Check favorite status
  }, [restaurant.id]);

  // 3. Event handlers
  const handleFavoriteClick = () => {
    setIsFavorite(!isFavorite);
    onFavorite?.(restaurant.id);
  };

  // 4. Render
  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Component JSX */}
    </div>
  );
}
```

### API Client Pattern

```typescript
// lib/api/restaurants.api.ts

import { apiClient } from './client';

export interface Restaurant {
  id: string;
  name: string;
  // ... other fields
}

export const restaurantsApi = {
  getRestaurants: async (params: RestaurantListParams) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, String(value));
    });

    return apiClient.get<{
      restaurants: Restaurant[];
      pagination: PaginationMeta;
    }>(`/restaurants?${queryParams}`);
  },

  getRestaurantBySlug: async (slug: string) => {
    return apiClient.get<{ restaurant: RestaurantDetail }>(
      `/restaurants/${slug}`
    );
  },
};
```

### Loading States

```tsx
// ✅ GOOD: Proper loading states
export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (restaurants.length === 0) {
    return <EmptyState />;
  }

  return <RestaurantList restaurants={restaurants} />;
}
```

---

## State Management

### Zustand Store Pattern

```typescript
// stores/cart-store.ts

import { create } from 'zustand';
import { cartApi, type Cart } from '@/lib/api/cart.api';

interface CartState {
  // State
  cart: Cart | null;
  subtotal: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCart: () => Promise<void>;
  addToCart: (restaurantId: string, menuItemId: string, quantity: number) => Promise<void>;
  clearError: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  subtotal: 0,
  isLoading: false,
  error: null,

  fetchCart: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await cartApi.getCart();

      if (response.success) {
        set({
          cart: response.data?.cart || null,
          subtotal: response.data?.subtotal || 0,
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch cart',
        isLoading: false,
      });
    }
  },

  addToCart: async (restaurantId, menuItemId, quantity) => {
    try {
      set({ isLoading: true, error: null });
      await cartApi.addToCart({ restaurantId, menuItemId, quantity });

      // Refresh cart after adding
      await get().fetchCart();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to add to cart',
        isLoading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));
```

### Usage in Components

```tsx
'use client';

import { useCartStore } from '@/stores/cart-store';

export default function CartPage() {
  const { cart, subtotal, fetchCart, removeItem } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return (
    <div>
      {cart?.items.map((item) => (
        <CartItem key={item.id} item={item} onRemove={removeItem} />
      ))}
      <Total amount={subtotal} />
    </div>
  );
}
```

---

## Error Handling

### Backend Error Handling

```typescript
// Custom error class
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
  }
}

// Global error handler
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: err.errors,
    });
  }

  // Unexpected errors
  console.error('Unhandled error:', err);
  return res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
};

// Async handler wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
```

### Frontend Error Handling

```tsx
// Component-level error handling
const [error, setError] = useState('');

try {
  const response = await api.createOrder(data);
  if (!response.success) {
    setError(response.error || 'Operation failed');
  }
} catch (err) {
  setError(err instanceof Error ? err.message : 'Unexpected error');
}

// Display errors
{error && (
  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
    {error}
  </div>
)}
```

---

## Common Tasks

### Adding a New API Endpoint

1. **Define Zod validator** (`apps/api/src/validators/`)
2. **Create controller** (`apps/api/src/controllers/`)
3. **Add route** (`apps/api/src/routes/`)
4. **Register route** in `routes/index.ts`
5. **Create frontend API client** (`apps/user/lib/api/`)
6. **Add TypeScript types** for request/response

### Adding a New Page

1. **Create page file** in `apps/user/app/(main)/`
2. **Define page component** with proper TypeScript types
3. **Add route protection** (if needed in middleware)
4. **Create API client calls** in component
5. **Add navigation link** in header/sidebar

### Database Schema Changes

```bash
# 1. Update schema.prisma
# 2. Generate migration
pnpm --filter @repo/db prisma migrate dev --name descriptive_name

# 3. Generate Prisma client
pnpm db:generate

# 4. Update TypeScript types if needed in packages/db/src/types.ts
```

### Adding shadcn/ui Component

```bash
# Add component to user app
npx shadcn@latest add button -c apps/user
```

---

## Development Workflow

### Git Commit Convention

```
feat: add restaurant search functionality
fix: resolve cart quantity update bug
refactor: extract order calculation logic
docs: update API documentation
style: format code with Prettier
test: add unit tests for auth service
chore: update dependencies
```

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - New features
- `fix/*` - Bug fixes
- `hotfix/*` - Critical production fixes

### Testing Checklist

Before committing:
- [ ] TypeScript compiles without errors
- [ ] All imports are correct
- [ ] API endpoints return expected responses
- [ ] Frontend pages load without errors
- [ ] Error states are handled
- [ ] Loading states are shown
- [ ] Authentication flows work
- [ ] Payment integration tested (test mode)

### Code Review Checklist

- [ ] Follows TypeScript conventions
- [ ] No `any` types used
- [ ] Proper error handling
- [ ] Input validation present
- [ ] Database queries optimized
- [ ] No sensitive data exposed
- [ ] Responsive design implemented
- [ ] Accessibility considered

---

## Security Considerations

### Backend Security

1. **Authentication**: JWT tokens in httpOnly cookies
2. **Rate Limiting**: Applied to OTP and sensitive endpoints
3. **Input Validation**: Zod schemas for all inputs
4. **SQL Injection**: Prevented by Prisma ORM
5. **CORS**: Configured for specific origins
6. **Helmet**: Security headers enabled

### Frontend Security

1. **No sensitive data in localStorage**
2. **JWT tokens in httpOnly cookies only**
3. **CSRF protection** via SameSite cookies
4. **Input sanitization** on user-generated content
5. **HTTPS only** in production

---

## Performance Optimization

### Backend

- **Database**: Proper indexing on frequently queried fields
- **Caching**: Consider Redis for session storage (future)
- **Query Optimization**: Use Prisma's `select` to limit fields
- **Connection Pooling**: Prisma handles this automatically

### Frontend

- **Code Splitting**: Next.js automatic code splitting
- **Image Optimization**: Use Next.js `<Image>` component
- **Lazy Loading**: Load components on demand
- **Memoization**: Use `useMemo` and `useCallback` for expensive operations

---

## Docker Deployment

### Docker Architecture

The platform uses Docker for containerized deployment with the following services:

```
┌─────────────────────────────────────────────────────────────┐
│                      Docker Network (daavat-network)          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   User App   │  │ Restaurant   │  │  Logistics   │     │
│  │  (Next.js)   │  │     App      │  │     App      │     │
│  │  Port: 3000  │  │  Port: 3001  │  │  Port: 3002  │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                 │                  │              │
│         └─────────────────┼──────────────────┘              │
│                           ▼                                 │
│                  ┌─────────────────┐                        │
│                  │   API Backend   │                        │
│                  │   (Express.js)  │                        │
│                  │   Port: 4000    │                        │
│                  └────────┬────────┘                        │
│                           │                                 │
│                           ▼                                 │
│                  ┌─────────────────┐                        │
│                  │   PostgreSQL    │                        │
│                  │   Port: 5432    │                        │
│                  │   (with volume) │                        │
│                  └─────────────────┘                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Dockerfiles

Each application has its own optimized multi-stage Dockerfile:

- **apps/api/Dockerfile** - Express.js backend with Prisma client
- **apps/user/Dockerfile** - Next.js user app with Turbopack
- **apps/restaurant/Dockerfile** - Next.js restaurant dashboard
- **apps/logistics/Dockerfile** - Next.js logistics app

### Multi-Stage Build Benefits

All Dockerfiles follow this pattern:
1. **Base**: Install pnpm
2. **Dependencies**: Install workspace dependencies
3. **Builder**: Build application with all source code
4. **Production**: Minimal image with only production dependencies

This results in:
- Smaller final images (only production dependencies)
- Faster builds (layer caching)
- Better security (no dev dependencies in production)
- Proper monorepo workspace resolution

### Docker Compose Services

**Development** (`docker-compose.yml`)
```bash
# Only PostgreSQL for local development
docker-compose up -d
```

**Production** (`docker-compose.production.yml`)
```bash
# All services (API, User, Restaurant, Logistics, PostgreSQL)
docker-compose -f docker-compose.production.yml up -d
```

### Building Docker Images

**Build all at once:**
```bash
# Linux/Mac
chmod +x build-all.sh
./build-all.sh

# Windows
build-all.bat
```

**Build individually:**
```bash
docker build -f apps/api/Dockerfile -t daavat-api:latest .
docker build -f apps/user/Dockerfile -t daavat-user:latest .
docker build -f apps/restaurant/Dockerfile -t daavat-restaurant:latest .
docker build -f apps/logistics/Dockerfile -t daavat-logistics:latest .
```

### Environment Configuration

Copy and configure production environment:
```bash
cp .env.production.example .env.production
# Edit .env.production with your credentials
```

Required environment variables:
- Database credentials (PostgreSQL)
- JWT secret (minimum 32 characters)
- Firebase service account key (authentication + FCM push notifications)
- Razorpay keys (payment gateway)
- Google Cloud Storage credentials
- Google Maps API key

### Health Checks

All services include Docker health checks:
- **API**: HTTP GET to `/health` endpoint
- **Frontends**: HTTP GET to root path
- **PostgreSQL**: `pg_isready` command

Check service health:
```bash
docker inspect --format='{{.State.Health.Status}}' daavat-api
docker inspect --format='{{.State.Health.Status}}' daavat-user
docker inspect --format='{{.State.Health.Status}}' daavat-restaurant
docker inspect --format='{{.State.Health.Status}}' daavat-logistics
```

### Database Migrations

Run Prisma migrations in production:
```bash
docker exec daavat-api pnpm --filter @repo/db prisma migrate deploy
```

### Monitoring

View logs:
```bash
# All services
docker-compose -f docker-compose.production.yml logs -f

# Specific service
docker-compose -f docker-compose.production.yml logs -f api
```

View resource usage:
```bash
docker stats daavat-api daavat-user daavat-restaurant daavat-logistics daavat-postgres
```

### Complete Docker Documentation

For comprehensive Docker deployment instructions, see:
- **README.Docker.md** - Complete deployment guide with troubleshooting

---

## Traditional Deployment

### Environment Variables

**Never commit**:
- JWT secrets
- API keys (Firebase, Razorpay, Google)
- Database credentials
- Firebase service account JSON files

**Always set in deployment platform**:
- `NODE_ENV=production`
- `DATABASE_URL`
- `JWT_SECRET`
- `CORS_ORIGIN`

### Production Checklist

**Infrastructure**
- [ ] Docker Engine 20.10+ installed
- [ ] Docker Compose 2.0+ installed
- [ ] Sufficient disk space (minimum 5GB)
- [ ] Reverse proxy configured (Nginx/Traefik)
- [ ] SSL/TLS certificates installed

**Configuration**
- [ ] Environment variables configured (.env.production)
- [ ] Database credentials secured
- [ ] JWT secret generated (minimum 32 characters)
- [ ] API keys configured (Firebase, Razorpay, Google)
- [ ] Firebase service account JSON file secured
- [ ] CORS origins restricted to production domains
- [ ] HTTPS enabled for all services

**Database**
- [ ] PostgreSQL running in Docker with persistent volume
- [ ] Database migrations applied (prisma migrate deploy)
- [ ] Database backups scheduled
- [ ] Backup restoration tested

**Security**
- [ ] Rate limiting enabled on API
- [ ] Helmet security headers configured
- [ ] Input validation (Zod) on all endpoints
- [ ] Authentication middleware protecting routes
- [ ] httpOnly cookies for JWT tokens
- [ ] No sensitive data in frontend localStorage
- [ ] Container security scanning configured

**Monitoring & Logging**
- [ ] Docker health checks verified
- [ ] Log aggregation configured (optional)
- [ ] Error monitoring (Sentry, etc.) configured
- [ ] Resource usage monitoring (docker stats)
- [ ] Alerts for service failures configured

**Application Services**
- [ ] All Docker images built successfully
- [ ] All containers healthy and running
- [ ] API accessible at configured port
- [ ] User app accessible at configured port
- [ ] Restaurant app accessible at configured port
- [ ] Logistics app accessible at configured port
- [ ] Services can communicate within Docker network

**Testing**
- [ ] User authentication flow working
- [ ] Restaurant dashboard accessible
- [ ] Logistics app functioning
- [ ] Payment integration tested (test mode)
- [ ] Order placement working end-to-end
- [ ] Real-time order updates working
- [ ] File uploads to Google Cloud Storage working
- [ ] Google Maps integration working

---

## Troubleshooting

### Common Issues

**Database connection failed**
```bash
# Check PostgreSQL is running
docker-compose ps

# Restart PostgreSQL
docker-compose restart postgres
```

**Prisma client not found**
```bash
# Generate Prisma client
pnpm db:generate
```

**Port already in use**
```bash
# Find process using port
netstat -ano | findstr :4000

# Kill process or change PORT in .env
```

**TypeScript errors after schema change**
```bash
# Regenerate types
pnpm db:generate

# Restart TypeScript server in IDE
```

---

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [shadcn/ui Components](https://ui.shadcn.com)

---

---

## Quick Reference

### Port Assignments

| Service | Port | Purpose |
|---------|------|---------|
| User App | 3000 | Customer-facing application |
| Restaurant App | 3001 | Restaurant partner dashboard |
| Logistics App | 3002 | Delivery partner application |
| API Backend | 4000 | RESTful API server |
| PostgreSQL | 5432 | Database |

### Development Commands

```bash
# Start all apps in development mode
pnpm dev

# Start specific app
pnpm --filter user dev
pnpm --filter restaurant dev
pnpm --filter logistics dev
pnpm --filter api dev

# Build all apps
pnpm build

# Database commands
pnpm --filter @repo/db prisma migrate dev
pnpm --filter @repo/db prisma studio
pnpm --filter @repo/db prisma generate

# Docker commands (development)
docker-compose up -d                    # Start PostgreSQL
docker-compose down                     # Stop PostgreSQL

# Docker commands (production)
docker-compose -f docker-compose.production.yml up -d
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml logs -f
```

### API Endpoints Overview

**Authentication**
- POST `/api/auth/send-otp` - Send OTP
- POST `/api/auth/verify-otp` - Verify OTP and login
- POST `/api/auth/logout` - Logout

**Restaurants**
- GET `/api/restaurants` - List restaurants
- GET `/api/restaurants/:slug` - Get restaurant details

**Cart** (Protected)
- GET `/api/cart` - Get user's cart
- POST `/api/cart` - Add item to cart
- DELETE `/api/cart/items/:id` - Remove cart item

**Orders** (Protected)
- POST `/api/orders` - Create order
- GET `/api/orders` - List user's orders
- GET `/api/orders/:id` - Get order details

**Payments** (Protected)
- POST `/api/payments/create-order` - Create Razorpay order
- POST `/api/payments/verify` - Verify payment

**Addresses** (Protected)
- GET `/api/addresses` - List user addresses
- POST `/api/addresses` - Create address
- PUT `/api/addresses/:id` - Update address
- DELETE `/api/addresses/:id` - Delete address

---

**Last Updated**: 2026-02-02
**Version**: 2.0.0
**Maintainer**: Daavat Development Team
