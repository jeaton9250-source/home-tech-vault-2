/** Device-specific demo product images — one path per device ID. */
export const DEMO_DEVICE_IMAGE_PATHS = {
  samsungFrameTv: "/demo-devices/samsung-frame-tv.png",
  appleTv4k: "/demo-devices/apple-tv-4k.png",
  sonosBeam: "/demo-devices/sonos-beam.png",
  nintendoSwitchOled: "/demo-devices/nintendo-switch-oled.png",
  playstation5: "/demo-devices/playstation-5.png",
  xboxSeriesX: "/demo-devices/xbox-series-x.png",
  macbookPro: "/demo-devices/macbook-pro.png",
  studioDisplay: "/demo-devices/studio-display.png",
  canonPrinter: "/demo-devices/canon-printer.png",
  unifiDreamRouter: "/demo-devices/unifi-dream-router.png",
  synologyNas: "/demo-devices/synology-nas.png",
  iphone16Pro: "/demo-devices/iphone-16-pro.png",
  samsungRefrigerator: "/demo-devices/samsung-refrigerator.png",
  echoShow: "/demo-devices/echo-show.png",
  lgWasher: "/demo-devices/lg-washer.png",
  lgDryer: "/demo-devices/lg-dryer.png",
  robotVacuumDock: "/demo-devices/robot-vacuum-dock.png",
  airPurifier: "/demo-devices/air-purifier.png",
  ringDoorbell: "/demo-devices/ring-doorbell.png",
  yaleSmartLock: "/demo-devices/yale-smart-lock.png",
  nestThermostat: "/demo-devices/nest-thermostat.png",
  securityCameras: "/demo-devices/security-cameras.png",
  unifiAccessPoint: "/demo-devices/unifi-access-point.png",
  lgOledTv: "/demo-devices/lg-oled-tv.png",
} as const;

export const DEMO_DEVICE_IMAGE_BY_ID: Record<string, string> = {
  "demo-samsung-frame": DEMO_DEVICE_IMAGE_PATHS.samsungFrameTv,
  "demo-appletv": DEMO_DEVICE_IMAGE_PATHS.appleTv4k,
  "demo-sonos": DEMO_DEVICE_IMAGE_PATHS.sonosBeam,
  "demo-switch": DEMO_DEVICE_IMAGE_PATHS.nintendoSwitchOled,
  "demo-ps5": DEMO_DEVICE_IMAGE_PATHS.playstation5,
  "demo-xbox": DEMO_DEVICE_IMAGE_PATHS.xboxSeriesX,
  "demo-macbook": DEMO_DEVICE_IMAGE_PATHS.macbookPro,
  "demo-studio-display": DEMO_DEVICE_IMAGE_PATHS.studioDisplay,
  "demo-canon-printer": DEMO_DEVICE_IMAGE_PATHS.canonPrinter,
  "demo-unifi-router": DEMO_DEVICE_IMAGE_PATHS.unifiDreamRouter,
  "demo-synology": DEMO_DEVICE_IMAGE_PATHS.synologyNas,
  "demo-iphone": DEMO_DEVICE_IMAGE_PATHS.iphone16Pro,
  "demo-samsung-fridge": DEMO_DEVICE_IMAGE_PATHS.samsungRefrigerator,
  "demo-echo-show": DEMO_DEVICE_IMAGE_PATHS.echoShow,
  "demo-lg-washer": DEMO_DEVICE_IMAGE_PATHS.lgWasher,
  "demo-lg-dryer": DEMO_DEVICE_IMAGE_PATHS.lgDryer,
  "demo-robot-vacuum": DEMO_DEVICE_IMAGE_PATHS.robotVacuumDock,
  "demo-air-purifier": DEMO_DEVICE_IMAGE_PATHS.airPurifier,
  "demo-ring": DEMO_DEVICE_IMAGE_PATHS.ringDoorbell,
  "demo-smart-lock": DEMO_DEVICE_IMAGE_PATHS.yaleSmartLock,
  "demo-nest": DEMO_DEVICE_IMAGE_PATHS.nestThermostat,
  "demo-cameras": DEMO_DEVICE_IMAGE_PATHS.securityCameras,
  "demo-unifi-ap": DEMO_DEVICE_IMAGE_PATHS.unifiAccessPoint,
  "demo-lg-oled": DEMO_DEVICE_IMAGE_PATHS.lgOledTv,
};

export function getDemoImagePathForCategory(
  category?: string | null
): string | null {
  const normalized =
    category?.trim().toLowerCase() ?? "";

  if (!normalized) {
    return null;
  }

  if (
    normalized.includes("computer") ||
    normalized.includes("laptop")
  ) {
    return DEMO_DEVICE_IMAGE_PATHS.macbookPro;
  }

  if (normalized.includes("monitor")) {
    return DEMO_DEVICE_IMAGE_PATHS.studioDisplay;
  }

  if (
    normalized === "tv" ||
    normalized.includes("television")
  ) {
    return DEMO_DEVICE_IMAGE_PATHS.samsungFrameTv;
  }

  if (normalized.includes("printer")) {
    return DEMO_DEVICE_IMAGE_PATHS.canonPrinter;
  }

  if (normalized.includes("game")) {
    return DEMO_DEVICE_IMAGE_PATHS.playstation5;
  }

  if (normalized.includes("mobile") || normalized.includes("phone")) {
    return DEMO_DEVICE_IMAGE_PATHS.iphone16Pro;
  }

  if (normalized.includes("stream")) {
    return DEMO_DEVICE_IMAGE_PATHS.appleTv4k;
  }

  if (normalized.includes("security") || normalized.includes("camera")) {
    return DEMO_DEVICE_IMAGE_PATHS.securityCameras;
  }

  if (normalized.includes("network") || normalized.includes("router")) {
    return DEMO_DEVICE_IMAGE_PATHS.unifiDreamRouter;
  }

  if (normalized.includes("storage") || normalized.includes("nas")) {
    return DEMO_DEVICE_IMAGE_PATHS.synologyNas;
  }

  return null;
}

export function getDemoImagePathForDevice(device: {
  id?: string;
  demo_image?: string | null;
  category?: string | null;
}): string | null {
  if (device.demo_image?.trim()) {
    return device.demo_image.trim();
  }

  if (device.id && DEMO_DEVICE_IMAGE_BY_ID[device.id]) {
    return DEMO_DEVICE_IMAGE_BY_ID[device.id];
  }

  return getDemoImagePathForCategory(device.category);
}
