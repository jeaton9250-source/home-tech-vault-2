import {
  demoDevices as sourceDemoDevices,
  type DemoDevice,
} from "@/lib/demoData";
import { withDemoDevicePhoto } from "@/lib/devices/getDeviceImage";

export type { DemoDevice };

export const demoDevices = sourceDemoDevices;

export const demoDevicesWithPhotos =
  sourceDemoDevices.map((device) =>
    withDemoDevicePhoto(device)
  );
