# Demo Device Images — Asset Registry

Source of truth: `lib/devices/demoDeviceImages.ts` → `DEMO_DEVICE_IMAGE_BY_ID`  
Data binding: `lib/demo/morganDevices.ts` → `demo_image` (auto-set from device ID)  
Public assets: `/public/demo/devices/*.webp`

## Fixed asset mismatches (July 2026)

| Device | Problem | Resolution |
|--------|---------|------------|
| Xbox Series X | PNG showed a PlayStation 5 | Replaced with Xbox Series X product photo |
| Nintendo Switch OLED | PNG showed retail packaging box | Replaced with handheld console product photo |
| Samsung Frame TV | PNG showed generic black TV | Replaced with Samsung The Frame art-mode TV |
| Security Cameras | PNG showed Arlo 3-pack retail box | Replaced with single outdoor camera product photo |

## Remaining assets to review (optional quality pass)

| Device | File | Notes |
|--------|------|-------|
| Echo Show | `echo-show.webp` | In-context kitchen shot; acceptable but not isolated product photo |

## Fallback behavior

If a demo asset file is missing, `DeviceImageDisplay` shows a category-appropriate
Lucide icon (not an unrelated product photo). Demo resolution never uses category-based
image swapping.
