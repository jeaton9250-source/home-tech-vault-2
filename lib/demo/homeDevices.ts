import {
  demoDevices,
  demoDocuments,
} from "@/lib/demoData";
import { MORGAN_ROOMS } from "@/lib/demo/morganRooms";

export type DemoHomeDevice = {
  id: string;
  deviceName: string;
  brand: string;
  category: string;
  location: string;
  purchasePrice: number;
  warrantyDate: string;
  demoImage: string;
  hasPhoto: boolean;
  hasDocument: boolean;
};

const documentDeviceIds = new Set(
  demoDocuments
    .map((document) => document.device_id)
    .filter(Boolean)
);

const deviceById = new Map(
  demoDevices.map((device) => [device.id, device])
);

export function getDemoHomeDevices(): DemoHomeDevice[] {
  const ordered: DemoHomeDevice[] = [];

  for (const room of MORGAN_ROOMS) {
    for (const deviceId of room.deviceIds) {
      const device = deviceById.get(deviceId);

      if (!device) {
        continue;
      }

      ordered.push({
        id: device.id,
        deviceName: device.device_name,
        brand: device.brand,
        category: device.category,
        location: device.location,
        purchasePrice: device.purchase_price,
        warrantyDate: device.warranty_date,
        demoImage: device.demo_image,
        hasPhoto: Boolean(device.demo_image?.trim()),
        hasDocument: documentDeviceIds.has(device.id),
      });
    }
  }

  return ordered;
}

export { MORGAN_ROOMS };
