# Push Notifications Troubleshooting Guide

## 🔍 Problem
Restaurant app not receiving push notifications when minimized or closed, even though backend shows "Push notification sent successfully".

## ✅ Solution Overview
The issue is typically caused by one or more of these factors:
1. **HTTPS requirement** - Service workers only work on HTTPS (or localhost)
2. **VAPID key not configured** - Required for web push
3. **Browser notifications blocked** - User must allow notifications
4. **Service worker not active** - Registration may have failed

---

## 🛠️ Quick Fixes

### 1. Check HTTPS
**Service workers require HTTPS or localhost**

✅ **Valid URLs:**
- `https://restaurant.example.com`
- `http://localhost:3001`
- `http://127.0.0.1:3001`

❌ **Invalid URLs:**
- `http://192.168.1.100:3001` (LAN IP without HTTPS)
- `http://restaurant.example.com` (HTTP without HTTPS)

**Solution:** Use HTTPS in production or access via localhost for development.

---

### 2. Configure VAPID Key
The VAPID key is required for web push notifications.

**Get VAPID Key:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project → Project Settings
3. Click "Cloud Messaging" tab
4. Under "Web Push certificates", find or generate a key pair
5. Copy the "Key pair" value

**Add to environment:**
```env
# apps/restaurant/.env.local
NEXT_PUBLIC_FIREBASE_VAPID_KEY=YOUR_VAPID_KEY_HERE
```

**Verify it's loaded:**
```bash
# In browser console
console.log(process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY);
# Should show your key, not undefined
```

---

### 3. Enable Browser Notifications

#### Chrome
1. Click the lock/info icon in address bar
2. Find "Notifications"
3. Change to "Allow"
4. Refresh the page

#### Firefox
1. Click the lock icon in address bar
2. Click "More information"
3. Go to "Permissions" tab
4. Find "Receive Notifications"
5. Check "Allow"
6. Refresh the page

#### Edge
1. Click the lock icon in address bar
2. Click "Permissions for this site"
3. Find "Notifications"
4. Change to "Allow"
5. Refresh the page

---

### 4. Use Notification Diagnostics Tool

We've added a **Notification Diagnostics** button to the restaurant dashboard:

1. Open restaurant dashboard
2. Look for the 🔔 bell icon in the bottom-right corner
3. Click it to see detailed diagnostic information
4. Follow the on-screen recommendations

**Features:**
- ✅ Check HTTPS status
- ✅ Verify browser support
- ✅ Check notification permissions
- ✅ Verify service worker status
- ✅ Check VAPID key configuration
- ✅ Re-setup notifications
- ✅ Send test notification

---

## 🔍 Detailed Debugging

### Check Service Worker Registration

**In browser console:**
```javascript
// Check if service worker is registered
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Registered service workers:', regs);
  regs.forEach(reg => {
    console.log('SW URL:', reg.active?.scriptURL);
    console.log('SW State:', reg.active?.state);
  });
});

// Check if service worker is controlling the page
console.log('Controller:', navigator.serviceWorker.controller);
```

**Expected output:**
```
Registered service workers: [ServiceWorkerRegistration]
SW URL: https://your-domain.com/firebase-messaging-sw.js
SW State: activated
Controller: ServiceWorker { ... }
```

---

### Check FCM Token

**In browser console:**
```javascript
// The token should be logged during setup
// Look for: "✅ [FCM] FCM token obtained: ..."
```

**If no token:**
1. Check browser console for errors
2. Verify VAPID key is configured
3. Check notification permission is granted
4. Verify service worker is active

---

### Test Notification Manually

**Use the diagnostic tool:**
1. Click the bell icon in bottom-right
2. Click "Send Test Notification"
3. You should receive a notification within seconds

**Alternative: Use backend API directly:**
```bash
# Get your auth token from browser cookies
# Then test the notification endpoint
curl -X POST https://your-api.com/api/restaurant-manage/test-notification \
  -H "Cookie: auth_token=YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 🐛 Common Errors and Solutions

### Error: "messaging/permission-blocked"
**Cause:** Notifications are blocked in browser settings
**Solution:** Enable notifications in browser settings (see step 3 above)

---

### Error: "messaging/unsupported-browser"
**Cause:** Browser doesn't support push notifications
**Solution:** Use Chrome, Firefox, or Edge (latest versions)

---

### Error: "messaging/failed-service-worker-registration"
**Cause:** Service worker registration failed (usually due to HTTP)
**Solution:** Use HTTPS or localhost

---

### Error: "messaging/token-unsubscribe-failed"
**Cause:** Old token needs to be cleared
**Solution:**
1. Open browser console
2. Run: `navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(reg => reg.unregister()))`
3. Clear browser cache
4. Reload page
5. Re-setup notifications

---

### Service worker shows "activated" but notifications don't work
**Cause:** Service worker might not be controlling the page
**Solution:**
1. Check if service worker is controlling: `console.log(navigator.serviceWorker.controller)`
2. If null, refresh the page
3. If still null, clear cache and hard refresh (Ctrl+Shift+R)

---

## 📱 Testing Background Notifications

### Test with app closed/minimized:
1. Open restaurant dashboard
2. Wait for "✅ [Dashboard] Notification setup complete!" in console
3. Minimize or close the browser tab (don't close the browser completely)
4. Create a test order from user app
5. You should see a desktop notification

### Test with browser console:
1. Keep browser console open
2. Look for: "🔔 [SW] BACKGROUND MESSAGE RECEIVED"
3. If you see this log but no notification appears:
   - Check notification permission
   - Check browser notification settings (might be in "Do Not Disturb" mode)

---

## 🔧 Backend Configuration

### Verify FCM token is saved:
```sql
-- In your database
SELECT id, phone, "fcmToken" FROM "RestaurantOwner" WHERE id = 'your-owner-id';
-- fcmToken should not be null
```

### Check backend logs:
Look for these logs when an order is created:
```
✅ [Order] Checking for restaurant owner FCM token...
👤 [Order] Restaurant owner found: cm1amo9yv004o1o1511xbkwj
📱 [Order] FCM token present: true
✅ [Order] Sending push notification to restaurant owner...
📱 [FCM] Preparing to send push notification...
📱 [FCM] Token (first 20 chars): d8lbqowi7b56bl1hka3w...
📱 [FCM] Title: New Order!
🔄 [FCM] Sending message via Firebase Admin SDK...
✅ [FCM] Push notification sent successfully! Message ID: ...
```

If you see this but still no notification on frontend, the issue is with the frontend service worker or browser settings.

---

## ✅ Production Deployment Checklist

Before deploying to production:

- [ ] HTTPS is enabled for the restaurant app
- [ ] VAPID key is configured in environment variables
- [ ] Service worker file is accessible at `/firebase-messaging-sw.js`
- [ ] Firebase config in service worker is correct
- [ ] FCM tokens are being saved to database
- [ ] Test notifications work in production environment
- [ ] Browser notification permissions are documented for users
- [ ] Diagnostic tool is available for troubleshooting

---

## 📚 Additional Resources

- [Firebase Cloud Messaging Web Guide](https://firebase.google.com/docs/cloud-messaging/js/client)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [Web Push Protocol](https://developers.google.com/web/fundamentals/push-notifications)

---

## 🆘 Still Not Working?

If notifications still don't work after trying all the above:

1. **Check browser console** - Look for any error messages
2. **Check service worker logs** - Open DevTools → Application → Service Workers
3. **Try incognito/private mode** - This rules out extension conflicts
4. **Try a different browser** - Chrome, Firefox, or Edge
5. **Check firewall/antivirus** - May be blocking push notifications
6. **Contact support** - Provide browser console logs and service worker logs

---

**Last Updated:** 2026-02-10
