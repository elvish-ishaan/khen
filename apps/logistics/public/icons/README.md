# PWA Icons - Logistics App

Currently using placeholder icons copied from the user app.

## TODO: Create Custom Logistics Icons

Replace these placeholder files with logistics-branded icons:

- `icon-192x192.png` - 192x192px app icon
- `icon-512x512.png` - 512x512px app icon

### Design Requirements

**Theme**: Blue/teal logistics theme matching `#0ea5e9` (sky-500)

**Icon Design Ideas**:
- Delivery truck icon
- Delivery box/package icon
- Location pin with delivery theme
- Route/navigation icon

**Technical Requirements**:
- Format: PNG with transparency
- Sizes: 192x192px and 512x512px
- Safe area: Keep logo within 80% center for maskable variant
- Background: White or light blue gradient

### Generation Options

1. **Online PWA Icon Generator**: https://realfavicongenerator.net/
2. **PWA Asset Generator**: https://github.com/elegantapp/pwa-asset-generator
3. **Manual Design**: Export from Figma/Adobe XD/Illustrator at exact dimensions
4. **Programmatic**: Use sharp/canvas library to generate from SVG

### Quick Command (if you have an SVG logo)

```bash
# Using PWA Asset Generator
npx pwa-asset-generator logo.svg ./public/icons --icon-only --background "#ffffff" --scrape false
```

---

**Note**: Current icons are temporary placeholders. Replace with logistics-themed icons before production deployment.
