import "server-only";

type IdentityInput = {
  brand?: string | null;
  manufacturer?: string | null;
  modelNumber?: string | null;
  model?: string | null;
  deviceName?: string | null;
  name?: string | null;
  category?: string | null;
  [key: string]: unknown;
};

type IdentityResult = {
  brand: string;
  manufacturer: string;
  modelNumber: string;
  model: string;
  deviceName: string;
  name: string;
  category: string | null;
  confidence: number;
  changed: boolean;

  /*
   * Compatibility aliases. Existing callers from
   * earlier resolver versions can consume either
   * naming style while we standardize the pipeline.
   */
  normalizedBrand: string;
  normalizedModelNumber: string;
  normalizedDeviceName: string;
};

type OpenAIResponse = {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      text?: string;
    }>;
  }>;
};

function clean(value: unknown) {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function responseText(
  value: OpenAIResponse
) {
  if (value.output_text?.trim()) {
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

function parseJson(
  value: string
): Record<string, unknown> | null {
  const fenced =
    value.match(
      /```(?:json)?\s*([\s\S]*?)```/i
    );

  const source =
    fenced?.[1] ??
    value;

  const start =
    source.indexOf("{");

  const end =
    source.lastIndexOf("}");

  if (
    start === -1 ||
    end <= start
  ) {
    return null;
  }

  try {
    const parsed =
      JSON.parse(
        source.slice(
          start,
          end + 1
        )
      );

    return (
      parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed)
    )
      ? parsed
      : null;
  } catch {
    return null;
  }
}

export async function normalizeDeviceIdentityForLookup(
  input: IdentityInput
): Promise<IdentityResult | null> {
  const originalBrand =
    clean(
      input.brand ??
        input.manufacturer
    );

  const originalModel =
    clean(
      input.modelNumber ??
        input.model
    );

  const originalName =
    clean(
      input.deviceName ??
        input.name
    );

  const originalCategory =
    clean(
      input.category
    ) || null;

  if (
    !originalBrand &&
    !originalModel &&
    !originalName
  ) {
    return null;
  }

  const apiKey =
    process.env
      .OPENAI_API_KEY
      ?.trim();

  if (!apiKey) {
    return null;
  }

  const model =
    process.env
      .OPENAI_DEVICE_MODEL
      ?.trim() ||
    "gpt-5.4-mini";

  const prompt = [
    "Normalize a consumer device identity for database lookup.",
    "",
    `Brand: ${originalBrand || "(missing)"}`,
    `Model: ${originalModel || "(missing)"}`,
    `Device name: ${originalName || "(missing)"}`,
    `Category: ${originalCategory || "(missing)"}`,
    "",
    "Rules:",
    "- Correct obvious capitalization, spacing, punctuation, and manufacturer naming.",
    "- Preserve a real exact model code when one is supplied.",
    "- Never invent a screen size, region suffix, storage size, generation, or exact model code.",
    "- If the model is only a product family such as QN90D, keep it as QN90D.",
    "- Do not turn a product family into one arbitrary SKU.",
    "- Return only JSON.",
    "",
    'Shape: {"brand":"...","modelNumber":"...","deviceName":"...","category":"...","confidence":0.0}',
  ].join("\n");

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
              model,
              input:
                prompt,
              max_output_tokens:
                220,
              store:
                false,
            }),
          cache:
            "no-store",
          signal:
            AbortSignal.timeout(
              12_000
            ),
        }
      );

    if (!response.ok) {
      console.warn(
        "[device-identity] OpenAI normalization failed",
        response.status
      );

      return null;
    }

    const payload =
      (await response.json()) as
        OpenAIResponse;

    const parsed =
      parseJson(
        responseText(payload)
      );

    if (!parsed) {
      return null;
    }

    const brand =
      clean(parsed.brand) ||
      originalBrand;

    const modelNumber =
      clean(
        parsed.modelNumber
      ) ||
      originalModel;

    const deviceName =
      clean(
        parsed.deviceName
      ) ||
      originalName ||
      [brand, modelNumber]
        .filter(Boolean)
        .join(" ");

    const category =
      clean(parsed.category) ||
      originalCategory;

    const confidenceRaw =
      Number(
        parsed.confidence
      );

    const confidence =
      Number.isFinite(
        confidenceRaw
      )
        ? Math.min(
            1,
            Math.max(
              0,
              confidenceRaw
            )
          )
        : 0.75;

    const changed =
      brand !==
        originalBrand ||
      modelNumber !==
        originalModel ||
      deviceName !==
        originalName;

    return {
      brand,
      manufacturer:
        brand,
      modelNumber,
      model:
        modelNumber,
      deviceName,
      name:
        deviceName,
      category,
      confidence,
      changed,
      normalizedBrand:
        brand,
      normalizedModelNumber:
        modelNumber,
      normalizedDeviceName:
        deviceName,
    };
  } catch (error) {
    console.warn(
      "[device-identity] OpenAI normalization error",
      error instanceof Error
        ? error.message
        : "unknown"
    );

    return null;
  }
}
