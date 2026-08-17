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

export function parseLowes(
  text: string
): ParsedOrder {
  const orderMatch =
    text.match(
      /order\s*(?:number|#|no\.?)?\s*:?\s*([A-Z0-9-]{5,})/i
    );

  const dateMatch =
    text.match(
      /(?:order date|purchase date|ordered)\s*:?\s*([A-Za-z]{3,9}\s+\d{1,2},\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{2,4})/i
    );

  const priceMatch =
    text.match(
      /(?:price|item total|subtotal)\s*:?\s*\$?\s*([\d,]+\.\d{2})/i
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
    retailer: "Lowe's",
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
        retailer: "Lowe's",
        orderNumber,
        purchaseDate,
        purchasePrice,
        modelNumber,
        brand,
        deviceName,
      }),
  };
}