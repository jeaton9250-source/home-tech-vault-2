import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(
  process.env.RESEND_API_KEY!
);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type ResendReceivedEvent = {
  type: string;

  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string | null;
    message_id?: string | null;
  };
};

export async function POST(
  request: NextRequest
) {
  try {
    /*
      IMPORTANT:
      Verify the raw webhook body before
      processing anything.
    */
    const rawBody =
      await request.text();

    const svixId =
      request.headers.get("svix-id");

    const svixTimestamp =
      request.headers.get(
        "svix-timestamp"
      );

    const svixSignature =
      request.headers.get(
        "svix-signature"
      );

    if (
      !svixId ||
      !svixTimestamp ||
      !svixSignature
    ) {
      return NextResponse.json(
        {
          error:
            "Missing webhook headers.",
        },
        {
          status: 400,
        }
      );
    }

    let event: ResendReceivedEvent;

    try {
      event =
        resend.webhooks.verify({
          payload: rawBody,

          headers: {
            id: svixId,
            timestamp:
              svixTimestamp,
            signature:
              svixSignature,
          },

          webhookSecret:
            process.env
              .RESEND_WEBHOOK_SECRET!,
        }) as ResendReceivedEvent;
    } catch (error) {
      console.error(
        "Invalid Resend webhook:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Invalid webhook signature.",
        },
        {
          status: 401,
        }
      );
    }

    if (
      event.type !==
      "email.received"
    ) {
      return NextResponse.json({
        received: true,
      });
    }

    const recipient =
      event.data.to?.[0];

    if (!recipient) {
      return NextResponse.json(
        {
          error:
            "No recipient found.",
        },
        {
          status: 400,
        }
      );
    }

    /*
      Example:
      jason-test-01@fuevwun.resend.app

      Extract:
      jason-test-01
    */
    const token =
      recipient
        .split("@")[0]
        ?.trim()
        .toLowerCase();

    if (!token) {
      return NextResponse.json(
        {
          error:
            "Unable to determine import token.",
        },
        {
          status: 400,
        }
      );
    }

    /*
      Find who owns this forwarding address.
    */
    const {
      data: importAddress,
      error:
        importAddressError,
    } = await supabaseAdmin
      .from("import_addresses")
      .select(
        "user_id, household_id, token"
      )
      .eq("token", token)
      .single();

    if (
      importAddressError ||
      !importAddress
    ) {
      console.error(
        "Unknown import address:",
        token,
        importAddressError
      );

      /*
        Return 200 so Resend doesn't
        retry an email for an address
        we intentionally don't recognize.
      */
      return NextResponse.json({
        received: true,
        ignored: true,
      });
    }

    /*
      Fetch full email content.

      Resend's webhook does NOT contain
      the actual email body.
    */
    const {
      data: receivedEmail,
      error: emailError,
    } =
      await resend.emails.receiving.get(
        event.data.email_id
      );

    if (
      emailError ||
      !receivedEmail
    ) {
      console.error(
        "Unable to fetch received email:",
        emailError
      );

      return NextResponse.json(
        {
          error:
            "Unable to retrieve email contents.",
        },
        {
          status: 500,
        }
      );
    }

    const rawText =
      receivedEmail.text ||
      stripHtml(
        receivedEmail.html || ""
      );

    if (!rawText.trim()) {
      return NextResponse.json(
        {
          error:
            "Received email had no readable content.",
        },
        {
          status: 400,
        }
      );
    }

    const parsed =
      parseOrderConfirmation(
        rawText
      );

    const {
      data: createdImport,
      error: insertError,
    } = await supabaseAdmin
      .from("device_imports")
      .insert({
        user_id:
          importAddress.user_id,

        household_id:
          importAddress.household_id,

        source: "email",

        source_message_id:
          event.data.email_id,

        sender_email:
          event.data.from,

        subject:
          event.data.subject,

        retailer:
          parsed.retailer,

        order_number:
          parsed.orderNumber,

        device_name:
          parsed.deviceName,

        category:
          parsed.category,

        brand:
          parsed.brand,

        manufacturer:
          parsed.manufacturer,

        model_number:
          parsed.modelNumber,

        serial_number:
          parsed.serialNumber,

        purchase_date:
          parsed.purchaseDate,

        purchase_price:
          parsed.purchasePrice,

        confidence:
          parsed.confidence,

        extraction_notes:
          "Imported from a forwarded email received through Resend.",

        raw_text: rawText,

        raw_data: {
          resend_email_id:
            event.data.email_id,

          recipient,
          parsed,
        },

        status: "pending",

        updated_at:
          new Date().toISOString(),
      })
      .select("*")
      .single();

    if (insertError) {
      /*
        Duplicate protection:
        source_message_id already exists.
      */
      if (
        insertError.code ===
        "23505"
      ) {
        return NextResponse.json({
          received: true,
          duplicate: true,
        });
      }

      console.error(
        "Unable to create import:",
        insertError
      );

      return NextResponse.json(
        {
          error:
            "Unable to create Smart Import.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      received: true,
      importId:
        createdImport.id,
    });
  } catch (error) {
    console.error(
      "Inbound Resend webhook error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unexpected inbound email error.",
      },
      {
        status: 500,
      }
    );
  }
}

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

function stripHtml(
  value: string
) {
  return value
    .replace(
      /<style[\s\S]*?<\/style>/gi,
      " "
    )
    .replace(
      /<script[\s\S]*?<\/script>/gi,
      " "
    )
    .replace(
      /<br\s*\/?>/gi,
      "\n"
    )
    .replace(
      /<\/p>/gi,
      "\n"
    )
    .replace(
      /<[^>]+>/g,
      " "
    )
    .replace(
      /&nbsp;/gi,
      " "
    )
    .replace(
      /&amp;/gi,
      "&"
    )
    .replace(
      /\s+\n/g,
      "\n"
    )
    .replace(
      /\n\s+/g,
      "\n"
    )
    .trim();
}

function detectRetailer(
  text: string
): string | null {
  const retailers = [
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
      return cleanValue(
        match[1]
      );
    }
  }

  return null;
}

function detectPurchaseDate(
  text: string
): string | null {
  const patterns = [
    /(?:order date|purchase date|purchased|ordered)\s*:?\s*([A-Za-z]{3,9}\s+\d{1,2},\s+\d{4})/i,
    /(?:order date|purchase date|purchased|ordered)\s*:?\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
    /(?:order date|purchase date|purchased|ordered)\s*:?\s*(\d{4}-\d{2}-\d{2})/i,
  ];

  for (const pattern of patterns) {
    const match =
      text.match(pattern);

    if (match?.[1]) {
      return normalizeDate(
        match[1]
      );
    }
  }

  return null;
}

function normalizeDate(
  value: string
) {
  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value.trim();
  }

  return date
    .toISOString()
    .slice(0, 10);
}

function detectPurchasePrice(
  text: string
): number | null {
  const patterns = [
    /(?:item total|order total|total|price|subtotal)\s*:?\s*\$?\s*([\d,]+\.\d{2})/i,
    /\$\s*([\d,]+\.\d{2})/,
  ];

  for (const pattern of patterns) {
    const match =
      text.match(pattern);

    if (match?.[1]) {
      const amount =
        Number(
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
  const match =
    text.match(
      /model(?:\s+number|\s+#|\s+no\.?)?\s*:?\s*([A-Z0-9][A-Z0-9._/-]{3,})/i
    );

  return match?.[1]
    ? cleanValue(match[1])
    : null;
}

function detectSerialNumber(
  text: string
): string | null {
  const match =
    text.match(
      /serial(?:\s+number|\s+#|\s+no\.?)?\s*:?\s*([A-Z0-9][A-Z0-9._/-]{4,})/i
    );

  return match?.[1]
    ? cleanValue(match[1])
    : null;
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
    const pattern =
      new RegExp(
        `\\b${brand.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        )}\\b`,
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

  const words = [
    "tv",
    "oled",
    "qled",
    "refrigerator",
    "fridge",
    "washer",
    "dryer",
    "dishwasher",
    "laptop",
    "computer",
    "router",
    "camera",
    "doorbell",
    "thermostat",
    "soundbar",
    "vacuum",
  ];

  const match =
    lines.find((line) => {
      const lower =
        line.toLowerCase();

      return (
        line.length >= 8 &&
        line.length <= 160 &&
        words.some((word) =>
          lower.includes(word)
        )
      );
    });

  if (match) {
    return match;
  }

  if (
    brand &&
    modelNumber
  ) {
    return `${brand} ${modelNumber}`;
  }

  return brand
    ? `${brand} Device`
    : null;
}

function detectCategory(
  text: string,
  deviceName: string | null
): string {
  const value =
    `${deviceName ?? ""} ${text}`
      .toLowerCase();

  if (
    value.includes(
      "refrigerator"
    ) ||
    value.includes("fridge")
  ) {
    return "Refrigerator";
  }

  if (
    value.includes("oled") ||
    value.includes("qled") ||
    value.includes(
      "television"
    ) ||
    value.includes(" tv ")
  ) {
    return "TV";
  }

  if (value.includes("washer")) {
    return "Washer";
  }

  if (value.includes("dryer")) {
    return "Dryer";
  }

  if (
    value.includes("dishwasher")
  ) {
    return "Dishwasher";
  }

  if (
    value.includes("laptop") ||
    value.includes("macbook")
  ) {
    return "Laptop";
  }

  if (value.includes("router")) {
    return "Router";
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

  if (retailer) score += 0.12;
  if (purchaseDate) score += 0.15;
  if (purchasePrice) score += 0.15;
  if (modelNumber) score += 0.2;
  if (brand) score += 0.18;
  if (deviceName) score += 0.2;

  return Math.min(
    1,
    Number(score.toFixed(4))
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