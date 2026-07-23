import { normalizeMacAddress } from "@/lib/connector/network";

export type ScanObservedDevice = {
  macAddress: string;
  ipAddress?: string | null;
  manufacturer?: string | null;
  online?: boolean;
};

/**
 * Build a vault device update when a household scan observes a known MAC.
 */
export function buildVaultPresenceUpdateFromScan(input: {
  scannedAt: string;
  observed: ScanObservedDevice;
  existing?: {
    ip_address?: string | null;
    manufacturer?: string | null;
    brand?: string | null;
    device_name?: string | null;
  };
  suggestedName?: string | null;
}): Record<string, unknown> {
  const {
    scannedAt,
    observed,
    existing,
    suggestedName,
  } = input;

  const update: Record<string, unknown> = {
    last_seen_at: scannedAt,
    network_updated_at: scannedAt,
    online: observed.online ?? true,
    discovery_source: "ARP Sync",
  };

  if (observed.ipAddress?.trim()) {
    update.ip_address = observed.ipAddress.trim();
  }

  if (observed.manufacturer?.trim()) {
    update.manufacturer = observed.manufacturer.trim();

    if (!existing?.brand?.trim()) {
      update.brand = observed.manufacturer.trim();
    }
  }

  const currentName = existing?.device_name?.trim() ?? "";
  const currentNameIsGeneric =
    currentName === "" ||
    currentName.startsWith("Network Device ");

  if (
    currentNameIsGeneric &&
    suggestedName?.trim() &&
    !suggestedName.trim().startsWith("Network Device ")
  ) {
    update.device_name = suggestedName.trim();
  }

  return update;
}

export function indexObservedDevicesByMac(
  devices: ScanObservedDevice[]
): Map<string, ScanObservedDevice> {
  const map = new Map<string, ScanObservedDevice>();

  for (const device of devices) {
    const mac = normalizeMacAddress(device.macAddress);

    if (mac) {
      map.set(mac, device);
    }
  }

  return map;
}

export function indexVaultDevicesByMac<
  T extends { mac_address?: string | null },
>(devices: T[]): Map<string, T> {
  const map = new Map<string, T>();

  for (const device of devices) {
    const mac = normalizeMacAddress(device.mac_address ?? "");

    if (mac && !map.has(mac)) {
      map.set(mac, device);
    }
  }

  return map;
}

export function filterVaultDevicesObservedInScan<
  T extends { mac_address?: string | null },
>(
  vaultDevices: T[],
  observedByMac: Map<string, unknown>
): T[] {
  return vaultDevices.filter((device) => {
    const mac = normalizeMacAddress(device.mac_address ?? "");

    return mac && observedByMac.has(mac);
  });
}
