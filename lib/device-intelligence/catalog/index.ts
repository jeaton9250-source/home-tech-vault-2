import { AMAZON_CATALOG } from "@/lib/device-intelligence/catalog/amazon";
import { APPLE_CATALOG } from "@/lib/device-intelligence/catalog/apple";
import { GOOGLE_CATALOG } from "@/lib/device-intelligence/catalog/google";
import { NETWORKING_CATALOG } from "@/lib/device-intelligence/catalog/networking";
import { SMART_HOME_CATALOG } from "@/lib/device-intelligence/catalog/smartHome";
import { TELEVISIONS_CATALOG } from "@/lib/device-intelligence/catalog/televisions";
import type { DeviceCatalogEntry } from "@/lib/device-intelligence/catalog/apple";

export type { DeviceCatalogEntry };

export const DEVICE_CATALOG: DeviceCatalogEntry[] = [
  ...APPLE_CATALOG,
  ...AMAZON_CATALOG,
  ...GOOGLE_CATALOG,
  ...TELEVISIONS_CATALOG,
  ...SMART_HOME_CATALOG,
  ...NETWORKING_CATALOG,
];

export function getCatalogEntry(
  id: string
): DeviceCatalogEntry | undefined {
  return DEVICE_CATALOG.find((entry) => entry.id === id);
}
