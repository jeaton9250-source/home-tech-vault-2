export type DeviceLookupResult = {
  id: string;
  deviceName: string;
  brand: string;
  manufacturer: string;
  modelNumber: string;
  category: string;
  confidence: "catalog" | "icecat" | "upcitemdb" | "inferred";
  description: string;

  imageUrl?: string;
  upc?: string;
};

type CatalogDevice = Omit<
  DeviceLookupResult,
  "confidence"
> & {
  aliases: string[];
};

const DEVICE_CATALOG: CatalogDevice[] = [
  {
    id: "apple-macbook-pro",
    deviceName: "Apple MacBook Pro",
    brand: "Apple",
    manufacturer: "Apple",
    modelNumber: "MacBook Pro",
    category: "Laptop",
    description: "Apple laptop",
    aliases: [
      "macbook pro",
      "mbp",
      "apple macbook pro",
    ],
  },
  {
    id: "apple-macbook-air",
    deviceName: "Apple MacBook Air",
    brand: "Apple",
    manufacturer: "Apple",
    modelNumber: "MacBook Air",
    category: "Laptop",
    description: "Apple laptop",
    aliases: [
      "macbook air",
      "mba",
      "apple macbook air",
    ],
  },
  {
    id: "apple-imac",
    deviceName: "Apple iMac",
    brand: "Apple",
    manufacturer: "Apple",
    modelNumber: "iMac",
    category: "Computer",
    description: "Apple desktop computer",
    aliases: ["imac", "apple imac"],
  },
  {
    id: "apple-iphone",
    deviceName: "Apple iPhone",
    brand: "Apple",
    manufacturer: "Apple",
    modelNumber: "iPhone",
    category: "Phone",
    description: "Apple smartphone",
    aliases: ["iphone", "apple iphone"],
  },
  {
    id: "apple-ipad",
    deviceName: "Apple iPad",
    brand: "Apple",
    manufacturer: "Apple",
    modelNumber: "iPad",
    category: "Tablet",
    description: "Apple tablet",
    aliases: ["ipad", "apple ipad"],
  },
  {
    id: "apple-tv-4k",
    deviceName: "Apple TV 4K",
    brand: "Apple",
    manufacturer: "Apple",
    modelNumber: "Apple TV 4K",
    category: "Streaming Device",
    description: "Streaming media player",
    aliases: [
      "apple tv",
      "apple tv 4k",
      "appletv",
    ],
  },
  {
    id: "apple-homepod",
    deviceName: "Apple HomePod",
    brand: "Apple",
    manufacturer: "Apple",
    modelNumber: "HomePod",
    category: "Smart Home",
    description: "Smart speaker",
    aliases: [
      "homepod",
      "apple homepod",
    ],
  },

  {
    id: "samsung-s90d",
    deviceName: "Samsung S90D OLED TV",
    brand: "Samsung",
    manufacturer: "Samsung",
    modelNumber: "S90D",
    category: "TV",
    description: "Samsung OLED television",
    aliases: [
      "s90d",
      "samsung s90d",
      "s90d oled",
      "s90d tv",
    ],
  },
  {
    id: "samsung-qn90d",
    deviceName: "Samsung QN90D Neo QLED TV",
    brand: "Samsung",
    manufacturer: "Samsung",
    modelNumber: "QN90D",
    category: "TV",
    description: "Samsung Neo QLED television",
    aliases: [
      "qn90d",
      "samsung qn90d",
      "qn90d tv",
    ],
  },
  {
    id: "samsung-galaxy",
    deviceName: "Samsung Galaxy",
    brand: "Samsung",
    manufacturer: "Samsung",
    modelNumber: "Galaxy",
    category: "Phone",
    description: "Samsung smartphone",
    aliases: [
      "galaxy",
      "samsung galaxy",
      "galaxy s",
    ],
  },

  {
    id: "lg-c4",
    deviceName: "LG C4 OLED TV",
    brand: "LG",
    manufacturer: "LG",
    modelNumber: "C4",
    category: "TV",
    description: "LG OLED television",
    aliases: [
      "lg c4",
      "c4 oled",
      "lg c4 oled",
    ],
  },
  {
    id: "lg-g4",
    deviceName: "LG G4 OLED TV",
    brand: "LG",
    manufacturer: "LG",
    modelNumber: "G4",
    category: "TV",
    description: "LG OLED television",
    aliases: [
      "lg g4",
      "g4 oled",
      "lg g4 oled",
    ],
  },

  {
    id: "sony-bravia",
    deviceName: "Sony BRAVIA TV",
    brand: "Sony",
    manufacturer: "Sony",
    modelNumber: "BRAVIA",
    category: "TV",
    description: "Sony television",
    aliases: [
      "sony bravia",
      "bravia tv",
      "bravia",
    ],
  },
  {
    id: "sony-ps5",
    deviceName: "Sony PlayStation 5",
    brand: "Sony",
    manufacturer: "Sony",
    modelNumber: "PlayStation 5",
    category: "Gaming",
    description: "PlayStation game console",
    aliases: [
      "ps5",
      "playstation 5",
      "sony ps5",
    ],
  },
  {
    id: "sony-ps5-slim",
    deviceName: "Sony PlayStation 5 Slim",
    brand: "Sony",
    manufacturer: "Sony",
    modelNumber: "PlayStation 5 Slim",
    category: "Gaming",
    description: "PlayStation game console",
    aliases: [
      "ps5 slim",
      "playstation 5 slim",
    ],
  },

  {
    id: "xbox-series-x",
    deviceName: "Microsoft Xbox Series X",
    brand: "Microsoft",
    manufacturer: "Microsoft",
    modelNumber: "Xbox Series X",
    category: "Gaming",
    description: "Xbox game console",
    aliases: [
      "xbox series x",
      "series x",
    ],
  },
  {
    id: "xbox-series-s",
    deviceName: "Microsoft Xbox Series S",
    brand: "Microsoft",
    manufacturer: "Microsoft",
    modelNumber: "Xbox Series S",
    category: "Gaming",
    description: "Xbox game console",
    aliases: [
      "xbox series s",
      "series s",
    ],
  },

  {
    id: "eero-pro-6e",
    deviceName: "eero Pro 6E",
    brand: "eero",
    manufacturer: "Amazon",
    modelNumber: "Pro 6E",
    category: "Network Equipment",
    description: "Mesh Wi-Fi router",
    aliases: [
      "eero pro 6e",
      "pro 6e",
    ],
  },
  {
    id: "eero-max-7",
    deviceName: "eero Max 7",
    brand: "eero",
    manufacturer: "Amazon",
    modelNumber: "Max 7",
    category: "Network Equipment",
    description: "Mesh Wi-Fi router",
    aliases: [
      "eero max 7",
      "max 7",
    ],
  },
  {
    id: "google-nest-wifi",
    deviceName: "Google Nest Wifi",
    brand: "Google",
    manufacturer: "Google",
    modelNumber: "Nest Wifi",
    category: "Network Equipment",
    description: "Mesh Wi-Fi system",
    aliases: [
      "nest wifi",
      "google nest wifi",
    ],
  },
  {
    id: "tplink-deco",
    deviceName: "TP-Link Deco",
    brand: "TP-Link",
    manufacturer: "TP-Link",
    modelNumber: "Deco",
    category: "Network Equipment",
    description: "Mesh Wi-Fi system",
    aliases: [
      "deco",
      "tp-link deco",
      "tplink deco",
    ],
  },
  {
    id: "netgear-nighthawk",
    deviceName: "NETGEAR Nighthawk",
    brand: "NETGEAR",
    manufacturer: "NETGEAR",
    modelNumber: "Nighthawk",
    category: "Network Equipment",
    description: "Wi-Fi router",
    aliases: [
      "nighthawk",
      "netgear nighthawk",
    ],
  },

  {
    id: "ring-doorbell",
    deviceName: "Ring Video Doorbell",
    brand: "Ring",
    manufacturer: "Ring",
    modelNumber: "Video Doorbell",
    category: "Security",
    description: "Smart video doorbell",
    aliases: [
      "ring doorbell",
      "ring video doorbell",
    ],
  },
  {
    id: "nest-thermostat",
    deviceName: "Google Nest Thermostat",
    brand: "Google",
    manufacturer: "Google",
    modelNumber: "Nest Thermostat",
    category: "Smart Home",
    description: "Smart thermostat",
    aliases: [
      "nest thermostat",
      "google thermostat",
    ],
  },
  {
    id: "amazon-echo-dot",
    deviceName: "Amazon Echo Dot",
    brand: "Amazon",
    manufacturer: "Amazon",
    modelNumber: "Echo Dot",
    category: "Audio",
    description: "Alexa smart speaker",
    aliases: [
      "echo dot",
      "amazon echo dot",
      "alexa dot",
    ],
  },
  {
    id: "amazon-echo-show",
    deviceName: "Amazon Echo Show",
    brand: "Amazon",
    manufacturer: "Amazon",
    modelNumber: "Echo Show",
    category: "Smart Home",
    description: "Alexa smart display",
    aliases: [
      "echo show",
      "amazon echo show",
    ],
  },
  {
    id: "fire-tv-stick",
    deviceName: "Amazon Fire TV Stick 4K",
    brand: "Amazon",
    manufacturer: "Amazon",
    modelNumber: "Fire TV Stick 4K",
    category: "Streaming Device",
    description: "Streaming media player",
    aliases: [
      "fire stick",
      "fire tv stick",
      "fire tv stick 4k",
    ],
  },

  {
    id: "roku-ultra",
    deviceName: "Roku Ultra",
    brand: "Roku",
    manufacturer: "Roku",
    modelNumber: "Ultra",
    category: "Streaming Device",
    description: "Streaming media player",
    aliases: [
      "roku ultra",
      "ultra roku",
    ],
  },
  {
    id: "roku-stick-4k",
    deviceName: "Roku Streaming Stick 4K",
    brand: "Roku",
    manufacturer: "Roku",
    modelNumber: "Streaming Stick 4K",
    category: "Streaming Device",
    description: "Streaming media player",
    aliases: [
      "roku stick",
      "roku streaming stick",
      "roku streaming stick 4k",
    ],
  },

  {
    id: "sonos-arc",
    deviceName: "Sonos Arc",
    brand: "Sonos",
    manufacturer: "Sonos",
    modelNumber: "Arc",
    category: "Audio",
    description: "Sonos soundbar",
    aliases: [
      "sonos arc",
      "arc soundbar",
    ],
  },
  {
    id: "sonos-beam",
    deviceName: "Sonos Beam",
    brand: "Sonos",
    manufacturer: "Sonos",
    modelNumber: "Beam",
    category: "Audio",
    description: "Sonos soundbar",
    aliases: [
      "sonos beam",
      "beam soundbar",
    ],
  },
  {
    id: "sonos-era-100",
    deviceName: "Sonos Era 100",
    brand: "Sonos",
    manufacturer: "Sonos",
    modelNumber: "Era 100",
    category: "Audio",
    description: "Wireless speaker",
    aliases: [
      "era 100",
      "sonos era 100",
    ],
  },

  {
    id: "dyson-v15",
    deviceName: "Dyson V15 Detect",
    brand: "Dyson",
    manufacturer: "Dyson",
    modelNumber: "V15 Detect",
    category: "Vacuum",
    description: "Cordless vacuum",
    aliases: [
      "dyson v15",
      "v15 detect",
      "dyson v15 detect",
    ],
  },
];

const BRAND_RULES: Array<{
  brand: string;
  manufacturer?: string;
  patterns: RegExp[];
}> = [
  {
    brand: "Apple",
    patterns: [
      /\bapple\b/i,
      /\biphone\b/i,
      /\bipad\b/i,
      /\bmacbook\b/i,
      /\bimac\b/i,
      /\bhomepod\b/i,
      /\bapple\s*tv\b/i,
    ],
  },
  {
    brand: "Samsung",
    patterns: [
      /\bsamsung\b/i,
      /\bgalaxy\b/i,
      /\bs90[a-z0-9]*\b/i,
      /\bqn\d{2}[a-z0-9]*\b/i,
    ],
  },
  {
    brand: "LG",
    patterns: [/\blg\b/i],
  },
  {
    brand: "Sony",
    patterns: [
      /\bsony\b/i,
      /\bbravia\b/i,
      /\bplaystation\b/i,
      /\bps5\b/i,
      /\bps4\b/i,
    ],
  },
  {
    brand: "Microsoft",
    patterns: [/\bxbox\b/i],
  },
  {
    brand: "Google",
    patterns: [
      /\bgoogle\b/i,
      /\bnest\b/i,
      /\bchromecast\b/i,
    ],
  },
  {
    brand: "Amazon",
    patterns: [
      /\bamazon\b/i,
      /\becho\b/i,
      /\bfire\s*tv\b/i,
      /\bfire\s*stick\b/i,
    ],
  },
  {
    brand: "Ring",
    patterns: [/\bring\b/i],
  },
  {
    brand: "eero",
    manufacturer: "Amazon",
    patterns: [/\beero\b/i],
  },
  {
    brand: "NETGEAR",
    patterns: [
      /\bnetgear\b/i,
      /\bnighthawk\b/i,
    ],
  },
  {
    brand: "TP-Link",
    patterns: [
      /\btp[\s-]?link\b/i,
      /\bdeco\b/i,
    ],
  },
  {
    brand: "Roku",
    patterns: [/\broku\b/i],
  },
  {
    brand: "Sonos",
    patterns: [/\bsonos\b/i],
  },
  {
    brand: "Dyson",
    patterns: [/\bdyson\b/i],
  },
  {
    brand: "Dell",
    patterns: [/\bdell\b/i],
  },
  {
    brand: "HP",
    patterns: [
      /\bhp\b/i,
      /\blaserjet\b/i,
      /\bofficejet\b/i,
    ],
  },
  {
    brand: "Lenovo",
    patterns: [/\blenovo\b/i],
  },
  {
    brand: "ASUS",
    patterns: [/\basus\b/i],
  },
  {
    brand: "Acer",
    patterns: [/\bacer\b/i],
  },
  {
    brand: "Brother",
    patterns: [/\bbrother\b/i],
  },
  {
    brand: "Canon",
    patterns: [/\bcanon\b/i],
  },
  {
    brand: "Epson",
    patterns: [/\bepson\b/i],
  },
];

const CATEGORY_RULES: Array<{
  category: string;
  patterns: RegExp[];
}> = [
  {
    category: "Laptop",
    patterns: [
      /\blaptop\b/i,
      /\bmacbook\b/i,
      /\bthinkpad\b/i,
      /\bxps\b/i,
    ],
  },
  {
    category: "Phone",
    patterns: [
      /\biphone\b/i,
      /\bgalaxy\s+s\d/i,
      /\bphone\b/i,
      /\bpixel\s+\d/i,
    ],
  },
  {
    category: "Tablet",
    patterns: [
      /\bipad\b/i,
      /\btablet\b/i,
      /\bgalaxy\s+tab\b/i,
    ],
  },
  {
    category: "TV",
    patterns: [
      /\btv\b/i,
      /\boled\b/i,
      /\bqled\b/i,
      /\bbravia\b/i,
      /\bs90[a-z0-9]*\b/i,
      /\bqn\d{2}[a-z0-9]*\b/i,
    ],
  },
  {
    category: "Gaming",
    patterns: [
      /\bps5\b/i,
      /\bps4\b/i,
      /\bplaystation\b/i,
      /\bxbox\b/i,
      /\bnintendo\b/i,
      /\bswitch\b/i,
    ],
  },
  {
    category: "Network Equipment",
    patterns: [
      /\brouter\b/i,
      /\bmodem\b/i,
      /\bmesh\b/i,
      /\beero\b/i,
      /\bnighthawk\b/i,
      /\bdeco\b/i,
      /\baccess point\b/i,
      /\bwifi\b/i,
      /\bwi-fi\b/i,
    ],
  },
  {
    category: "Streaming Device",
    patterns: [
      /\broku\b/i,
      /\bfire\s*tv\b/i,
      /\bfire\s*stick\b/i,
      /\bchromecast\b/i,
      /\bapple\s*tv\b/i,
    ],
  },
  {
    category: "Audio",
    patterns: [
      /\bsonos\b/i,
      /\bsoundbar\b/i,
      /\bspeaker\b/i,
      /\becho\s+dot\b/i,
      /\bheadphones\b/i,
    ],
  },
  {
    category: "Security",
    patterns: [
      /\bring\b/i,
      /\bdoorbell\b/i,
      /\bcamera\b/i,
      /\bsecurity\b/i,
    ],
  },
  {
    category: "Smart Home",
    patterns: [
      /\bthermostat\b/i,
      /\bhomepod\b/i,
      /\becho\s+show\b/i,
      /\bsmart\s+plug\b/i,
      /\bsmart\s+bulb\b/i,
      /\bnest\s+hub\b/i,
    ],
  },
  {
    category: "Printer",
    patterns: [
      /\bprinter\b/i,
      /\blaserjet\b/i,
      /\bofficejet\b/i,
      /\binkjet\b/i,
    ],
  },
  {
    category: "Vacuum",
    patterns: [
      /\bvacuum\b/i,
      /\bdyson\s+v\d/i,
      /\broomba\b/i,
    ],
  },
  {
    category: "Computer",
    patterns: [
      /\bdesktop\b/i,
      /\bcomputer\b/i,
      /\bimac\b/i,
      /\bmac\s+mini\b/i,
    ],
  },
];

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function catalogScore(
  device: CatalogDevice,
  query: string
) {
  const normalizedQuery = normalize(query);

  const haystack = normalize(
    [
      device.deviceName,
      device.brand,
      device.modelNumber,
      device.category,
      ...device.aliases,
    ].join(" ")
  );

  if (!normalizedQuery) {
    return 0;
  }

  if (
    normalize(device.modelNumber) ===
    normalizedQuery
  ) {
    return 100;
  }

  if (
    device.aliases.some(
      (alias) =>
        normalize(alias) ===
        normalizedQuery
    )
  ) {
    return 95;
  }

  if (
    normalize(device.deviceName).includes(
      normalizedQuery
    )
  ) {
    return 85;
  }

  const words =
    normalizedQuery.split(" ");

  if (
    words.every((word) =>
      haystack.includes(word)
    )
  ) {
    return 70 + Math.min(words.length, 5);
  }

  return 0;
}

function detectBrand(query: string) {
  for (const rule of BRAND_RULES) {
    if (
      rule.patterns.some((pattern) =>
        pattern.test(query)
      )
    ) {
      return {
        brand: rule.brand,
        manufacturer:
          rule.manufacturer ??
          rule.brand,
      };
    }
  }

  return {
    brand: "",
    manufacturer: "",
  };
}

function detectCategory(query: string) {
  for (const rule of CATEGORY_RULES) {
    if (
      rule.patterns.some((pattern) =>
        pattern.test(query)
      )
    ) {
      return rule.category;
    }
  }

  return "";
}

function inferredResult(
  query: string
): DeviceLookupResult {
  const cleaned = query.trim();

  const {
    brand,
    manufacturer,
  } = detectBrand(cleaned);

  const category =
    detectCategory(cleaned);

  return {
    id: `inferred-${normalize(cleaned)}`,
    deviceName: cleaned,
    brand,
    manufacturer,
    modelNumber: cleaned,
    category,
    confidence: "inferred",
    description:
      brand || category
        ? [
            brand,
            category,
            "We'll use what you typed",
          ]
            .filter(Boolean)
            .join(" • ")
        : "Use what you typed and finish any missing details later",
  };
}

export function searchDeviceCatalog(
  query: string
): DeviceLookupResult[] {
  const cleaned = query.trim();

  if (cleaned.length < 2) {
    return [];
  }

  const catalogResults =
    DEVICE_CATALOG.map((device) => ({
      device,
      score: catalogScore(
        device,
        cleaned
      ),
    }))
      .filter(
        ({ score }) => score > 0
      )
      .sort(
        (a, b) =>
          b.score - a.score
      )
      .slice(0, 5)
      .map(
        ({ device }): DeviceLookupResult => ({
          id: device.id,
          deviceName:
            device.deviceName,
          brand: device.brand,
          manufacturer:
            device.manufacturer,
          modelNumber:
            device.modelNumber,
          category:
            device.category,
          description:
            device.description,
          confidence: "catalog",
        })
      );

  const fallback =
    inferredResult(cleaned);

  const duplicateFallback =
    catalogResults.some(
      (result) =>
        normalize(
          result.deviceName
        ) ===
        normalize(
          fallback.deviceName
        )
    );

  if (
    !duplicateFallback &&
    catalogResults.length < 5
  ) {
    catalogResults.push(fallback);
  }

  return catalogResults;
}
