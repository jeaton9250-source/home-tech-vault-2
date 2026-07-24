import type { DeviceCatalogEntry } from "@/lib/device-intelligence/catalog/apple";

export const AMAZON_CATALOG: DeviceCatalogEntry[] = [
  {
    id: "amazon-echo",
    manufacturer: "Amazon",
    family: "Echo",
    suggestedName: "Amazon Echo",
    category: "voice_assistant",
    vendorAliases: ["Amazon"],
    hostnamePatterns: [/echo/i, /amazon-/i],
    mdnsServices: ["_amzn-wplay._tcp"],
    ssdpDeviceTypes: [/MediaRenderer/i],
  },
  {
    id: "amazon-fire-tv",
    manufacturer: "Amazon",
    family: "Fire TV",
    suggestedName: "Amazon Fire TV",
    category: "streaming_device",
    vendorAliases: ["Amazon"],
    hostnamePatterns: [/firetv|fire-tv|aft[a-z]/i],
    ssdpDeviceTypes: [/MediaRenderer/i],
  },
  {
    id: "amazon-ring",
    manufacturer: "Ring",
    family: "Ring",
    suggestedName: "Ring device",
    category: "camera",
    vendorAliases: ["Amazon", "Ring"],
    hostnamePatterns: [/ring/i],
  },
  {
    id: "amazon-eero",
    manufacturer: "eero",
    family: "eero",
    suggestedName: "eero mesh node",
    category: "mesh_node",
    vendorAliases: ["Amazon", "eero"],
    hostnamePatterns: [/eero/i],
  },
];
