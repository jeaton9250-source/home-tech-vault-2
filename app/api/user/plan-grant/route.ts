import { NextResponse } from "next/server";

import { toSafeGrantSummary } from "@/lib/plan-grants/grantAccess";
import { loadActivePlanGrantForUser } from "@/lib/plan-grants/loadActiveGrant";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function privateJson(
  body: unknown,
  init: ResponseInit = {}
) {
  const headers = new Headers(init.headers);

  headers.set(
    "Cache-Control",
    "private, no-store, max-age=0"
  );

  headers.set("Pragma", "no-cache");

  return NextResponse.json(body, {
    ...init,
    headers,
  });
}


export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      throw userError;
    }

    if (!user) {
      return privateJson(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const grant =
      await loadActivePlanGrantForUser(
        supabase,
        user.id
      );

    return privateJson({
      grant: toSafeGrantSummary(grant),
    });
  } catch (error) {
    console.error(
      "Plan grant lookup error:",
      error
    );

    return privateJson(
      {
        error:
          "Unable to load plan grant.",
      },
      { status: 500 }
    );
  }
}
