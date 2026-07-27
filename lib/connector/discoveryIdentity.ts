import { normalizeHostname, normalizeMacAddress, normalizeManufacturer, normalizeModel, normalizeSerialNumber } from "@/lib/connector/network";

import type { DiscoveredDeviceSummary } from "@/lib/connector/discoveryTypes";

type IdentityCandidate = {
  id: string;
  connector_id: string;
  local_fingerprint: string;
  hostname: string | null;
  manufacturer: string | null;
  model: string | null;
  serial_number: string | null;
  mac_address: string | null;
  imported_device_id: string | null;
  recognition_status?: string | null;
  recognition_reviewed_at?: string | null;
  match_confirmed_at?: string | null;
  friendly_name?: string | null;
  identification_display_name?: string | null;
  last_seen_at?: string | null;
};

type IncomingIdentity = {
  connectorId: string;
  localFingerprint: string;
  hostname: string | null;
  manufacturer: string | null;
  model: string | null;
  serialNumber: string | null;
  macAddress: string | null;
  importedDeviceId?: string | null;
};

const GENERIC_MANUFACTURERS = new Set([
  "apple",
  "samsung",
  "amazon",
  "google",
]);

function normalizeMacKey(value: string | null | undefined): string {
  const normalized = normalizeMacAddress(value);

  return normalized.replace(/[^0-9a-f]/g, "");
}

export function isPrivateOrRandomizedMac(value: string | null | undefined): boolean {
  const normalized = normalizeMacKey(value);

  if (normalized.length !== 12) {
    return false;
  }

  const firstOctet = Number.parseInt(normalized.slice(0, 2), 16);

  if (Number.isNaN(firstOctet)) {
    return false;
  }

  return (firstOctet & 0b00000010) === 0b00000010;
}

function isGenericManufacturer(value: string | null | undefined): boolean {
  const normalized = normalizeManufacturer(value);

  if (!normalized) {
    return false;
  }

  return GENERIC_MANUFACTURERS.has(normalized);
}

function completenessScore(candidate: IdentityCandidate): number {
  return [
    candidate.hostname,
    candidate.manufacturer,
    candidate.model,
    candidate.serial_number,
    candidate.friendly_name,
    candidate.identification_display_name,
  ].filter((value) => Boolean(value?.trim())).length;
}

function timestampScore(value: string | null | undefined): number {
  if (!value) {
    return 0;
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function representativeRank(candidate: IdentityCandidate): number {
  if (candidate.imported_device_id) {
    return 500;
  }

  if (candidate.recognition_status === "accepted") {
    return 400;
  }

  if (candidate.match_confirmed_at || candidate.recognition_reviewed_at) {
    return 300;
  }

  return 100;
}

function candidateMatchScore(input: IncomingIdentity, candidate: IdentityCandidate): number {
  if (input.importedDeviceId && candidate.imported_device_id === input.importedDeviceId) {
    return 1000;
  }

  const incomingMac = normalizeMacKey(input.macAddress);
  const candidateMac = normalizeMacKey(candidate.mac_address);

  if (incomingMac && candidateMac && incomingMac === candidateMac && !isPrivateOrRandomizedMac(input.macAddress)) {
    return candidate.imported_device_id ? 950 : 900;
  }

  if (input.localFingerprint.trim() && input.localFingerprint.trim() === candidate.local_fingerprint.trim()) {
    return 850;
  }

  const incomingHost = normalizeHostname(input.hostname);
  const incomingManufacturer = normalizeManufacturer(input.manufacturer);
  const incomingModel = normalizeModel(input.model);
  const incomingSerial = normalizeSerialNumber(input.serialNumber);

  const candidateHost = normalizeHostname(candidate.hostname);
  const candidateManufacturer = normalizeManufacturer(candidate.manufacturer);
  const candidateModel = normalizeModel(candidate.model);
  const candidateSerial = normalizeSerialNumber(candidate.serial_number);

  if (
    incomingHost &&
    incomingManufacturer &&
    incomingModel &&
    incomingSerial &&
    incomingHost === candidateHost &&
    incomingManufacturer === candidateManufacturer &&
    incomingModel === candidateModel &&
    incomingSerial === candidateSerial
  ) {
    return 800;
  }

  if (
    incomingHost &&
    incomingManufacturer &&
    incomingModel &&
    incomingHost === candidateHost &&
    incomingManufacturer === candidateManufacturer &&
    incomingModel === candidateModel
  ) {
    return 700;
  }

  if (
    incomingHost &&
    incomingManufacturer &&
    incomingHost === candidateHost &&
    incomingManufacturer === candidateManufacturer &&
    !isGenericManufacturer(input.manufacturer)
  ) {
    return 600;
  }

  return 0;
}

export function pickExistingDiscoveredCandidate(input: {
  incoming: IncomingIdentity;
  candidates: IdentityCandidate[];
}): IdentityCandidate | null {
  const { incoming, candidates } = input;

  const scored = candidates
    .filter((candidate) => candidate.connector_id === incoming.connectorId)
    .map((candidate) => ({
      candidate,
      score: candidateMatchScore(incoming, candidate),
      rank: representativeRank(candidate),
      seenAt: timestampScore(candidate.last_seen_at),
      completeness: completenessScore(candidate),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      if (b.rank !== a.rank) {
        return b.rank - a.rank;
      }

      if (b.completeness !== a.completeness) {
        return b.completeness - a.completeness;
      }

      return b.seenAt - a.seenAt;
    });

  return scored[0]?.candidate ?? null;
}

function displayIdentityKey(device: DiscoveredDeviceSummary): string {
  if (device.importedDeviceId) {
    return `imported:${device.importedDeviceId}`;
  }

  const macKey = normalizeMacKey(device.macAddress);

  if (macKey && !isPrivateOrRandomizedMac(device.macAddress)) {
    return `mac:${macKey}`;
  }

  if (device.localFingerprint?.trim()) {
    return `fingerprint:${device.localFingerprint.trim()}`;
  }

  const host = normalizeHostname(device.hostname);
  const manufacturer = normalizeManufacturer(device.manufacturer);
  const model = normalizeModel(device.model);

  if (host && manufacturer && model) {
    return `combo:${device.connectorId}:${host}:${manufacturer}:${model}`;
  }

  if (host && manufacturer) {
    return `combo-lite:${device.connectorId}:${host}:${manufacturer}`;
  }

  return `id:${device.id}`;
}

function displayRepresentativePriority(device: DiscoveredDeviceSummary): number {
  if (device.importedDeviceId) {
    return 500;
  }

  if (device.recognitionStatus === "accepted") {
    return 400;
  }

  if (device.matchConfirmedAt || device.recognitionReviewedAt) {
    return 300;
  }

  return 100;
}

function displayCompleteness(device: DiscoveredDeviceSummary): number {
  return [
    device.friendlyName,
    device.identificationDisplayName,
    device.manufacturer,
    device.model,
    device.likelyCategory,
    device.recognitionSuggestion.friendlyName,
  ].filter((value) => Boolean(value?.trim())).length;
}

export function dedupeDiscoveredDevicesForDisplay(
  devices: DiscoveredDeviceSummary[]
): DiscoveredDeviceSummary[] {
  const groups = new Map<string, DiscoveredDeviceSummary[]>();

  for (const device of devices) {
    const key = displayIdentityKey(device);
    const group = groups.get(key);

    if (group) {
      group.push(device);
      continue;
    }

    groups.set(key, [device]);
  }

  return [...groups.values()].map((group) => {
    return [...group].sort((a, b) => {
      const priorityDelta = displayRepresentativePriority(b) - displayRepresentativePriority(a);

      if (priorityDelta !== 0) {
        return priorityDelta;
      }

      const completenessDelta = displayCompleteness(b) - displayCompleteness(a);

      if (completenessDelta !== 0) {
        return completenessDelta;
      }

      return Date.parse(b.lastSeenAt) - Date.parse(a.lastSeenAt);
    })[0]!;
  });
}
