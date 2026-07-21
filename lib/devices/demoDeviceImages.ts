export const DEMO_DEVICE_IMAGE_PATHS = {
  macbookPro: "/demo-devices/macbook-pro.png",
  samsungTv: "/demo-devices/samsung-tv.png",
  asusRouter: "/demo-devices/asus-router.png",
  hpPrinter: "/demo-devices/hp-printer.png",
  xboxSeriesX: "/demo-devices/xbox-series-x.png",
  mobilePhone: "/demo-devices/mobile-phone.png",
  ringDoorbell: "/demo-devices/ring-doorbell.png",
  appleTv: "/demo-devices/apple-tv.png",
  synologyNas: "/demo-devices/synology-nas.png",
} as const;

export const DEMO_DEVICE_IMAGE_BY_ID: Record<
  string,
  string
> = {
  "demo-macbook":
    DEMO_DEVICE_IMAGE_PATHS.macbookPro,
  "demo-iphone":
    DEMO_DEVICE_IMAGE_PATHS.mobilePhone,
  "demo-samsung-frame":
    DEMO_DEVICE_IMAGE_PATHS.samsungTv,
  "demo-lg-oled":
    DEMO_DEVICE_IMAGE_PATHS.samsungTv,
  "demo-ps5":
    DEMO_DEVICE_IMAGE_PATHS.xboxSeriesX,
  "demo-xbox":
    DEMO_DEVICE_IMAGE_PATHS.xboxSeriesX,
  "demo-switch":
    DEMO_DEVICE_IMAGE_PATHS.xboxSeriesX,
  "demo-appletv":
    DEMO_DEVICE_IMAGE_PATHS.appleTv,
  "demo-sonos":
    DEMO_DEVICE_IMAGE_PATHS.ringDoorbell,
  "demo-nest":
    DEMO_DEVICE_IMAGE_PATHS.ringDoorbell,
  "demo-ring":
    DEMO_DEVICE_IMAGE_PATHS.ringDoorbell,
  "demo-canon-printer":
    DEMO_DEVICE_IMAGE_PATHS.hpPrinter,
  "demo-hp-laptop":
    DEMO_DEVICE_IMAGE_PATHS.macbookPro,
  "demo-dyson":
    DEMO_DEVICE_IMAGE_PATHS.hpPrinter,
  "demo-lg-washer":
    DEMO_DEVICE_IMAGE_PATHS.hpPrinter,
  "demo-lg-dryer":
    DEMO_DEVICE_IMAGE_PATHS.hpPrinter,
  "demo-samsung-fridge":
    DEMO_DEVICE_IMAGE_PATHS.samsungTv,
  "demo-unifi-router":
    DEMO_DEVICE_IMAGE_PATHS.asusRouter,
  "demo-unifi-ap":
    DEMO_DEVICE_IMAGE_PATHS.asusRouter,
  "demo-synology":
    DEMO_DEVICE_IMAGE_PATHS.synologyNas,
  "demo-cameras":
    DEMO_DEVICE_IMAGE_PATHS.ringDoorbell,
  "demo-robot-vacuum":
    DEMO_DEVICE_IMAGE_PATHS.ringDoorbell,
  "demo-smart-lock":
    DEMO_DEVICE_IMAGE_PATHS.ringDoorbell,
  // Legacy IDs
  "demo-tv":
    DEMO_DEVICE_IMAGE_PATHS.samsungTv,
  "demo-printer":
    DEMO_DEVICE_IMAGE_PATHS.hpPrinter,
  "demo-router":
    DEMO_DEVICE_IMAGE_PATHS.asusRouter,
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
    normalized.includes("laptop") ||
    normalized.includes("monitor")
  ) {
    return DEMO_DEVICE_IMAGE_PATHS.macbookPro;
  }

  if (
    normalized.includes("television") ||
    normalized === "tv"
  ) {
    return DEMO_DEVICE_IMAGE_PATHS.samsungTv;
  }

  if (
    normalized.includes("router") ||
    normalized.includes("network")
  ) {
    return DEMO_DEVICE_IMAGE_PATHS.asusRouter;
  }

  if (
    normalized.includes("printer") ||
    normalized.includes("appliance")
  ) {
    return DEMO_DEVICE_IMAGE_PATHS.hpPrinter;
  }

  if (
    normalized.includes("game") ||
    normalized.includes("gaming") ||
    normalized.includes("console")
  ) {
    return DEMO_DEVICE_IMAGE_PATHS.xboxSeriesX;
  }

  if (
    normalized.includes("mobile") ||
    normalized.includes("phone") ||
    normalized.includes("tablet")
  ) {
    return DEMO_DEVICE_IMAGE_PATHS.mobilePhone;
  }

  if (
    normalized.includes("stream") ||
    normalized.includes("media")
  ) {
    return DEMO_DEVICE_IMAGE_PATHS.appleTv;
  }

  if (
    normalized.includes("camera") ||
    normalized.includes("security") ||
    normalized.includes("doorbell")
  ) {
    return DEMO_DEVICE_IMAGE_PATHS.ringDoorbell;
  }

  if (
    normalized.includes("storage") ||
    normalized.includes("nas")
  ) {
    return DEMO_DEVICE_IMAGE_PATHS.synologyNas;
  }

  if (
    normalized.includes("smart home") ||
    normalized.includes("audio") ||
    normalized.includes("speaker")
  ) {
    return DEMO_DEVICE_IMAGE_PATHS.ringDoorbell;
  }

  return null;
}

export function getDemoImagePathForDevice(
  device: {
    id?: string;
    demo_image?: string | null;
    category?: string | null;
  }
): string | null {
  if (device.demo_image?.trim()) {
    return device.demo_image.trim();
  }

  if (
    device.id &&
    DEMO_DEVICE_IMAGE_BY_ID[device.id]
  ) {
    return DEMO_DEVICE_IMAGE_BY_ID[
      device.id
    ];
  }

  return getDemoImagePathForCategory(
    device.category
  );
}
