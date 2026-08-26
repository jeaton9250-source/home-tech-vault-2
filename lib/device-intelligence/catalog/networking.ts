import type { DeviceCatalogEntry } from "@/lib/device-intelligence/catalog/apple";

export const NETWORKING_CATALOG: DeviceCatalogEntry[] = [
  {
    id: "spectrum-sax2v1r",
    manufacturer: "Spectrum",
    family: "SAX2V1R",
    suggestedName: "Spectrum WiFi 6E Router",
    category: "router",
    hostnamePatterns: [
      /^sax2v1r(?:[.\-_]|$)/i,
    ],
  },
  {
    id: "spectrum-sax2v1s",
    manufacturer: "Spectrum",
    family: "SAX2V1S",
    suggestedName: "Spectrum WiFi Router",
    category: "router",
    hostnamePatterns: [
      /^sax2v1s(?:[.\-_]|$)/i,
    ],
  },
  {
    id: "spectrum-sax1v1r",
    manufacturer: "Spectrum",
    family: "SAX1V1R",
    suggestedName: "Spectrum WiFi Router",
    category: "router",
    hostnamePatterns: [
      /^sax1v1r(?:[.\-_]|$)/i,
    ],
  },
  {
    id: "spectrum-sax1v1s",
    manufacturer: "Spectrum",
    family: "SAX1V1S",
    suggestedName: "Spectrum WiFi Router",
    category: "router",
    hostnamePatterns: [
      /^sax1v1s(?:[.\-_]|$)/i,
    ],
  },

  {
    id: "generic-router",
    manufacturer: "Unknown",
    family: "Router",
    suggestedName: "Router or gateway",
    category: "router",
    hostnamePatterns: [/router|gateway/i],
  },
  {
    id: "mesh-node",
    manufacturer: "Unknown",
    family: "Mesh",
    suggestedName: "Mesh Wi-Fi node",
    category: "mesh_node",
    hostnamePatterns: [/mesh|eero|orbi|deco|unifi/i],
  },
  {
    id: "synology-nas",
    manufacturer: "Synology",
    family: "NAS",
    suggestedName: "Synology NAS",
    category: "nas",
    vendorAliases: ["Synology"],
    hostnamePatterns: [/synology|diskstation/i],
    mdnsServices: ["_smb._tcp", "_afpovertcp._tcp"],
  },
  {
    id: "network-printer",
    manufacturer: "Unknown",
    family: "Printer",
    suggestedName: "Network printer",
    category: "printer",
    hostnamePatterns: [/printer|epson|brother|canon|hp/i],
    mdnsServices: [
      "_ipp._tcp",
      "_ipps._tcp",
      "_printer._tcp",
      "_pdl-datastream._tcp",
    ],
    servicePorts: [631, 9100],
  },
];
