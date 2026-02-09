# Daavat - Food Delivery Platform

A modern food delivery platform built with Next.js, Express.js, and PostgreSQL.

## Project Structure

```
daavat/
├── apps/
│   ├── api/           # Express.js backend API
│   ├── user/          # Next.js user-facing app
│   ├── restaurant/    # Next.js restaurant management app
│   └── logistics/     # Next.js delivery partner app
├── packages/
│   ├── db/            # Shared Prisma database package
│   └── ui/            # Shared UI components
└── docker-compose.yml # PostgreSQL database
```

## Tech Stack

### Backend (apps/api)
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Firebase Phone Authentication, JWT sessions
- **Payment**: Razorpay integration
- **Validation**: Zod
- **Security**: Helmet, CORS, Rate limiting

### Frontend - User App (apps/user)
- **Framework**: Next.js 15 with App Router
- **UI**: React 19, Tailwind CSS v4, shadcn/ui
- **State Management**: Zustand
- **API Client**: Fetch-based client with TypeScript

### Frontend - Restaurant App (apps/restaurant)
- **Framework**: Next.js 15 with App Router
- **UI**: React 19, Tailwind CSS v4
- **State Management**: Zustand
- **Features**: Multi-step onboarding, order management, menu builder
- **API Client**: Fetch-based client with TypeScript

### Frontend - Logistics App (apps/logistics)
- **Framework**: Next.js 15 with App Router
- **UI**: React 19, Tailwind CSS v4
- **State Management**: Zustand
- **Features**: Delivery partner onboarding, order acceptance, GPS tracking, earnings management
- **API Client**: Fetch-based client with TypeScript

### Database (packages/db)
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Models**: User, Restaurant, Menu, Cart, Order, Payment, Review, Address

## Getting Started

### Prerequisites

- Node.js 18+ (with pnpm)
- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd daavat
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start PostgreSQL database**
   ```bash
   docker-compose up -d
   ```

4. **Set up environment variables**

   Create `.env` in `apps/api/`:
   ```bash
   cd apps/api
   cp .env.example .env
   ```

   Update the `.env` file with your credentials:
   - `JWT_SECRET`: Generate a secure random string (32+ characters)
   - `FIREBASE_SERVICE_ACCOUNT_KEY`: Path to Firebase service account JSON file
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`: (Optional) Razorpay credentials

   Create `.env.local` in `apps/user/`:
   ```bash
   cd apps/user
   cp .env.local.example .env.local
   ```

   Create `.env.local` in `apps/restaurant/`:
   ```bash
   cd apps/restaurant
   echo "NEXT_PUBLIC_API_URL=http://localhost:4000/api" > .env.local
   ```

   Create `.env.local` in `apps/logistics/`:
   ```bash
   cd apps/logistics
   cp .env.example .env.local
   ```

5. **Generate Prisma client**
   ```bash
   pnpm db:generate
   ```

6. **Run database migrations**
   ```bash
   pnpm db:migrate
   ```

7. **Seed the database** (optional - adds sample restaurants)
   ```bash
   pnpm db:seed
   ```

### Running the Application

You can run all services together or individually:

**Run all services (recommended for development):**
```bash
pnpm dev
```

**Or run services individually:**

1. **Backend API** (port 4000)
   ```bash
   pnpm dev:api
   ```

2. **User App** (port 3000)
   ```bash
   pnpm dev:user
   ```

3. **Restaurant App** (port 3001)
   ```bash
   pnpm --filter restaurant dev
   ```

4. **Logistics App** (port 3002)
   ```bash
   pnpm --filter logistics dev
   ```

### Access the Application

- **User App**: http://localhost:3000
- **Restaurant App**: http://localhost:3001
- **Logistics App**: http://localhost:3002
- **API**: http://localhost:4000
- **API Health Check**: http://localhost:4000/health

## Development Mode Features

### Authentication (Development)
Firebase Phone Authentication:
- Use Firebase Console to add test phone numbers for development
- Add test numbers in: Firebase Console → Authentication → Sign-in method → Phone → Phone numbers for testing
- Example: +91 1234567890 → 123456
- This allows testing without SMS charges

### Payment (Development)
When `RAZORPAY_KEY_ID` is not configured:
- Payment APIs will return mock responses
- Use Razorpay test mode keys for testing

## API Endpoints

### Authentication
- `POST /api/auth/verify-token` - Verify Firebase ID token and login
- `POST /api/restaurant-auth/verify-token` - Restaurant owner login
- `POST /api/logistics-auth/verify-token` - Delivery partner login
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Restaurants
- `GET /api/restaurants` - List restaurants (with filters)
- `GET /api/restaurants/search` - Search restaurants
- `GET /api/restaurants/:slug` - Get restaurant details
- `GET /api/restaurants/:slug/menu` - Get restaurant menu

### Cart (Protected)
- `GET /api/cart` - Get user cart
- `POST /api/cart/items` - Add item to cart
- `PATCH /api/cart/items/:itemId` - Update cart item
- `DELETE /api/cart/items/:itemId` - Remove item
- `DELETE /api/cart` - Clear cart

### Orders (Protected)
- `GET /api/orders` - List user orders
- `POST /api/orders` - Create order from cart
- `GET /api/orders/:id` - Get order details
- `POST /api/orders/:id/reorder` - Reorder

### Payments (Protected)
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/:orderId/status` - Payment status

### Addresses (Protected)
- `GET /api/addresses` - List addresses
- `POST /api/addresses` - Create address
- `PATCH /api/addresses/:id` - Update address
- `DELETE /api/addresses/:id` - Delete address
- `POST /api/addresses/:id/default` - Set default

### Users (Protected)
- `GET /api/users/profile` - Get profile
- `PATCH /api/users/profile` - Update profile
- `GET /api/users/favorites` - Get favorites
- `POST /api/users/favorites/:restaurantId` - Add favorite
- `DELETE /api/users/favorites/:restaurantId` - Remove favorite

### Reviews
- `POST /api/reviews` - Submit review (protected)
- `GET /api/reviews/restaurant/:restaurantId` - Get reviews

### Restaurant Authentication
- `POST /api/restaurant-auth/send-otp` - Send OTP to restaurant owner
- `POST /api/restaurant-auth/verify-otp` - Verify OTP and login
- `POST /api/restaurant-auth/logout` - Logout restaurant owner
- `GET /api/restaurant-auth/me` - Get current restaurant owner

### Restaurant Onboarding (Protected)
- `GET /api/onboarding/status` - Get onboarding status
- `POST /api/onboarding/documents` - Upload business documents
- `POST /api/onboarding/bank-details` - Submit bank details
- `POST /api/onboarding/restaurant` - Create restaurant profile
- `POST /api/onboarding/menu/categories` - Add menu category
- `POST /api/onboarding/menu/items` - Add menu item
- `PUT /api/onboarding/location` - Set restaurant location
- `POST /api/onboarding/complete` - Complete onboarding

### Restaurant Management (Protected)
- `GET /api/restaurant-manage/profile` - Get restaurant profile
- `PUT /api/restaurant-manage/profile` - Update restaurant profile
- `GET /api/restaurant-manage/menu` - Get restaurant menu
- `GET /api/restaurant-manage/orders` - Get restaurant orders
- `PUT /api/restaurant-manage/orders/:id/status` - Update order status

### Logistics Authentication
- `POST /api/logistics-auth/send-otp` - Send OTP to delivery partner
- `POST /api/logistics-auth/verify-otp` - Verify OTP and login
- `POST /api/logistics-auth/logout` - Logout delivery partner
- `GET /api/logistics-auth/me` - Get current delivery partner

### Logistics Onboarding (Protected)
- `POST /api/logistics-onboarding/documents` - Submit Aadhar & DL
- `POST /api/logistics-onboarding/bank-details` - Submit bank details
- `GET /api/logistics-onboarding/status` - Get onboarding status

### Logistics Operations (Protected)
- `POST /api/logistics/duty/start` - Go on duty
- `POST /api/logistics/duty/end` - Go off duty
- `POST /api/logistics/location` - Update GPS location
- `GET /api/logistics/orders/available` - Get nearby orders (10km radius)
- `POST /api/logistics/orders/accept` - Accept order
- `GET /api/logistics/deliveries/active` - Get active deliveries
- `POST /api/logistics/deliveries/:id/pickup` - Mark picked up
- `POST /api/logistics/deliveries/:id/deliver` - Mark delivered
- `GET /api/logistics/earnings` - Get earnings summary
- `POST /api/logistics/withdrawals/request` - Request withdrawal
- `GET /api/logistics/analytics/dashboard` - Get dashboard stats

## Restaurant App

The restaurant app provides a separate portal for restaurant owners to:
- Register and complete onboarding (documents, bank details, menu, location)
- Manage restaurant profile and menu
- View and manage orders
- Update order status in real-time

See `RESTAURANT_APP_STATUS.md` for detailed implementation status and remaining tasks.

## Logistics App

The logistics app provides a portal for delivery partners to:
- Register and complete onboarding (Aadhar, DL, vehicle info, bank details)
- Go on/off duty with duty management
- View and accept nearby orders (within 10km radius)
- Track active deliveries with GPS location updates
- View earnings (₹10 per km traveled)
- Request withdrawals for earned money
- View dashboard analytics (today, weekly, monthly statistics)

**Key Features:**
- Phone OTP authentication
- Multi-step onboarding with document verification
- Real-time GPS location tracking
- Intelligent order assignment (first-come-first-served within 10km)
- Transparent earnings calculation based on distance
- Self-service withdrawal requests
- Comprehensive analytics dashboard

See `LOGISTICS_IMPLEMENTATION.md` for detailed implementation status and architecture.

## Database Commands

```bash
# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed database
pnpm db:seed

# Open Prisma Studio
pnpm --filter @repo/db studio
```

## Project Scripts

### Root
```bash
pnpm dev          # Run all services
pnpm dev:api      # Run API only
pnpm dev:user     # Run user app only
pnpm db:generate  # Generate Prisma client
pnpm db:migrate   # Run migrations
pnpm db:seed      # Seed database
```

## Troubleshooting

### Database Issues
```bash
# Check PostgreSQL status
docker-compose ps

# Restart PostgreSQL
docker-compose restart

# View logs
docker-compose logs postgres
```

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :4000
netstat -ano | findstr :3000
```

## Contributing

[Add your contributing guidelines here]

## License

[Add your license here]
