import type { DeviceCatalogEntry } from "@/lib/device-intelligence/catalog/apple";

export const GOOGLE_CATALOG: DeviceCatalogEntry[] = [
  {
    id: "google-chromecast",
    manufacturer: "Google",
    family: "Chromecast",
    suggestedName: "Google Chromecast",
    category: "streaming_device",
    vendorAliases: ["Google"],
    hostnamePatterns: [/chromecast|googlecast/i],
    mdnsServices: ["_googlecast._tcp"],
  },
  {
    id: "google-nest-speaker",
    manufacturer: "Google",
    family: "Nest Speaker",
    suggestedName: "Google Nest speaker",
    category: "speaker",
    vendorAliases: ["Google"],
    hostnamePatterns: [/nest-audio|nest-mini|google-home/i],
    mdnsServices: ["_googlecast._tcp"],
  },
  {
    id: "google-nest-thermostat",
    manufacturer: "Google",
    family: "Nest Thermostat",
    suggestedName: "Nest Thermostat",
    category: "thermostat",
    vendorAliases: ["Google", "Nest Labs"],
    hostnamePatterns: [/nest-thermostat|nestthermo/i],
  },
];
