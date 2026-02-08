# PWA Icons

Place your app icons in this directory with the following sizes:

## Required Icon Sizes

- `icon-72x72.png` - 72x72 pixels
- `icon-96x96.png` - 96x96 pixels
- `icon-128x128.png` - 128x128 pixels
- `icon-144x144.png` - 144x144 pixels
- `icon-152x152.png` - 152x152 pixels
- `icon-192x192.png` - 192x192 pixels (most common)
- `icon-384x384.png` - 384x384 pixels
- `icon-512x512.png` - 512x512 pixels (largest)

## Icon Guidelines

- **Format**: PNG with transparency
- **Purpose**: The icons are set to work as both regular and maskable icons
- **Maskable**: Ensure important content is within the safe zone (80% of canvas)
- **Background**: For maskable icons, fill the entire canvas (no transparency in corners)

## Tools to Generate Icons

- [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [PWA Builder](https://www.pwabuilder.com/imageGenerator)

## Quick Command (with pwa-asset-generator)

```bash
npx pwa-asset-generator your-logo.png public/icons --background "#ffffff" --padding "10%"
```

Replace `your-logo.png` with your source icon file.
