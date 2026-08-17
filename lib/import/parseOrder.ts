import {
  calculateConfidence,
  detectBrand,
  detectCategory,
  detectModelNumber,
  detectSerialNumber,
  findLikelyProductName,
  normalizeDate,
  normalizeText,
  parseMoney,
} from "@/lib/import/helpers";

import { parseAmazon } from "@/lib/import/retailers/amazon";
import { parseBestBuy } from "@/lib/import/retailers/bestBuy";
import { parseHomeDepot } from "@/lib/import/retailers/homeDepot";
import { parseLowes } from "@/lib/import/retailers/lowes";

import type { ParsedOrder } from "@/lib/import/types";

export function parseOrderConfirmation(
  rawText: string
): ParsedOrder {
  const text =
    normalizeText(rawText);

  /*
    RETAILER-SPECIFIC PARSERS
  */

  if (
    /\bbest\s*buy\b/i.test(
      text
    )
  ) {
    return parseBestBuy(text);
  }

  if (
    /\bhome\s*depot\b/i.test(
      text
    )
  ) {
    return parseHomeDepot(text);
  }

  if (
    /\blowe'?s\b/i.test(
      text
    )
  ) {
    return parseLowes(text);
  }

  if (
    /\bamazon\b/i.test(
      text
    )
  ) {
    return parseAmazon(text);
  }

  /*
    GENERIC FALLBACK

    Unknown retailers can still work.
    They just get a lower-confidence
    generic extraction.
  */

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

  const category =
    deviceName
      ? detectCategory(
          deviceName
        )
      : detectCategory(text);

  const orderMatch =
    text.match(
      /order\s*(?:number|#|no\.?)?\s*:?\s*([A-Z0-9-]{5,})/i
    );

  const dateMatch =
    text.match(
      /(?:order date|purchase date|purchased|ordered)\s*:?\s*([A-Za-z]{3,9}\s+\d{1,2},\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{2,4})/i
    );

  const priceMatch =
    text.match(
      /(?:price|item total|subtotal)\s*:?\s*\$?\s*([\d,]+\.\d{2})/i
    );

  const orderNumber =
    orderMatch?.[1] ?? null;

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

  return {
    retailer: null,
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
        retailer: null,
        orderNumber,
        purchaseDate,
        purchasePrice,
        modelNumber,
        brand,
        deviceName,
      }),
  };
}