# Demo Device Images — Asset Registry

Source of truth: `lib/devices/demoDeviceImages.ts` → `DEMO_DEVICE_IMAGE_BY_ID`  
Data binding: `lib/demo/morganDevices.ts` → `demo_image` (auto-set from device ID)  
Public assets: `/public/demo/devices/*.webp`

## Fixed asset mismatches (July 2026)

| Device | Problem | Resolution |
|--------|---------|------------|
| Xbox Series X | PNG showed a PlayStation 5 | Replaced with Xbox Series X product photo |
| Samsung Frame TV | PNG showed generic black TV | Replaced with Samsung The Frame art-mode TV |
| Security Cameras | PNG showed Arlo 3-pack retail box | Replaced with single outdoor camera product photo |
| Air Purifier (Dyson) | Stale/mismatched product shot | Regenerated Dyson Purifier Cool tower |
| Sonos Beam | Stale/mismatched product shot | Regenerated black Beam soundbar |
| Yale Smart Lock | In-door lifestyle shot | Regenerated isolated Assure Lock product photo |
| Samsung Refrigerator | Stale Family Hub shot | Regenerated stainless Family Hub fridge |
| Robot Vacuum Dock | In-room lifestyle shot | Regenerated Roborock dock + robot product photo |
| Nintendo Switch OLED | AI-looking detached Joy-Cons | Regenerated handheld with Joy-Cons attached |
| Nest Thermostat | Wall-mounted lifestyle shot | Regenerated isolated Nest dial product photo |
| LG Washer | Dark graphite finish mismatch | Regenerated white ThinQ front-load washer |
| LG Dryer | AI artifacts / mismatched look | Regenerated white ThinQ front-load dryer |

## Remaining assets to review (optional quality pass)

| Device | File | Notes |
|--------|------|-------|
| Echo Show | `echo-show.webp` | In-context kitchen shot; acceptable but not isolated product photo |

## Fallback behavior

If a demo asset file is missing, `DeviceImageDisplay` shows a category-appropriate
Lucide icon (not an unrelated product photo). Demo resolution never uses category-based
image swapping.
