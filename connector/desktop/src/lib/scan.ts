import { invoke } from "@tauri-apps/api/core";

import { syncDiscoveryResults } from "./api";

import type {
  DiscoverySyncResponse,
  ScanSummary,
} from "./types";

export async function runLocalNetworkScan() {
  return invoke<ScanSummary>("scan_my_network");
}

export function cancelLocalNetworkScan() {
  return invoke<void>("cancel_network_scan");
}

export function mapScanDevicesForSync(
  scan: ScanSummary,
  scannedAt: string
) {
  return scan.devices.map((device) => ({
    localFingerprint: device.localFingerprint,
    ipAddress: device.ipAddress ?? null,
    macAddress: device.macAddress ?? null,
    hostname: device.hostname ?? null,
    manufacturer: device.manufacturer ?? null,
    model: device.model ?? null,
    friendlyName: device.friendlyName ?? null,
    deviceType: device.deviceType ?? null,
    discoverySource: device.discoverySource,
    discoverySources: device.discoverySources ?? [device.discoverySource],
    mdnsServices: device.mdnsServices ?? [],
    ssdpDeviceType: device.ssdpDeviceType ?? null,
    ssdpDescriptionUrl: device.ssdpDescriptionUrl ?? null,
    firstSeenAt: scannedAt,
    lastSeenAt: scannedAt,
    online: device.online,
  }));
}

export async function scanAndSyncDiscovery(options: {
  token: string;
  runMatching?: boolean;
  onScanComplete?: (scan: ScanSummary) => void;
}) {
  const scan = await runLocalNetworkScan();

  options.onScanComplete?.(scan);

  if (scan.cancelled) {
    return {
      scan,
      sync: null as DiscoverySyncResponse | null,
    };
  }

  const scannedAt = new Date().toISOString();
  const devices = mapScanDevicesForSync(
    scan,
    scannedAt
  );

  const sync = await syncDiscoveryResults({
    token: options.token,
    scannedAt,
    devices,
    runMatching: options.runMatching ?? false,
  });

  return { scan, sync };
}
