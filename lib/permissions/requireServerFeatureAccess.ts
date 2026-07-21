import "server-only";

import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { buildServerPlanAccessContext } from "@/lib/permissions/serverPlanAccess";

import type { EffectivePlanResult } from "@/lib/permissions/effectivePlan";
import type { FeatureKey } from "@/lib/permissions/types";

import type { User } from "@supabase/supabase-js";

export class FeatureAccessError extends Error {
  readonly code:
    | "UNAUTHORIZED"
    | "FORBIDDEN";

  constructor(
    code: "UNAUTHORIZED" | "FORBIDDEN",
    message?: string
  ) {
    super(message ?? code);
    this.code = code;
  }
}

export type ServerFeatureAccessContext = {
  user: User;
  userId: string;
  result: EffectivePlanResult;
};

/**
 * Authenticate the current user and confirm centralized feature access
 * using effective plan resolution (including inherited Family and admin grants).
 * Household role is not used for authorization.
 */
export async function requireServerFeatureAccess(
  feature: FeatureKey
): Promise<ServerFeatureAccessContext> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new FeatureAccessError(
      "UNAUTHORIZED"
    );
  }

  const admin = createAdminClient();

  const { result } =
    await buildServerPlanAccessContext(
      admin,
      user.id
    );

  if (result.effectivePlanSource === "demo") {
    throw new FeatureAccessError(
      "FORBIDDEN",
      "Demo mode is read-only."
    );
  }

  if (!result.featureAccess[feature]) {
    throw new FeatureAccessError(
      "FORBIDDEN"
    );
  }

  return {
    user,
    userId: user.id,
    result,
  };
}

export function featureAccessResponse(
  error: unknown
) {
  if (error instanceof FeatureAccessError) {
    if (error.code === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  return null;
}
