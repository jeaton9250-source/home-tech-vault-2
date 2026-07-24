/**
 * Network artifact rejection — hide non-physical devices from customer lists.
 */

import {
  isBroadcastMac,
  isMulticastMac,
  normalizeMacAddress,
} from "@/lib/device-intelligence/macAddress";
import type { NetworkArtifactClassification } from "@/lib/device-intelligence/types";

function isLoopbackIp(ip: string): boolean {
  return ip === "127.0.0.1" || ip.startsWith("127.");
}

function isUnspecifiedIp(ip: string): boolean {
  return ip === "0.0.0.0";
}

function isIpv4Broadcast(ip: string): boolean {
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) {
    return false;
  }

  if (ip.endsWith(".255")) {
    return true;
  }

  return ip === "255.255.255.255";
}

export function classifyNetworkArtifact(input: {
  ipAddress?: string | null;
  macAddress?: string | null;
  hostname?: string | null;
  mdnsServices?: string[] | null;
  ssdpDeviceType?: string | null;
  manufacturer?: string | null;
  friendlyName?: string | null;
}): NetworkArtifactClassification | null {
  const ip = input.ipAddress?.trim() || null;
  const mac = normalizeMacAddress(input.macAddress);

  if (ip && isUnspecifiedIp(ip)) {
    return {
      classification: "network_artifact",
      reason: "Unspecified IPv4 address (0.0.0.0)",
      visibleToCustomer: false,
    };
  }

  if (ip && isLoopbackIp(ip)) {
    return {
      classification: "network_artifact",
      reason: "Loopback address",
      visibleToCustomer: false,
    };
  }

  if (ip && isIpv4Broadcast(ip)) {
    return {
      classification: "network_artifact",
      reason: "IPv4 broadcast address",
      visibleToCustomer: false,
    };
  }

  if (mac && isBroadcastMac(mac)) {
    return {
      classification: "network_artifact",
      reason: "Broadcast MAC address",
      visibleToCustomer: false,
    };
  }

  if (mac && isMulticastMac(mac) && !ip) {
    return {
      classification: "network_artifact",
      reason: "Multicast-only MAC entry",
      visibleToCustomer: false,
    };
  }

  const hasUsableEvidence = Boolean(
    (mac && !isBroadcastMac(mac) && !isMulticastMac(mac)) ||
      input.hostname?.trim() ||
      input.manufacturer?.trim() ||
      input.friendlyName?.trim() ||
      (input.mdnsServices?.length ?? 0) > 0 ||
      input.ssdpDeviceType?.trim()
  );

  if (!ip && !hasUsableEvidence) {
    return {
      classification: "network_artifact",
      reason: "Incomplete record with no usable identifying evidence",
      visibleToCustomer: false,
    };
  }

  return null;
}

export function isVisibleToCustomer(input: {
  ipAddress?: string | null;
  macAddress?: string | null;
  hostname?: string | null;
  mdnsServices?: string[] | null;
  ssdpDeviceType?: string | null;
  manufacturer?: string | null;
  friendlyName?: string | null;
}): boolean {
  return classifyNetworkArtifact(input) === null;
}
