/** Demo device image registry — single source of truth for Morgan Household assets. */
export const DEMO_DEVICE_IMAGE_BASE = "/demo/devices";

/** Device ID → local webp asset under /public/demo/devices/ */
export const DEMO_DEVICE_IMAGE_BY_ID: Record<string, string> = {
  "demo-samsung-frame": `${DEMO_DEVICE_IMAGE_BASE}/samsung-frame-tv.webp`,
  "demo-appletv": `${DEMO_DEVICE_IMAGE_BASE}/apple-tv-4k.webp`,
  "demo-sonos": `${DEMO_DEVICE_IMAGE_BASE}/sonos-beam.webp`,
  "demo-switch": `${DEMO_DEVICE_IMAGE_BASE}/nintendo-switch-oled.webp`,
  "demo-ps5": `${DEMO_DEVICE_IMAGE_BASE}/playstation-5.webp`,
  "demo-xbox": `${DEMO_DEVICE_IMAGE_BASE}/xbox-series-x.webp`,
  "demo-macbook": `${DEMO_DEVICE_IMAGE_BASE}/macbook-pro.webp`,
  "demo-studio-display": `${DEMO_DEVICE_IMAGE_BASE}/studio-display.webp`,
  "demo-canon-printer": `${DEMO_DEVICE_IMAGE_BASE}/canon-printer.webp`,
  "demo-unifi-router": `${DEMO_DEVICE_IMAGE_BASE}/unifi-dream-router.webp`,
  "demo-synology": `${DEMO_DEVICE_IMAGE_BASE}/synology-nas.webp`,
  "demo-iphone": `${DEMO_DEVICE_IMAGE_BASE}/iphone.webp`,
  "demo-samsung-fridge": `${DEMO_DEVICE_IMAGE_BASE}/samsung-refrigerator.webp`,
  "demo-echo-show": `${DEMO_DEVICE_IMAGE_BASE}/echo-show.webp`,
  "demo-lg-washer": `${DEMO_DEVICE_IMAGE_BASE}/lg-washer.webp`,
  "demo-lg-dryer": `${DEMO_DEVICE_IMAGE_BASE}/lg-dryer.webp`,
  "demo-robot-vacuum": `${DEMO_DEVICE_IMAGE_BASE}/robot-vacuum.webp`,
  "demo-air-purifier": `${DEMO_DEVICE_IMAGE_BASE}/air-purifier.webp`,
  "demo-lg-oled": `${DEMO_DEVICE_IMAGE_BASE}/lg-oled-tv.webp`,
  "demo-ring": `${DEMO_DEVICE_IMAGE_BASE}/ring-doorbell.webp`,
  "demo-smart-lock": `${DEMO_DEVICE_IMAGE_BASE}/yale-smart-lock.webp`,
  "demo-nest": `${DEMO_DEVICE_IMAGE_BASE}/nest-thermostat.webp`,
  "demo-unifi-ap": `${DEMO_DEVICE_IMAGE_BASE}/unifi-access-point.webp`,
  "demo-cameras": `${DEMO_DEVICE_IMAGE_BASE}/security-camera.webp`,
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
