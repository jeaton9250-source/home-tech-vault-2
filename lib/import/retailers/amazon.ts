import {
  calculateConfidence,
  detectBrand,
  detectCategory,
  detectModelNumber,
  detectSerialNumber,
  findLikelyProductName,
  normalizeDate,
  parseMoney,
} from "@/lib/import/helpers";
import type { ParsedOrder } from "@/lib/import/types";

export function parseAmazon(
  text: string
): ParsedOrder {
  const orderMatch =
    text.match(
      /order\s*(?:#|number)?\s*:?\s*([0-9]{3}-[0-9]{7}-[0-9]{7}|[A-Z0-9-]{8,})/i
    );

  const dateMatch =
    text.match(
      /(?:ordered on|order date|placed on)\s*:?\s*([A-Za-z]{3,9}\s+\d{1,2},\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{2,4})/i
    );

  /*
    Prefer item subtotal before order total,
    because shipping/tax may otherwise inflate
    the device price.
  */
  const priceMatch =
    text.match(
      /(?:item subtotal|item price|price)\s*:?\s*\$?\s*([\d,]+\.\d{2})/i
    );

  const brand =
    detectBrand(text);

  const modelNumber =
    detectModelNumber(text);

  const serialNumber =
    detectSerialNumber(text);

  const deviceName =
    findLikelyProductName(
      text,
      brand
    );

  const purchaseDate =
    dateMatch?.[1]
      ? normalizeDate(
          dateMatch[1]
        )
      : null;

  const purchasePrice =
    parseMoney(
      priceMatch?.[1]
    );

  const orderNumber =
    orderMatch?.[1] ?? null;

  const category =
    deviceName
      ? detectCategory(
          deviceName
        )
      : detectCategory(text);

  return {
    retailer: "Amazon",
    orderNumber,
    deviceName,
    category,
    brand,
    manufacturer: brand,
    modelNumber,
    serialNumber,
    purchaseDate,
    purchasePrice,

    confidence:
      calculateConfidence({
        retailer: "Amazon",
        orderNumber,
        purchaseDate,
        purchasePrice,
        modelNumber,
        brand,
        deviceName,
      }),
  };
}