import type { DeviceCatalogEntry } from "@/lib/device-intelligence/catalog/apple";

export const TELEVISIONS_CATALOG: DeviceCatalogEntry[] = [
  {
    id: "samsung-tv",
    manufacturer: "Samsung",
    family: "Smart TV",
    suggestedName: "Samsung Smart TV",
    category: "television",
    vendorAliases: ["Samsung"],
    hostnamePatterns: [/samsung.?tv|tizen/i],
    ssdpDeviceTypes: [/MediaRenderer/i],
  },
  {
    id: "lg-webos-tv",
    manufacturer: "LG",
    family: "webOS TV",
    suggestedName: "LG webOS TV",
    category: "television",
    vendorAliases: ["LG"],
    hostnamePatterns: [/lgwebostv|webos/i],
    ssdpDeviceTypes: [/MediaRenderer/i],
  },
  {
    id: "sony-bravia",
    manufacturer: "Sony",
    family: "Bravia",
    suggestedName: "Sony Bravia TV",
    category: "television",
    vendorAliases: ["Sony"],
    hostnamePatterns: [/bravia/i],
  },
  {
    id: "roku-tv",
    manufacturer: "Roku",
    family: "Roku TV",
    suggestedName: "Roku TV",
    category: "television",
    vendorAliases: ["Roku"],
    hostnamePatterns: [/roku.?tv/i],
    mdnsServices: ["_roku._tcp"],
  },
];
