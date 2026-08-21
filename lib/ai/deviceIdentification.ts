import "server-only";

import {
  createHash,
} from "node:crypto";

import OpenAI from "openai";

import {
  buildServerPlanAccessContext,
} from "@/lib/permissions/serverPlanAccess";

import type {
  IdentificationResult,
} from "@/lib/connector/deviceIdentification";

import type {
  ParsedDiscoveryDevice,
} from "@/lib/connector/discoveryValidation";

import type {
  SupabaseClient,
} from "@supabase/supabase-js";

const AI_DEVICE_TIMEOUT_MS = 8_000;

const DEFAULT_MONTHLY_REQUEST_LIMIT = 100;

const LOW_CONFIDENCE_LEVELS = new Set([
  "medium",
  "low",
  "unknown",
]);

export type AiDeviceSuggestion = {
  displayName: string | null;
  manufacturer: string | null;
  model: string | null;
  category: string | null;
  deviceType: string | null;
  confidence: number;
  reason: string;
};

export type AiDeviceIdentificationResult = {
  suggestion: AiDeviceSuggestion | null;
  source:
    | "cache"
    | "ai"
    | "deterministic"
    | "not_entitled"
    | "limit_reached"
    | "unavailable";
  fingerprintHash: string;
  observationHash: string;
};

type CachedSuggestionRow = {
  suggested_name: string | null;
  suggested_manufacturer: string | null;
  suggested_model: string | null;
  suggested_category: string | null;
  suggested_device_type: string | null;
  confidence: number | string;
  reason: string;
};

type OpenAiStructuredSuggestion = {
  display_name: string | null;
  manufacturer: string | null;
  model: string | null;
  category: string | null;
  device_type: string | null;
  confidence: number;
  reason: string;
};

const DEVICE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    display_name: {
      type: [
        "string",
        "null",
      ],
    },

    manufacturer: {
      type: [
        "string",
        "null",
      ],
    },

    model: {
      type: [
        "string",
        "null",
      ],
    },

    category: {
      type: [
        "string",
        "null",
      ],
    },

    device_type: {
      type: [
        "string",
        "null",
      ],
    },

    confidence: {
      type: "number",
      minimum: 0,
      maximum: 1,
    },

    reason: {
      type: "string",
      minLength: 1,
      maxLength: 300,
    },
  },

  required: [
    "display_name",
    "manufacturer",
    "model",
    "category",
    "device_type",
    "confidence",
    "reason",
  ],
} as const;

function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> {
  return new Promise(
    (resolve, reject) => {
      const timer = setTimeout(
        () => {
          reject(
            new Error(
              "AI device identification timed out."
            )
          );
        },
        timeoutMs
      );

      promise
        .then((value) => {
          clearTimeout(timer);
          resolve(value);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    }
  );
}

function hashValue(
  value: string
): string {
  return createHash("sha256")
    .update(value)
    .digest("hex");
}

function normalizeOptionalText(
  value:
    | string
    | null
    | undefined,
  maxLength = 200
): string | null {
  const trimmed =
    value?.trim() ?? "";

  if (!trimmed) {
    return null;
  }

  return trimmed.slice(
    0,
    maxLength
  );
}

function normalizeStringArray(
  values:
    | string[]
    | null
    | undefined,
  maximumItems = 16
): string[] {
  return [
    ...new Set(
      (values ?? [])
        .map((value) =>
          value.trim()
        )
        .filter(Boolean)
    ),
  ]
    .sort()
    .slice(0, maximumItems);
}

function buildSafeObservation(
  device: ParsedDiscoveryDevice
) {
  /*
   * Deliberately excluded:
   * - full MAC address
   * - IP address
   * - serial number
   * - household/user identifiers
   */
  return {
    hostname:
      normalizeOptionalText(
        device.hostname
      ),

    manufacturer:
      normalizeOptionalText(
        device.manufacturer
      ),

    model:
      normalizeOptionalText(
        device.model
      ),

    friendlyName:
      normalizeOptionalText(
        device.friendlyName
      ),

    deviceType:
      normalizeOptionalText(
        device.deviceType
      ),

    discoverySources:
      normalizeStringArray(
        device.discoverySources
      ),

    mdnsServices:
      normalizeStringArray(
        device.mdnsServices
      ),

    ssdpDeviceType:
      normalizeOptionalText(
        device.ssdpDeviceType
      ),

    ssdpDescriptionHint:
      normalizeOptionalText(
        device.ssdpDescriptionUrl
          ?.split("?")[0]
          ?.split("/")
          ?.pop() ??
        null,
        100
      ),
  };
}

export function buildAiDeviceHashes(
  device: ParsedDiscoveryDevice
): {
  fingerprintHash: string;
  observationHash: string;
} {
  const safeObservation =
    buildSafeObservation(device);

  return {
    fingerprintHash:
      hashValue(
        device.localFingerprint
      ),

    observationHash:
      hashValue(
        JSON.stringify(
          safeObservation
        )
      ),
  };
}

export function shouldRequestAiIdentification(
  input: {
    deterministic:
      IdentificationResult;
    recognitionStatus?:
      | "pending"
      | "accepted"
      | "dismissed"
      | null;
    importedDeviceId?:
      | string
      | null;
  }
): boolean {
  if (
    input.recognitionStatus ===
      "accepted" ||
    input.recognitionStatus ===
      "dismissed"
  ) {
    return false;
  }

  if (input.importedDeviceId) {
    return false;
  }

  return LOW_CONFIDENCE_LEVELS.has(
    input.deterministic
      .identificationConfidence
  );
}

function parsePositiveInteger(
  value:
    | string
    | undefined,
  fallback: number
): number {
  const parsed =
    Number.parseInt(
      value ?? "",
      10
    );

  if (
    !Number.isFinite(parsed) ||
    parsed < 1
  ) {
    return fallback;
  }

  return parsed;
}

function currentMonthStartIso(): string {
  const now = new Date();

  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      1
    )
  ).toISOString();
}

async function hasMonthlyCapacity(
  admin: SupabaseClient,
  householdId: string
): Promise<boolean> {
  const limit =
    parsePositiveInteger(
      process.env
        .AI_DEVICE_MONTHLY_REQUEST_LIMIT,
      DEFAULT_MONTHLY_REQUEST_LIMIT
    );

  const {
    count,
    error,
  } = await admin
    .from("ai_usage_events")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq(
      "household_id",
      householdId
    )
    .eq(
      "feature",
      "device_identification"
    )
    .eq(
      "cache_hit",
      false
    )
    .eq(
      "succeeded",
      true
    )
    .gte(
      "created_at",
      currentMonthStartIso()
    );

  if (error) {
    throw error;
  }

  return (count ?? 0) < limit;
}

async function loadCachedSuggestion(
  admin: SupabaseClient,
  input: {
    householdId: string;
    fingerprintHash: string;
    observationHash: string;
  }
): Promise<AiDeviceSuggestion | null> {
  const {
    data,
    error,
  } = await admin
    .from(
      "ai_device_identification_cache"
    )
    .select(
      [
        "suggested_name",
        "suggested_manufacturer",
        "suggested_model",
        "suggested_category",
        "suggested_device_type",
        "confidence",
        "reason",
      ].join(", ")
    )
    .eq(
      "household_id",
      input.householdId
    )
    .eq(
      "fingerprint_hash",
      input.fingerprintHash
    )
    .eq(
      "observation_hash",
      input.observationHash
    )
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const row =
    data as unknown as CachedSuggestionRow;

  return {
    displayName:
      row.suggested_name,

    manufacturer:
      row.suggested_manufacturer,

    model:
      row.suggested_model,

    category:
      row.suggested_category,

    deviceType:
      row.suggested_device_type,

    confidence:
      Number(row.confidence),

    reason:
      row.reason,
  };
}

function parseStructuredSuggestion(
  value: string
): AiDeviceSuggestion {
  const parsed =
    JSON.parse(
      value
    ) as OpenAiStructuredSuggestion;

  return {
    displayName:
      normalizeOptionalText(
        parsed.display_name
      ),

    manufacturer:
      normalizeOptionalText(
        parsed.manufacturer
      ),

    model:
      normalizeOptionalText(
        parsed.model
      ),

    category:
      normalizeOptionalText(
        parsed.category
      ),

    deviceType:
      normalizeOptionalText(
        parsed.device_type
      ),

    confidence:
      Math.max(
        0,
        Math.min(
          1,
          Number(
            parsed.confidence
          )
        )
      ),

    reason:
      normalizeOptionalText(
        parsed.reason,
        300
      ) ??
      "Limited network evidence was available.",
  };
}

async function saveSuggestion(
  admin: SupabaseClient,
  input: {
    householdId: string;
    connectorId: string;
    fingerprintHash: string;
    observationHash: string;
    model: string;
    suggestion:
      AiDeviceSuggestion;
    inputTokens: number;
    outputTokens: number;
  }
) {
  const {
    error,
  } = await admin
    .from(
      "ai_device_identification_cache"
    )
    .upsert(
      {
        household_id:
          input.householdId,

        connector_id:
          input.connectorId,

        fingerprint_hash:
          input.fingerprintHash,

        observation_hash:
          input.observationHash,

        model:
          input.model,

        suggested_name:
          input.suggestion
            .displayName,

        suggested_manufacturer:
          input.suggestion
            .manufacturer,

        suggested_model:
          input.suggestion.model,

        suggested_category:
          input.suggestion.category,

        suggested_device_type:
          input.suggestion
            .deviceType,

        confidence:
          input.suggestion
            .confidence,

        reason:
          input.suggestion.reason,

        input_tokens:
          input.inputTokens,

        output_tokens:
          input.outputTokens,

        /*
         * Token usage is recorded now.
         * Cost remains zero until model
         * rates are configured explicitly,
         * avoiding inaccurate estimates.
         */
        estimated_cost_micros: 0,

        updated_at:
          new Date().toISOString(),
      },
      {
        onConflict:
          [
            "household_id",
            "fingerprint_hash",
            "observation_hash",
          ].join(","),
      }
    );

  if (error) {
    throw error;
  }
}

async function logUsage(
  admin: SupabaseClient,
  input: {
    householdId: string;
    userId: string;
    connectorId: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    succeeded: boolean;
    errorCode?: string | null;
  }
) {
  const {
    error,
  } = await admin
    .from("ai_usage_events")
    .insert({
      household_id:
        input.householdId,

      user_id:
        input.userId,

      connector_id:
        input.connectorId,

      feature:
        "device_identification",

      model:
        input.model,

      input_tokens:
        input.inputTokens,

      output_tokens:
        input.outputTokens,

      estimated_cost_micros: 0,

      cache_hit: false,

      succeeded:
        input.succeeded,

      error_code:
        input.errorCode ?? null,
    });

  if (error) {
    console.error(
      "[ai-device-identification] usage logging failed:",
      error.message
    );
  }
}

export async function identifyDeviceWithAi(
  input: {
    admin: SupabaseClient;
    householdId: string;
    connectorId: string;
    actorUserId:
      | string
      | null;
    device:
      ParsedDiscoveryDevice;
    deterministic:
      IdentificationResult;
    recognitionStatus?:
      | "pending"
      | "accepted"
      | "dismissed"
      | null;
    importedDeviceId?:
      | string
      | null;
  }
): Promise<AiDeviceIdentificationResult> {
  const {
    fingerprintHash,
    observationHash,
  } = buildAiDeviceHashes(
    input.device
  );

  const fallback = (
    source:
      AiDeviceIdentificationResult["source"]
  ): AiDeviceIdentificationResult => ({
    suggestion: null,
    source,
    fingerprintHash,
    observationHash,
  });

  if (
    !shouldRequestAiIdentification({
      deterministic:
        input.deterministic,

      recognitionStatus:
        input.recognitionStatus,

      importedDeviceId:
        input.importedDeviceId,
    })
  ) {
    return fallback(
      "deterministic"
    );
  }

  if (!input.actorUserId) {
    return fallback(
      "unavailable"
    );
  }

  const cached =
    await loadCachedSuggestion(
      input.admin,
      {
        householdId:
          input.householdId,

        fingerprintHash,

        observationHash,
      }
    );

  if (cached) {
    return {
      suggestion: cached,
      source: "cache",
      fingerprintHash,
      observationHash,
    };
  }

  const planContext =
    await buildServerPlanAccessContext(
      input.admin,
      input.actorUserId
    );

  if (
    !planContext.result
      .featureAccess.networkDiscover
  ) {
    return fallback(
      "not_entitled"
    );
  }

  const apiKey =
    process.env
      .OPENAI_API_KEY
      ?.trim();

  if (!apiKey) {
    return fallback(
      "unavailable"
    );
  }

  const hasCapacity =
    await hasMonthlyCapacity(
      input.admin,
      input.householdId
    );

  if (!hasCapacity) {
    return fallback(
      "limit_reached"
    );
  }

  const model =
    process.env
      .OPENAI_DEVICE_IDENTIFICATION_MODEL
      ?.trim() ||
    process.env
      .OPENAI_ADVISOR_MODEL
      ?.trim() ||
    "gpt-4o-mini";

  const client =
    new OpenAI({
      apiKey,
    });

  const safeObservation =
    buildSafeObservation(
      input.device
    );

  try {
    const response =
      await withTimeout(
        client.responses.create({
          model,

          store: false,

          input: [
            {
              role: "system",
              content: [
                {
                  type:
                    "input_text",

                  text:
                    [
                       "You identify consumer home-network devices from limited discovery metadata.",
                       "Your primary job is to produce a clean, human-friendly display_name for the device.",
                       "Use only the supplied evidence.",
                       "Do not invent an exact model, manufacturer, or product family that the evidence does not support.",
                       "Return null for exact fields that cannot be supported.",
                       "A useful generic display_name is allowed when the category or manufacturer is supported, for example Apple TV, LG Smart TV, Roku Streaming Device, HP Printer, Smart Speaker, Security Camera, or Network Device.",
                       "Never use an IP address, MAC address, UUID, raw fingerprint, protocol banner, server banner, or meaningless random identifier as display_name.",
                       "Do not return raw .local, .lan, or .home.arpa hostnames as display_name. Convert meaningful hostname words into a readable consumer label and discard network-only suffixes.",
                       "Prefer manufacturer plus product family or category when supported.",
                       "Preserve meaningful product-family terms from the evidence, but do not guess a model suffix.",
                       "Use a broad category such as Television, Streaming Device, Router, Camera, Speaker, Printer, Computer, Phone, Tablet, Smart Home, Network Device, or Unknown.",
                       "Confidence must reflect how strongly the supplied evidence supports the result.",
                       "The reason must be concise and mention the strongest evidence.",
                     ].join(" "),
                },
              ],
            },

            {
              role: "user",
              content: [
                {
                  type:
                    "input_text",

                  text:
                    JSON.stringify({
                      observation:
                        safeObservation,

                      currentRuleResult: {
                        displayName:
                          input
                            .deterministic
                            .displayName,

                        manufacturer:
                          input
                            .deterministic
                            .likelyBrand,

                        model:
                          input
                            .deterministic
                            .model,

                        category:
                          input
                            .deterministic
                            .likelyCategory,

                        confidence:
                          input
                            .deterministic
                            .identificationConfidence,

                        reasons:
                          input
                            .deterministic
                            .identificationReasons
                            .slice(0, 5),
                      },
                    }),
                },
              ],
            },
          ],

          text: {
            format: {
              type:
                "json_schema",

              name:
                "device_identification",

              strict: true,

              schema:
                DEVICE_SCHEMA,
            },
          },

          max_output_tokens: 220,
        }),
        AI_DEVICE_TIMEOUT_MS
      );

    const outputText =
      response.output_text?.trim();

    if (!outputText) {
      await logUsage(
        input.admin,
        {
          householdId:
            input.householdId,

          userId:
            input.actorUserId,

          connectorId:
            input.connectorId,

          model,

          inputTokens:
            response.usage
              ?.input_tokens ??
            0,

          outputTokens:
            response.usage
              ?.output_tokens ??
            0,

          succeeded: false,

          errorCode:
            "EMPTY_RESPONSE",
        }
      );

      return fallback(
        "unavailable"
      );
    }

    const suggestion =
      parseStructuredSuggestion(
        outputText
      );

    const inputTokens =
      response.usage
        ?.input_tokens ??
      0;

    const outputTokens =
      response.usage
        ?.output_tokens ??
      0;

    await saveSuggestion(
      input.admin,
      {
        householdId:
          input.householdId,

        connectorId:
          input.connectorId,

        fingerprintHash,

        observationHash,

        model,

        suggestion,

        inputTokens,

        outputTokens,
      }
    );

    await logUsage(
      input.admin,
      {
        householdId:
          input.householdId,

        userId:
          input.actorUserId,

        connectorId:
          input.connectorId,

        model,

        inputTokens,

        outputTokens,

        succeeded: true,
      }
    );

    return {
      suggestion,
      source: "ai",
      fingerprintHash,
      observationHash,
    };
  } catch (error) {
    console.error(
      "[ai-device-identification] request failed:",
      error instanceof Error
        ? error.message
        : error
    );

    await logUsage(
      input.admin,
      {
        householdId:
          input.householdId,

        userId:
          input.actorUserId,

        connectorId:
          input.connectorId,

        model,

        inputTokens: 0,

        outputTokens: 0,

        succeeded: false,

        errorCode:
          error instanceof Error
            ? error.name
            : "UNKNOWN_ERROR",
      }
    );

    return fallback(
      "unavailable"
    );
  }
}

function confidenceLabelFromScore(
  score: number
): IdentificationResult["identificationConfidence"] {
  if (score >= 0.95) {
    return "exact";
  }

  if (score >= 0.85) {
    return "high";
  }

  if (score >= 0.65) {
    return "medium";
  }

  if (score >= 0.4) {
    return "low";
  }

  return "unknown";
}

/**
 * Merge an AI suggestion into the rule-based result.
 *
 * This does not handle accepted user recognition. Accepted values
 * remain protected later in the discovery sync pipeline.
 */
export function mergeAiDeviceSuggestion(
  deterministic: IdentificationResult,
  aiResult: AiDeviceIdentificationResult
): IdentificationResult {
  const suggestion =
    aiResult.suggestion;

  if (!suggestion) {
    return deterministic;
  }

  const aiReason =
    `AI-assisted identification: ${suggestion.reason}`;

  return {
    likelyCategory:
      (suggestion.category as IdentificationResult["likelyCategory"]) ??
      deterministic.likelyCategory,

    likelyBrand:
      suggestion.manufacturer ??
      deterministic.likelyBrand,

    friendlyName:
      suggestion.displayName ??
      deterministic.friendlyName,

    model:
      suggestion.model ??
      deterministic.model,

    identificationConfidence:
      confidenceLabelFromScore(
        suggestion.confidence
      ),

    identificationReasons: [
      aiReason,
      ...deterministic.identificationReasons,
    ].slice(0, 6),

    displayName:
      suggestion.displayName ??
      deterministic.displayName,
  };
}
