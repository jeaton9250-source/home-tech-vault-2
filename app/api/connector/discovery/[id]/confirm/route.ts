import {
  clearDiscoveredDeviceLink,
  confirmDiscoveredDeviceMatch,
} from "@/lib/connector/discoverySync";
import {
  householdAccessResponse,
  requireHouseholdMutator,
} from "@/lib/connector/requireHouseholdAdmin";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ConfirmBody = {
  householdId?: string;
  vaultDeviceId?: string;
  action?: "confirm" | "clear_link";
};

export async function POST(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await context.params;
    const body =
      (await request.json()) as ConfirmBody;

    const memberContext =
      await requireHouseholdMutator(
        body.householdId
      );

    const nowIso = new Date().toISOString();
    const admin = createAdminClient();

    if (body.action === "clear_link") {
      await clearDiscoveredDeviceLink({
        admin,
        householdId:
          memberContext.householdId,
        discoveredDeviceId: id,
        nowIso,
      });

      return NextResponse.json({ ok: true });
    }

    if (!body.vaultDeviceId?.trim()) {
      return NextResponse.json(
        {
          error:
            "vaultDeviceId is required to confirm a match.",
        },
        { status: 400 }
      );
    }

    await confirmDiscoveredDeviceMatch({
      admin,
      householdId: memberContext.householdId,
      discoveredDeviceId: id,
      vaultDeviceId:
        body.vaultDeviceId.trim(),
      userId: memberContext.userId,
      nowIso,
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

    console.error(
      "Discovery confirm error:",
      error instanceof Error
        ? error.message
        : error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}
