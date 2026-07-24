import type { DeviceCatalogEntry } from "@/lib/device-intelligence/catalog/apple";

export const NETWORKING_CATALOG: DeviceCatalogEntry[] = [
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
