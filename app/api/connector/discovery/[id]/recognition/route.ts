import { reviewDiscoveredRecognitionSuggestion } from "@/lib/connector/discoverySync";
import { isSupportedDeviceIconKey } from "@/lib/connector/recognitionSuggestion";
import {
  householdAccessResponse,
  requireHouseholdMutator,
} from "@/lib/connector/requireHouseholdAdmin";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RecognitionBody = {
  householdId?: string;
  action?: "accept" | "dismiss";
  edits?: {
    friendlyName?: string | null;
    manufacturer?: string | null;
    model?: string | null;
    category?: string | null;
    deviceTypeKey?: string | null;
  };
};

const MAX_LENGTHS = {
  friendlyName: 120,
  manufacturer: 100,
  model: 120,
  category: 60,
  deviceTypeKey: 60,
} as const;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type NormalizedFieldResult = {
  value: string | null;
  error: string | null;
};

function normalizeOptionalText(value: string | null | undefined) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeOptionalTextWithMax(
  value: string | null | undefined,
  maxLength: number,
  fieldName: string
): NormalizedFieldResult {
  const normalized = normalizeOptionalText(value);

  if (!normalized) {
    return { value: null, error: null };
  }

  if (normalized.length > maxLength) {
    return {
      value: null,
      error: `${fieldName} exceeds maximum length of ${maxLength}.`,
    };
  }

  return {
    value: normalized,
    error: null,
  };
}

function validateUuid(value: string) {
  return UUID_PATTERN.test(value);
}

function safeErrorLog(error: unknown) {
  if (error instanceof Error) {
    console.error(
      "Discovery recognition review error:",
      error.message
    );
    return;
  }

  console.error(
    "Discovery recognition review error:",
    "Unknown error"
  );
}

export async function POST(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await context.params;

    if (!validateUuid(id)) {
      return NextResponse.json(
        {
          error: "Invalid discovered device id.",
        },
        { status: 400 }
      );
    }

    const body =
      (await request.json()) as RecognitionBody;

    if (body.action !== "accept" && body.action !== "dismiss") {
      return NextResponse.json(
        {
          error:
            "action must be either accept or dismiss.",
        },
        { status: 400 }
      );
    }

    const memberContext =
      await requireHouseholdMutator(
        body.householdId
      );

    const nowIso = new Date().toISOString();
    const admin = createAdminClient();

    if (body.action === "dismiss") {
      await reviewDiscoveredRecognitionSuggestion({
        admin,
        householdId: memberContext.householdId,
        discoveredDeviceId: id,
        userId: memberContext.userId,
        nowIso,
        action: "dismiss",
      });

      return NextResponse.json({ ok: true });
    }

    const friendlyName = normalizeOptionalTextWithMax(
      body.edits?.friendlyName,
      MAX_LENGTHS.friendlyName,
      "friendlyName"
    );

    if (friendlyName.error) {
      return NextResponse.json(
        { error: friendlyName.error },
        { status: 400 }
      );
    }

    const manufacturer = normalizeOptionalTextWithMax(
      body.edits?.manufacturer,
      MAX_LENGTHS.manufacturer,
      "manufacturer"
    );

    if (manufacturer.error) {
      return NextResponse.json(
        { error: manufacturer.error },
        { status: 400 }
      );
    }

    const model = normalizeOptionalTextWithMax(
      body.edits?.model,
      MAX_LENGTHS.model,
      "model"
    );

    if (model.error) {
      return NextResponse.json(
        { error: model.error },
        { status: 400 }
      );
    }

    const category = normalizeOptionalTextWithMax(
      body.edits?.category,
      MAX_LENGTHS.category,
      "category"
    );

    if (category.error) {
      return NextResponse.json(
        { error: category.error },
        { status: 400 }
      );
    }

    const deviceTypeKey = normalizeOptionalTextWithMax(
      body.edits?.deviceTypeKey,
      MAX_LENGTHS.deviceTypeKey,
      "deviceTypeKey"
    );

    if (deviceTypeKey.error) {
      return NextResponse.json(
        { error: deviceTypeKey.error },
        { status: 400 }
      );
    }

    if (
      deviceTypeKey.value &&
      !isSupportedDeviceIconKey(deviceTypeKey.value)
    ) {
      return NextResponse.json(
        {
          error:
            "deviceTypeKey is not supported.",
        },
        { status: 400 }
      );
    }

    await reviewDiscoveredRecognitionSuggestion({
      admin,
      householdId: memberContext.householdId,
      discoveredDeviceId: id,
      userId: memberContext.userId,
      nowIso,
      action: "accept",
      edits: {
        friendlyName: friendlyName.value,
        manufacturer: manufacturer.value,
        model: model.value,
        category: category.value,
        deviceTypeKey: deviceTypeKey.value,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const accessResponse =
      householdAccessResponse(error);

    if (accessResponse) {
      return NextResponse.json(
        { error: accessResponse.message },
        { status: accessResponse.status }
      );
    }

    safeErrorLog(error);

    return NextResponse.json(
      {
        error:
          "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}
