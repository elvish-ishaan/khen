# FCM Push Notifications Setup Guide

## Overview
The restaurant app now receives push notifications when customers place orders.

## Firebase Console Setup

### 1. Generate VAPID Key
1. Go to Firebase Console → Project Settings → Cloud Messaging
2. Scroll to "Web Push certificates"
3. Click "Generate key pair"
4. Copy the VAPID key

### 2. Update Service Worker Config
Edit `public/firebase-messaging-sw.js`:
- Replace `YOUR_FIREBASE_API_KEY` with your actual Firebase API key
- Replace `YOUR_PROJECT.firebaseapp.com` with your Firebase auth domain
- Replace `YOUR_PROJECT_ID` with your Firebase project ID
- Replace other placeholders with actual values

**⚠️ IMPORTANT**: Service workers cannot access environment variables, so these values must be hardcoded in the file.

## Environment Setup

Add to `.env.local`:
```bash
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key_from_step_1
```

## How It Works

### When App is Open (Foreground)
1. User places order
2. API backend sends FCM push notification
3. Restaurant app receives notification via `onForegroundMessage`
4. Browser shows notification toast
5. Notification data includes order ID

### When App is Closed (Background)
1. User places order
2. API backend sends FCM push notification
3. Service worker (`firebase-messaging-sw.js`) receives it
4. Browser shows native notification with actions:
   - "View Order" - Opens order detail page
   - "Dismiss" - Closes notification

## Testing

### 1. Development Testing
```bash
# 1. Build the app (PWA only works in production build)
pnpm build

# 2. Run production server
pnpm start

# 3. Open http://localhost:3001/dashboard
# 4. Grant notification permission when prompted
# 5. Check browser console for "FCM token registered successfully"
```

### 2. Test Notification Flow
1. Log in to user app (port 3000)
2. Add items to cart
3. Place an order
4. Check restaurant app (port 3001) for notification

### 3. Check Service Worker
1. Open Chrome DevTools → Application → Service Workers
2. You should see:
   - `sw.js` (PWA service worker from next-pwa)
   - Firebase messaging service worker registered

## Troubleshooting

### No notification permission prompt
- Check if notifications are blocked in browser settings
- Clear site data and reload

### "FCM token not available"
- Verify VAPID key is correct in `.env.local`
- Check `firebase-messaging-sw.js` has correct Firebase config
- Ensure service worker is registered (DevTools → Application → Service Workers)

### Background notifications not working
- Verify `firebase-messaging-sw.js` is accessible at `/firebase-messaging-sw.js`
- Check browser console for service worker errors
- Ensure the app is a PWA (has manifest and service worker)

### Token registration fails
- Check API endpoint `/restaurant-manage/fcm-token` is working
- Verify restaurant owner is authenticated
- Check backend logs for errors

## Browser Support

| Browser | Foreground | Background |
|---------|-----------|------------|
| Chrome | ✅ | ✅ |
| Firefox | ✅ | ✅ |
| Safari (macOS) | ✅ | ✅ |
| Safari (iOS) | ⚠️ Limited | ⚠️ Limited |
| Edge | ✅ | ✅ |

**Note**: iOS Safari has limited push notification support. For full mobile support, consider building native apps.

## Security Notes

1. **Service Worker File**: The `firebase-messaging-sw.js` file contains your Firebase config. While these values are public (used in the browser), they should still be restricted via:
   - Firebase Console → Project Settings → App Check (enable for production)
   - Authorized domains only

2. **FCM Tokens**: These are stored in the database and used to send notifications. They're not sensitive but should be:
   - Updated when they change (Firebase handles this automatically)
   - Removed when user logs out (optional enhancement)

## Cost

Firebase Cloud Messaging (FCM) is **completely free** with unlimited messages.

## Next Steps

1. **Error Handling**: Add better error handling for notification failures
2. **Sound/Vibration**: Customize notification sound and vibration patterns
3. **Badge Count**: Show unread order count in app badge
4. **Notification History**: Store notifications in database for later viewing
5. **User Preferences**: Let users configure notification settings
