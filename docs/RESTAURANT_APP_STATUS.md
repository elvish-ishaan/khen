# Restaurant App Implementation Status

## ✅ Completed Tasks

### 1. Database Schema (Task #1)
- Added `OnboardingStatus` enum (PENDING_DOCUMENTS, PENDING_BANK_DETAILS, PENDING_MENU, PENDING_LOCATION, COMPLETED)
- Added `DocumentType` enum (FSSAI_CERTIFICATE, PAN_CARD, AADHAR, GSTIN)
- Created `RestaurantOwner` model with phone authentication and onboarding status
- Created `RestaurantDocument` model for document uploads
- Created `BankDetails` model for payment information
- Updated `Restaurant` model to link with owner
- Migration applied successfully: `20260131191317_add_restaurant_owner_models`

### 2. File Upload Middleware (Task #2)
- Installed multer for file handling
- Created `/apps/api/src/middleware/upload.ts` with:
  - Local file storage in `/uploads` directory
  - Subdirectories: documents/, menu-items/, restaurants/
  - File validation (MIME types, size limits)
  - Helper functions for file management
- Updated `env.ts` with upload configuration (UPLOAD_DIR, MAX_FILE_SIZE)

### 3. Restaurant Authentication API (Task #3)
- Created `/apps/api/src/validators/restaurant-auth.validator.ts`
- Created `/apps/api/src/middleware/restaurant-auth.ts`
- Created `/apps/api/src/controllers/restaurant-auth.controller.ts` with:
  - sendOtpHandler - Send OTP via MSG91
  - verifyOtpHandler - Verify OTP and create/login owner
  - logoutHandler - Clear authentication cookie
  - getMeHandler - Get current owner profile
- Created `/apps/api/src/routes/restaurant-auth.routes.ts`
- Added `RestaurantAuthenticatedRequest` type to types/index.ts
- Uses separate cookie: `restaurant_auth_token`
- JWT payload includes: `{ ownerId, phone, role: 'restaurant', restaurantId }`

### 4. Onboarding API (Task #4)
- Created `/apps/api/src/validators/onboarding.validator.ts` with schemas for:
  - Document uploads
  - Bank details
  - Restaurant info
  - Menu categories and items
  - Location
- Created `/apps/api/src/controllers/onboarding.controller.ts` with handlers for:
  - getStatusHandler - Get onboarding progress
  - uploadDocumentsHandler - Upload business documents
  - submitBankDetailsHandler - Submit bank account info
  - createRestaurantHandler - Create restaurant profile
  - addCategoryHandler, updateCategoryHandler, deleteCategoryHandler
  - addMenuItemHandler, updateMenuItemHandler, deleteMenuItemHandler
  - updateLocationHandler - Set restaurant location
  - completeOnboardingHandler - Validate and complete onboarding
- Created `/apps/api/src/routes/onboarding.routes.ts` with all endpoints

### 5. Restaurant Management API (Task #5)
- Created `/apps/api/src/validators/restaurant-manage.validator.ts`
- Created `/apps/api/src/controllers/restaurant-manage.controller.ts` with:
  - getProfileHandler - Get restaurant profile
  - updateProfileHandler - Update restaurant info
  - getMenuHandler - Get full menu
  - getOrdersHandler - Get orders with pagination and filtering
  - getOrderByIdHandler - Get single order details
  - updateOrderStatusHandler - Update order status
- Created `/apps/api/src/routes/restaurant-manage.routes.ts`
- Reuses onboarding menu handlers for menu management

### 6. API Configuration (Task #6)
- Updated `/apps/api/src/middleware/cors.ts` to allow multiple origins:
  - http://localhost:3000 (user app)
  - http://localhost:3001 (restaurant app)
- Updated `/apps/api/src/routes/index.ts` to register:
  - `/api/restaurant-auth` - Restaurant authentication routes
  - `/api/onboarding` - Onboarding routes
  - `/api/restaurant-manage` - Restaurant management routes
- Updated `/apps/api/src/app.ts` to serve static files from `/uploads`

### 7. Restaurant Next.js App Structure (Task #7)
Created complete app structure at `/apps/restaurant/`:

**Configuration Files:**
- package.json - Dependencies and scripts (runs on port 3001)
- next.config.mjs - Next.js configuration
- tsconfig.json - TypeScript configuration
- tailwind.config.ts - Tailwind CSS configuration
- postcss.config.mjs - PostCSS configuration
- .env.local - Environment variables

**Middleware:**
- middleware.ts - Route protection and authentication checks

**API Client Layer** (`lib/api/`):
- client.ts - Base API client with fetch wrapper
- auth.api.ts - Restaurant authentication endpoints
- onboarding.api.ts - Onboarding flow endpoints
- restaurant.api.ts - Restaurant management endpoints

**State Management** (`stores/`):
- auth-store.ts - Zustand store for authentication
- onboarding-store.ts - Zustand store for onboarding progress

**App Structure:**
- `app/(auth)/` - Authentication route group
  - layout.tsx - Auth layout
  - login/page.tsx - Phone login (placeholder)
  - verify-otp/page.tsx - OTP verification (placeholder)

- `app/(onboarding)/` - Onboarding route group
  - layout.tsx - Onboarding layout
  - documents/page.tsx - Document upload (placeholder)
  - bank-details/page.tsx - Bank details form (placeholder)
  - restaurant-info/page.tsx - Restaurant info (placeholder)
  - menu/page.tsx - Menu builder (placeholder)
  - location/page.tsx - Location setup (placeholder)

- `app/(dashboard)/` - Dashboard route group
  - layout.tsx - Dashboard layout with navigation
  - page.tsx - Dashboard home (placeholder)
  - orders/page.tsx - Order management (placeholder)
  - settings/page.tsx - Settings (placeholder)

---

## 🚧 Remaining Tasks

### 8. Implement Restaurant Auth Pages (Task #8)
**Location:** `apps/restaurant/app/(auth)/`

**Login Page** (`login/page.tsx`):
- Phone number input form
- Validation (10-digit Indian number)
- Call authApi.sendOtp()
- Redirect to /verify-otp
- Error handling and loading states

**Verify OTP Page** (`verify-otp/page.tsx`):
- OTP input (6 digits)
- Optional name and email fields
- Call authApi.verifyOtp()
- On success:
  - Update auth store
  - Check onboarding status
  - Redirect to appropriate page (onboarding or dashboard)
- Resend OTP functionality
- Error handling

### 9. Implement Onboarding Flow Pages (Task #9)
**Location:** `apps/restaurant/app/(onboarding)/`

**Components to Create:**
- Stepper component - Show progress through 5 steps
- File upload component - Drag & drop with preview
- Form components - Reusable form fields

**Documents Page** (`documents/page.tsx`):
- Upload FSSAI certificate (required)
- Upload PAN card (required)
- Input Aadhar number (required, 12 digits)
- Input GSTIN (optional, 15 chars)
- Call onboardingApi.uploadDocuments()
- Navigate to /bank-details on success

**Bank Details Page** (`bank-details/page.tsx`):
- Form fields:
  - Account holder name
  - Account number
  - Confirm account number (validation match)
  - IFSC code (regex validation)
  - Branch name
- Call onboardingApi.submitBankDetails()
- Navigate to /restaurant-info

**Restaurant Info Page** (`restaurant-info/page.tsx`):
- Form fields:
  - Restaurant name
  - Description (textarea)
  - Cuisine types (multi-select)
  - Phone number
  - Email (optional)
  - Opening hours (time pickers for opensAt/closesAt)
  - Min order amount
  - Delivery fee
  - Estimated delivery time (in minutes)
  - Cover image upload
- Call onboardingApi.createRestaurant()
- Navigate to /menu

**Menu Page** (`menu/page.tsx`):
- Two-column layout:
  - Left: Categories list with add/edit/delete
  - Right: Items for selected category
- Add category form (name, description)
- Add menu item form:
  - Name, description, price
  - Image upload
  - Veg/Non-veg toggle
  - Available toggle
- Call onboardingApi.addCategory(), addMenuItem()
- Navigate to /location when at least 1 category with 1 item exists

**Location Page** (`location/page.tsx`):
- Address form:
  - Address line 1, line 2
  - City, state, postal code
- Map integration:
  - Use browser geolocation API
  - Display map (can use Leaflet or Google Maps)
  - Allow pin dragging for precise location
  - Display latitude/longitude
- Call onboardingApi.updateLocation()
- Call onboardingApi.completeOnboarding()
- Redirect to /dashboard on success

### 10. Implement Restaurant Dashboard (Task #10)
**Location:** `apps/restaurant/app/(dashboard)/`

**Dashboard Page** (`page.tsx`):
- Fetch restaurant stats:
  - Total orders (all time)
  - Pending orders (status = PENDING or CONFIRMED)
  - Revenue today
  - Active menu items count
- Display in card grid
- Recent orders list (latest 5)
- Quick actions buttons

**Orders Page** (`orders/page.tsx`):
- Tabs for order status:
  - All, Pending, Preparing, Out for Delivery, Delivered
- Order list with:
  - Order number
  - Customer name/phone
  - Items summary
  - Total amount
  - Status
  - Time
- Click order to view details
- Update status dropdown
- Call restaurantApi.getOrders(), updateOrderStatus()
- Real-time updates (optional: polling or WebSocket)

**Order Detail Page** (`orders/[id]/page.tsx`):
- Full order information:
  - Customer details
  - Delivery address
  - Order items with quantities and prices
  - Payment status
  - Timestamps
- Status update controls
- Print receipt button

**Settings Page** (`settings/page.tsx`):
- Restaurant profile edit:
  - Name, description, cuisines
  - Phone, email
  - Operating hours
  - Delivery settings
  - Cover image update
- Menu management link (to /menu)
- Account settings (owner name, email)
- Logout button

---

## 📋 Testing Checklist

Once implementation is complete, test the following flow:

### New Restaurant Onboarding:
1. [ ] Open http://localhost:3001
2. [ ] Enter phone number, receive OTP
3. [ ] Verify OTP, create account
4. [ ] Upload documents (FSSAI, PAN, Aadhar)
5. [ ] Enter bank details
6. [ ] Create restaurant profile with cover image
7. [ ] Add menu categories and items with images
8. [ ] Set restaurant location on map
9. [ ] Complete onboarding
10. [ ] Verify restaurant appears in user app (http://localhost:3000)
11. [ ] Place test order from user app
12. [ ] View and update order status in restaurant dashboard

### Restaurant Management:
13. [ ] Login as existing restaurant owner
14. [ ] View dashboard stats
15. [ ] View orders list with filtering
16. [ ] Update order status
17. [ ] Edit menu items
18. [ ] Update restaurant profile
19. [ ] Logout

---

## 🚀 Running the Apps

### Start Backend API:
```bash
cd apps/api
pnpm dev
# API runs on http://localhost:4000
```

### Start User App:
```bash
cd apps/user
pnpm dev
# User app runs on http://localhost:3000
```

### Start Restaurant App:
```bash
cd apps/restaurant
pnpm install  # First time only
pnpm dev
# Restaurant app runs on http://localhost:3001
```

### Start Database:
```bash
docker-compose up -d
```

---

## 📝 Notes

- All backend APIs are implemented and ready
- Database schema is migrated
- Frontend structure is in place with placeholders
- API client and state management configured
- Need to implement actual UI components and forms
- Consider adding form libraries like react-hook-form and zod for validation
- Consider adding UI component library or complete shadcn/ui setup
- Image upload previews should show thumbnails
- Add loading spinners and error messages throughout
- Implement proper TypeScript types for all data
- Add input sanitization on frontend
- Consider adding image compression before upload
- Implement file size/type validation on frontend before upload

---

## 🔧 Environment Variables

**Backend** (`apps/api/.env`):
- Already configured with JWT_SECRET, DATABASE_URL, MSG91 keys, etc.

**Restaurant App** (`apps/restaurant/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

---

## 📚 API Endpoints Reference

### Restaurant Authentication
- POST `/api/restaurant-auth/send-otp` - Send OTP
- POST `/api/restaurant-auth/verify-otp` - Verify OTP and login
- POST `/api/restaurant-auth/logout` - Logout
- GET `/api/restaurant-auth/me` - Get current owner

### Onboarding
- GET `/api/onboarding/status` - Get onboarding status
- POST `/api/onboarding/documents` - Upload documents (multipart)
- POST `/api/onboarding/bank-details` - Submit bank details
- POST `/api/onboarding/restaurant` - Create restaurant (multipart)
- POST `/api/onboarding/menu/categories` - Add category
- PUT `/api/onboarding/menu/categories/:id` - Update category
- DELETE `/api/onboarding/menu/categories/:id` - Delete category
- POST `/api/onboarding/menu/items` - Add menu item (multipart)
- PUT `/api/onboarding/menu/items/:id` - Update item (multipart)
- DELETE `/api/onboarding/menu/items/:id` - Delete item
- PUT `/api/onboarding/location` - Update location
- POST `/api/onboarding/complete` - Complete onboarding

### Restaurant Management
- GET `/api/restaurant-manage/profile` - Get restaurant profile
- PUT `/api/restaurant-manage/profile` - Update profile (multipart)
- GET `/api/restaurant-manage/menu` - Get full menu
- POST `/api/restaurant-manage/menu/categories` - Add category
- PUT `/api/restaurant-manage/menu/categories/:id` - Update category
- DELETE `/api/restaurant-manage/menu/categories/:id` - Delete category
- POST `/api/restaurant-manage/menu/items` - Add item (multipart)
- PUT `/api/restaurant-manage/menu/items/:id` - Update item (multipart)
- DELETE `/api/restaurant-manage/menu/items/:id` - Delete item
- GET `/api/restaurant-manage/orders` - Get orders (with query params)
- GET `/api/restaurant-manage/orders/:id` - Get order details
- PUT `/api/restaurant-manage/orders/:id/status` - Update order status

---

**Last Updated:** 2026-01-31
**Status:** Backend Complete, Frontend Structure Ready, UI Implementation Pending
