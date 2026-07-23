import { ignoreDiscoveredDevice } from "@/lib/connector/discoverySync";
import {
  householdAccessResponse,
  requireHouseholdMutator,
} from "@/lib/connector/requireHouseholdAdmin";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type IgnoreBody = {
  householdId?: string;
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
      (await request.json()) as IgnoreBody;

    const memberContext =
      await requireHouseholdMutator(
        body.householdId
      );

    const nowIso = new Date().toISOString();
    const admin = createAdminClient();

    await ignoreDiscoveredDevice({
      admin,
      householdId: memberContext.householdId,
      discoveredDeviceId: id,
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
      "Discovery ignore error:",
      error instanceof Error
        ? error.message
        : error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}
