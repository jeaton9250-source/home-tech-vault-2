export function normalizeText(value: string) {
  return value
    .replace(/\r/g, "")
    .replace(/\t/g, " ")
    .replace(/\u00a0/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function cleanValue(value: string) {
  return value
    .trim()
    .replace(/[.,;:]+$/, "");
}

export function normalizeDate(
  value: string
): string | null {
  const parsed = new Date(value);

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return null;
  }

  return parsed
    .toISOString()
    .slice(0, 10);
}

export function parseMoney(
  value: string | undefined
): number | null {
  if (!value) {
    return null;
  }

  const amount = Number(
    value
      .replace(/[$,]/g, "")
      .trim()
  );

  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    return null;
  }

  return amount;
}

export function detectBrand(
  text: string
): string | null {
  const brands = [
    "Samsung",
    "LG",
    "Sony",
    "Apple",
    "Dell",
    "HP",
    "Lenovo",
    "Asus",
    "Acer",
    "Microsoft",
    "Amazon",
    "Google",
    "Ring",
    "Arlo",
    "Nest",
    "Netgear",
    "TP-Link",
    "Eero",
    "Linksys",
    "Whirlpool",
    "Maytag",
    "GE",
    "Bosch",
    "Frigidaire",
    "KitchenAid",
    "Electrolux",
    "Dyson",
    "Shark",
    "Roku",
    "TCL",
    "Hisense",
    "Vizio",
    "Insignia",
    "Hisense",
    "Haier",
    "Miele",
  ];

  for (const brand of brands) {
    const escaped =
      brand.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

    if (
      new RegExp(
        `\\b${escaped}\\b`,
        "i"
      ).test(text)
    ) {
      return brand;
    }
  }

  return null;
}

export function detectCategory(
  text: string
): string {
  const value =
    ` ${text.toLowerCase()} `;

  if (
    value.includes(
      "refrigerator"
    ) ||
    value.includes(" fridge ")
  ) {
    return "Refrigerator";
  }

  if (
    value.includes(" television ") ||
    value.includes(" tv ") ||
    value.includes(" oled ") ||
    value.includes(" qled ")
  ) {
    return "TV";
  }

  if (
    value.includes(" washer ")
  ) {
    return "Washer";
  }

  if (
    value.includes(" dryer ")
  ) {
    return "Dryer";
  }

  if (
    value.includes(
      "dishwasher"
    )
  ) {
    return "Dishwasher";
  }

  if (
    value.includes(" laptop ") ||
    value.includes(" macbook ")
  ) {
    return "Laptop";
  }

  if (
    value.includes(" desktop ") ||
    value.includes(" imac ")
  ) {
    return "Computer";
  }

  if (
    value.includes(" monitor ")
  ) {
    return "Monitor";
  }

  if (
    value.includes(" router ") ||
    value.includes(
      "mesh wi-fi"
    ) ||
    value.includes(
      "mesh wifi"
    )
  ) {
    return "Router";
  }

  if (
    value.includes(" doorbell ") ||
    value.includes(
      "security camera"
    )
  ) {
    return "Security";
  }

  if (
    value.includes(
      "thermostat"
    )
  ) {
    return "Smart Home";
  }

  if (
    value.includes(" soundbar ")
  ) {
    return "Audio";
  }

  if (
    value.includes(" vacuum ")
  ) {
    return "Vacuum";
  }

  if (
    value.includes(
      "game console"
    ) ||
    value.includes(
      "playstation"
    ) ||
    value.includes(" xbox ") ||
    value.includes(
      "nintendo switch"
    )
  ) {
    return "Gaming";
  }

  return "Other";
}

export function detectModelNumber(
  text: string
): string | null {
  const patterns = [
    /model(?:\s+number|\s+#|\s+no\.?)?\s*:?\s*([A-Z0-9][A-Z0-9._/-]{3,})/i,
    /model\s+([A-Z0-9][A-Z0-9._/-]{4,})/i,
  ];

  for (const pattern of patterns) {
    const match =
      text.match(pattern);

    if (match?.[1]) {
      return cleanValue(
        match[1]
      );
    }
  }

  return null;
}

export function detectSerialNumber(
  text: string
): string | null {
  const patterns = [
    /serial(?:\s+number|\s+#|\s+no\.?)?\s*:?\s*([A-Z0-9][A-Z0-9._/-]{4,})/i,
    /\bs\/n\s*:?\s*([A-Z0-9][A-Z0-9._/-]{4,})/i,
  ];

  for (const pattern of patterns) {
    const match =
      text.match(pattern);

    if (match?.[1]) {
      return cleanValue(
        match[1]
      );
    }
  }

  return null;
}

export function findLikelyProductName(
  text: string,
  brand?: string | null
): string | null {
  const lines = text
    .split("\n")
    .map((line) =>
      line.trim()
    )
    .filter(Boolean);

  const usefulWords = [
    "tv",
    "oled",
    "qled",
    "refrigerator",
    "fridge",
    "washer",
    "dryer",
    "dishwasher",
    "laptop",
    "desktop",
    "monitor",
    "router",
    "wifi",
    "wi-fi",
    "camera",
    "doorbell",
    "thermostat",
    "soundbar",
    "speaker",
    "vacuum",
    "playstation",
    "xbox",
  ];

  const badWords = [
    "subtotal",
    "order total",
    "shipping",
    "sales tax",
    "payment",
    "delivery",
    "tracking",
    "warranty plan",
    "protection plan",
    "gift card",
  ];

  const likely =
    lines.find((line) => {
      const lower =
        line.toLowerCase();

      if (
        line.length < 8 ||
        line.length > 180
      ) {
        return false;
      }

      if (
        badWords.some((word) =>
          lower.includes(word)
        )
      ) {
        return false;
      }

      const hasUsefulWord =
        usefulWords.some((word) =>
          lower.includes(word)
        );

      const hasBrand =
        brand
          ? lower.includes(
              brand.toLowerCase()
            )
          : false;

      return (
        hasUsefulWord ||
        hasBrand
      );
    });

  return likely ?? null;
}

export function calculateConfidence({
  retailer,
  orderNumber,
  purchaseDate,
  purchasePrice,
  modelNumber,
  brand,
  deviceName,
}: {
  retailer: string | null;
  orderNumber: string | null;
  purchaseDate: string | null;
  purchasePrice: number | null;
  modelNumber: string | null;
  brand: string | null;
  deviceName: string | null;
}) {
  let score = 0;

  if (retailer) score += 0.1;
  if (orderNumber) score += 0.1;
  if (purchaseDate) score += 0.15;
  if (purchasePrice) score += 0.15;
  if (modelNumber) score += 0.2;
  if (brand) score += 0.15;
  if (deviceName) score += 0.15;

  return Number(
    Math.min(
      score,
      1
    ).toFixed(4)
  );
}