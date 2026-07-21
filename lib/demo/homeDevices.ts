import {
  demoDevices,
  demoDocuments,
} from "@/lib/demoData";

export type DemoHomeDevice = {
  id: string;
  deviceName: string;
  brand: string;
  category: string;
  location: string;
  purchasePrice: number;
  warrantyDate: string;
  hasPhoto: boolean;
  hasDocument: boolean;
};

const documentDeviceIds = new Set(
  demoDocuments
    .map((document) => document.device_id)
    .filter(Boolean)
);

export function getDemoHomeDevices(): DemoHomeDevice[] {
  return demoDevices.map((device) => ({
    id: device.id,
    deviceName: device.device_name,
    brand: device.brand,
    category: device.category,
    location: device.location,
    purchasePrice: device.purchase_price,
    warrantyDate: device.warranty_date,
    hasPhoto: Boolean(device.demo_image?.trim()),
    hasDocument: documentDeviceIds.has(device.id),
  }));
}
