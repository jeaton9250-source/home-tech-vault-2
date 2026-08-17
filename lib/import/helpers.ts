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
    "Haier",
    "Miele",
  ];

  for (const brand of brands) {
    const escaped =
      brand.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

    const pattern =
      new RegExp(
        `\\b${escaped}\\b`,
        "i"
      );

    if (pattern.test(text)) {
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
    value.includes(" monitor ") ||
    value.includes(" ultrawide ") ||
    value.includes(
      "computer display"
    )
  ) {
    return "Monitor";
  }

  if (
    value.includes(
      "television"
    ) ||
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
    ) ||
    value.includes(
      "video camera"
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
    value.includes(" speaker ")
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
      "playstation"
    ) ||
    value.includes(" xbox ") ||
    value.includes(
      "nintendo switch"
    ) ||
    value.includes(
      "game console"
    )
  ) {
    return "Gaming";
  }

  if (
    value.includes(
      "smart home"
    ) ||
    value.includes(
      "smart hub"
    )
  ) {
    return "Smart Home";
  }

  return "Other";
}

export function detectModelNumber(
  text: string
): string | null {
  const patterns = [
    /model(?:\s+number|\s+#|\s+no\.?)?\s*:?\s*([A-Z0-9][A-Z0-9._/-]{3,})/i,

    /model\s+([A-Z0-9][A-Z0-9._/-]{4,})\b/i,

    /(?:model|model number)\s*[-–—]\s*([A-Z0-9][A-Z0-9._/-]{3,})/i,
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

    /\bserial\s*[-–—]\s*([A-Z0-9][A-Z0-9._/-]{4,})/i,
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
      line
        .trim()

        /*
          Remove Markdown heading symbols.
        */
        .replace(
          /^#+\s*/,
          ""
        )

        /*
          Remove basic Markdown bullet markers.
        */
        .replace(
          /^[-*]\s*/,
          ""
        )

        .trim()
    )
    .filter(Boolean);

  const usefulWords = [
    "tv",
    "television",
    "oled",
    "qled",
    "monitor",
    "ultrawide",
    "ultra wide",
    "display",
    "gaming monitor",
    "refrigerator",
    "fridge",
    "washer",
    "dryer",
    "dishwasher",
    "laptop",
    "desktop",
    "computer",
    "macbook",
    "router",
    "wifi",
    "wi-fi",
    "mesh",
    "camera",
    "doorbell",
    "thermostat",
    "soundbar",
    "speaker",
    "vacuum",
    "playstation",
    "xbox",
    "nintendo",
    "console",
  ];

  /*
    These are lines that might mention
    a product brand but are almost
    certainly NOT the product name.
  */
  const badWords = [
    "subtotal",
    "order total",
    "total:",
    "shipping",
    "sales tax",
    "payment",
    "delivery",
    "tracking",
    "warranty plan",
    "protection plan",
    "gift card",
    "order confirmation",
    "order number",
    "order date",
    "purchase date",

    /*
      Forwarded email / Markdown
      image descriptions.
    */
    "[image:",
    "image:",
    "product image",
    "image for:",
    "product image for",
    "alt text",

    /*
      Common email navigation/junk.
    */
    "view in browser",
    "unsubscribe",
    "privacy policy",
    "customer service",
    "contact us",
    "shop now",
    "see details",
    "view order",
    "manage order",
    "track package",
    "track order",
  ];

  const candidates = lines
    .filter((line) => {
      const lower =
        line.toLowerCase();

      /*
        Too short or way too long
        to reasonably be a product name.
      */
      if (
        line.length < 8 ||
        line.length > 220
      ) {
        return false;
      }

      /*
        Ignore Markdown images.

        Examples:

        ![LG Monitor](...)
        [image: Product Image For: LG - 34]
      */
      if (
        lower.startsWith("![") ||
        lower.startsWith("[image") ||
        lower.includes(
          "product image"
        ) ||
        lower.includes(
          "image for:"
        )
      ) {
        return false;
      }

      /*
        Don't mistake URLs for products.
      */
      if (
        lower.startsWith(
          "http://"
        ) ||
        lower.startsWith(
          "https://"
        ) ||
        lower.includes(
          "www."
        )
      ) {
        return false;
      }

      /*
        Ignore obvious email/order
        metadata.
      */
      if (
        badWords.some((word) =>
          lower.includes(word)
        )
      ) {
        return false;
      }

      /*
        Ignore lines that are mostly
        punctuation.
      */
      const alphanumeric =
        line.replace(
          /[^a-z0-9]/gi,
          ""
        );

      if (
        alphanumeric.length < 5
      ) {
        return false;
      }

      return true;
    })

    .map((line) => {
      const lower =
        line.toLowerCase();

      let score = 0;

      /*
        Category/product words are
        a very strong signal.
      */
      for (
        const word of usefulWords
      ) {
        if (
          lower.includes(word)
        ) {
          score += 4;
        }
      }

      /*
        Brand name is also a
        strong signal.
      */
      if (
        brand &&
        lower.includes(
          brand.toLowerCase()
        )
      ) {
        score += 5;
      }

      /*
        Product names commonly contain
        sizes like:

        34"
        65"
        27-inch
        34 inch
      */
      if (
        /\b\d{2,3}(?:\.\d+)?\s*(?:"|”|inch|inches|-inch)\b/i.test(
          line
        )
      ) {
        score += 4;
      }

      /*
        Resolution wording is common
        in TVs and monitors.
      */
      if (
        /\b(4k|8k|uhd|qhd|wqhd|fhd|1080p|1440p|2160p)\b/i.test(
          line
        )
      ) {
        score += 3;
      }

      /*
        Monitor-related terms.
      */
      if (
        /\b(ips|oled|qled|ultrawide|gaming|curved)\b/i.test(
          line
        )
      ) {
        score += 2;
      }

      /*
        Model-like strings make a line
        more likely to describe a product.
      */
      if (
        /\b[A-Z]{1,5}[A-Z0-9-]{4,}\b/i.test(
          line
        )
      ) {
        score += 2;
      }

      /*
        Typical descriptive product
        title length.
      */
      if (
        line.length >= 20 &&
        line.length <= 160
      ) {
        score += 1;
      }

      /*
        Penalize lines that look like
        generic order metadata.
      */
      if (
        /\b(order|confirmation|thank you|receipt)\b/i.test(
          line
        )
      ) {
        score -= 3;
      }

      return {
        line,
        score,
      };
    })

    /*
      Do not accept a candidate with
      effectively no useful signals.
    */
    .filter(
      (candidate) =>
        candidate.score >= 4
    )

    .sort(
      (a, b) =>
        b.score - a.score
    );

  const best =
    candidates[0];

  if (!best) {
    return null;
  }

  return best.line
    /*
      Clean brackets sometimes left
      over from forwarded email text.
    */
    .replace(
      /^\[|\]$/g,
      ""
    )

    /*
      Remove trailing Markdown link URLs
      if something like this appears:

      LG Monitor (https://...)
    */
    .replace(
      /\s*\(https?:\/\/[^)]+\)\s*$/i,
      ""
    )

    .replace(
      /\s{2,}/g,
      " "
    )

    .trim();
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

  if (retailer) {
    score += 0.1;
  }

  if (orderNumber) {
    score += 0.1;
  }

  if (purchaseDate) {
    score += 0.15;
  }

  if (purchasePrice) {
    score += 0.15;
  }

  if (modelNumber) {
    score += 0.2;
  }

  if (brand) {
    score += 0.15;
  }

  if (deviceName) {
    score += 0.15;
  }

  return Number(
    Math.min(
      score,
      1
    ).toFixed(4)
  );
}