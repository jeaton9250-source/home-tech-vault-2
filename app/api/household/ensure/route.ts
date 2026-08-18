import { NextResponse } from "next/server";

import { ensureUserHousehold } from "@/lib/household/ensureHousehold";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const supabase =
      await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error:
            "You must be signed in to create a household.",
        },
        {
          status: 401,
        }
      );
    }

    const body =
      (await request.json()) as {
        householdName?: unknown;
      };

    const householdName =
      typeof body.householdName === "string"
        ? body.householdName.trim()
        : "";

    if (!householdName) {
      return NextResponse.json(
        {
          error:
            "Enter a household name.",
        },
        {
          status: 400,
        }
      );
    }

    if (householdName.length > 120) {
      return NextResponse.json(
        {
          error:
            "Household names must be 120 characters or fewer.",
        },
        {
          status: 400,
        }
      );
    }

    const admin =
      createAdminClient();

    const result =
      await ensureUserHousehold({
        admin,
        userId: user.id,
        householdName,
      });

    return NextResponse.json({
      success: true,
      householdId:
        result.householdId,
      householdName:
        result.householdName,
      created: result.created,
    });
  } catch (error) {
    console.error(
      "[household/ensure] failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create your household.",
      },
      {
        status: 500,
      }
    );
  }
}
