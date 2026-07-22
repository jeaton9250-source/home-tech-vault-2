import type { LucideIcon } from "lucide-react";
import {
  Camera,
  Gamepad2,
  HardDrive,
  Laptop,
  Printer,
  Router,
  Smartphone,
  Tv,
  Wifi,
} from "lucide-react";

import {
  getDemoImagePathForDevice,
  isDemoDeviceAssetPath,
} from "@/lib/devices/demoDeviceImages";

export type DeviceImageInput = {
  id?: string;
  device_name?: string | null;
  brand?: string | null;
  category?: string | null;
  photo_url?: string | null;
  demo_image?: string | null;
};

export type ResolvedDeviceImage = {
  src: string | null;
  alt: string;
  isDemoAsset: boolean;
  useCategoryFallback: boolean;
};

export function isDemoDeviceId(
  id?: string | null
): boolean {
  if (!id) {
    return false;
  }

  return (
    id.startsWith("demo-") ||
    id.startsWith("demo")
  );
}

export function buildDeviceImageAlt(
  device: DeviceImageInput,
  isDemoAsset = false
): string {
  const brand = device.brand?.trim();
  const name =
    device.device_name?.trim() ||
    "Device";

  if (isDemoAsset) {
    return brand
      ? `${brand} ${name} demo device`
      : `${name} demo device`;
  }

  return name;
}

export function resolveDeviceImage(
  device: DeviceImageInput
): ResolvedDeviceImage {
  const uploadedPhoto =
    device.photo_url?.trim();

  if (uploadedPhoto) {
    const isDemoAsset =
      isDemoDeviceAssetPath(uploadedPhoto);

    return {
      src: uploadedPhoto,
      alt: buildDeviceImageAlt(
        device,
        isDemoAsset
      ),
      isDemoAsset,
      useCategoryFallback: false,
    };
  }

  const isDemo =
    isDemoDeviceId(device.id) ||
    Boolean(device.demo_image?.trim());

  if (isDemo) {
    const demoSrc =
      getDemoImagePathForDevice(device);

    if (demoSrc) {
      return {
        src: demoSrc,
        alt: buildDeviceImageAlt(
          device,
          true
        ),
        isDemoAsset: true,
        useCategoryFallback: false,
      };
    }
  }

  return {
    src: null,
    alt: buildDeviceImageAlt(device),
    isDemoAsset: false,
    useCategoryFallback: true,
  };
}

export function getCategoryFallbackIcon(
  category?: string | null
): LucideIcon {
  const normalized =
    category?.trim().toLowerCase() ?? "";

  if (
    normalized.includes("computer") ||
    normalized.includes("laptop") ||
    normalized.includes("monitor")
  ) {
    return Laptop;
  }

  if (
    normalized.includes("television") ||
    normalized === "tv"
  ) {
    return Tv;
  }

  if (
    normalized.includes("router") ||
    normalized.includes("network")
  ) {
    return Router;
  }

  if (normalized.includes("printer")) {
    return Printer;
  }

  if (
    normalized.includes("game") ||
    normalized.includes("gaming") ||
    normalized.includes("console")
  ) {
    return Gamepad2;
  }

  if (
    normalized.includes("mobile") ||
    normalized.includes("phone") ||
    normalized.includes("tablet")
  ) {
    return Smartphone;
  }

  if (
    normalized.includes("camera") ||
    normalized.includes("security") ||
    normalized.includes("doorbell")
  ) {
    return Camera;
  }

  if (
    normalized.includes("storage") ||
    normalized.includes("nas")
  ) {
    return HardDrive;
  }

  if (
    normalized.includes("stream") ||
    normalized.includes("wifi") ||
    normalized.includes("smart home")
  ) {
    return Wifi;
  }

  return Laptop;
}

export function withDemoDevicePhoto<
  T extends DeviceImageInput,
>(device: T): T & { photo_url: string } {
  const resolved =
    resolveDeviceImage(device);

  return {
    ...device,
    photo_url: resolved.src ?? "",
  };
}
