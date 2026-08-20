import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OPENAI_RESPONSES_URL =
  "https://api.openai.com/v1/responses";

const CACHE_MS =
  1000 * 60 * 60 * 6;

const MAX_QUERY_LENGTH =
  160;

type DeviceResult = {
  id: string;
  deviceName: string;
  brand: string;
  manufacturer: string;
  modelNumber: string;
  category: string;
  description: string;
  confidence: "openai";
  upc?: string;
};

type OpenAIResponse = {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      text?: string;
    }>;
  }>;
};

const cache =
  new Map<
    string,
    {
      expiresAt: number;
      matches: DeviceResult[];
    }
  >();

function cleanText(
  value: unknown,
  max = 180
) {
  return typeof value ===
    "string"
    ? value
        .replace(
          /[\u0000-\u001F\u007F]/g,
          " "
        )
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, max)
    : "";
}

function normalizeKey(
  value: string
) {
  return value
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      ""
    );
}

function isBarcode(
  value: string
) {
  const cleaned =
    value.replace(/\D/g, "");

  return (
    cleaned === value &&
    [8, 12, 13, 14].includes(
      cleaned.length
    )
  );
}

function responseText(
  value: OpenAIResponse
) {
  if (
    value.output_text?.trim()
  ) {
    return value.output_text.trim();
  }

  return (
    value.output
      ?.flatMap(
        (item) =>
          item.content ?? []
      )
      .map(
        (part) =>
          part.text ?? ""
      )
      .join("")
      .trim() ?? ""
  );
}

function parseJsonArray(
  value: string
): unknown[] {
  const fenced =
    value.match(
      /```(?:json)?\s*([\s\S]*?)```/i
    );

  const source =
    fenced?.[1] ??
    value;

  const start =
    source.indexOf("[");

  const end =
    source.lastIndexOf("]");

  if (
    start === -1 ||
    end <= start
  ) {
    return [];
  }

  try {
    const parsed =
      JSON.parse(
        source.slice(
          start,
          end + 1
        )
      );

    return Array.isArray(
      parsed
    )
      ? parsed
      : [];
  } catch {
    return [];
  }
}

function sanitizeMatches(
  raw: unknown[],
  query: string
): DeviceResult[] {
  const barcodeQuery =
    isBarcode(query);

  const seen =
    new Set<string>();

  const matches:
    DeviceResult[] = [];

  for (
    const item of raw
  ) {
    if (
      !item ||
      typeof item !==
        "object" ||
      Array.isArray(item)
    ) {
      continue;
    }

    const row =
      item as Record<
        string,
        unknown
      >;

    const brand =
      cleanText(
        row.brand,
        80
      );

    const modelNumber =
      cleanText(
        row.modelNumber,
        100
      );

    const deviceName =
      cleanText(
        row.deviceName,
        160
      );

    const category =
      cleanText(
        row.category,
        80
      ) ||
      "Household Device";

    const description =
      cleanText(
        row.description,
        260
      );

    const upc =
      cleanText(
        row.upc,
        20
      ).replace(/\D/g, "");

    if (
      !brand ||
      !modelNumber ||
      !deviceName
    ) {
      continue;
    }

    if (
      barcodeQuery &&
      upc !== query
    ) {
      continue;
    }

    const key =
      normalizeKey(
        `${brand}|${modelNumber}`
      );

    if (
      !key ||
      seen.has(key)
    ) {
      continue;
    }

    seen.add(key);

    matches.push({
      id:
        `openai:${key}`,
      deviceName,
      brand,
      manufacturer:
        brand,
      modelNumber,
      category,
      description:
        description ||
        `${brand} ${modelNumber}`,
      confidence:
        "openai",
      ...(upc
        ? { upc }
        : {}),
    });

    if (
      matches.length >=
      6
    ) {
      break;
    }
  }

  return matches;
}

export async function GET(
  request: Request
) {
  try {
    const supabase =
      await createClient();

    const {
      data: {
        user,
      },
      error:
        userError,
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
      new URL(
        request.url
      );

    const query =
      cleanText(
        url.searchParams.get(
          "q"
        ),
        MAX_QUERY_LENGTH
      );

    if (
      query.length < 3
    ) {
      return NextResponse.json(
        {
          matches: [],
        }
      );
    }

    const cacheKey =
      query.toLowerCase();

    const cached =
      cache.get(
        cacheKey
      );

    if (
      cached &&
      cached.expiresAt >
        Date.now()
    ) {
      return NextResponse.json(
        {
          matches:
            cached.matches,
          cached:
            true,
        },
        {
          headers: {
            "Cache-Control":
              "private, no-store",
          },
        }
      );
    }

    const apiKey =
      process.env
        .OPENAI_API_KEY
        ?.trim();

    if (!apiKey) {
      return NextResponse.json(
        {
          matches: [],
          unavailable:
            true,
        },
        {
          headers: {
            "Cache-Control":
              "private, no-store",
          },
        }
      );
    }

    const model =
      process.env
        .OPENAI_DEVICE_LOOKUP_MODEL
        ?.trim() ||
      "gpt-5.6-luna";

    const barcodeQuery =
      isBarcode(
        query
      );

    const prompt = [
      "You are the product-discovery engine for Home Tech Vault.",
      "Use web search to identify real household products matching the user's query.",
      "",
      `Query: ${query}`,
      `Query type: ${barcodeQuery ? "UPC/EAN/GTIN barcode" : "product/model search"}`,
      "",
      "SEARCH BROADLY. Home Tech Vault should be able to find nearly any normal household device or appliance, not only computers and TVs.",
      "",
      "Relevant categories include, but are not limited to:",
      "- televisions, projectors, streaming devices and remotes",
      "- laptops, desktops, monitors, tablets, phones and accessories",
      "- routers, modems, mesh Wi-Fi, switches, access points, NAS and storage",
      "- printers, scanners and office equipment",
      "- speakers, soundbars, receivers, headphones and audio equipment",
      "- game consoles, controllers and VR devices",
      "- refrigerators, freezers, ranges, ovens, microwaves and dishwashers",
      "- washers, dryers and laundry appliances",
      "- coffee makers, air fryers, blenders, mixers and small kitchen appliances",
      "- vacuums, robot vacuums, carpet cleaners and floor-care devices",
      "- thermostats, HVAC controls, air conditioners, dehumidifiers, humidifiers and air purifiers",
      "- smart lights, switches, plugs, hubs, sensors, locks, doorbells and cameras",
      "- security systems, smoke/CO detectors and leak detectors",
      "- garage door openers, generators, UPS units, batteries and power stations",
      "- lawn equipment, robotic mowers, pool/spa equipment and irrigation controllers",
      "- exercise equipment, scales and other connected home equipment",
      "- tools and other household equipment when a manufacturer/model can be verified",
      "",
      "Accuracy rules:",
      "- Return only real products or real product families supported by web results.",
      "- Never invent a model number, model suffix, UPC, EAN or GTIN.",
      "- Prefer the exact model when the query contains one.",
      "- If the query is a product-family name, a verified family-level result is acceptable.",
      "- For a barcode query, return a result ONLY when that exact barcode can be verified and include it in the upc field.",
      "- For text queries, leave upc as an empty string unless a specific barcode is directly verified.",
      "- Do not include retailer-only bundle names as model numbers.",
      "- Results should be plausible matches to the user's wording, not merely products in the same category.",
      "- Return at most 6 matches, best match first.",
      "",
      "Return ONLY a JSON array. No markdown and no explanation.",
      'Each item must use: {"deviceName":"...","brand":"...","modelNumber":"...","category":"...","description":"...","upc":""}',
      "If no reliable match exists, return [].",
    ].join(
      "\n"
    );

    const response =
      await fetch(
        OPENAI_RESPONSES_URL,
        {
          method:
            "POST",
          headers: {
            Authorization:
              `Bearer ${apiKey}`,
            "Content-Type":
              "application/json",
          },
          body:
            JSON.stringify({
              model,
              input:
                prompt,
              reasoning: {
                effort:
                  "low",
              },
              tools: [
                {
                  type:
                    "web_search",
                  search_context_size:
                    "medium",
                  user_location: {
                    type:
                      "approximate",
                    country:
                      "US",
                  },
                },
              ],
              max_output_tokens:
                900,
              store:
                false,
            }),
          cache:
            "no-store",
          signal:
            AbortSignal.timeout(
              25_000
            ),
        }
      );

    if (!response.ok) {
      console.warn(
        "[device-ai-lookup] OpenAI request failed",
        response.status
      );

      return NextResponse.json(
        {
          matches: [],
          unavailable:
            true,
        },
        {
          headers: {
            "Cache-Control":
              "private, no-store",
          },
        }
      );
    }

    const payload =
      (await response.json()) as
        OpenAIResponse;

    const raw =
      parseJsonArray(
        responseText(
          payload
        )
      );

    const matches =
      sanitizeMatches(
        raw,
        query
      );

    cache.set(
      cacheKey,
      {
        expiresAt:
          Date.now() +
          CACHE_MS,
        matches,
      }
    );

    return NextResponse.json(
      {
        matches,
        cached:
          false,
      },
      {
        headers: {
          "Cache-Control":
            "private, no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "[device-ai-lookup] unexpected error",
      error instanceof Error
        ? error.message
        : "unknown"
    );

    return NextResponse.json(
      {
        matches: [],
        unavailable:
          true,
      },
      {
        headers: {
          "Cache-Control":
            "private, no-store",
        },
      }
    );
  }
}
