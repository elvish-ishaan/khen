# PWA Setup Guide - Daavat User App

The user app has been configured as a Progressive Web App (PWA). Follow this guide to complete the setup and test the PWA functionality.

## ✅ What's Been Configured

1. **PWA Package**: Installed `@ducanh2912/next-pwa`
2. **Next.js Config**: Added PWA configuration with:
   - Service worker generation
   - Offline fallback page
   - Auto-update in background
   - Disabled in development mode
3. **Web Manifest**: Created `public/manifest.webmanifest` with:
   - App name and description
   - Display mode (standalone)
   - Theme colors
   - Icon configurations
   - App shortcuts (Restaurants, Orders, Cart)
4. **Offline Page**: Created `/offline` route for when user loses connection
5. **Metadata**: Updated root layout with PWA-specific metadata
6. **Icons Directory**: Set up structure for app icons
7. **Screenshots Directory**: Set up structure for app screenshots

## 📋 Required Next Steps

### 1. Add Your App Icons

You need to add PNG icons in the `public/icons/` directory with these sizes:

- `icon-72x72.png`
- `icon-96x96.png`
- `icon-128x128.png`
- `icon-144x144.png`
- `icon-152x152.png`
- `icon-192x192.png` (most important - used as primary icon)
- `icon-384x384.png`
- `icon-512x512.png` (largest)

**Quick Way to Generate Icons:**

```bash
# Install pwa-asset-generator globally
npm install -g pwa-asset-generator

# Generate all icons from your logo (run from apps/user directory)
npx pwa-asset-generator your-logo.png public/icons --background "#ffffff" --padding "10%"
```

Or use online tools:
- [PWA Builder Image Generator](https://www.pwabuilder.com/imageGenerator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)

### 2. Add App Screenshots (Optional but Recommended)

Add screenshots to `public/screenshots/`:

- `home.png` - Wide format (1280x720) for desktop/tablet
- `mobile.png` - Narrow format (750x1334) for mobile

These appear in the install prompt on some browsers and improve the installation experience.

### 3. Customize Theme Colors (Optional)

Edit `public/manifest.webmanifest` and update:

```json
{
  "theme_color": "#000000",  // Browser UI color
  "background_color": "#ffffff"  // Splash screen background
}
```

Update the same in `app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  // ...
  themeColor: '#000000',
  // ...
}
```

### 4. Build the App

The PWA features only work in production mode:

```bash
# Build the app (from project root)
pnpm --filter user build

# Start production server
pnpm --filter user start
```

Or use Next.js production mode directly:

```bash
cd apps/user
pnpm build
pnpm start
```

The app will be available at `http://localhost:3000`

## 🧪 Testing the PWA

### Chrome Desktop

1. Build and start the app in production mode
2. Open Chrome and go to `http://localhost:3000`
3. Look for the install icon (➕ or ⬇️) in the address bar
4. Click it to install the app
5. The app should open in a standalone window (no browser UI)

**Test Offline Mode:**
1. Open Chrome DevTools (F12)
2. Go to Application tab → Service Workers
3. Check "Offline" checkbox
4. Refresh the page - you should see the offline page

### Chrome Mobile (Android)

1. Deploy to a server with HTTPS (PWAs require HTTPS)
2. Open the app in Chrome on Android
3. Look for the "Add to Home Screen" prompt
4. Install the app
5. Find the app icon on your home screen
6. Open it - should look like a native app

### iOS Safari

1. Deploy to a server with HTTPS
2. Open the app in Safari on iOS
3. Tap the Share button
4. Select "Add to Home Screen"
5. The app will be added to your home screen

**Note:** iOS has limited PWA support compared to Android. Some features like push notifications are not available.

## 🔍 Verifying PWA Setup

### Using Chrome DevTools

1. Open Chrome DevTools (F12)
2. Go to **Application** tab
3. Check the left sidebar:

**Manifest:**
- Should show "Daavat Food Delivery"
- Icons should be listed
- Should show as "Installable"

**Service Workers:**
- Should show registered service worker
- Should have "activated and running" status

**Lighthouse:**
- Go to **Lighthouse** tab
- Select "Progressive Web App" category
- Click "Generate report"
- Should score 90+ for PWA

### Using PWA Builder

Visit [PWA Builder](https://www.pwabuilder.com/) and enter your deployed URL to get a detailed PWA report.

## 🚀 Deployment Considerations

### HTTPS Required

PWAs require HTTPS in production. Service workers will not register on HTTP (except localhost).

### Caching Strategy

The current configuration uses basic caching:
- **Offline Fallback**: Shows `/offline` page when no connection
- **Auto-update**: New versions load automatically on next visit
- **Development Disabled**: PWA features disabled in dev mode

### Custom Caching (Advanced)

To add more sophisticated caching, you can customize the Workbox options in `next.config.mjs`:

```javascript
workboxOptions: {
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'cloudinary-images',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    {
      urlPattern: /^https:\/\/storage\.googleapis\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'gcs-images',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
  ],
}
```

## 📱 PWA Features Enabled

### ✅ Currently Implemented

- **Installability**: Users can install the app to their home screen
- **Offline Fallback**: Shows friendly offline page when no connection
- **Standalone Mode**: Opens without browser UI
- **App Shortcuts**: Quick access to Restaurants, Orders, and Cart
- **Auto-updates**: New versions load automatically
- **Theme Integration**: Matches system theme (via next-themes)
- **Icon Support**: Maskable icons for modern Android

### 🔄 Future Enhancements (Not Implemented Yet)

- **Push Notifications**: Order status updates
- **Background Sync**: Queue actions when offline, sync when back online
- **Advanced Caching**: Cache restaurant data and images
- **Badging API**: Show unread order count on app icon
- **Share Target**: Share restaurants via native share

## 🐛 Troubleshooting

### Service Worker Not Registering

1. Make sure you're in production mode (`NODE_ENV=production`)
2. Clear browser cache and hard reload (Ctrl+Shift+R)
3. Check Console for errors
4. Verify HTTPS in production

### Install Prompt Not Showing

1. PWA must meet all installability criteria
2. Check Lighthouse PWA audit
3. Ensure all required icons are present
4. User must visit the site at least twice (Chrome requirement)

### Icons Not Showing

1. Verify icons exist in `public/icons/` directory
2. Check file names match exactly (case-sensitive)
3. Clear browser cache
4. Check manifest.webmanifest is accessible at `/manifest.webmanifest`

### Offline Page Not Showing

1. Service worker must be registered and active
2. Go to Chrome DevTools → Application → Service Workers
3. Click "Update" to refresh service worker
4. Try offline mode again

### Build Errors

If you get build errors:

```bash
# Clear Next.js cache
rm -rf apps/user/.next

# Clear service worker files
rm -rf apps/user/public/sw.js*
rm -rf apps/user/public/workbox-*.js*

# Rebuild
pnpm --filter user build
```

## 📚 Additional Resources

- [Next PWA Documentation](https://ducanh-ne.github.io/next-pwa/)
- [PWA Builder](https://www.pwabuilder.com/)
- [Web.dev PWA Guide](https://web.dev/progressive-web-apps/)
- [MDN PWA Documentation](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)

## 🎯 Checklist

Before deploying:

- [ ] Add all required icon sizes (72px to 512px)
- [ ] Add app screenshots (optional but recommended)
- [ ] Customize theme colors if desired
- [ ] Test installation on desktop Chrome
- [ ] Test installation on mobile Chrome (Android)
- [ ] Test offline functionality
- [ ] Run Lighthouse PWA audit (score 90+)
- [ ] Deploy with HTTPS
- [ ] Test on production URL

---

**Questions?** Check the troubleshooting section or refer to the resources above.
