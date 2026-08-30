import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";

const MAX_IMAGE_DATA_LENGTH = 8_500_000;

type IdentificationBasis = "model_label" | "barcode" | "product" | "unknown";

type VisionConfidence = "high" | "medium" | "low";

type VisionExtraction = {
  brand: string;
  manufacturer: string;
  modelNumber: string;
  serialNumber: string;
  productName: string;
  category: string;
  barcode: string;
  identificationBasis: IdentificationBasis;
  confidence: VisionConfidence;
  visibleText: string[];
};

type OpenAIResponse = {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      text?: string;
    }>;
  }>;
};

function cleanText(value: unknown, max = 180) {
  return typeof value === "string"
    ? value
        .replace(/[\u0000-\u001F\u007F]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, max)
    : "";
}

function cleanBarcode(value: unknown) {
  const barcode = cleanText(value, 32).replace(/\D/g, "");

  return [8, 12, 13, 14].includes(barcode.length) ? barcode : "";
}

function responseText(value: OpenAIResponse) {
  if (value.output_text?.trim()) {
    return value.output_text.trim();
  }

  return (
    value.output
      ?.flatMap((item) => item.content ?? [])
      .map((part) => part.text ?? "")
      .join("")
      .trim() ?? ""
  );
}

function parseJsonObject(value: string): Record<string, unknown> | null {
  const fenced = value.match(/```(?:json)?\s*([\s\S]*?)```/i);

  const source = fenced?.[1] ?? value;

  const start = source.indexOf("{");
  const end = source.lastIndexOf("}");

  if (start === -1 || end <= start) {
    return null;
  }

  try {
    const parsed = JSON.parse(source.slice(start, end + 1));

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }

    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

function normalizeBasis(value: unknown): IdentificationBasis {
  return value === "model_label" || value === "barcode" || value === "product"
    ? value
    : "unknown";
}

function normalizeConfidence(value: unknown): VisionConfidence {
  return value === "high" || value === "medium" ? value : "low";
}

function sanitizeExtraction(raw: Record<string, unknown>): VisionExtraction {
  const brand = cleanText(raw.brand, 80);

  const manufacturer = cleanText(raw.manufacturer, 80) || brand;

  const modelNumber = cleanText(raw.modelNumber, 120);

  const serialNumber = cleanText(raw.serialNumber, 140);

  const productName = cleanText(raw.productName, 180);

  const category = cleanText(raw.category, 80);

  const barcode = cleanBarcode(raw.barcode);

  const visibleText = Array.isArray(raw.visibleText)
    ? raw.visibleText
        .map((item) => cleanText(item, 160))
        .filter(Boolean)
        .slice(0, 12)
    : [];

  return {
    brand,
    manufacturer,
    modelNumber,
    serialNumber,
    productName,
    category,
    barcode,
    identificationBasis: normalizeBasis(raw.identificationBasis),
    confidence: normalizeConfidence(raw.confidence),
    visibleText,
  };
}

function buildSearchQuery(extraction: VisionExtraction) {
  if (extraction.barcode) {
    return extraction.barcode;
  }

  if (extraction.brand && extraction.modelNumber) {
    return `${extraction.brand} ${extraction.modelNumber}`;
  }

  if (extraction.manufacturer && extraction.modelNumber) {
    return `${extraction.manufacturer} ${extraction.modelNumber}`;
  }

  if (extraction.brand && extraction.productName) {
    return `${extraction.brand} ${extraction.productName}`;
  }

  return extraction.modelNumber || extraction.productName || extraction.brand;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error: "Authentication required.",
        },
        {
          status: 401,
        },
      );
    }

    const body = (await request.json()) as {
      imageDataUrl?: unknown;
    };

    const imageDataUrl =
      typeof body.imageDataUrl === "string" ? body.imageDataUrl.trim() : "";

    if (
      !imageDataUrl ||
      !/^data:image\/(jpeg|jpg|png|webp);base64,/i.test(imageDataUrl)
    ) {
      return NextResponse.json(
        {
          error: "Upload a JPEG, PNG, or WebP image.",
        },
        {
          status: 400,
        },
      );
    }

    if (imageDataUrl.length > MAX_IMAGE_DATA_LENGTH) {
      return NextResponse.json(
        {
          error: "That image is too large. Try a smaller photo.",
        },
        {
          status: 413,
        },
      );
    }

    const apiKey = process.env.OPENAI_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "Photo identification is temporarily unavailable.",
          unavailable: true,
        },
        {
          status: 503,
        },
      );
    }

    const model =
      process.env.OPENAI_DEVICE_VISION_MODEL?.trim() ||
      process.env.OPENAI_DEVICE_LOOKUP_MODEL?.trim() ||
      "gpt-5.6-luna";

    const prompt = [
      "You are the visual product-identification layer for Home Tech Vault.",
      "",
      "Inspect this image of a household device, appliance, product, barcode, or manufacturer/model label.",
      "",
      "Your job is extraction, not guessing.",
      "",
      "Priority:",
      "1. Read manufacturer/brand and exact model number when visible.",
      "2. Read serial number when clearly visible.",
      "3. Read UPC/EAN/GTIN barcode digits when clearly visible.",
      "4. Identify the general product only when the image reasonably supports it.",
      "",
      "Accuracy rules:",
      "- Never invent a model number.",
      "- Never invent a serial number.",
      "- Never invent a barcode.",
      "- Preserve model suffixes exactly when readable.",
      "- If a character is uncertain, leave the field empty rather than guessing.",
      "- A visual resemblance alone is not enough to claim an exact model.",
      "- A manufacturer label/nameplate is stronger evidence than the appearance of the product.",
      "- Use confidence high only when important identifiers are clearly readable.",
      "",
      "identificationBasis must be one of:",
      '- "model_label" when a manufacturer/model/serial label is visible,',
      '- "barcode" when a product barcode is the primary useful identifier,',
      '- "product" when recognizing the product mainly from appearance/branding,',
      '- "unknown" when the image cannot be usefully identified.',
      "",
      "Return ONLY one JSON object with this exact shape:",
      '{"brand":"","manufacturer":"","modelNumber":"","serialNumber":"","productName":"","category":"","barcode":"","identificationBasis":"unknown","confidence":"low","visibleText":[]}',
      "",
      "visibleText should contain only short useful text actually visible in the image.",
    ].join("\n");

    const response = await fetch(OPENAI_RESPONSES_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: prompt,
              },
              {
                type: "input_image",
                image_url: imageDataUrl,
                detail: "high",
              },
            ],
          },
        ],
        reasoning: {
          effort: "low",
        },
        max_output_tokens: 700,
        store: false,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      console.warn("[device-vision] OpenAI request failed", response.status);

      return NextResponse.json(
        {
          error:
            "We couldn't read that photo. Try a clearer picture of the model label.",
          unavailable: true,
        },
        {
          status: 502,
        },
      );
    }

    const payload = (await response.json()) as OpenAIResponse;

    const parsed = parseJsonObject(responseText(payload));

    if (!parsed) {
      return NextResponse.json(
        {
          error: "We couldn't identify useful product details in that photo.",
          extraction: null,
        },
        {
          status: 422,
        },
      );
    }

    const extraction = sanitizeExtraction(parsed);

    const searchQuery = buildSearchQuery(extraction);

    const useful = Boolean(searchQuery || extraction.serialNumber);

    if (!useful) {
      return NextResponse.json(
        {
          error:
            "We couldn't identify enough information. Try photographing the model or serial label.",
          extraction,
          searchQuery: "",
        },
        {
          status: 422,
        },
      );
    }

    return NextResponse.json(
      {
        extraction,
        searchQuery,
      },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      },
    );
  } catch (error) {
    console.error(
      "[device-vision] unexpected error",
      error instanceof Error ? error.message : "unknown",
    );

    return NextResponse.json(
      {
        error: "Photo identification is temporarily unavailable.",
        unavailable: true,
      },
      {
        status: 500,
      },
    );
  }
}
