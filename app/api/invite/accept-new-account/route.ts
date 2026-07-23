import { NextResponse } from "next/server";

import { acceptNewAccountInvitation } from "@/lib/admin/invitations";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { resolvePostAuthRedirect } from "@/lib/onboarding/redirect";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Sign in required." },
        { status: 401 }
      );
    }

    const body = (await request.json()) as {
      token?: string;
      firstName?: string;
      lastName?: string;
      householdName?: string;
    };

    const token = body.token?.trim() || "";

    if (!token) {
      return NextResponse.json(
        { error: "Invitation token is required." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const result = await acceptNewAccountInvitation({
      admin,
      userId: user.id,
      userEmail: user.email ?? null,
      token,
      firstName: body.firstName ?? "",
      lastName: body.lastName ?? "",
      householdName: body.householdName ?? "",
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    const redirectTo = await resolvePostAuthRedirect(
      supabase,
      user.id,
      "/dashboard"
    );

    return NextResponse.json({
      householdId: result.householdId,
      householdName: result.householdName,
      message: result.message,
      redirectTo,
    });
  } catch (error) {
    console.error("Accept new-account invitation error:", error);

    const message =
      error instanceof Error ? error.message.toLowerCase() : "";

    if (
      message.includes("duplicate") ||
      message.includes("unique")
    ) {
      return NextResponse.json(
        {
          error:
            "Unable to create that household. Try a different household name.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Unable to finish account setup." },
      { status: 500 }
    );
  }
}
