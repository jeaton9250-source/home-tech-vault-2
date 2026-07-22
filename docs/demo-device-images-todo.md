# Demo Device Images — Asset Registry

Source of truth: `lib/devices/demoDeviceImages.ts` → `DEMO_DEVICE_IMAGE_BY_ID`  
Data binding: `lib/demo/morganDevices.ts` → `demo_image` (auto-set from device ID)  
Public assets: `/public/demo/devices/*.webp`

## Visual style (July 2026)

All 24 demo devices use **in-home lifestyle photography** in the Morgan Household aesthetic:

- Warm natural light, cream/stone walls matching app palette (`#F3F1EC`, `#FAF9F7`)
- Device shown in its real room context (living room, office, kitchen, laundry, bedroom, entryway)
- Shallow depth of field, photorealistic homeowner-inventory feel
- **Not** white-background e-commerce catalog shots

Display: `DeviceImageDisplay` and `DemoDeviceProfile` use `object-cover` on a warm stone gradient background.

## Fallback behavior

If a demo asset file is missing, `DeviceImageDisplay` shows a category-appropriate
Lucide icon (not an unrelated product photo). Demo resolution never uses category-based
image swapping.
