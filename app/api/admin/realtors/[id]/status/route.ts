import { NextResponse } from "next/server";

import {
  platformAdminAccessResponse,
  requirePlatformAdminSession,
} from "@/lib/auth/platformAdmin";

import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    await requirePlatformAdminSession();

    const { id } = await context.params;
    const body = await request.json();

    const status =
      typeof body.status === "string"
        ? body.status
        : "";

    if (
      !["active", "suspended"].includes(status)
    ) {
      return NextResponse.json(
        { error: "Invalid status." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    const { error } = await admin
      .from("realtor_partners")
      .update({
        status,
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      status,
    });
  } catch (error) {
    const accessResponse =
      platformAdminAccessResponse(error);

    if (accessResponse) {
      return accessResponse;
    }

    console.error(
      "[admin-realtor-status]",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to update Realtor status.",
      },
      { status: 500 }
    );
  }
}
