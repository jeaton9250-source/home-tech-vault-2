/**
 * Hostname intelligence — pattern hints without over-claiming exact models.
 */

import type { DeviceCategory } from "@/lib/device-intelligence/types";

export type HostnameAnalysis = {
  original: string | null;
  normalized: string | null;
  suggestedManufacturer: string | null;
  suggestedFamily: string | null;
  suggestedCategory: DeviceCategory | null;
  suggestedName: string | null;
  specificity: "product" | "family" | "generic" | "none";
  evidenceLabel: string | null;
};

export function normalizeHostnameForIntelligence(
  value: string | null | undefined
): string | null {
  if (!value?.trim()) {
    return null;
  }

  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/\.local$/i, "")
    .replace(/\.lan$/i, "")
    .replace(/\.home$/i, "")
    .replace(/\.$/, "")
    .replace(/[_\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || null;
}

type HostnameRule = {
  pattern: RegExp;
  manufacturer: string | null;
  family: string | null;
  category: DeviceCategory;
  suggestedName: string;
  specificity: HostnameAnalysis["specificity"];
  label: string;
};

const HOSTNAME_RULES: HostnameRule[] = [
  {
    pattern: /macbook|imac|mac-mini|macmini|mac-pro|macpro|macstudio/,
    manufacturer: "Apple",
    family: "Mac",
    category: "computer",
    suggestedName: "Apple Mac",
    specificity: "family",
    label: "Hostname indicates an Apple Mac",
  },
  {
    pattern: /^mac$|^mac-/,
    manufacturer: "Apple",
    family: "Mac",
    category: "computer",
    suggestedName: "Possible Apple Mac",
    specificity: "generic",
    label: "Generic Mac hostname — possible Apple computer",
  },
  {
    pattern: /iphone/,
    manufacturer: "Apple",
    family: "iPhone",
    category: "phone",
    suggestedName: "Apple iPhone",
    specificity: "family",
    label: "Hostname indicates an iPhone",
  },
  {
    pattern: /ipad/,
    manufacturer: "Apple",
    family: "iPad",
    category: "tablet",
    suggestedName: "Apple iPad",
    specificity: "family",
    label: "Hostname indicates an iPad",
  },
  {
    pattern: /apple-?tv|appletv/,
    manufacturer: "Apple",
    family: "Apple TV",
    category: "streaming_device",
    suggestedName: "Apple TV",
    specificity: "product",
    label: "Hostname indicates Apple TV",
  },
  {
    pattern: /homepod/,
    manufacturer: "Apple",
    family: "HomePod",
    category: "speaker",
    suggestedName: "Apple HomePod",
    specificity: "family",
    label: "Hostname indicates HomePod",
  },
  {
    pattern: /samsung.?tv|living-room-tv|bedroom-tv|bravia/,
    manufacturer: null,
    family: "Smart TV",
    category: "television",
    suggestedName: "Smart TV",
    specificity: "family",
    label: "Hostname suggests a television",
  },
  {
    pattern: /lgwebostv|webos/,
    manufacturer: "LG",
    family: "webOS TV",
    category: "television",
    suggestedName: "LG webOS TV",
    specificity: "family",
    label: "Hostname indicates LG webOS TV",
  },
  {
    pattern: /roku/,
    manufacturer: "Roku",
    family: "Roku",
    category: "streaming_device",
    suggestedName: "Roku",
    specificity: "family",
    label: "Hostname indicates Roku",
  },
  {
    pattern: /firetv|fire-tv|aft[a-z]/,
    manufacturer: "Amazon",
    family: "Fire TV",
    category: "streaming_device",
    suggestedName: "Amazon Fire TV",
    specificity: "family",
    label: "Hostname indicates Fire TV",
  },
  {
    pattern: /echo|amazon-/,
    manufacturer: "Amazon",
    family: "Echo",
    category: "voice_assistant",
    suggestedName: "Amazon Echo",
    specificity: "family",
    label: "Hostname indicates Amazon Echo",
  },
  {
    pattern: /chromecast|googlecast|nest-audio|nest-mini|google-home/,
    manufacturer: "Google",
    family: "Cast / Nest",
    category: "streaming_device",
    suggestedName: "Google Cast device",
    specificity: "family",
    label: "Hostname indicates Google Cast / Nest",
  },
  {
    pattern: /nest-thermostat|nestthermo/,
    manufacturer: "Google",
    family: "Nest Thermostat",
    category: "thermostat",
    suggestedName: "Nest Thermostat",
    specificity: "family",
    label: "Hostname indicates Nest thermostat",
  },
  {
    pattern: /sonos/,
    manufacturer: "Sonos",
    family: "Sonos",
    category: "speaker",
    suggestedName: "Sonos speaker",
    specificity: "family",
    label: "Hostname indicates Sonos",
  },
  {
    pattern: /hue|philips-hue/,
    manufacturer: "Philips Hue",
    family: "Hue Bridge",
    category: "hub",
    suggestedName: "Philips Hue Bridge",
    specificity: "family",
    label: "Hostname indicates Philips Hue",
  },
  {
    pattern: /lutron/,
    manufacturer: "Lutron",
    family: "Caséta",
    category: "hub",
    suggestedName: "Lutron Caséta Bridge",
    specificity: "family",
    label: "Hostname indicates Lutron",
  },
  {
    pattern: /ring/,
    manufacturer: "Ring",
    family: "Ring",
    category: "camera",
    suggestedName: "Ring device",
    specificity: "family",
    label: "Hostname indicates Ring",
  },
  {
    pattern: /arlo/,
    manufacturer: "Arlo",
    family: "Arlo",
    category: "camera",
    suggestedName: "Arlo camera",
    specificity: "family",
    label: "Hostname indicates Arlo",
  },
  {
    pattern: /eufy/,
    manufacturer: "Eufy",
    family: "Eufy",
    category: "camera",
    suggestedName: "Eufy device",
    specificity: "family",
    label: "Hostname indicates Eufy",
  },
  {
    pattern: /wyze/,
    manufacturer: "Wyze",
    family: "Wyze",
    category: "camera",
    suggestedName: "Wyze camera",
    specificity: "family",
    label: "Hostname indicates Wyze",
  },
  {
    pattern: /kasa|tp-?link|tapo/,
    manufacturer: "TP-Link",
    family: "Kasa / Tapo",
    category: "smart_plug",
    suggestedName: "TP-Link smart device",
    specificity: "family",
    label: "Hostname indicates TP-Link Kasa/Tapo",
  },
  {
    pattern: /levoit/,
    manufacturer: "Levoit",
    family: "Air Purifier",
    category: "air_purifier",
    suggestedName: "Levoit air purifier",
    specificity: "family",
    label: "Hostname indicates Levoit",
  },
  {
    pattern: /ecobee/,
    manufacturer: "Ecobee",
    family: "Thermostat",
    category: "thermostat",
    suggestedName: "Ecobee thermostat",
    specificity: "family",
    label: "Hostname indicates Ecobee",
  },
  {
    pattern: /roomba|irobot/,
    manufacturer: "iRobot",
    family: "Roomba",
    category: "robot_vacuum",
    suggestedName: "iRobot Roomba",
    specificity: "family",
    label: "Hostname indicates Roomba",
  },
  {
    pattern: /roborock/,
    manufacturer: "Roborock",
    family: "Roborock",
    category: "robot_vacuum",
    suggestedName: "Roborock vacuum",
    specificity: "family",
    label: "Hostname indicates Roborock",
  },
  {
    pattern: /playstation|ps[45]/,
    manufacturer: "Sony",
    family: "PlayStation",
    category: "game_console",
    suggestedName: "PlayStation",
    specificity: "family",
    label: "Hostname indicates PlayStation",
  },
  {
    pattern: /xbox/,
    manufacturer: "Microsoft",
    family: "Xbox",
    category: "game_console",
    suggestedName: "Xbox",
    specificity: "family",
    label: "Hostname indicates Xbox",
  },
  {
    pattern: /nintendo|switch/,
    manufacturer: "Nintendo",
    family: "Switch",
    category: "game_console",
    suggestedName: "Nintendo Switch",
    specificity: "family",
    label: "Hostname indicates Nintendo Switch",
  },
  {
    pattern: /printer|epson|brother|canon|deskjet|laserjet|officejet/,
    manufacturer: null,
    family: "Printer",
    category: "printer",
    suggestedName: "Printer",
    specificity: "family",
    label: "Hostname indicates a printer",
  },
  {
    pattern: /synology|qnap|nas-/,
    manufacturer: null,
    family: "NAS",
    category: "nas",
    suggestedName: "NAS",
    specificity: "family",
    label: "Hostname indicates NAS storage",
  },
  {
    pattern: /router|gateway|eero|orbi|deco|unifi|mesh/,
    manufacturer: null,
    family: "Router / Mesh",
    category: "router",
    suggestedName: "Router or mesh node",
    specificity: "family",
    label: "Hostname indicates networking gear",
  },
];

export function analyzeHostname(
  value: string | null | undefined
): HostnameAnalysis {
  const original = value?.trim() || null;
  const normalized = normalizeHostnameForIntelligence(value);

  if (!normalized) {
    return {
      original,
      normalized: null,
      suggestedManufacturer: null,
      suggestedFamily: null,
      suggestedCategory: null,
      suggestedName: null,
      specificity: "none",
      evidenceLabel: null,
    };
  }

  for (const rule of HOSTNAME_RULES) {
    if (rule.pattern.test(normalized)) {
      return {
        original,
        normalized,
        suggestedManufacturer: rule.manufacturer,
        suggestedFamily: rule.family,
        suggestedCategory: rule.category,
        suggestedName: rule.suggestedName,
        specificity: rule.specificity,
        evidenceLabel: rule.label,
      };
    }
  }

  return {
    original,
    normalized,
    suggestedManufacturer: null,
    suggestedFamily: null,
    suggestedCategory: null,
    suggestedName: null,
    specificity: "none",
    evidenceLabel: null,
  };
}
