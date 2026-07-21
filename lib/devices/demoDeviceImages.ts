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
  "demo-tv":
    DEMO_DEVICE_IMAGE_PATHS.samsungTv,
  "demo-printer":
    DEMO_DEVICE_IMAGE_PATHS.hpPrinter,
  "demo-xbox":
    DEMO_DEVICE_IMAGE_PATHS.xboxSeriesX,
  "demo-iphone":
    DEMO_DEVICE_IMAGE_PATHS.mobilePhone,
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

  if (normalized.includes("printer")) {
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
