import type {
  DeviceCategory,
  DiscoveryEvidenceType,
} from "@/lib/device-intelligence/types";

export type DeviceCatalogEntry = {
  id: string;
  manufacturer: string;
  family: string;
  suggestedName: string;
  category: DeviceCategory;
  vendorAliases?: string[];
  hostnamePatterns?: RegExp[];
  mdnsServices?: string[];
  mdnsInstancePatterns?: RegExp[];
  ssdpDeviceTypes?: RegExp[];
  ssdpServerPatterns?: RegExp[];
  upnpManufacturerPatterns?: RegExp[];
  upnpModelPatterns?: RegExp[];
  friendlyNamePatterns?: RegExp[];
  servicePorts?: number[];
  defaultEvidenceWeights?: Partial<
    Record<DiscoveryEvidenceType, number>
  >;
};

export const APPLE_CATALOG: DeviceCatalogEntry[] = [
  {
    id: "apple-mac",
    manufacturer: "Apple",
    family: "Mac",
    suggestedName: "Apple Mac",
    category: "computer",
    vendorAliases: ["Apple"],
    hostnamePatterns: [
      /macbook/i,
      /imac/i,
      /mac-mini/i,
      /macpro/i,
      /^mac$/i,
      /^mac-/i,
    ],
    mdnsServices: [
      "_airplay._tcp",
      "_companion-link._tcp",
      "_smb._tcp",
      "_device-info._tcp",
    ],
  },
  {
    id: "apple-iphone",
    manufacturer: "Apple",
    family: "iPhone",
    suggestedName: "Apple iPhone",
    category: "phone",
    vendorAliases: ["Apple"],
    hostnamePatterns: [/iphone/i],
    mdnsServices: ["_apple-mobdev2._tcp"],
  },
  {
    id: "apple-ipad",
    manufacturer: "Apple",
    family: "iPad",
    suggestedName: "Apple iPad",
    category: "tablet",
    vendorAliases: ["Apple"],
    hostnamePatterns: [/ipad/i],
    mdnsServices: ["_apple-mobdev2._tcp"],
  },
  {
    id: "apple-tv",
    manufacturer: "Apple",
    family: "Apple TV",
    suggestedName: "Apple TV",
    category: "streaming_device",
    vendorAliases: ["Apple"],
    hostnamePatterns: [/apple-?tv/i, /appletv/i],
    mdnsServices: [
      "_airplay._tcp",
      "_appletv-v2._tcp",
      "_companion-link._tcp",
      "_raop._tcp",
    ],
  },
  {
    id: "apple-homepod",
    manufacturer: "Apple",
    family: "HomePod",
    suggestedName: "Apple HomePod",
    category: "speaker",
    vendorAliases: ["Apple"],
    hostnamePatterns: [/homepod/i],
    mdnsServices: ["_airplay._tcp", "_raop._tcp"],
  },
];
