import { NextResponse } from "next/server";

import {
  buildHomeAdvisorResult,
} from "@/lib/advisor";

import {
  logAdvisorStage,
  toAdvisorDbError,
} from "@/lib/advisor/logging";

import {
  resolveHouseholdAccess,
} from "@/lib/data/householdScope";

import {
  buildServerPlanAccessContext,
} from "@/lib/permissions/serverPlanAccess";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  createClient,
} from "@/lib/supabase/server";

export const runtime = "nodejs";

export const dynamic =
  "force-dynamic";

function privateJson(
  body: unknown,
  init?: ResponseInit
) {
  const headers =
    new Headers(
      init?.headers
    );

  headers.set(
    "Cache-Control",
    "private, no-store, max-age=0"
  );

  return NextResponse.json(
    body,
    {
      ...init,
      headers,
    }
  );
}

export async function GET() {
  logAdvisorStage(
    "route.start",
    "route"
  );

  try {
    const supabase =
      await createClient();

    logAdvisorStage(
      "auth.start",
      "auth"
    );

    const {
      data: { user },
      error: userError,
    } =
      await supabase.auth.getUser();

    if (
      userError ||
      !user
    ) {
      logAdvisorStage(
        "auth.error",
        "auth",
        {
          error:
            toAdvisorDbError(
              userError
            ),
        }
      );

      return privateJson(
        {
          success: false,

          error:
            "You must be signed in to view Home Advisor insights.",
        },
        {
          status: 401,
        }
      );
    }

    logAdvisorStage(
      "auth.success",
      "auth"
    );

    const admin =
      createAdminClient();

    const [
      householdAccess,
      planContext,
    ] =
      await Promise.all([
        resolveHouseholdAccess(
          user.id,
          supabase
        ),

        buildServerPlanAccessContext(
          admin,
          user.id
        ),
      ]);

    const result =
      await buildHomeAdvisorResult(
        supabase,
        user.id,
        {
          householdId:
            householdAccess
              .householdId,

          householdOwnerId:
            householdAccess
              .householdOwnerId,

          /*
           * Free users still receive the
           * deterministic Vault analysis.
           *
           * Pro / Family get Groq synthesis.
           */
          skipAiSummary:
            !planContext
              .result
              .featureAccess
              .aiAdvisor,
        }
      );

    logAdvisorStage(
      "route.complete",
      "route"
    );

    return privateJson({
      success: true,
      advisor: result,
    });
  } catch (error) {
    logAdvisorStage(
      "route.error",
      "route",
      {
        error:
          toAdvisorDbError(
            error
          ),
      }
    );

    return privateJson(
      {
        success: false,

        error:
          "Unable to load Home Advisor insights right now.",
      },
      {
        status: 500,
      }
    );
  }
}
