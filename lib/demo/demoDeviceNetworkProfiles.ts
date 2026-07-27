import {
  demoTimestampDaysAgo,
  demoTimestampMinutesAgo,
} from "@/lib/demo/demoNetworkTime";

export const DEMO_CONNECTOR_ID = "demo-smart-connector";
export const DEMO_CONNECTOR_NAME = "Morgan Home Mac";
export const DEMO_DISCOVERY_SOURCE = "ARP + mDNS";

export type DemoDeviceNetworkProfile = {
  online: boolean;
  lastSeenMinutesAgo: number;
  ipAddress: string;
  macAddress: string;
  hostname: string;
  manufacturer: string;
  discoverySource: string;
  firstSeenDaysAgo: number;
  networkUpdatedMinutesAgo: number;
};

const DEMO_DEVICE_NETWORK: Record<string, DemoDeviceNetworkProfile> = {
  "demo-lg-washer": {
    online: true,
    lastSeenMinutesAgo: 3,
    ipAddress: "192.168.1.42",
    macAddress: "AA:BB:CC:42:01:02",
    hostname: "lg-washer.local",
    manufacturer: "LG Electronics",
    discoverySource: DEMO_DISCOVERY_SOURCE,
    firstSeenDaysAgo: 48,
    networkUpdatedMinutesAgo: 3,
  },
  "demo-lg-dryer": {
    online: true,
    lastSeenMinutesAgo: 5,
    ipAddress: "192.168.1.43",
    macAddress: "AA:BB:CC:43:01:02",
    hostname: "lg-dryer.local",
    manufacturer: "LG Electronics",
    discoverySource: DEMO_DISCOVERY_SOURCE,
    firstSeenDaysAgo: 48,
    networkUpdatedMinutesAgo: 5,
  },
  "demo-nest": {
    online: true,
    lastSeenMinutesAgo: 2,
    ipAddress: "192.168.1.50",
    macAddress: "AA:BB:CC:50:01:02",
    hostname: "nest-hallway.local",
    manufacturer: "Google Nest",
    discoverySource: DEMO_DISCOVERY_SOURCE,
    firstSeenDaysAgo: 120,
    networkUpdatedMinutesAgo: 2,
  },
  "demo-switch": {
    online: true,
    lastSeenMinutesAgo: 8,
    ipAddress: "192.168.1.42",
    macAddress: "AA:BB:CC:42:02:01",
    hostname: "nintendo-switch.local",
    manufacturer: "Nintendo",
    discoverySource: DEMO_DISCOVERY_SOURCE,
    firstSeenDaysAgo: 90,
    networkUpdatedMinutesAgo: 8,
  },
  "demo-robot-vacuum": {
    online: true,
    lastSeenMinutesAgo: 6,
    ipAddress: "192.168.1.53",
    macAddress: "AA:BB:CC:53:01:02",
    hostname: "roborock-dock.local",
    manufacturer: "Roborock",
    discoverySource: DEMO_DISCOVERY_SOURCE,
    firstSeenDaysAgo: 60,
    networkUpdatedMinutesAgo: 6,
  },
  "demo-samsung-frame": {
    online: true,
    lastSeenMinutesAgo: 4,
    ipAddress: "192.168.1.25",
    macAddress: "AA:BB:CC:25:01:02",
    hostname: "samsung-frame.local",
    manufacturer: "Samsung Electronics",
    discoverySource: DEMO_DISCOVERY_SOURCE,
    firstSeenDaysAgo: 75,
    networkUpdatedMinutesAgo: 4,
  },
  "demo-macbook": {
    online: true,
    lastSeenMinutesAgo: 1,
    ipAddress: "192.168.1.14",
    macAddress: "AA:BB:CC:14:01:02",
    hostname: "alex-macbook.local",
    manufacturer: "Apple",
    discoverySource: DEMO_DISCOVERY_SOURCE,
    firstSeenDaysAgo: 200,
    networkUpdatedMinutesAgo: 1,
  },
  "demo-canon-printer": {
    online: false,
    lastSeenMinutesAgo: 18,
    ipAddress: "192.168.1.31",
    macAddress: "AA:BB:CC:31:01:02",
    hostname: "epson-printer.local",
    manufacturer: "Epson",
    discoverySource: DEMO_DISCOVERY_SOURCE,
    firstSeenDaysAgo: 140,
    networkUpdatedMinutesAgo: 18,
  },
  "demo-unifi-router": {
    online: true,
    lastSeenMinutesAgo: 1,
    ipAddress: "192.168.1.1",
    macAddress: "AA:BB:CC:01:01:02",
    hostname: "unifi-dream-router.local",
    manufacturer: "Ubiquiti",
    discoverySource: DEMO_DISCOVERY_SOURCE,
    firstSeenDaysAgo: 365,
    networkUpdatedMinutesAgo: 1,
  },
  "demo-lg-oled": {
    online: true,
    lastSeenMinutesAgo: 12,
    ipAddress: "192.168.1.27",
    macAddress: "AA:BB:CC:27:01:02",
    hostname: "lg-bedroom-tv.local",
    manufacturer: "LG Electronics",
    discoverySource: DEMO_DISCOVERY_SOURCE,
    firstSeenDaysAgo: 55,
    networkUpdatedMinutesAgo: 12,
  },
  "demo-sonos": {
    online: true,
    lastSeenMinutesAgo: 7,
    ipAddress: "192.168.1.28",
    macAddress: "AA:BB:CC:28:01:02",
    hostname: "sonos-beam.local",
    manufacturer: "Sonos",
    discoverySource: DEMO_DISCOVERY_SOURCE,
    firstSeenDaysAgo: 80,
    networkUpdatedMinutesAgo: 7,
  },
  "demo-appletv": {
    online: true,
    lastSeenMinutesAgo: 9,
    ipAddress: "192.168.1.26",
    macAddress: "AA:BB:CC:26:01:02",
    hostname: "apple-tv.local",
    manufacturer: "Apple",
    discoverySource: DEMO_DISCOVERY_SOURCE,
    firstSeenDaysAgo: 70,
    networkUpdatedMinutesAgo: 9,
  },
};

export function getDemoDeviceNetworkProfile(
  deviceId: string
): DemoDeviceNetworkProfile | null {
  return DEMO_DEVICE_NETWORK[deviceId] ?? null;
}

export function applyDemoDeviceNetworkFields<
  T extends {
    id: string;
    online?: boolean;
    last_seen_at?: string | null;
    ip_address?: string | null;
    mac_address?: string | null;
    manufacturer?: string | null;
    discovery_source?: string | null;
    hostname?: string | null;
    connector_id?: string | null;
    first_seen_at?: string | null;
    network_updated_at?: string | null;
  },
>(device: T): T {
  const profile = getDemoDeviceNetworkProfile(device.id);

  if (!profile) {
    return device;
  }

  return {
    ...device,
    online: profile.online,
    last_seen_at: demoTimestampMinutesAgo(profile.lastSeenMinutesAgo),
    ip_address: profile.ipAddress,
    mac_address: profile.macAddress,
    hostname: profile.hostname,
    manufacturer: profile.manufacturer,
    discovery_source: profile.discoverySource,
    connector_id: DEMO_CONNECTOR_ID,
    first_seen_at: demoTimestampDaysAgo(profile.firstSeenDaysAgo),
    network_updated_at: demoTimestampMinutesAgo(
      profile.networkUpdatedMinutesAgo
    ),
  };
}
