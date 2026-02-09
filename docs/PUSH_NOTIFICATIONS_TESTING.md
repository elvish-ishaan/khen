# Push Notifications Testing Guide

This guide will help you test and debug push notifications in the Daavat food delivery platform.

## Prerequisites

1. **Firebase Configuration**
   - Firebase project created
   - Firebase Admin SDK service account key configured in API backend
   - Firebase Web Push certificate (VAPID key) configured in restaurant frontend
   - All Firebase environment variables set correctly

2. **HTTPS or Localhost**
   - Push notifications only work on HTTPS or localhost
   - Make sure you're testing on one of these

3. **Browser Support**
   - Chrome, Firefox, Edge, Opera support push notifications
   - Safari has limited support
   - Notifications must be enabled in browser settings

## Environment Variables Checklist

### Backend (apps/api/.env)
```env
FIREBASE_SERVICE_ACCOUNT_KEY=path/to/serviceAccountKey.json
```

### Frontend (apps/restaurant/.env.local)
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key
```

**Important:** The VAPID key must match the one in your Firebase project settings:
- Go to Firebase Console → Project Settings → Cloud Messaging → Web Push certificates
- Copy the "Key pair" value

## Testing Steps

### Step 1: Start the Applications

```bash
# Terminal 1: Start API backend
pnpm --filter api dev

# Terminal 2: Start restaurant frontend
pnpm --filter restaurant dev
```

### Step 2: Login to Restaurant Dashboard

1. Open http://localhost:3001/login
2. Login with your restaurant owner phone number
3. Complete OTP verification

### Step 3: Enable Notifications

When you land on the dashboard, the app will automatically:
1. Request notification permission (allow it!)
2. Register a service worker
3. Get an FCM token
4. Send the token to the backend

**Check the console logs to verify:**
- Look for logs starting with `🔔 [FCM]` and `✅ [FCM]`
- You should see "FCM token obtained" and "Token registered successfully"

### Step 4: Test Notification Manually

Use the test endpoint via API:

```bash
# Make sure you're logged in to restaurant dashboard first
curl -X POST http://localhost:4000/api/restaurant-manage/test-notification \
  -H "Content-Type: application/json" \
  -b "auth_token=YOUR_AUTH_TOKEN"
```

Or use the browser console:
```javascript
fetch('/api/restaurant-manage/test-notification', {
  method: 'POST',
  credentials: 'include'
}).then(r => r.json()).then(console.log)
```

### Step 5: Test with Real Order

To test the full flow:

1. **Login to User App** (http://localhost:3000)
2. **Browse restaurants** and add items to cart
3. **Place an order**
4. **Check restaurant dashboard** - you should receive a notification

## Troubleshooting

### Issue: "Firebase app not initialized"

**Solution:**
- Check that `apps/restaurant/lib/firebase.ts` is imported in your layout or page
- Make sure all Firebase environment variables are set correctly

### Issue: "No FCM token available"

**Solution:**
1. Check browser console for detailed error logs
2. Verify VAPID key is correct in `.env.local`
3. Make sure service worker registered successfully
4. Try clearing browser cache and service workers:
   - Chrome: DevTools → Application → Service Workers → Unregister
   - Then refresh the page

### Issue: "VAPID key not configured"

**Solution:**
1. Go to Firebase Console → Project Settings → Cloud Messaging
2. Under "Web Push certificates", generate a new key pair if none exists
3. Copy the key and set it as `NEXT_PUBLIC_FIREBASE_VAPID_KEY`
4. Restart the frontend app

### Issue: "Service worker registration failed"

**Solution:**
1. Check that `firebase-messaging-sw.js` exists in `apps/restaurant/public/`
2. Make sure Firebase config in the service worker matches your `.env.local` values
3. Open DevTools → Application → Service Workers and check for errors
4. Try accessing http://localhost:3001/firebase-messaging-sw.js directly

### Issue: "Push notification sent but not received"

**Possible causes:**
1. Browser notifications blocked - check browser settings
2. App is in focus - try switching to another tab or minimizing browser
3. Service worker not active - check DevTools → Application → Service Workers
4. FCM token expired - try clearing the token and re-registering:
   ```sql
   -- In your database
   UPDATE "RestaurantOwner" SET "fcmToken" = NULL WHERE phone = 'your_phone';
   -- Then reload the dashboard to get a new token
   ```

### Issue: "messaging/invalid-registration-token"

**Solution:**
- The FCM token is invalid or expired
- Clear the token from database and re-register
- Check server logs for the exact error from Firebase Admin SDK

### Issue: Notification permission is denied

**Solution:**
1. **Chrome/Edge:**
   - Click the lock icon in address bar → Site settings
   - Find "Notifications" and change to "Allow"
   - Reload the page

2. **Firefox:**
   - Click the lock icon → More information → Permissions
   - Find "Receive Notifications" and change to "Allow"
   - Reload the page

## Logging Guide

The implementation includes comprehensive logging with emojis for easy tracking:

| Emoji | Meaning |
|-------|---------|
| 🔔 | Notification-related action starting |
| ✅ | Success |
| ❌ | Error |
| ⚠️ | Warning |
| 🔄 | Processing/In progress |
| 📱 | FCM token or message |
| 📦 | Data payload |
| 🧪 | Test notification |
| 🖱️ | User interaction |
| 👂 | Listener setup |

### Important Log Locations

**Frontend (Browser Console):**
- `[FCM]` - Firebase Messaging operations
- `[API]` - API client calls
- `[Dashboard]` - Dashboard component logic
- `[SW]` - Service worker operations

**Backend (Server Console):**
- `[Register FCM]` - Token registration
- `[Order]` - Order creation and notification sending
- `[Test Notification]` - Test notification endpoint
- `[FCM]` - Firebase Admin SDK operations

## Testing Checklist

Before reporting issues, verify:

- [ ] Firebase environment variables are set correctly
- [ ] Service worker is registered and active
- [ ] Notification permission is granted
- [ ] FCM token is obtained and registered with backend
- [ ] Restaurant owner has FCM token in database (check with SQL query)
- [ ] Backend logs show notification sent successfully
- [ ] Browser notifications are not blocked in system settings
- [ ] Testing on HTTPS or localhost (not HTTP)
- [ ] Service worker file is accessible at /firebase-messaging-sw.js

## Database Verification

Check if FCM token is saved:

```sql
SELECT id, phone, "fcmToken"
FROM "RestaurantOwner"
WHERE phone = 'your_restaurant_phone';
```

The `fcmToken` column should have a long string value (not NULL).

## Advanced Debugging

### View Service Worker Logs

1. Open Chrome DevTools
2. Go to Application tab → Service Workers
3. Click "inspect" under your service worker
4. Check the console for background message logs

### Test FCM Token Directly

You can test your FCM token using Firebase Console:
1. Go to Firebase Console → Cloud Messaging
2. Click "Send your first message"
3. Enter title and body
4. Click "Send test message"
5. Paste your FCM token
6. Click "Test"

### Monitor Network Requests

1. Open DevTools → Network tab
2. Filter by "fcm-token" to see token registration
3. Filter by "test-notification" to see test notification requests
4. Check the request/response payloads

## Common Success Patterns

### Successful Token Registration
```
🔔 [FCM] Starting notification permission request...
📱 [FCM] Current notification permission: default
📱 [FCM] Notification permission result: granted
✅ [FCM] Firebase app found
✅ [FCM] Firebase Messaging instance created
🔄 [FCM] Registering service worker...
✅ [FCM] Service worker registered: activated
✅ [FCM] Service worker ready
🔑 [FCM] VAPID key present: true
🔄 [FCM] Getting FCM token...
✅ [FCM] FCM token obtained: BKj7dM3...
📤 [API] Registering FCM token...
✅ [API] FCM token registration response: { success: true, ... }
✅ [Dashboard] FCM token registered successfully with backend
👂 [Dashboard] Setting up foreground message listener...
✅ [Dashboard] Notification setup complete!
```

### Successful Test Notification
```
🧪 [Test Notification] Testing push notification for owner: cly...
✅ [Test Notification] FCM token found, sending test notification...
📱 [FCM] Preparing to send push notification...
🔄 [FCM] Sending message via Firebase Admin SDK...
✅ [FCM] Push notification sent successfully! Message ID: 0:167...
```

## Testing via Browser Console

Once logged into the restaurant dashboard, open the browser console and run:

```javascript
// Test the notification API directly
fetch('http://localhost:4000/api/restaurant-manage/test-notification', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => {
  console.log('Test notification result:', data);
})
.catch(err => {
  console.error('Test notification error:', err);
});
```

## Need Help?

If you're still having issues after following this guide:

1. Check all logs in both browser console and server console
2. Copy the exact error messages
3. Verify all environment variables are set
4. Take screenshots of the errors
5. Check Firebase Console for any quota limits or errors

## Resources

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [Web Push Notifications Guide](https://web.dev/push-notifications-overview/)
- [Service Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
