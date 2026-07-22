# Demo Device Images — Asset Review TODO

All Morgan Household demo devices now resolve images from `lib/devices/demoDeviceImages.ts`
→ `demo_image` on each record in `lib/demo/morganDevices.ts`
→ local files under `/public/demo/devices/*.webp`.

## Status

All 24 demo devices have dedicated webp assets converted from existing project PNGs.
No device shares a category-based generic image anymore.

## Assets to review or replace with higher-fidelity product photography

These files exist and load correctly, but were converted from earlier demo PNGs.
Replace only if visual QA shows a mismatch with the device name:

| Device | Asset file | Notes |
|--------|------------|-------|
| Samsung Frame TV | `samsung-frame-tv.webp` | Review art-mode TV frame appearance |
| Apple TV 4K | `apple-tv-4k.webp` | Review set-top box silhouette |
| Sonos Beam | `sonos-beam.webp` | Review soundbar form factor |
| Nintendo Switch OLED | `nintendo-switch-oled.webp` | Review OLED dock + Joy-Cons |
| PlayStation 5 | `playstation-5.webp` | Review PS5 console |
| Xbox Series X | `xbox-series-x.webp` | Review Series X tower |
| MacBook Pro | `macbook-pro.webp` | Review 14-inch laptop |
| Studio Display | `studio-display.webp` | Review Apple monitor |
| Canon Printer | `canon-printer.webp` | Review inkjet all-in-one |
| UniFi Dream Router | `unifi-dream-router.webp` | Review UDR hardware |
| Synology NAS | `synology-nas.webp` | Review NAS enclosure |
| iPhone 16 Pro | `iphone.webp` | Review phone model |
| Samsung Refrigerator | `samsung-refrigerator.webp` | Review 4-door fridge |
| Echo Show | `echo-show.webp` | Review smart display |
| LG Washer | `lg-washer.webp` | Review front-load washer |
| LG Dryer | `lg-dryer.webp` | Review matching dryer |
| Robot Vacuum Dock | `robot-vacuum.webp` | Review vacuum + dock |
| Air Purifier | `air-purifier.webp` | Review tower purifier |
| LG OLED TV | `lg-oled-tv.webp` | Review OLED panel |
| Ring Doorbell | `ring-doorbell.webp` | Review doorbell camera |
| Yale Smart Lock | `yale-smart-lock.webp` | Review deadbolt hardware |
| Nest Thermostat | `nest-thermostat.webp` | Review round thermostat |
| UniFi Access Point | `unifi-access-point.webp` | Review ceiling AP |
| Security Cameras | `security-camera.webp` | Review outdoor camera |

## Fallback behavior

If a demo asset path is missing at runtime, `DeviceImageDisplay` shows a
category-appropriate Lucide icon illustration (not an unrelated product photo).
