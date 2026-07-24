import { NextResponse } from "next/server";

import { completeCreateAccountHousehold } from "@/lib/invite/createAccountHousehold";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

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
        { error: "Invitation session required." },
        { status: 401 }
      );
    }

    const body = (await request.json()) as {
      firstName?: string;
      lastName?: string;
      householdName?: string;
      homeNickname?: string | null;
    };

    const admin = createAdminClient();
    const result = await completeCreateAccountHousehold({
      admin,
      userId: user.id,
      userEmail: user.email ?? null,
      firstName: body.firstName ?? "",
      lastName: body.lastName ?? "",
      householdName: body.householdName ?? "",
      homeNickname: body.homeNickname ?? null,
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json({
      householdId: result.householdId,
      householdName: result.householdName,
      message: result.message,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    console.error(
      "Create-account household setup error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message.toLowerCase()
        : "";

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
      { error: "Unable to create your household." },
      { status: 500 }
    );
  }
}
