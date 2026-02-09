# Firebase Setup Guide

## Overview
The Daavat platform now uses Firebase for:
1. **Phone Authentication** (all 3 apps: user, restaurant, logistics)
2. **Push Notifications** (restaurant app - for order alerts)

## Firebase Console Setup

### 1. Create a Firebase Project
1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Enter project name: "Daavat" (or your preferred name)
4. Disable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Phone Authentication
1. In Firebase Console → Authentication → Sign-in method
2. Click "Phone" provider
3. Enable it
4. Add test phone numbers (for development):
   - Phone: +91 9876543210
   - Test code: 123456
   - (Add more as needed)

### 3. Register Web Apps
You need to register 3 separate web apps (one for each frontend):

#### App 1: User App
1. Project Overview → Add app → Web
2. App nickname: "Daavat User App"
3. Copy the config values (you'll use these for user app .env)

#### App 2: Restaurant App
1. Add another web app
2. App nickname: "Daavat Restaurant App"
3. Copy the config values (for restaurant app .env)

#### App 3: Logistics App
1. Add another web app
2. App nickname: "Daavat Logistics App"
3. Copy the config values (for logistics app .env)

### 4. Generate VAPID Key (for Push Notifications)
1. Project Settings → Cloud Messaging
2. Scroll to "Web Push certificates"
3. Click "Generate key pair"
4. Copy the VAPID key (you'll use this in restaurant app .env)

### 5. Download Service Account (for Backend)
1. Project Settings → Service accounts
2. Click "Generate new private key"
3. Save the JSON file as `firebase-service-account.json`
4. Place it in `apps/api/` directory
5. **IMPORTANT**: Add to `.gitignore` (already done)

## Environment Configuration

### API Backend (`apps/api/.env`)
```bash
FIREBASE_SERVICE_ACCOUNT_KEY=./firebase-service-account.json
```

### Restaurant App (`apps/restaurant/.env.local`)
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_from_step_3
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key_from_step_4
```

### User App (`apps/user/.env.local`)
Same Firebase config as restaurant app (but use User App values from step 3)

### Logistics App (`apps/logistics/.env.local`)
Same Firebase config as restaurant app (but use Logistics App values from step 3)

## Testing Phone Authentication

### Development Testing
1. In Firebase Console → Authentication → Sign-in method → Phone
2. Add test phone numbers with test codes
3. Example:
   - Phone: +91 9876543210
   - Code: 123456

### Production Testing
- Real phone numbers will receive actual SMS
- Firebase has free tier: 10K verifications/month
- After that: $0.01 per verification

## Security Notes

1. **Service Account JSON**: Never commit this file to git
2. **VAPID Key**: Can be public (used in browser)
3. **API Keys**: These are safe to expose (they're restricted by domain in Firebase Console)
4. **Authorized Domains**: Add your production domain in Firebase Console → Authentication → Settings → Authorized domains

## Troubleshooting

### "reCAPTCHA" errors
- Make sure your domain is in Authorized domains (Firebase Console)
- For localhost, it should work automatically

### "quota-exceeded" error
- You've hit the free tier limit
- Upgrade to Blaze plan (pay-as-you-go)

### Push notifications not working
- Make sure VAPID key is correct
- Check browser console for errors
- Ensure notification permission is granted

## Cost Estimate

**Free Tier (Spark Plan):**
- Phone Auth: 10,000 verifications/month free
- Cloud Messaging (Push): Unlimited free

**Paid Tier (Blaze Plan):**
- Phone Auth: $0.01 per verification after 10K
- Cloud Messaging: Still free
- You only pay for what you use

For a small restaurant platform:
- ~300 logins/month = FREE
- ~3,000 logins/month = ~$20/month
- ~10,000+ logins/month = Consider alternative auth
