import { parseOrderItems } from "@/lib/import/parseOrderItems";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

type ImportRequestBody = {
  rawText?: string;
  subject?: string;
  senderEmail?: string;
  sourceMessageId?: string;
};

type ParsedImport = {
  retailer: string | null;
  orderNumber: string | null;
  deviceName: string | null;
  category: string | null;
  brand: string | null;
  manufacturer: string | null;
  modelNumber: string | null;
  serialNumber: string | null;
  purchaseDate: string | null;
  purchasePrice: number | null;
  confidence: number;
};

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },

          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(
                ({ name, value, options }) => {
                  cookieStore.set(name, value, options);
                }
              );
            } catch {
              // Safe to ignore when cookies cannot be mutated.
            }
          },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    let body: ImportRequestBody;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: "Request body must be valid JSON.",
        },
        {
          status: 400,
        }
      );
    }

    const rawText = body.rawText?.trim();

    if (!rawText) {
      return NextResponse.json(
        {
          error: "rawText is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (rawText.length > 100_000) {
      return NextResponse.json(
        {
          error: "Order text is too large.",
        },
        {
          status: 413,
        }
      );
    }

    const parsedItems =
      await parseOrderItems(
        rawText
      );

    /*
      Try to resolve the user's household ID
      from an existing device.

      This is more reliable than assuming
      household_id lives in user_metadata.
    */
    let householdId: string | null = null;

    const {
      data: existingDevice,
      error: householdLookupError,
    } = await supabase
      .from("devices")
      .select("household_id")
      .eq("user_id", user.id)
      .not("household_id", "is", null)
      .limit(1)
      .maybeSingle();

    if (householdLookupError) {
      console.error(
        "Unable to resolve household for import:",
        householdLookupError
      );
    }

    householdId =
      existingDevice?.household_id ?? null;

    if (
      parsedItems.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "No importable devices were found.",
        },
        {
          status: 422,
        }
      );
    }

    const importRows =
      parsedItems.map(
        (item, index) => ({
          user_id:
            user.id,

          household_id:
            householdId,

          source: "email",

          source_message_id:
            body.sourceMessageId?.trim()
              ? `${body.sourceMessageId.trim()}:${index + 1}`
              : null,

          sender_email:
            body.senderEmail?.trim() ||
            null,

          subject:
            body.subject?.trim() ||
            null,

          retailer:
            item.retailer,

          order_number:
            item.orderNumber,

          device_name:
            item.deviceName,

          category:
            item.category,

          brand:
            item.brand,

          manufacturer:
            item.manufacturer,

          model_number:
            item.modelNumber,

          serial_number:
            item.serialNumber,

          purchase_date:
            item.purchaseDate,

          purchase_price:
            item.purchasePrice,

          confidence:
            item.confidence,

          extraction_notes:
            "Parsed using Smart Import multi-device extraction.",

          raw_text:
            rawText,

          raw_data: {
            parsedItem: item,
            totalDeviceItems:
              parsedItems.length,
          },

          status: "pending",

          updated_at:
            new Date().toISOString(),
        })
      );

    const {
      data: createdImports,
      error: insertError,
    } = await supabase
      .from("device_imports")
      .insert(importRows)
      .select("*");

    const createdImport =
      createdImports?.[0] ??
      null;

    if (insertError) {
      console.error(
        "Smart Import insert error:",
        insertError
      );

      if (
        insertError.code === "23505"
      ) {
        return NextResponse.json(
          {
            error:
              "This email has already been imported.",
          },
          {
            status: 409,
          }
        );
      }

      return NextResponse.json(
        {
          error:
            "Unable to save imported device.",

          details:
            process.env.NODE_ENV ===
            "development"
              ? insertError.message
              : undefined,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        import:
          createdImport,

        imports:
          createdImports ?? [],

        deviceCount:
          createdImports?.length ??
          0,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Smart Import unexpected error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while importing the order.",
      },
      {
        status: 500,
      }
    );
  }
}

function parseOrderConfirmation(
  rawText: string
): ParsedImport {
  const normalized =
    normalizeText(rawText);

  const retailer =
    detectRetailer(normalized);

  const orderNumber =
    detectOrderNumber(normalized);

  const purchaseDate =
    detectPurchaseDate(normalized);

  const purchasePrice =
    detectPurchasePrice(normalized);

  const modelNumber =
    detectModelNumber(normalized);

  const serialNumber =
    detectSerialNumber(normalized);

  const brand =
    detectBrand(normalized);

  const deviceName =
    detectDeviceName(
      normalized,
      brand,
      modelNumber
    );

  const category =
    detectCategory(
      normalized,
      deviceName
    );

  const confidence =
    calculateConfidence({
      retailer,
      purchaseDate,
      purchasePrice,
      modelNumber,
      brand,
      deviceName,
    });

  return {
    retailer,
    orderNumber,
    deviceName,
    category,
    brand,
    manufacturer: brand,
    modelNumber,
    serialNumber,
    purchaseDate,
    purchasePrice,
    confidence,
  };
}

function normalizeText(
  value: string
) {
  return value
    .replace(/\r/g, "")
    .replace(/\t/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function detectRetailer(
  text: string
): string | null {
  const retailers: Array<{
    pattern: RegExp;
    name: string;
  }> = [
    {
      pattern: /\bbest\s*buy\b/i,
      name: "Best Buy",
    },
    {
      pattern: /\bamazon\b/i,
      name: "Amazon",
    },
    {
      pattern: /\bhome\s*depot\b/i,
      name: "Home Depot",
    },
    {
      pattern: /\blowe'?s\b/i,
      name: "Lowe's",
    },
    {
      pattern: /\bwalmart\b/i,
      name: "Walmart",
    },
    {
      pattern: /\bcostco\b/i,
      name: "Costco",
    },
    {
      pattern: /\btarget\b/i,
      name: "Target",
    },
    {
      pattern: /\bapple\b/i,
      name: "Apple",
    },
    {
      pattern: /\bsamsung\b/i,
      name: "Samsung",
    },
  ];

  for (const retailer of retailers) {
    if (
      retailer.pattern.test(text)
    ) {
      return retailer.name;
    }
  }

  return null;
}

function detectOrderNumber(
  text: string
): string | null {
  const patterns = [
    /order\s*(?:number|#|no\.?)\s*[:#]?\s*([A-Z0-9-]{5,})/i,
    /order\s+([A-Z0-9-]{8,})/i,
  ];

  for (const pattern of patterns) {
    const match =
      text.match(pattern);

    if (match?.[1]) {
      return cleanValue(match[1]);
    }
  }

  return null;
}

function detectPurchaseDate(
  text: string
): string | null {
  const labelledPatterns = [
    /(?:order date|purchase date|purchased|ordered)\s*:?\s*([A-Za-z]{3,9}\s+\d{1,2},\s+\d{4})/i,
    /(?:order date|purchase date|purchased|ordered)\s*:?\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
    /(?:order date|purchase date|purchased|ordered)\s*:?\s*(\d{4}-\d{2}-\d{2})/i,
  ];

  for (
    const pattern of labelledPatterns
  ) {
    const match =
      text.match(pattern);

    if (match?.[1]) {
      return normalizeDate(
        match[1]
      );
    }
  }

  const fallback =
    text.match(
      /\b([A-Za-z]{3,9}\s+\d{1,2},\s+\d{4})\b/
    );

  if (fallback?.[1]) {
    return normalizeDate(
      fallback[1]
    );
  }

  return null;
}

function normalizeDate(
  value: string
): string {
  const parsed = new Date(value);

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return value.trim();
  }

  return parsed
    .toISOString()
    .slice(0, 10);
}

function detectPurchasePrice(
  text: string
): number | null {
  const labelledPatterns = [
    /(?:item total|order total|total|price|subtotal)\s*:?\s*\$?\s*([\d,]+\.\d{2})/i,
    /\$\s*([\d,]+\.\d{2})/,
  ];

  for (
    const pattern of labelledPatterns
  ) {
    const match =
      text.match(pattern);

    if (match?.[1]) {
      const amount = Number(
        match[1].replace(
          /,/g,
          ""
        )
      );

      if (
        Number.isFinite(amount) &&
        amount > 0
      ) {
        return amount;
      }
    }
  }

  return null;
}

function detectModelNumber(
  text: string
): string | null {
  const patterns = [
    /model(?:\s+number|\s+#|\s+no\.?)?\s*:?\s*([A-Z0-9][A-Z0-9._/-]{3,})/i,
    /\bmodel\s+([A-Z0-9][A-Z0-9._/-]{4,})\b/i,
  ];

  for (const pattern of patterns) {
    const match =
      text.match(pattern);

    if (match?.[1]) {
      return cleanValue(match[1]);
    }
  }

  return null;
}

function detectSerialNumber(
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
      return cleanValue(match[1]);
    }
  }

  return null;
}

function detectBrand(
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

function detectDeviceName(
  text: string,
  brand: string | null,
  modelNumber: string | null
): string | null {
  const lines = text
    .split("\n")
    .map((line) =>
      line.trim()
    )
    .filter(Boolean);

  const categoryWords = [
    "tv",
    "television",
    "oled",
    "qled",
    "refrigerator",
    "fridge",
    "washer",
    "dryer",
    "dishwasher",
    "laptop",
    "desktop",
    "computer",
    "router",
    "camera",
    "doorbell",
    "thermostat",
    "monitor",
    "soundbar",
    "speaker",
    "vacuum",
  ];

  const likelyLine =
    lines.find((line) => {
      const lower =
        line.toLowerCase();

      const hasCategory =
        categoryWords.some(
          (word) =>
            lower.includes(word)
        );

      const hasBrand =
        brand
          ? lower.includes(
              brand.toLowerCase()
            )
          : false;

      return (
        line.length >= 8 &&
        line.length <= 140 &&
        (hasCategory ||
          hasBrand)
      );
    });

  if (likelyLine) {
    return cleanProductLine(
      likelyLine
    );
  }

  if (
    brand &&
    modelNumber
  ) {
    return `${brand} ${modelNumber}`;
  }

  if (brand) {
    return `${brand} Device`;
  }

  return null;
}

function cleanProductLine(
  value: string
) {
  return value
    .replace(
      /^(item|product)\s*:?\s*/i,
      ""
    )
    .replace(
      /\s{2,}/g,
      " "
    )
    .trim();
}

function detectCategory(
  text: string,
  deviceName: string | null
): string | null {
  const haystack =
    `${deviceName ?? ""} ${text}`
      .toLowerCase();

  const categories: Array<{
    words: string[];
    category: string;
  }> = [
    {
      words: [
        "television",
        " tv ",
        "oled",
        "qled",
      ],
      category: "TV",
    },
    {
      words: [
        "refrigerator",
        "fridge",
      ],
      category:
        "Refrigerator",
    },
    {
      words: ["washer"],
      category: "Washer",
    },
    {
      words: ["dryer"],
      category: "Dryer",
    },
    {
      words: ["dishwasher"],
      category:
        "Dishwasher",
    },
    {
      words: [
        "laptop",
        "macbook",
      ],
      category: "Laptop",
    },
    {
      words: [
        "desktop",
        "computer",
        "imac",
      ],
      category: "Computer",
    },
    {
      words: [
        "router",
        "wifi router",
        "wi-fi router",
        "mesh wifi",
        "mesh wi-fi",
      ],
      category: "Router",
    },
    {
      words: [
        "doorbell",
        "security camera",
        "camera",
      ],
      category: "Security",
    },
    {
      words: [
        "thermostat",
      ],
      category: "Smart Home",
    },
    {
      words: ["soundbar"],
      category: "Audio",
    },
    {
      words: [
        "vacuum",
        "robot vacuum",
      ],
      category: "Vacuum",
    },
  ];

  for (const item of categories) {
    if (
      item.words.some(
        (word) =>
          haystack.includes(
            word
          )
      )
    ) {
      return item.category;
    }
  }

  return "Other";
}

function calculateConfidence({
  retailer,
  purchaseDate,
  purchasePrice,
  modelNumber,
  brand,
  deviceName,
}: {
  retailer: string | null;
  purchaseDate: string | null;
  purchasePrice: number | null;
  modelNumber: string | null;
  brand: string | null;
  deviceName: string | null;
}) {
  let score = 0;

  if (retailer) {
    score += 0.12;
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
    score += 0.18;
  }

  if (deviceName) {
    score += 0.2;
  }

  return Math.min(
    1,
    Number(
      score.toFixed(4)
    )
  );
}

function cleanValue(
  value: string
) {
  return value
    .trim()
    .replace(
      /[.,;:]+$/,
      ""
    );
}