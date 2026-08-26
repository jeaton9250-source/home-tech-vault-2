/**
 * Local device-signature catalog for passive connector discovery.
 * Signatures combine manufacturer, hostname, mDNS, and SSDP signals.
 * Chipset vendors alone must not identify a specific consumer product.
 */

export type DeviceCategory =
  | "Computer"
  | "Phone / Tablet"
  | "Smart TV"
  | "Streaming Device"
  | "Printer"
  | "Smart Speaker"
  | "Game Console"
  | "Camera"
  | "Doorbell"
  | "Thermostat"
  | "Smart Plug"
  | "Wi-Fi Outlet"
  | "Robot Vacuum"
  | "Lighting Hub"
  | "Home Automation Hub"
  | "Router / Mesh System"
  | "NAS"
  | "Appliance"
  | "Aquarium Controller"
  | "Aquarium Lighting"
  | "Aquarium Pump"
  | "Aquarium Feeder"
  | "Aquarium Monitor"
  | "Aquarium Heater Controller"
  | "Aquarium Smart Plug"
  | "Aquarium Accessory"
  | "Smart Home Device"
  | "Networking Device"
  | "Unknown";

export type SignatureSignalKind =
  | "manufacturer"
  | "hostname"
  | "mdns"
  | "ssdp"
  | "model"
  | "vendorId";

export type DeviceSignature = {
  id: string;
  brand: string;
  category: DeviceCategory;
  /** Weight added when this signature matches (1–5). */
  weight: number;
  manufacturerPatterns?: RegExp[];
  hostnamePatterns?: RegExp[];
  mdnsServicePatterns?: RegExp[];
  ssdpDeviceTypePatterns?: RegExp[];
  modelPatterns?: RegExp[];
  /** When true, matching this signature alone cannot exceed low confidence. */
  chipsetOnly?: boolean;
  reasonTemplate: string;
};

function sig(
  input: Omit<DeviceSignature, "weight"> & { weight?: number }
): DeviceSignature {
  return { weight: input.weight ?? 2, ...input };
}

export const CHIPSET_VENDOR_PATTERNS = [
  /^espressif/i,
  /^tuya/i,
  /^itead/i,
  /^silicon labs/i,
];

export const DEVICE_SIGNATURES: DeviceSignature[] = [
  sig({
    id: "apple-computer",
    brand: "Apple",
    category: "Computer",
    weight: 3,
    manufacturerPatterns: [/^apple/i],
    hostnamePatterns: [
      /macbook/i,
      /imac/i,
      /mac-mini/i,
      /macstudio/i,
      /mac-pro/i,
    ],
    mdnsServicePatterns: [
      /_airplay\._tcp/i,
      /_companion-link\._tcp/i,
      /_smb\._tcp/i,
    ],
    reasonTemplate: "Manufacturer and hostname indicate an Apple computer",
  }),
  sig({
    id: "apple-mobile",
    brand: "Apple",
    category: "Phone / Tablet",
    weight: 3,
    manufacturerPatterns: [/^apple/i],
    hostnamePatterns: [/iphone/i, /ipad/i, /ipod/i],
    mdnsServicePatterns: [/_apple-mobdev2\._tcp/i],
    reasonTemplate: "Manufacturer and hostname indicate an Apple mobile device",
  }),
  sig({
    id: "apple-tv",
    brand: "Apple",
    category: "Streaming Device",
    weight: 3,
    manufacturerPatterns: [/^apple/i],
    hostnamePatterns: [/appletv/i, /apple-tv/i],
    mdnsServicePatterns: [/_appletv-v2\._tcp/i],
    reasonTemplate: "Apple TV streaming device signals detected",
  }),
  sig({
    id: "apple-homepod",
    brand: "Apple",
    category: "Smart Speaker",
    weight: 3,
    manufacturerPatterns: [/^apple/i],
    hostnamePatterns: [/homepod/i],
    mdnsServicePatterns: [/_airplay\._tcp/i],
    reasonTemplate: "Apple smart speaker signals detected",
  }),
  sig({
    id: "microsoft-computer",
    brand: "Microsoft",
    category: "Computer",
    weight: 3,
    manufacturerPatterns: [/^microsoft/i],
    hostnamePatterns: [/surface/i, /windows/i, /desktop/i, /laptop/i, /pc-/i],
    reasonTemplate: "Microsoft computer signals detected",
  }),
  sig({
    id: "nintendo-console",
    brand: "Nintendo",
    category: "Game Console",
    weight: 4,
    manufacturerPatterns: [/^nintendo/i],
    hostnamePatterns: [/switch/i, /nintendo/i],
    reasonTemplate: "Nintendo game console signals detected",
  }),
  sig({
    id: "sony-playstation",
    brand: "Sony",
    category: "Game Console",
    weight: 4,
    manufacturerPatterns: [/^sony/i],
    hostnamePatterns: [/playstation/i, /ps[45]/i],
    ssdpDeviceTypePatterns: [/playstation/i],
    reasonTemplate: "Sony PlayStation signals detected",
  }),
  sig({
    id: "xbox-console",
    brand: "Microsoft",
    category: "Game Console",
    weight: 4,
    manufacturerPatterns: [/^microsoft/i],
    hostnamePatterns: [/xbox/i],
    ssdpDeviceTypePatterns: [/xbox/i],
    reasonTemplate: "Xbox game console signals detected",
  }),
  sig({
    id: "roku-streaming",
    brand: "Roku",
    category: "Streaming Device",
    weight: 4,
    manufacturerPatterns: [/^roku/i],
    hostnamePatterns: [/roku/i],
    mdnsServicePatterns: [/_roku\.local/i],
    ssdpDeviceTypePatterns: [/roku/i],
    reasonTemplate: "Roku streaming device signals detected",
  }),
  sig({
    id: "amazon-echo",
    brand: "Amazon",
    category: "Smart Speaker",
    weight: 4,
    manufacturerPatterns: [/^amazon/i],
    hostnamePatterns: [/echo/i, /alexa/i],
    mdnsServicePatterns: [/_amzn-wplay\._tcp/i],
    ssdpDeviceTypePatterns: [/amazon/i, /alexa/i],
    reasonTemplate: "Amazon Echo smart speaker signals detected",
  }),
  sig({
    id: "amazon-fire-tv",
    brand: "Amazon",
    category: "Streaming Device",
    weight: 4,
    manufacturerPatterns: [/^amazon/i],
    hostnamePatterns: [/firetv/i, /fire-tv/i, /aft/i],
    ssdpDeviceTypePatterns: [/amazon.*fire/i],
    reasonTemplate: "Amazon Fire TV signals detected",
  }),
  sig({
    id: "google-nest",
    brand: "Google",
    category: "Smart Speaker",
    weight: 4,
    manufacturerPatterns: [/^google/i, /^nest/i],
    hostnamePatterns: [/nest/i, /google-home/i, /googlehome/i],
    mdnsServicePatterns: [/_googlecast\._tcp/i, /_googlezone\._tcp/i],
    reasonTemplate: "Google Nest speaker signals detected",
  }),
  sig({
    id: "google-chromecast",
    brand: "Google",
    category: "Streaming Device",
    weight: 4,
    manufacturerPatterns: [/^google/i],
    hostnamePatterns: [/chromecast/i, /google-tv/i],
    mdnsServicePatterns: [/_googlecast\._tcp/i],
    ssdpDeviceTypePatterns: [/google/i, /chromecast/i],
    reasonTemplate: "Google Chromecast streaming signals detected",
  }),
  sig({
    id: "sonos-speaker",
    brand: "Sonos",
    category: "Smart Speaker",
    weight: 4,
    manufacturerPatterns: [/^sonos/i],
    hostnamePatterns: [/sonos/i],
    mdnsServicePatterns: [/_sonos\._tcp/i],
    ssdpDeviceTypePatterns: [/sonos/i],
    reasonTemplate: "Sonos speaker signals detected",
  }),
  sig({
    id: "samsung-tv",
    brand: "Samsung",
    category: "Smart TV",
    weight: 3,
    manufacturerPatterns: [/^samsung/i],
    hostnamePatterns: [/samsung/i, /tizen/i],
    ssdpDeviceTypePatterns: [/samsung/i],
    reasonTemplate: "Samsung smart TV signals detected",
  }),
  sig({
    id: "lg-tv",
    brand: "LG",
    category: "Smart TV",
    weight: 3,
    manufacturerPatterns: [/^lg/i, /^lge/i],
    hostnamePatterns: [/lg/i, /webos/i],
    ssdpDeviceTypePatterns: [/lg/i],
    reasonTemplate: "LG smart TV signals detected",
  }),
  sig({
    id: "epson-printer",
    brand: "Epson",
    category: "Printer",
    weight: 4,
    manufacturerPatterns: [/^epson/i, /^seiko epson/i],
    hostnamePatterns: [/epson/i],
    mdnsServicePatterns: [/_ipp\._tcp/i, /_printer\._tcp/i, /_pdl-datastream\._tcp/i],
    ssdpDeviceTypePatterns: [/printer/i],
    reasonTemplate: "Epson printer signals detected",
  }),
  sig({
    id: "brother-printer",
    brand: "Brother",
    category: "Printer",
    weight: 4,
    manufacturerPatterns: [/^brother/i],
    hostnamePatterns: [/brother/i, /brn/i],
    mdnsServicePatterns: [/_ipp\._tcp/i, /_printer\._tcp/i],
    reasonTemplate: "Brother printer signals detected",
  }),
  sig({
    id: "canon-printer",
    brand: "Canon",
    category: "Printer",
    weight: 4,
    manufacturerPatterns: [/^canon/i],
    hostnamePatterns: [/canon/i],
    mdnsServicePatterns: [/_ipp\._tcp/i, /_printer\._tcp/i],
    reasonTemplate: "Canon printer signals detected",
  }),
  sig({
    id: "hp-printer",
    brand: "HP",
    category: "Printer",
    weight: 4,
    manufacturerPatterns: [/^hp/i, /^hewlett/i],
    hostnamePatterns: [/hp/i, /deskjet/i, /laserjet/i, /officejet/i],
    mdnsServicePatterns: [/_ipp\._tcp/i, /_printer\._tcp/i, /_pdl-datastream\._tcp/i],
    reasonTemplate: "HP printer signals detected",
  }),
  sig({
    id: "ring-doorbell",
    brand: "Ring",
    category: "Doorbell",
    weight: 4,
    manufacturerPatterns: [/^ring/i, /^amazon/i],
    hostnamePatterns: [/ring/i],
    reasonTemplate: "Ring doorbell signals detected",
  }),
  sig({
    id: "arlo-camera",
    brand: "Arlo",
    category: "Camera",
    weight: 4,
    manufacturerPatterns: [/^arlo/i, /^netgear/i],
    hostnamePatterns: [/arlo/i],
    reasonTemplate: "Arlo camera signals detected",
  }),
  sig({
    id: "tp-link-kasa",
    brand: "TP-Link",
    category: "Smart Plug",
    weight: 3,
    manufacturerPatterns: [/^tp-link/i, /^tplink/i, /^kasa/i],
    hostnamePatterns: [/kasa/i, /tplink/i, /tp-link/i],
    mdnsServicePatterns: [/_kasa\._tcp/i],
    reasonTemplate: "TP-Link Kasa smart plug signals detected",
  }),
  sig({
    id: "philips-hue",
    brand: "Philips Hue",
    category: "Lighting Hub",
    weight: 4,
    manufacturerPatterns: [/^philips/i, /^signify/i],
    hostnamePatterns: [/hue/i, /philips-hue/i],
    mdnsServicePatterns: [/_hue\._tcp/i],
    reasonTemplate: "Philips Hue lighting hub signals detected",
  }),
  sig({
    id: "home-assistant",
    brand: "Home Assistant",
    category: "Home Automation Hub",
    weight: 4,
    manufacturerPatterns: [/^home assistant/i, /^nabu casa/i],
    hostnamePatterns: [/homeassistant/i, /home-assistant/i, /hass/i],
    mdnsServicePatterns: [/_home-assistant\._tcp/i, /_hap\._tcp/i],
    reasonTemplate: "Home Assistant hub signals detected",
  }),
  sig({
    id: "spectrum-sax-router",
    brand: "Spectrum",
    category: "Router / Mesh System",
    weight: 5,

    /*
     * Spectrum Advanced WiFi routers commonly
     * expose the hardware model directly as the
     * network hostname, for example:
     *
     *   sax2v1r.lan
     *   SAX2V1R
     *
     * Keep these patterns deliberately narrow so
     * arbitrary "sax..." hostnames are not treated
     * as Spectrum routers.
     */
    hostnamePatterns: [
      /^sax1v1[rs](?:[.\-_]|$)/i,
      /^sax2v1[rs](?:[.\-_]|$)/i,
    ],

    modelPatterns: [
      /^sax1v1[rs]$/i,
      /^sax2v1[rs]$/i,
    ],

    reasonTemplate:
      "Hostname or model matches a Spectrum SAX-series Wi-Fi router",
  }),

  sig({
    id: "unifi-network",
    brand: "Ubiquiti",
    category: "Router / Mesh System",
    weight: 4,
    manufacturerPatterns: [/^ubiquiti/i, /^ui/i],
    hostnamePatterns: [/unifi/i, /ubnt/i, /udm/i, /u6/i],
    mdnsServicePatterns: [/_unifi/i],
    reasonTemplate: "UniFi router or mesh signals detected",
  }),
  sig({
    id: "synology-nas",
    brand: "Synology",
    category: "NAS",
    weight: 4,
    manufacturerPatterns: [/^synology/i],
    hostnamePatterns: [/synology/i, /diskstation/i, /ds\d+/i],
    mdnsServicePatterns: [/_smb\._tcp/i, /_afpovertcp\._tcp/i],
    reasonTemplate: "Synology NAS signals detected",
  }),
  sig({
    id: "qnap-nas",
    brand: "QNAP",
    category: "NAS",
    weight: 4,
    manufacturerPatterns: [/^qnap/i],
    hostnamePatterns: [/qnap/i, /ts-\d+/i],
    reasonTemplate: "QNAP NAS signals detected",
  }),
  sig({
    id: "robot-vacuum",
    brand: "Unknown",
    category: "Robot Vacuum",
    weight: 2,
    hostnamePatterns: [/roomba/i, /roborock/i, /vacuum/i, /irobot/i],
    ssdpDeviceTypePatterns: [/robot/i, /vacuum/i],
    reasonTemplate: "Robot vacuum hostname or service signals detected",
  }),
  sig({
    id: "nest-thermostat",
    brand: "Google Nest",
    category: "Thermostat",
    weight: 3,
    manufacturerPatterns: [/^google/i, /^nest/i],
    hostnamePatterns: [/nest-thermostat/i, /thermostat/i],
    reasonTemplate: "Nest thermostat signals detected",
  }),
  sig({
    id: "espressif-generic",
    brand: "Unknown",
    category: "Smart Home Device",
    weight: 1,
    chipsetOnly: true,
    manufacturerPatterns: [/^espressif/i],
    reasonTemplate: "Manufacturer is Espressif (generic Wi-Fi chipset)",
  }),
  sig({
    id: "tuya-generic",
    brand: "Unknown",
    category: "Smart Home Device",
    weight: 1,
    chipsetOnly: true,
    manufacturerPatterns: [/^tuya/i, /^itead/i],
    reasonTemplate: "Manufacturer indicates a generic Tuya smart-home chipset",
  }),
  sig({
    id: "neptune-aquarium-controller",
    brand: "Neptune Systems",
    category: "Aquarium Controller",
    weight: 4,
    manufacturerPatterns: [/^neptune/i],
    hostnamePatterns: [/apex/i, /neptune/i, /fusion/i],
    reasonTemplate: "Neptune Systems aquarium controller signals detected",
  }),
  sig({
    id: "hydros-aquarium",
    brand: "Hydros",
    category: "Aquarium Controller",
    weight: 4,
    manufacturerPatterns: [/^hydros/i, /^coralvue/i],
    hostnamePatterns: [/hydros/i, /hydroscontrol/i],
    reasonTemplate: "Hydros aquarium controller signals detected",
  }),
  sig({
    id: "ghl-aquarium",
    brand: "GHL",
    category: "Aquarium Controller",
    weight: 4,
    manufacturerPatterns: [/^ghl/i, /^german aquarium/i],
    hostnamePatterns: [/ghl/i, /profilux/i],
    reasonTemplate: "GHL aquarium controller signals detected",
  }),
  sig({
    id: "ecotech-aquarium",
    brand: "Ecotech Marine",
    category: "Aquarium Pump",
    weight: 4,
    manufacturerPatterns: [/^ecotech/i],
    hostnamePatterns: [/ecotech/i, /vectra/i, /mp\d+/i, /radion/i],
    reasonTemplate: "Ecotech Marine aquarium equipment signals detected",
  }),
  sig({
    id: "reefbeat-light",
    brand: "ReefBeat",
    category: "Aquarium Lighting",
    weight: 3,
    hostnamePatterns: [/reef-light/i, /reefbeat/i, /reef_light/i],
    mdnsServicePatterns: [/reef/i],
    reasonTemplate: "Hostname or service indicates aquarium Wi-Fi lighting",
  }),
  sig({
    id: "aquarium-pump-hostname",
    brand: "Unknown",
    category: "Aquarium Pump",
    weight: 2,
    hostnamePatterns: [/aqua-pump/i, /doser/i, /return-pump/i],
    reasonTemplate: "Hostname suggests an aquarium pump",
  }),
  sig({
    id: "aquarium-feeder-hostname",
    brand: "Unknown",
    category: "Aquarium Feeder",
    weight: 2,
    hostnamePatterns: [/feeder/i, /auto-feeder/i],
    reasonTemplate: "Hostname suggests an aquarium feeder",
  }),
  sig({
    id: "aquarium-monitor-hostname",
    brand: "Unknown",
    category: "Aquarium Monitor",
    weight: 2,
    hostnamePatterns: [/apex-fusion/i, /trident/i, /monitor/i, /seneye/i],
    reasonTemplate: "Hostname suggests an aquarium monitor",
  }),
  sig({
    id: "ssdp-media-renderer",
    brand: "Unknown",
    category: "Streaming Device",
    weight: 2,
    ssdpDeviceTypePatterns: [
      /mediarenderer/i,
      /mediaserver/i,
      /dial/i,
    ],
    reasonTemplate: "SSDP reports a media renderer or streaming service",
  }),
  sig({
    id: "ssdp-printer",
    brand: "Unknown",
    category: "Printer",
    weight: 2,
    ssdpDeviceTypePatterns: [/printer/i, /print/i],
    reasonTemplate: "SSDP reports a printer device type",
  }),
  sig({
    id: "mdns-printer",
    brand: "Unknown",
    category: "Printer",
    weight: 2,
    mdnsServicePatterns: [/_ipp\._tcp/i, /_printer\._tcp/i, /_pdl-datastream\._tcp/i],
    reasonTemplate: "mDNS advertises printer services",
  }),
  sig({
    id: "mdns-airplay",
    brand: "Unknown",
    category: "Smart Speaker",
    weight: 2,
    mdnsServicePatterns: [/_airplay\._tcp/i, /_raop\._tcp/i],
    reasonTemplate: "mDNS advertises AirPlay audio services",
  }),
];

export function isChipsetVendor(
  manufacturer: string | null | undefined
): boolean {
  if (!manufacturer?.trim()) {
    return false;
  }

  return CHIPSET_VENDOR_PATTERNS.some((pattern) =>
    pattern.test(manufacturer.trim())
  );
}
