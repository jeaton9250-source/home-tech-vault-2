import type {
  DiscoveredDeviceSummary,
  DiscoveryStatsSummary,
} from "@/lib/connector/discoveryTypes";
import type { ConnectorInstallationSummary } from "@/lib/connector/types";

import {
  DEMO_CONNECTOR_ID,
  DEMO_CONNECTOR_NAME,
  DEMO_DISCOVERY_SOURCE,
  getDemoDeviceNetworkProfile,
} from "@/lib/demo/demoDeviceNetworkProfiles";
import { morganDevices } from "@/lib/demo/morganDevices";
import {
  DEMO_NETWORK_ANCHOR,
  demoTimestampDaysAgo,
  demoTimestampMinutesAgo,
} from "@/lib/demo/demoNetworkTime";

export {
  applyDemoDeviceNetworkFields,
  DEMO_CONNECTOR_ID,
  DEMO_CONNECTOR_NAME,
  DEMO_DISCOVERY_SOURCE,
  getDemoDeviceNetworkProfile,
} from "@/lib/demo/demoDeviceNetworkProfiles";

export const DEMO_CONNECTOR_PLATFORM = "macos";
export const DEMO_CONNECTOR_VERSION = "0.1.0 Demo";

export function buildDemoConnectorInstallation(): ConnectorInstallationSummary {
  return {
    id: DEMO_CONNECTOR_ID,
    householdId: "demo-household",
    name: DEMO_CONNECTOR_NAME,
    platform: DEMO_CONNECTOR_PLATFORM,
    appVersion: DEMO_CONNECTOR_VERSION,
    status: "active",
    lastSeenAt: demoTimestampMinutesAgo(2),
    lastScanAt: demoTimestampMinutesAgo(4),
    revokedAt: null,
    createdAt: demoTimestampDaysAgo(30),
    updatedAt: demoTimestampMinutesAgo(2),
  };
}

function vaultDeviceById(deviceId: string) {
  return morganDevices.find((device) => device.id === deviceId) ?? null;
}

function matchedSummary(
  deviceId: string,
  overrides?: Partial<DiscoveredDeviceSummary>
): DiscoveredDeviceSummary {
  const vault = vaultDeviceById(deviceId);
  const profile = getDemoDeviceNetworkProfile(deviceId);

  if (!vault || !profile) {
    throw new Error(`Missing demo discovery profile for ${deviceId}`);
  }

  return {
    id: `demo-discovered-${deviceId}`,
    connectorId: DEMO_CONNECTOR_ID,
    localFingerprint: `demo:mac:${profile.macAddress.toLowerCase()}`,
    hostname: profile.hostname,
    manufacturer: profile.manufacturer,
    model: vault.model_number,
    serialNumber: vault.serial_number,
    ipAddress: profile.ipAddress,
    macAddress: profile.macAddress,
    deviceType: vault.category,
    online: profile.online,
    discoverySources: [profile.discoverySource],
    firstSeenAt: demoTimestampDaysAgo(profile.firstSeenDaysAgo),
    lastSeenAt: demoTimestampMinutesAgo(profile.lastSeenMinutesAgo),
    importedDeviceId: deviceId,
    matchConfirmedAt: demoTimestampDaysAgo(Math.max(profile.firstSeenDaysAgo - 1, 1)),
    ignoredAt: null,
    matchStatus: "matched",
    matchConfidence: "exact",
    matchReason: "Confirmed match to an existing vault device.",
    matchedDeviceId: deviceId,
    matchedDevice: {
      id: deviceId,
      deviceName: vault.device_name,
      category: vault.category,
      manufacturer: profile.manufacturer,
      modelNumber: vault.model_number,
      location: vault.location,
    },
    ...overrides,
  };
}

const MATCHED_DEVICE_IDS = [
  "demo-lg-washer",
  "demo-lg-dryer",
  "demo-nest",
  "demo-switch",
  "demo-robot-vacuum",
  "demo-samsung-frame",
  "demo-macbook",
  "demo-canon-printer",
  "demo-unifi-router",
  "demo-lg-oled",
  "demo-sonos",
  "demo-appletv",
] as const;

export function buildDemoDiscoveredDevices(): DiscoveredDeviceSummary[] {
  const matched = MATCHED_DEVICE_IDS.map((deviceId) =>
    matchedSummary(deviceId)
  );

  const needsReview: DiscoveredDeviceSummary[] = [
    {
      id: "demo-discovered-echo-show-review",
      connectorId: DEMO_CONNECTOR_ID,
      localFingerprint: "demo:mac:aa:bb:cc:55:01:02",
      hostname: "echo-show-kitchen.local",
      manufacturer: "Amazon",
      model: 'Echo Show 15"',
      serialNumber: null,
      ipAddress: "192.168.1.55",
      macAddress: "AA:BB:CC:55:01:02",
      deviceType: "Smart Home",
      online: true,
      discoverySources: [DEMO_DISCOVERY_SOURCE],
      firstSeenAt: demoTimestampDaysAgo(3),
      lastSeenAt: demoTimestampMinutesAgo(14),
      importedDeviceId: null,
      matchConfirmedAt: null,
      ignoredAt: null,
      matchStatus: "possible_match",
      matchConfidence: "high",
      matchReason:
        "Manufacturer and hostname resemble Echo Show in the kitchen.",
      matchedDeviceId: "demo-echo-show",
      candidateDeviceIds: ["demo-echo-show"],
      matchedDevice: {
        id: "demo-echo-show",
        deviceName: "Echo Show",
        category: "Smart Home",
        manufacturer: "Amazon",
        modelNumber: '15"',
        location: "Kitchen",
      },
    },
    {
      id: "demo-discovered-hue-bridge-review",
      connectorId: DEMO_CONNECTOR_ID,
      localFingerprint: "demo:mac:aa:bb:cc:58:01:02",
      hostname: "philips-hue.local",
      manufacturer: "Signify",
      model: "Hue Bridge",
      serialNumber: null,
      ipAddress: "192.168.1.58",
      macAddress: "AA:BB:CC:58:01:02",
      deviceType: "Smart Home",
      online: true,
      discoverySources: [DEMO_DISCOVERY_SOURCE],
      firstSeenAt: demoTimestampDaysAgo(2),
      lastSeenAt: demoTimestampMinutesAgo(20),
      importedDeviceId: null,
      matchConfirmedAt: null,
      ignoredAt: null,
      matchStatus: "possible_match",
      matchConfidence: "medium",
      matchReason: "New smart-home hub detected on the network.",
      matchedDeviceId: null,
      candidateDeviceIds: [],
      matchedDevice: null,
    },
  ];

  const newDevices: DiscoveredDeviceSummary[] = [
    {
      id: "demo-discovered-guest-ipad",
      connectorId: DEMO_CONNECTOR_ID,
      localFingerprint: "demo:mac:aa:bb:cc:61:01:02",
      hostname: "guest-ipad.local",
      manufacturer: "Apple",
      model: "iPad Air",
      serialNumber: null,
      ipAddress: "192.168.1.61",
      macAddress: "AA:BB:CC:61:01:02",
      deviceType: "Mobile",
      online: true,
      discoverySources: [DEMO_DISCOVERY_SOURCE],
      firstSeenAt: demoTimestampDaysAgo(1),
      lastSeenAt: demoTimestampMinutesAgo(11),
      importedDeviceId: null,
      matchConfirmedAt: null,
      ignoredAt: null,
      matchStatus: "new",
      matchConfidence: null,
      matchReason: null,
      matchedDeviceId: null,
      matchedDevice: null,
    },
    {
      id: "demo-discovered-roku-stick",
      connectorId: DEMO_CONNECTOR_ID,
      localFingerprint: "demo:mac:aa:bb:cc:62:01:02",
      hostname: "roku-bedroom.local",
      manufacturer: "Roku",
      model: "Streaming Stick 4K",
      serialNumber: null,
      ipAddress: "192.168.1.62",
      macAddress: "AA:BB:CC:62:01:02",
      deviceType: "Streaming",
      online: true,
      discoverySources: [DEMO_DISCOVERY_SOURCE],
      firstSeenAt: demoTimestampMinutesAgo(26 * 60),
      lastSeenAt: demoTimestampMinutesAgo(16),
      importedDeviceId: null,
      matchConfirmedAt: null,
      ignoredAt: null,
      matchStatus: "new",
      matchConfidence: null,
      matchReason: null,
      matchedDeviceId: null,
      matchedDevice: null,
    },
  ];

  const ignored: DiscoveredDeviceSummary[] = [
    {
      id: "demo-discovered-chromecast-ignored",
      connectorId: DEMO_CONNECTOR_ID,
      localFingerprint: "demo:mac:aa:bb:cc:63:01:02",
      hostname: "old-chromecast.local",
      manufacturer: "Google",
      model: "Chromecast (2nd Gen)",
      serialNumber: null,
      ipAddress: "192.168.1.63",
      macAddress: "AA:BB:CC:63:01:02",
      deviceType: "Streaming",
      online: false,
      discoverySources: [DEMO_DISCOVERY_SOURCE],
      firstSeenAt: demoTimestampDaysAgo(120),
      lastSeenAt: demoTimestampDaysAgo(14),
      importedDeviceId: null,
      matchConfirmedAt: null,
      ignoredAt: demoTimestampDaysAgo(10),
      matchStatus: "ignored",
      matchConfidence: null,
      matchReason: null,
      matchedDeviceId: null,
      matchedDevice: null,
    },
  ];

  return [...matched, ...needsReview, ...newDevices, ...ignored];
}

export function buildDemoDiscoveryStats(
  devices: DiscoveredDeviceSummary[]
): DiscoveryStatsSummary {
  const matchedDevices = devices.filter(
    (device) => device.matchStatus === "matched"
  ).length;
  const needsReview = devices.filter(
    (device) =>
      device.matchStatus === "new" ||
      device.matchStatus === "possible_match"
  ).length;
  const newDevices = devices.filter(
    (device) => device.matchStatus === "new"
  ).length;
  const ignoredDevices = devices.filter(
    (device) => device.matchStatus === "ignored"
  ).length;
  const onlineDevices = devices.filter((device) => device.online).length;
  const recentlyDetected = devices.filter((device) => {
    const lastSeenMs = new Date(device.lastSeenAt).getTime();
    const anchorMs = new Date(DEMO_NETWORK_ANCHOR).getTime();
    return anchorMs - lastSeenMs <= 30 * 60 * 1000;
  }).length;

  return {
    totalDevices: devices.length,
    totalDiscovered: devices.length,
    matchedDevices,
    needsReview,
    newDevices,
    ignoredDevices,
    onlineDevices,
    recentlyDetected,
  };
}

export function buildDemoNetworkPagePayload() {
  const devices = buildDemoDiscoveredDevices();
  const stats = buildDemoDiscoveryStats(devices);
  const connectors = [buildDemoConnectorInstallation()];

  return {
    connectors,
    devices,
    stats,
  };
}

export function buildDemoVaultDeviceOptions() {
  return morganDevices.map((device) => ({
    id: device.id,
    device_name: device.device_name,
    category: device.category,
    manufacturer: device.manufacturer,
    model_number: device.model_number,
    mac_address: device.mac_address,
    location: device.location,
  }));
}

export function buildDemoDiscoveryReviewConnectors() {
  const connector = buildDemoConnectorInstallation();

  return [
    {
      id: connector.id,
      name: connector.name,
      platform: connector.platform ?? "macos",
      status: connector.status,
      lastSeenAt: connector.lastSeenAt,
      lastScanAt: connector.lastScanAt,
      revokedAt: connector.revokedAt,
    },
  ];
}
