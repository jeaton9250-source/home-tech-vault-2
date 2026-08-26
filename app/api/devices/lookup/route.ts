import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type UpcItem = {
  ean?: string;
  upc?: string;
  gtin?: string;
  title?: string;
  description?: string;
  brand?: string;
  model?: string;
  category?: string;
  images?: string[];
};

type UpcResponse = {
  code?: string;
  total?: number;
  offset?: number;
  items?: UpcItem[];
  message?: string;
};

type IcecatResponse = {
  msg?: string;
  StatusCode?: number;
  Code?: number;
  Message?: string;
  data?: {
    GeneralInfo?: {
      IcecatId?: string | number;
      Title?: string;
      Brand?: string;
      ProductName?: string;
      ProductCode?: string;
      BrandPartCode?: string;
      Category?: {
        Name?: {
          Value?: string;
        };
      };
    };
  };
};

const cache = new Map<
  string,
  {
    expiresAt: number;
    matches: DeviceLookupMatch[];
  }
>();

const CACHE_MS =
  1000 * 60 * 60 * 12;

type DeviceLookupMatch = {
  id: string;
  deviceName: string;
  brand: string;
  manufacturer: string;
  modelNumber: string;
  category: string;
  description: string;
  confidence:
    | "upcitemdb"
    | "icecat"
    | "openai";
  upc?: string;
  imageUrl?: string;
};

const KNOWN_BRANDS = [
  "Samsung",
  "Sony",
  "LG",
  "Brother",
  "HP",
  "Canon",
  "Epson",
  "Apple",
  "NETGEAR",
  "TP-Link",
  "Amazon",
  "Google",
  "Ring",
  "Sonos",
  "Dyson",
  "Dell",
  "Lenovo",
  "ASUS",
  "Acer",
  "Roku",
  "Microsoft",
  "Nintendo",
  "Vizio",
  "TCL",
  "Hisense",
];

function cleanQuery(
  value: string
) {
  return value
    .replace(
      /[\u0000-\u001F\u007F]/g,
      " "
    )
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

function normalize(
  value: string
) {
  return value
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      " "
    )
    .trim();
}

function compact(
  value: string
) {
  return value
    .toLowerCase()
    .replace(
      /[^a-z0-9]/g,
      ""
    );
}


function buildLookupQueries(
  query: string
) {
  const cleaned =
    cleanQuery(query);

  const variants =
    new Set<string>([
      cleaned,
    ]);

  const detectedBrand =
    detectBrand(cleaned);

  const compactQuery =
    compact(cleaned);

  /*
   * Bare manufacturer model numbers are often
   * indexed with the brand or the word "model"
   * instead of by the identifier alone.
   */
  if (
    /^[a-z]+[-\s]?\d+[a-z0-9-]*$/i.test(
      cleaned
    )
  ) {
    variants.add(
      `model ${cleaned}`
    );
  }

  /*
   * Apple hardware identifiers commonly use
   * A followed by four digits, such as A2589.
   */
  if (
    /^a\d{4}$/i.test(
      compactQuery
    )
  ) {
    variants.add(
      `Apple ${cleaned}`
    );

    variants.add(
      `Apple model ${cleaned}`
    );
  } else if (
    detectedBrand &&
    !normalize(cleaned).includes(
      normalize(detectedBrand)
    )
  ) {
    variants.add(
      `${detectedBrand} ${cleaned}`
    );
  }

  return Array.from(
    variants
  ).slice(0, 4);
}

function detectBrand(
  query: string
) {
  const normalized =
    normalize(query);

  for (
    const brand of
    KNOWN_BRANDS
  ) {
    const normalizedBrand =
      normalize(brand);

    if (
      normalized.includes(
        normalizedBrand
      )
    ) {
      return brand;
    }
  }

  if (
    /\bmacbook\b|\biphone\b|\bipad\b|\bimac\b/i.test(
      query
    ) ||
    /^\s*a[-\s]?\d{4}\s*$/i.test(
      query
    )
  ) {
    return "Apple";
  }

  if (
    /\bps5\b|\bplaystation\b|\bbravia\b/i.test(
      query
    )
  ) {
    return "Sony";
  }

  if (
    /\bxbox\b/i.test(query)
  ) {
    return "Microsoft";
  }

  if (
    /\beero\b/i.test(query)
  ) {
    return "eero";
  }

  return "";
}

function extractModel(
  query: string,
  brand: string
) {
  let model =
    query.trim();

  if (brand) {
    const escaped =
      brand.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

    model = model.replace(
      new RegExp(
        escaped,
        "gi"
      ),
      " "
    );
  }

  return model
    .replace(
      /\b(tv|television|oled|qled|smart tv|printer|router|laptop|monitor|camera|speaker)\b/gi,
      " "
    )
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeCategory(
  rawCategory:
    | string
    | undefined,
  title = ""
) {
  const text =
    `${rawCategory ?? ""} ${title}`
      .toLowerCase();

  if (
    text.includes(
      "television"
    ) ||
    /\btv\b/.test(text)
  ) {
    return "TV";
  }

  if (
    text.includes("notebook") ||
    text.includes("laptop")
  ) {
    return "Laptop";
  }

  if (
    text.includes("printer")
  ) {
    return "Printer";
  }

  if (
    text.includes("router") ||
    text.includes(
      "network"
    ) ||
    text.includes(
      "access point"
    )
  ) {
    return "Network Equipment";
  }

  if (
    text.includes(
      "smartphone"
    ) ||
    text.includes(
      "mobile phone"
    )
  ) {
    return "Phone";
  }

  if (
    text.includes("tablet")
  ) {
    return "Tablet";
  }

  if (
    text.includes("monitor")
  ) {
    return "Monitor";
  }

  if (
    text.includes("camera")
  ) {
    return "Camera";
  }

  if (
    text.includes("vacuum")
  ) {
    return "Vacuum";
  }

  if (
    text.includes(
      "game console"
    ) ||
    text.includes("gaming") ||
    text.includes(
      "playstation"
    ) ||
    text.includes("xbox")
  ) {
    return "Gaming";
  }

  if (
    text.includes(
      "streaming"
    )
  ) {
    return "Streaming Device";
  }

  if (
    text.includes("speaker") ||
    text.includes("audio") ||
    text.includes(
      "soundbar"
    )
  ) {
    return "Audio";
  }

  if (
    text.includes(
      "thermostat"
    ) ||
    text.includes(
      "smart home"
    )
  ) {
    return "Smart Home";
  }

  return "Other";
}

function scoreItem(
  item: UpcItem,
  query: string
) {
  const queryNormalized =
    normalize(query);

  const queryCompact =
    compact(query);

  const title =
    item.title ?? "";

  const brand =
    item.brand ?? "";

  const model =
    item.model ?? "";

  const combined =
    normalize(
      [
        title,
        brand,
        model,
        item.category ?? "",
      ].join(" ")
    );

  const modelCompact =
    compact(model);

  let score = 0;

  /*
   * Barcode lookups are exact identifiers.
   * UPCitemdb may return the barcode in
   * upc, ean, or gtin, so compare all three
   * before doing normal text ranking.
   */
  const barcodeQuery =
    query.replace(/\D/g, "");

  const itemBarcodes = [
    item.upc,
    item.ean,
    item.gtin,
  ]
    .filter(
      (value): value is string =>
        typeof value === "string"
    )
    .map((value) =>
      value.replace(/\D/g, "")
    );

  if (
    [8, 12, 13, 14].includes(
      barcodeQuery.length
    ) &&
    itemBarcodes.includes(
      barcodeQuery
    )
  ) {
    score += 250;
  }

  if (
    modelCompact &&
    queryCompact.includes(
      modelCompact
    )
  ) {
    score += 100;
  }

  if (
    modelCompact &&
    modelCompact.includes(
      queryCompact
    )
  ) {
    score += 90;
  }

  if (
    normalize(title).includes(
      queryNormalized
    )
  ) {
    score += 70;
  }

  const words =
    queryNormalized
      .split(" ")
      .filter(
        (word) =>
          word.length >= 2
      );

  const matchedWords =
    words.filter(
      (word) =>
        combined.includes(word)
    ).length;

  score +=
    matchedWords * 8;

  const detectedBrand =
    detectBrand(query);

  if (
    detectedBrand &&
    normalize(brand) ===
      normalize(
        detectedBrand
      )
  ) {
    score += 30;
  }

  if (item.upc) {
    score += 2;
  }

  if (
    item.images?.length
  ) {
    score += 2;
  }

  return score;
}

function isBarcode(
  value: string
) {
  const cleaned =
    value.trim();

  return (
    /^\d+$/.test(
      cleaned
    ) &&
    [8, 12, 13, 14].includes(
      cleaned.length
    )
  );
}

function buildUpcMatches(
  response: UpcResponse,
  query: string
) {
  const items =
    Array.isArray(
      response.items
    )
      ? response.items
      : [];

  /*
   * UPC / EAN / GTIN lookup:
   *
   * UPCitemdb has already performed an
   * exact identifier lookup. Do NOT run
   * these results through text ranking.
   */
  if (isBarcode(query)) {
    const item =
      items[0];

    if (!item) {
      return [];
    }

    const title =
      item.title?.trim() ||
      [
        item.brand,
        item.model,
      ]
        .filter(Boolean)
        .join(" ")
        .trim();

    /*
     * A barcode-only record is not useful
     * enough to auto-fill the vault.
     * Require at least a real product title,
     * brand, or model.
     */
    const hasProductIdentity =
      Boolean(
        item.title?.trim() ||
        item.brand?.trim() ||
        item.model?.trim()
      );

    if (!hasProductIdentity) {
      return [];
    }

    const brand =
      item.brand?.trim() ||
      "";

    const model =
      item.model?.trim() ||
      "";

    const barcode =
      item.upc ||
      item.ean ||
      item.gtin ||
      query;

    const imageUrl =
      item.images?.find(
        (image) =>
          typeof image ===
            "string" &&
          image.startsWith(
            "https://"
          )
      );

    const match:
      DeviceLookupMatch = {
        id:
          `upc-${barcode}`,

        deviceName:
          title ||
          `${brand} ${model}`.trim() ||
          "Product",

        brand,

        manufacturer:
          brand,

        modelNumber:
          model,

        category:
          normalizeCategory(
            item.category,
            title
          ),

        description:
          "Verified by UPC/EAN barcode",

        confidence:
          "upcitemdb",

        upc:
          barcode,

        imageUrl,
      };

    return [match];
  }

  /*
   * Normal text/model search still uses
   * ranking because it can return multiple
   * possible products.
   */
  return items
    .map((item) => ({
      item,
      score: scoreItem(
        item,
        query
      ),
    }))
    .filter(
      ({ score }) =>
        score >= 15
    )
    .sort(
      (left, right) =>
        right.score -
        left.score
    )
    .slice(0, 5)
    .map(
      ({
        item,
      }): DeviceLookupMatch => {
        const title =
          item.title?.trim() ||
          [
            item.brand,
            item.model,
          ]
            .filter(Boolean)
            .join(" ");

        return {
          id:
            `upc-${item.upc || item.ean || compact(title)}`,

          deviceName:
            title ||
            query,

          brand:
            item.brand?.trim() ||
            detectBrand(query),

          manufacturer:
            item.brand?.trim() ||
            detectBrand(query),

          modelNumber:
            item.model?.trim() ||
            extractModel(
              query,
              detectBrand(
                query
              )
            ) ||
            query,

          category:
            normalizeCategory(
              item.category,
              title
            ),

          description:
            "Matched in UPCitemdb",

          confidence:
            "upcitemdb",

          upc:
            item.upc ||
            item.ean ||
            item.gtin,

          imageUrl:
            item.images?.find(
              (image) =>
                typeof image ===
                  "string" &&
                image.startsWith(
                  "https://"
                )
            ),
        };
      }
    );
}

async function searchUpcItemDb(
  query: string
) {
  const barcode =
    isBarcode(query);

  const queries =
    barcode
      ? [query]
      : buildLookupQueries(
          query
        );

  const allMatches:
    DeviceLookupMatch[] = [];

  let rateLimited = false;
  let remaining: string | null =
    null;

  for (
    const searchQuery of queries
  ) {
    const url =
      new URL(
        barcode
          ? "https://api.upcitemdb.com/prod/trial/lookup"
          : "https://api.upcitemdb.com/prod/trial/search"
      );

    if (barcode) {
      url.searchParams.set(
        "upc",
        searchQuery
      );
    } else {
      url.searchParams.set(
        "s",
        searchQuery
      );

      url.searchParams.set(
        "type",
        "product"
      );

      url.searchParams.set(
        "match_mode",
        "0"
      );
    }

    const controller =
      new AbortController();

    const timeout =
      setTimeout(
        () =>
          controller.abort(),
        7000
      );

    try {
      const response =
        await fetch(
          url.toString(),
          {
            method: "GET",
            headers: {
              Accept:
                "application/json",
              "Content-Type":
                "application/json",
            },
            signal:
              controller.signal,
            cache: "no-store",
            redirect: "error",
          }
        );

      remaining =
        response.headers.get(
          "x-ratelimit-remaining"
        );

      if (
        response.status === 429
      ) {
        rateLimited = true;
        break;
      }

      if (!response.ok) {
        console.error(
          "[upcitemdb] HTTP error:",
          response.status
        );

        continue;
      }

      const body =
        (await response.json()) as
          UpcResponse;

      const matches =
        buildUpcMatches(
          body,
          query
        );

      allMatches.push(
        ...matches
      );

      /*
       * Barcode lookups are exact, so there
       * is never a reason to run variants.
       */
      if (barcode) {
        break;
      }

      /*
       * Stop early once a strong model result
       * has been found. This keeps external
       * requests under control.
       */
      if (
        allMatches.some(
          (match) =>
            compact(
              match.modelNumber
            ).includes(
              compact(query)
            )
        )
      ) {
        break;
      }
    } catch (error) {
      console.error(
        "[upcitemdb] lookup failed:",
        error
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  const unique =
    Array.from(
      new Map(
        allMatches.map(
          (match) => [
            `${compact(
              match.brand
            )}:${compact(
              match.modelNumber
            )}:${match.id}`,
            match,
          ]
        )
      ).values()
    ).slice(0, 5);

  return {
    matches: unique,
    rateLimited,
    remaining,
  };
}

async function searchIcecat(
  query: string
): Promise<
  DeviceLookupMatch[]
> {
  const username =
    process.env
      .ICECAT_USERNAME
      ?.trim();

  const token =
    process.env
      .ICECAT_ACCESS_TOKEN
      ?.trim();

  if (
    !username ||
    !token
  ) {
    return [];
  }

  const brand =
    detectBrand(query);

  const model =
    extractModel(
      query,
      brand
    );

  if (
    !brand ||
    !model
  ) {
    return [];
  }

  const variants =
    Array.from(
      new Set([
        model,
        model.replace(
          /[^a-z0-9]/gi,
          ""
        ),
      ])
    ).filter(Boolean);

  /*
   * Only try one Icecat request.
   * Prefer punctuation-free MPN,
   * since many catalog MPNs are
   * stored that way.
   */
  const selectedModel =
    variants[
      variants.length - 1
    ];

  const url =
    new URL(
      "https://live.icecat.biz/api"
    );

  url.searchParams.set(
    "lang",
    "EN"
  );

  url.searchParams.set(
    "shopname",
    username
  );

  url.searchParams.set(
    "Brand",
    brand
  );

  url.searchParams.set(
    "ProductCode",
    selectedModel
  );

  url.searchParams.set(
    "content",
    "essentialinfo,title"
  );

  const controller =
    new AbortController();

  const timeout =
    setTimeout(
      () =>
        controller.abort(),
      5000
    );

  try {
    const response =
      await fetch(
        url.toString(),
        {
          headers: {
            Accept:
              "application/json",

            "api-token":
              token,
          },

          signal:
            controller.signal,

          cache: "no-store",

          redirect: "error",
        }
      );

    if (!response.ok) {
      return [];
    }

    const body =
      (await response.json()) as
        IcecatResponse;

    if (
      body.msg !== "OK" ||
      !body.data
        ?.GeneralInfo
    ) {
      return [];
    }

    const info =
      body.data
        .GeneralInfo;

    const returnedBrand =
      info.Brand?.trim() ||
      brand;

    const returnedModel =
      info.BrandPartCode?.trim() ||
      info.ProductCode?.trim() ||
      model;

    const title =
      info.Title?.trim() ||
      info.ProductName?.trim() ||
      `${returnedBrand} ${returnedModel}`;

    return [
      {
        id:
          `icecat-${info.IcecatId || compact(returnedModel)}`,

        deviceName:
          title,

        brand:
          returnedBrand,

        manufacturer:
          returnedBrand,

        modelNumber:
          returnedModel,

        category:
          normalizeCategory(
            info.Category
              ?.Name?.Value,
            title
          ),

        description:
          "Matched in Open Icecat",

        confidence:
          "icecat",
      },
    ];
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(
  request: Request
) {
  const supabase =
    await createClient();

  const {
    data: { user },
    error: userError,
  } =
    await supabase.auth.getUser();

  if (
    userError ||
    !user
  ) {
    return NextResponse.json(
      {
        error:
          "Authentication required.",
      },
      {
        status: 401,
      }
    );
  }

  const url =
    new URL(request.url);

  const query =
    cleanQuery(
      url.searchParams.get(
        "q"
      ) ?? ""
    );

  if (
    query.length < 3
  ) {
    return NextResponse.json({
      matches: [],
    });
  }

  const cacheKey =
    normalize(query);

  /*
   * Never use an old server-memory
   * cache entry for barcode scans.
   * Barcode lookups are cheap exact
   * identifier requests and should
   * always receive fresh enrichment.
   */
  const cached =
    isBarcode(query)
      ? undefined
      : cache.get(
          cacheKey
        );

  if (
    cached &&
    cached.expiresAt >
      Date.now()
  ) {
    return NextResponse.json({
      matches:
        cached.matches,

      cached: true,
    });
  }

  try {
    const upc =
      await searchUpcItemDb(
        query
      );

    if (
      upc.matches.length >
      0
    ) {
      cache.set(
        cacheKey,
        {
          expiresAt:
            Date.now() +
            CACHE_MS,

          matches:
            upc.matches,
        }
      );

      return NextResponse.json(
        {
          matches:
            upc.matches,

          source:
            "upcitemdb",

          rateLimitRemaining:
            upc.remaining,
        },
        {
          headers: {
            "Cache-Control":
              "private, max-age=3600",
          },
        }
      );
    }

    /*
     * UPCitemdb didn't find
     * anything useful.
     *
     * Quietly try Icecat if
     * credentials exist.
     */
    const icecat =
      await searchIcecat(
        query
      );

    if (
      icecat.length > 0
    ) {
      cache.set(
        cacheKey,
        {
          expiresAt:
            Date.now() +
            CACHE_MS,

          matches:
            icecat,
        }
      );

      return NextResponse.json({
        matches:
          icecat,

        source:
          "icecat",

        rateLimited:
          upc.rateLimited,
      });
    }

    return NextResponse.json({
      matches: [],

      rateLimited:
        upc.rateLimited,

      source:
        "none",
    });
  } catch (error) {
    console.error(
      "[device-lookup] Lookup failed:",
      error instanceof Error
        ? error.message
        : "Unknown error"
    );

    return NextResponse.json({
      matches: [],
      unavailable: true,
    });
  }
}
