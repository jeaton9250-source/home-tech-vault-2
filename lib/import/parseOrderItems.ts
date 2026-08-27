import {
  parseOrderConfirmation,
} from "@/lib/import/parseOrder";

import type {
  ParsedOrder,
} from "@/lib/import/types";

type AiReceiptItem = {
  itemType?: string | null;
  deviceName?: string | null;
  category?: string | null;
  brand?: string | null;
  manufacturer?: string | null;
  modelNumber?: string | null;
  serialNumber?: string | null;
  quantity?: number | null;
  unitPrice?: number | null;
  confidence?: number | null;
};

type AiReceiptResult = {
  retailer?: string | null;
  orderNumber?: string | null;
  purchaseDate?: string | null;
  items?: AiReceiptItem[];
};

type OpenAiResponse = {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
};

function cleanString(
  value: unknown
): string | null {
  if (
    typeof value !== "string"
  ) {
    return null;
  }

  const cleaned =
    value.trim();

  return cleaned || null;
}

function cleanNumber(
  value: unknown
): number | null {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return null;
  }

  return value;
}

function responseText(
  payload: OpenAiResponse
): string {
  if (
    payload.output_text?.trim()
  ) {
    return payload.output_text.trim();
  }

  return (
    payload.output
      ?.flatMap(
        (item) =>
          item.content ?? []
      )
      .map(
        (item) =>
          item.text ?? ""
      )
      .join("")
      .trim() ?? ""
  );
}

function parseJson(
  value: string
): AiReceiptResult | null {
  const trimmed =
    value.trim();

  if (!trimmed) {
    return null;
  }

  try {
    return JSON.parse(
      trimmed
    ) as AiReceiptResult;
  } catch {
    const fenced =
      trimmed.match(
        /```(?:json)?\s*([\s\S]*?)```/i
      );

    if (fenced?.[1]) {
      try {
        return JSON.parse(
          fenced[1].trim()
        ) as AiReceiptResult;
      } catch {
        return null;
      }
    }

    const start =
      trimmed.indexOf("{");

    const end =
      trimmed.lastIndexOf("}");

    if (
      start >= 0 &&
      end > start
    ) {
      try {
        return JSON.parse(
          trimmed.slice(
            start,
            end + 1
          )
        ) as AiReceiptResult;
      } catch {
        return null;
      }
    }

    return null;
  }
}

function isImportableDeviceType(
  value: string | null
) {
  const type =
    value
      ?.trim()
      .toLowerCase();

  return (
    type === "device" ||
    type === "appliance" ||
    type === "electronics"
  );
}

function clampQuantity(
  value: unknown
) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return 1;
  }

  return Math.min(
    Math.max(
      Math.round(value),
      1
    ),
    20
  );
}

function clampConfidence(
  value: unknown,
  fallback: number
) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return fallback;
  }

  if (
    value >= 0 &&
    value <= 1
  ) {
    return Number(
      value.toFixed(2)
    );
  }

  if (
    value > 1 &&
    value <= 100
  ) {
    return Number(
      (
        value / 100
      ).toFixed(2)
    );
  }

  return fallback;
}

export async function parseOrderItems(
  text: string
): Promise<ParsedOrder[]> {
  const fallback =
    parseOrderConfirmation(
      text
    );

  const fallbackItems =
    fallback.deviceName
      ? [fallback]
      : [];

  const apiKey =
    process.env
      .OPENAI_API_KEY
      ?.trim();

  if (!apiKey) {
    return fallbackItems;
  }

  const input =
    text
      .slice(0, 40_000);

  try {
    const response =
      await fetch(
        "https://api.openai.com/v1/responses",
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${apiKey}`,

            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify({
              model:
                process.env
                  .OPENAI_SMART_IMPORT_MODEL ||
                "gpt-4.1-mini",

              store: false,

              max_output_tokens:
                2200,

              instructions: [
                "You are the Smart Import receipt parser for Home Tech Vault.",
                "",
                "Analyze the supplied purchase receipt, invoice, or order-confirmation email.",
                "",
                "Return ONLY valid JSON.",
                "",
                "Find EVERY separately purchased physical device or appliance in the receipt.",
                "",
                "Do not collapse multiple products into one device.",
                "",
                "Classify every useful line item as one of:",
                "device, appliance, accessory, warranty, service, subscription, fee, consumable, other.",
                "",
                "Only device and appliance items will become Home Tech Vault device cards.",
                "",
                "Examples that SHOULD normally be devices:",
                "televisions, computers, monitors, routers, smart speakers, streaming boxes, cameras, phones, tablets, printers, game consoles, smart-home hubs, refrigerators, washers, dryers, dishwashers, ovens, microwaves, vacuums and similar durable technology.",
                "",
                "Examples that should NOT normally become device cards:",
                "HDMI cables, charging cables, cases, mounts, batteries, ink, filters, delivery fees, installation services, sales tax, subscriptions, protection plans, AppleCare, Geek Squad Protection, warranties and gift cards.",
                "",
                "If quantity is greater than 1, preserve the quantity. The application will create a separate device card for each physical unit.",
                "",
                "Use the product's unit price, not the order subtotal, tax or total.",
                "",
                "Do not invent model numbers or serial numbers.",
                "",
                "Return this exact shape:",
                "{",
                '  "retailer": string | null,',
                '  "orderNumber": string | null,',
                '  "purchaseDate": "YYYY-MM-DD" | null,',
                '  "items": [',
                "    {",
                '      "itemType": "device" | "appliance" | "accessory" | "warranty" | "service" | "subscription" | "fee" | "consumable" | "other",',
                '      "deviceName": string | null,',
                '      "category": string | null,',
                '      "brand": string | null,',
                '      "manufacturer": string | null,',
                '      "modelNumber": string | null,',
                '      "serialNumber": string | null,',
                '      "quantity": number,',
                '      "unitPrice": number | null,',
                '      "confidence": number',
                "    }",
                "  ]",
                "}",
              ].join("\n"),

              input,
            }),

          signal:
            AbortSignal.timeout(
              18_000
            ),
        }
      );

    if (!response.ok) {
      console.warn(
        "[smart-import] AI multi-item extraction failed",
        response.status
      );

      return fallbackItems;
    }

    const payload =
      await response.json() as
        OpenAiResponse;

    const parsed =
      parseJson(
        responseText(payload)
      );

    if (
      !parsed ||
      !Array.isArray(
        parsed.items
      )
    ) {
      console.warn(
        "[smart-import] AI returned no usable item array"
      );

      return fallbackItems;
    }

    const retailer =
      cleanString(
        parsed.retailer
      ) ||
      fallback.retailer;

    const orderNumber =
      cleanString(
        parsed.orderNumber
      ) ||
      fallback.orderNumber;

    const purchaseDate =
      cleanString(
        parsed.purchaseDate
      ) ||
      fallback.purchaseDate;

    const results:
      ParsedOrder[] = [];

    for (
      const item of parsed.items
    ) {
      const itemType =
        cleanString(
          item.itemType
        );

      if (
        !isImportableDeviceType(
          itemType
        )
      ) {
        continue;
      }

      const deviceName =
        cleanString(
          item.deviceName
        );

      if (!deviceName) {
        continue;
      }

      const brand =
        cleanString(
          item.brand
        );

      const manufacturer =
        cleanString(
          item.manufacturer
        ) ||
        brand;

      const modelNumber =
        cleanString(
          item.modelNumber
        );

      const serialNumber =
        cleanString(
          item.serialNumber
        );

      const category =
        cleanString(
          item.category
        ) ||
        "Other";

      const purchasePrice =
        cleanNumber(
          item.unitPrice
        );

      const confidence =
        clampConfidence(
          item.confidence,
          fallback.confidence
        );

      const quantity =
        clampQuantity(
          item.quantity
        );

      for (
        let index = 0;
        index < quantity;
        index += 1
      ) {
        results.push({
          retailer,
          orderNumber,

          deviceName:
            quantity > 1
              ? `${deviceName} #${index + 1}`
              : deviceName,

          category,
          brand,
          manufacturer,
          modelNumber,

          serialNumber:
            quantity === 1
              ? serialNumber
              : null,

          purchaseDate,
          purchasePrice,
          confidence,
        });
      }
    }

    if (
      results.length === 0
    ) {
      return fallbackItems;
    }

    console.info(
      "[smart-import] extracted device cards",
      {
        count:
          results.length,

        retailer,
      }
    );

    return results;
  } catch (error) {
    console.warn(
      "[smart-import] AI multi-item extraction error",
      error instanceof Error
        ? error.message
        : "unknown"
    );

    return fallbackItems;
  }
}
