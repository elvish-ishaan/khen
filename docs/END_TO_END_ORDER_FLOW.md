# End-to-End Order Flow - Complete Guide

## 🔄 Complete Order Journey

### Flow Overview
```
USER ORDERS → RESTAURANT MANAGES → LOGISTICS DELIVERS → USER RECEIVES
```

---

## 📱 Step-by-Step Flow

### 1. **User Places Order** (User App - Port 3000)

**Steps:**
1. User browses restaurants
2. Adds items to cart
3. Proceeds to checkout
4. Creates order with payment

**Order Status:** `PENDING`

---

### 2. **Restaurant Receives Order** (Restaurant App - Port 3001)

**URL:** http://localhost:3001/dashboard/orders

**What Restaurant Sees:**
- New order appears in orders list
- Click on order to see details
- Order shows: Customer info, items, delivery address

**Restaurant Actions:**

#### Step 1: Confirm Order
- Click **"Mark as CONFIRMED"** button
- **Order Status:** `PENDING` → `CONFIRMED`

#### Step 2: Start Preparing
- Click **"Mark as PREPARING"** button
- **Order Status:** `CONFIRMED` → `PREPARING`

#### Step 3: Ready for Pickup
- Click **"Mark as READY_FOR_PICKUP"** button
- **Order Status:** `PREPARING` → `READY_FOR_PICKUP`
- **✨ This triggers the order to appear for logistics partners!**

**Restaurant Page:**
```
/dashboard/orders           → List of all orders
/dashboard/orders/[id]      → Order detail with status buttons
```

---

### 3. **Logistics Partner Sees Available Order** (Logistics App - Port 3002)

**Prerequisite:** Delivery partner must be:
- ✅ Logged in
- ✅ Onboarding status: `APPROVED` (set manually in DB for testing)
- ✅ On duty (toggle duty on dashboard)
- ✅ Within 10km of restaurant

**URL:** http://localhost:3002/dashboard/orders

**What Logistics Partner Sees:**
- Order appears in "Available Orders" list
- Shows: Restaurant name, distance, estimated earnings
- Order Status: `READY_FOR_PICKUP`

**Logistics Actions:**

#### Step 1: View Order Details
- Click on order card
- **URL:** `/dashboard/orders/[id]`
- See full details: pickup location, delivery address, items, earnings

#### Step 2: Accept Order
- Click **"Accept Order"** button
- **Order Status:** `READY_FOR_PICKUP` → `OUT_FOR_DELIVERY`
- **User sees:** Order status updates to "Out for Delivery"
- Partner redirected to `/dashboard/deliveries`

**Logistics Pages:**
```
/dashboard/orders           → Available orders (within 10km)
/dashboard/orders/[id]      → Order detail with accept button
/dashboard/deliveries       → Active deliveries
/dashboard/deliveries/[id]  → Delivery tracking
```

---

### 4. **Logistics Partner Delivers Order** (Logistics App)

**URL:** http://localhost:3002/dashboard/deliveries/[id]

#### Step 1: Mark as Picked Up
- Partner arrives at restaurant
- Click **"Mark as Picked Up"** button
- **Delivery Status:** `ACCEPTED` → `PICKED_UP`

#### Step 2: Mark as Delivered
- Partner arrives at customer location
- Click **"Mark as Delivered"** button
- **Order Status:** `OUT_FOR_DELIVERY` → `DELIVERED`
- **Delivery Status:** `PICKED_UP` → `DELIVERED`
- **Earnings:** ₹10 per km added to partner's account

---

### 5. **User Receives Order** (User App)

**User sees:**
- Order status: `DELIVERED`
- Can leave a review
- Order marked complete

---

## 🧪 Testing the Complete Flow

### Prerequisites

1. **Start all services:**
```bash
# Terminal 1: Database
docker-compose up -d

# Terminal 2: API
pnpm --filter api dev

# Terminal 3: User App
pnpm --filter user dev

# Terminal 4: Restaurant App
pnpm --filter restaurant dev

# Terminal 5: Logistics App
pnpm --filter logistics dev
```

2. **Access URLs:**
- User App: http://localhost:3000
- Restaurant App: http://localhost:3001
- Logistics App: http://localhost:3002
- API: http://localhost:4000

---

### Test Flow

#### Part 1: Setup (One-time)

**A. Register Restaurant Owner**
1. Go to http://localhost:3001/login
2. Enter phone: `9876543210`
3. Enter OTP: `123456`
4. Complete onboarding (documents, bank, restaurant, menu)
5. Wait for approval or manually approve:
   ```sql
   UPDATE "RestaurantOwner"
   SET "onboardingStatus" = 'COMPLETED'
   WHERE phone = '+919876543210';
   ```

**B. Register Delivery Partner**
1. Go to http://localhost:3002/login
2. Enter phone: `9103267625`
3. Enter OTP: `123456`
4. Complete onboarding (documents, bank details)
5. Manually approve in database:
   ```sql
   UPDATE "DeliveryPersonnel"
   SET "onboardingStatus" = 'APPROVED'
   WHERE phone = '+919103267625';
   ```
6. Update location (for testing, set close to restaurant):
   ```sql
   UPDATE "DeliveryPersonnel"
   SET latitude = 19.0760, longitude = 72.8777
   WHERE phone = '+919103267625';
   ```

#### Part 2: Order Flow Test

**Step 1: User Places Order**
1. Go to http://localhost:3000
2. Register/Login with phone: `9999999999`
3. Browse restaurants
4. Add items to cart
5. Create order
6. Order created with status `PENDING`

**Step 2: Restaurant Manages Order**
1. Go to http://localhost:3001/dashboard/orders
2. See new order
3. Click on order
4. Click **"Mark as CONFIRMED"** → Status: `CONFIRMED`
5. Click **"Mark as PREPARING"** → Status: `PREPARING`
6. Click **"Mark as READY_FOR_PICKUP"** → Status: `READY_FOR_PICKUP`

**Step 3: Logistics Accepts Order**
1. Go to http://localhost:3002/dashboard
2. Click **"Start Duty"**
3. Go to "Available Orders"
4. See the order (if within 10km)
5. Click on order
6. Click **"Accept Order"**
7. Order status → `OUT_FOR_DELIVERY`
8. Redirected to Active Deliveries

**Step 4: Logistics Completes Delivery**
1. In Active Deliveries, click on the delivery
2. Click **"Mark as Picked Up"** → Status: `PICKED_UP`
3. Click **"Mark as Delivered"** → Status: `DELIVERED`
4. Earnings added: ₹10 per km

**Step 5: Verify User Sees Delivered**
1. Go to http://localhost:3000/orders
2. See order status: `DELIVERED`

---

## 📊 Order Status Flow

```
USER CREATES ORDER
    ↓
PENDING (Order created)
    ↓
CONFIRMED (Restaurant confirms)
    ↓
PREPARING (Restaurant starts cooking)
    ↓
READY_FOR_PICKUP (Food ready - Logistics can see)
    ↓
OUT_FOR_DELIVERY (Logistics accepts - User sees this)
    ↓
DELIVERED (Logistics marks delivered)
```

---

## 🔑 Key Features

### Restaurant App
- ✅ View all orders
- ✅ Order detail page with full info
- ✅ Update order status (CONFIRMED → PREPARING → READY_FOR_PICKUP)
- ✅ See customer info and delivery address

### Logistics App
- ✅ Available orders (10km radius)
- ✅ Order detail with estimated earnings
- ✅ Accept order (first-come-first-served)
- ✅ Active deliveries list
- ✅ Delivery tracking with status updates
- ✅ Mark as Picked Up
- ✅ Mark as Delivered
- ✅ Earnings calculation (₹10/km)

### User App
- ✅ Real-time order status updates
- ✅ See when order is out for delivery
- ✅ View order details

---

## 🛠️ Database Helpers

### Approve Delivery Partner
```sql
UPDATE "DeliveryPersonnel"
SET "onboardingStatus" = 'APPROVED'
WHERE phone = '+919103267625';
```

### Set Delivery Partner Location (Mumbai example)
```sql
UPDATE "DeliveryPersonnel"
SET
  latitude = 19.0760,
  longitude = 72.8777,
  "lastLocationUpdate" = NOW()
WHERE phone = '+919103267625';
```

### Set Restaurant Location (near delivery partner)
```sql
UPDATE "Restaurant"
SET
  latitude = 19.0800,
  longitude = 72.8800
WHERE slug = 'your-restaurant-slug';
```

### View Order Status
```sql
SELECT "orderNumber", status, "createdAt"
FROM "Order"
ORDER BY "createdAt" DESC
LIMIT 10;
```

### View Delivery with Order
```sql
SELECT
  d.id,
  d.status as delivery_status,
  o."orderNumber",
  o.status as order_status,
  d.distance,
  d.earnings
FROM "Delivery" d
JOIN "Order" o ON d."orderId" = o.id
ORDER BY d."createdAt" DESC;
```

---

## 🐛 Troubleshooting

### Order Not Appearing for Logistics

**Check:**
1. Order status is `READY_FOR_PICKUP`
2. Delivery partner is `APPROVED`
3. Delivery partner is on duty
4. Delivery partner location is within 10km of restaurant

**Fix:**
```sql
-- Check order status
SELECT "orderNumber", status FROM "Order" WHERE id = 'order-id';

-- Check delivery partner
SELECT
  phone,
  "onboardingStatus",
  "isOnDuty",
  latitude,
  longitude
FROM "DeliveryPersonnel"
WHERE phone = '+919103267625';

-- Check restaurant location
SELECT slug, name, latitude, longitude
FROM "Restaurant";
```

### Calculate Distance
Use this formula or an online tool:
- Restaurant: (lat1, lon1)
- Delivery Partner: (lat2, lon2)
- If distance > 10km, order won't appear

**Quick Fix (Set same location for testing):**
```sql
-- Get restaurant location
SELECT latitude, longitude FROM "Restaurant" WHERE id = 'restaurant-id';

-- Set delivery partner to same location
UPDATE "DeliveryPersonnel"
SET latitude = 19.0760, longitude = 72.8777
WHERE phone = '+919103267625';
```

---

## 📈 Complete Feature List

### ✅ Implemented
- [x] Restaurant order detail page
- [x] Restaurant order status updates
- [x] Logistics available orders page
- [x] Logistics order detail page
- [x] Logistics order acceptance
- [x] Logistics active deliveries page
- [x] Logistics delivery tracking page
- [x] Mark as Picked Up
- [x] Mark as Delivered
- [x] Earnings calculation
- [x] 10km radius filtering
- [x] First-come-first-served logic
- [x] User sees OUT_FOR_DELIVERY status

### 🚧 Future Enhancements
- [ ] Real-time notifications (FCM)
- [ ] Google Maps route display
- [ ] Live location tracking
- [ ] Multiple orders batching
- [ ] Order timeout/retry mechanism
- [ ] Admin panel for approvals

---

## 🎯 Quick Test Commands

```bash
# 1. Start all services
docker-compose up -d && \
pnpm --filter api dev &
pnpm --filter user dev &
pnpm --filter restaurant dev &
pnpm --filter logistics dev

# 2. Access apps
echo "User: http://localhost:3000"
echo "Restaurant: http://localhost:3001"
echo "Logistics: http://localhost:3002"

# 3. Approve delivery partner (in Prisma Studio or psql)
# http://localhost:5555 (if using Prisma Studio)
```

---

**Last Updated:** February 1, 2026
**Status:** ✅ Fully Functional End-to-End
