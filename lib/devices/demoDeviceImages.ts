/** Demo device image registry — single source of truth for Morgan Household assets. */
export const DEMO_DEVICE_IMAGE_BASE = "/demo/devices";

/**
 * Device ID → local webp asset under /public/demo/devices/
 * Filename must match the physical product shown in the Morgan Household demo.
 */
export const DEMO_DEVICE_IMAGE_BY_ID: Record<string, string> = {
  "demo-samsung-frame": `${DEMO_DEVICE_IMAGE_BASE}/samsung-frame-tv.webp`, // Samsung Frame TV
  "demo-appletv": `${DEMO_DEVICE_IMAGE_BASE}/apple-tv-4k.webp`, // Apple TV 4K
  "demo-sonos": `${DEMO_DEVICE_IMAGE_BASE}/sonos-beam.webp`, // Sonos Beam
  "demo-switch": `${DEMO_DEVICE_IMAGE_BASE}/nintendo-switch-oled.webp`, // Nintendo Switch OLED
  "demo-ps5": `${DEMO_DEVICE_IMAGE_BASE}/playstation-5.webp`, // PlayStation 5
  "demo-xbox": `${DEMO_DEVICE_IMAGE_BASE}/xbox-series-x.webp`, // Xbox Series X
  "demo-macbook": `${DEMO_DEVICE_IMAGE_BASE}/macbook-pro.webp`, // MacBook Pro
  "demo-studio-display": `${DEMO_DEVICE_IMAGE_BASE}/studio-display.webp`, // Studio Display
  "demo-canon-printer": `${DEMO_DEVICE_IMAGE_BASE}/canon-printer.webp`, // Canon Printer
  "demo-unifi-router": `${DEMO_DEVICE_IMAGE_BASE}/unifi-dream-router.webp`, // UniFi Dream Router
  "demo-synology": `${DEMO_DEVICE_IMAGE_BASE}/synology-nas.webp`, // Synology NAS
  "demo-iphone": `${DEMO_DEVICE_IMAGE_BASE}/iphone.webp`, // iPhone 16 Pro
  "demo-samsung-fridge": `${DEMO_DEVICE_IMAGE_BASE}/samsung-refrigerator.webp`, // Samsung Refrigerator
  "demo-echo-show": `${DEMO_DEVICE_IMAGE_BASE}/echo-show.webp`, // Echo Show
  "demo-lg-washer": `${DEMO_DEVICE_IMAGE_BASE}/lg-washer.webp`, // LG Washer
  "demo-lg-dryer": `${DEMO_DEVICE_IMAGE_BASE}/lg-dryer.webp`, // LG Dryer
  "demo-robot-vacuum": `${DEMO_DEVICE_IMAGE_BASE}/robot-vacuum.webp`, // Robot Vacuum Dock
  "demo-air-purifier": `${DEMO_DEVICE_IMAGE_BASE}/air-purifier.webp`, // Air Purifier
  "demo-lg-oled": `${DEMO_DEVICE_IMAGE_BASE}/lg-oled-tv.webp`, // LG OLED TV
  "demo-ring": `${DEMO_DEVICE_IMAGE_BASE}/ring-doorbell.webp`, // Ring Doorbell
  "demo-smart-lock": `${DEMO_DEVICE_IMAGE_BASE}/yale-smart-lock.webp`, // Yale Smart Lock
  "demo-nest": `${DEMO_DEVICE_IMAGE_BASE}/nest-thermostat.webp`, // Nest Thermostat
  "demo-unifi-ap": `${DEMO_DEVICE_IMAGE_BASE}/unifi-access-point.webp`, // UniFi Access Point
  "demo-cameras": `${DEMO_DEVICE_IMAGE_BASE}/security-camera.webp`, // Security Cameras
};

/** @deprecated Use DEMO_DEVICE_IMAGE_BY_ID. Kept for landing preview imports. */
export const DEMO_DEVICE_IMAGE_PATHS = {
  samsungFrameTv: DEMO_DEVICE_IMAGE_BY_ID["demo-samsung-frame"],
  appleTv4k: DEMO_DEVICE_IMAGE_BY_ID["demo-appletv"],
  sonosBeam: DEMO_DEVICE_IMAGE_BY_ID["demo-sonos"],
  nintendoSwitchOled: DEMO_DEVICE_IMAGE_BY_ID["demo-switch"],
  playstation5: DEMO_DEVICE_IMAGE_BY_ID["demo-ps5"],
  xboxSeriesX: DEMO_DEVICE_IMAGE_BY_ID["demo-xbox"],
  macbookPro: DEMO_DEVICE_IMAGE_BY_ID["demo-macbook"],
  studioDisplay: DEMO_DEVICE_IMAGE_BY_ID["demo-studio-display"],
  canonPrinter: DEMO_DEVICE_IMAGE_BY_ID["demo-canon-printer"],
  unifiDreamRouter: DEMO_DEVICE_IMAGE_BY_ID["demo-unifi-router"],
  synologyNas: DEMO_DEVICE_IMAGE_BY_ID["demo-synology"],
  iphone16Pro: DEMO_DEVICE_IMAGE_BY_ID["demo-iphone"],
  samsungRefrigerator: DEMO_DEVICE_IMAGE_BY_ID["demo-samsung-fridge"],
  echoShow: DEMO_DEVICE_IMAGE_BY_ID["demo-echo-show"],
  lgWasher: DEMO_DEVICE_IMAGE_BY_ID["demo-lg-washer"],
  lgDryer: DEMO_DEVICE_IMAGE_BY_ID["demo-lg-dryer"],
  robotVacuumDock: DEMO_DEVICE_IMAGE_BY_ID["demo-robot-vacuum"],
  airPurifier: DEMO_DEVICE_IMAGE_BY_ID["demo-air-purifier"],
  ringDoorbell: DEMO_DEVICE_IMAGE_BY_ID["demo-ring"],
  yaleSmartLock: DEMO_DEVICE_IMAGE_BY_ID["demo-smart-lock"],
  nestThermostat: DEMO_DEVICE_IMAGE_BY_ID["demo-nest"],
  securityCameras: DEMO_DEVICE_IMAGE_BY_ID["demo-cameras"],
  unifiAccessPoint: DEMO_DEVICE_IMAGE_BY_ID["demo-unifi-ap"],
  lgOledTv: DEMO_DEVICE_IMAGE_BY_ID["demo-lg-oled"],
} as const;

export function isDemoDeviceAssetPath(
  src?: string | null
): boolean {
  if (!src?.trim()) {
    return false;
  }

  const normalized = src.trim();

  return (
    normalized.startsWith(`${DEMO_DEVICE_IMAGE_BASE}/`) ||
    normalized.startsWith("/demo-devices/")
  );
}

export function getDemoImagePathForDeviceId(
  deviceId?: string | null
): string | null {
  if (!deviceId?.trim()) {
    return null;
  }

  return DEMO_DEVICE_IMAGE_BY_ID[deviceId.trim()] ?? null;
}

export function getDemoImagePathForDevice(device: {
  id?: string;
  demo_image?: string | null;
}): string | null {
  if (device.demo_image?.trim()) {
    return device.demo_image.trim();
  }

  return getDemoImagePathForDeviceId(device.id);
}
