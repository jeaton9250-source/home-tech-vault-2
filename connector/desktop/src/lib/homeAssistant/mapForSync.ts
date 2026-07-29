import type {
  GroupedHomeAssistantDevice,
} from "./types";

export type HomeAssistantSyncDevice = {
  localFingerprint: string;

  ipAddress: null;
  macAddress: null;
  hostname: null;

  manufacturer: string | null;
  model: string | null;

  friendlyName: string;
  deviceType: string | null;

  discoverySource: string;
  discoverySources: string[];

  mdnsServices: string[];

  ssdpDeviceType: null;
  ssdpDescriptionUrl: null;

  firstSeenAt: string;
  lastSeenAt: string;

  online: boolean;
};

export function mapHomeAssistantDevicesForSync(
  devices:
    GroupedHomeAssistantDevice[],
  scannedAt: string
): HomeAssistantSyncDevice[] {
  return devices.map((device) => ({
    localFingerprint:
      device.localFingerprint,

    ipAddress: null,
    macAddress: null,
    hostname: null,

    manufacturer:
      device.manufacturer,

    model:
      device.model,

    friendlyName:
      device.name,

    deviceType:
      device.deviceType,

    discoverySource:
      "Home Assistant",

    discoverySources: [
      "Home Assistant",
      ...device.domains.map(
        (domain) =>
          `Home Assistant: ${domain}`
      ),
    ],

    mdnsServices: [],

    ssdpDeviceType: null,
    ssdpDescriptionUrl: null,

    firstSeenAt:
      scannedAt,

    lastSeenAt:
      scannedAt,

    online:
      device.available,
  }));
}