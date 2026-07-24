/**
 * MAC vendor lookup — pluggable provider with a small reviewed seed dataset.
 *
 * Dataset source: curated seed for development (not a full IEEE MA-L dump).
 * To add a redistributable full dataset:
 * 1. Obtain IEEE MA-L / MA-M / MA-S CSV under a license that permits redistribution
 *    (e.g. purchase from IEEE, or use a project with a compatible license).
 * 2. Place JSON under lib/device-intelligence/data/oui-seed.json (prefix → vendor).
 * 3. Bump VENDOR_DATASET_VERSION in types.ts.
 *
 * Never scrape oui databases without license permission.
 * Never perform a remote lookup per scanned device.
 */

import {
  getOuiPrefix,
  isLocallyAdministeredMac,
  isStableMacForIdentity,
  normalizeMacAddress,
} from "@/lib/device-intelligence/macAddress";
import { VENDOR_DATASET_VERSION } from "@/lib/device-intelligence/types";
import { normalizeVendorName } from "@/lib/device-intelligence/vendorAliases";

export type MacVendorResult = {
  vendor: string | null;
  normalizedVendor: string | null;
  prefix: string | null;
  source: string;
  datasetVersion: string | null;
  isPrivateMac: boolean;
  confidence: "high" | "medium" | "low" | "none";
};

export interface MacVendorProvider {
  lookup(macAddress: string): Promise<MacVendorResult>;
  lookupSync(macAddress: string): MacVendorResult;
}

/**
 * Reviewed OUI seed (MA-L style 24-bit prefixes).
 * Enough for Phase 3A tests and honest offline demos — not exhaustive.
 */
const OUI_SEED: Record<string, string> = {
  "0017f2": "Apple",
  "001124": "Apple",
  "001cb3": "Apple",
  "002312": "Apple",
  "28f076": "Apple",
  "3c0754": "Apple",
  "7c04d0": "Apple",
  "a4b197": "Apple",
  "acbc32": "Apple",
  "f0d1a9": "Apple",
  "001451": "Google",
  "001a11": "Google",
  "54ef44": "Google",
  "001b44": "Samsung",
  "002454": "Samsung",
  "5c497d": "Samsung",
  "001d0f": "Sonos",
  "b8e937": "Sonos",
  "001d7e": "Roku",
  "d8d866": "Roku",
  "001ea7": "Amazon",
  "0024b2": "Amazon",
  "50dc7e": "Amazon",
  "084ff9": "Amazon",
  "001e06": "Netgear",
  "002722": "Ubiquiti",
  "24a43c": "Ubiquiti",
  "001132": "Synology",
  "00155d": "Microsoft",
  "001dd8": "Microsoft",
  "001cdf": "Belkin",
  "ec1bbd": "Philips Hue",
  "001788": "Philips Hue",
  "b827eb": "Raspberry Pi",
  "dca632": "Raspberry Pi",
  "001e8c": "ASUS",
  "00e04c": "Realtek",
  "50c7bf": "TP-Link",
  "60e327": "TP-Link",
  "14ebb6": "TP-Link",
  "18b430": "Nest Labs",
  "64b5c6": "Nintendo",
  "00d9d1": "Sony Interactive",
  "7cbb8a": "Nintendo",
};

function emptyResult(
  overrides: Partial<MacVendorResult> = {}
): MacVendorResult {
  return {
    vendor: null,
    normalizedVendor: null,
    prefix: null,
    source: "seed",
    datasetVersion: VENDOR_DATASET_VERSION,
    isPrivateMac: false,
    confidence: "none",
    ...overrides,
  };
}

class SeedMacVendorProvider implements MacVendorProvider {
  private cache = new Map<string, MacVendorResult>();

  lookupSync(macAddress: string): MacVendorResult {
    const normalized = normalizeMacAddress(macAddress);

    if (!normalized) {
      return emptyResult({ source: "invalid" });
    }

    const cached = this.cache.get(normalized);
    if (cached) {
      return cached;
    }

    if (isLocallyAdministeredMac(normalized)) {
      const result = emptyResult({
        isPrivateMac: true,
        source: "private_mac",
        confidence: "none",
        prefix: getOuiPrefix(normalized),
      });
      this.cache.set(normalized, result);
      return result;
    }

    if (!isStableMacForIdentity(normalized)) {
      const result = emptyResult({
        source: "unstable_mac",
        prefix: getOuiPrefix(normalized),
      });
      this.cache.set(normalized, result);
      return result;
    }

    const prefix = getOuiPrefix(normalized);
    const rawVendor = prefix
      ? OUI_SEED[prefix] ??
        OUI_SEED[prefix.toLowerCase()] ??
        null
      : null;

    const normalizedVendor = normalizeVendorName(rawVendor);

    const result: MacVendorResult = {
      vendor: normalizedVendor,
      normalizedVendor,
      prefix,
      source: "seed",
      datasetVersion: VENDOR_DATASET_VERSION,
      isPrivateMac: false,
      confidence: normalizedVendor ? "medium" : "none",
    };

    this.cache.set(normalized, result);
    return result;
  }

  async lookup(macAddress: string): Promise<MacVendorResult> {
    return this.lookupSync(macAddress);
  }
}

let defaultProvider: MacVendorProvider | null = null;

export function getMacVendorProvider(): MacVendorProvider {
  if (!defaultProvider) {
    defaultProvider = new SeedMacVendorProvider();
  }

  return defaultProvider;
}

export function lookupMacVendorSync(
  macAddress: string
): MacVendorResult {
  return getMacVendorProvider().lookupSync(macAddress);
}
