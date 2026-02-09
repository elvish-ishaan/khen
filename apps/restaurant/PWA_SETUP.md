# PWA Setup - Restaurant App

The restaurant app is now configured as a Progressive Web App (PWA).

## Missing: App Icons

You need to create PWA icons before the app can be fully installed:

### Required Icons
- `public/icons/icon-192x192.png` - 192x192 pixels
- `public/icons/icon-512x512.png` - 512x512 pixels

### How to Create Icons

**Option 1: Using an online tool**
1. Go to https://realfavicongenerator.net/
2. Upload your logo (preferably square, at least 512x512px)
3. Generate icons
4. Download and place in `public/icons/` directory

**Option 2: Using design software**
1. Create/export your logo at 512x512px and 192x192px
2. Save as PNG files
3. Place in `public/icons/` directory

**Option 3: Simple colored square (for testing)**
Create a simple yellow (#eab308) square with the letter "D" in the center using any image editor.

### Theme Colors
The app uses yellow branding:
- Primary color: `#eab308` (yellow-500)
- Match your icons to this color scheme

## Testing PWA

1. Build the app: `pnpm build`
2. Run production server: `pnpm start`
3. Open in Chrome: http://localhost:3001
4. Check DevTools > Application > Manifest
5. Click "Install" button in address bar (if icons are present)

## Features Enabled
- ✅ Offline capability (service worker)
- ✅ Installable on mobile/desktop
- ✅ Standalone display mode
- ✅ Theme color (#eab308)
- ⏳ App icons (you need to add these)
