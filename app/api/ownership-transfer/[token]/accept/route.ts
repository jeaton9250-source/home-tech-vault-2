import {
  NextResponse,
} from "next/server";

import {
  acceptOwnershipTransfer,
} from "@/lib/realtor/transfers";

import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    token: string;
  }>;
};

export async function POST(
  _request: Request,
  context: RouteContext
) {
  try {
    const {
      token,
    } = await context.params;

    const supabase =
      await createClient();

    const {
      data: {
        user,
      },
      error: userError,
    } = await supabase.auth.getUser();

    if (
      userError ||
      !user
    ) {
      return NextResponse.json(
        {
          error:
            "Sign in with the buyer email to accept this Home Vault.",
          requiresAuth:
            true,
        },
        {
          status: 401,
        }
      );
    }

    const email =
      user.email?.trim();

    if (!email) {
      return NextResponse.json(
        {
          error:
            "Your account does not have an email address.",
        },
        {
          status: 400,
        }
      );
    }

    const result =
      await acceptOwnershipTransfer({
        token,
        userId:
          user.id,
        email,
      });

    return NextResponse.json({
      success: true,
      householdId:
        result.household_id,
      giftPlan:
        result.gift_plan,
      giftExpiresAt:
        result.gift_expires_at,
      redirectTo:
        "/dashboard",
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "";

    console.error(
      "[ownership-transfer/accept] failed:",
      error
    );

    const knownErrors: Record<
      string,
      string
    > = {
      TRANSFER_NOT_FOUND:
        "This ownership invitation could not be found.",

      TRANSFER_NOT_PENDING:
        "This ownership invitation has already been used or cancelled.",

      TRANSFER_EXPIRED:
        "This ownership invitation has expired.",

      TRANSFER_EMAIL_MISMATCH:
        "Sign in with the same email address the Realtor invited.",

      OWNER_CHANGED:
        "The ownership of this Vault changed before this invitation was accepted.",

      CANNOT_TRANSFER_TO_SELF:
        "This Vault is already owned by this account.",
    };

    const friendly =
      Object.entries(
        knownErrors
      ).find(
        ([key]) =>
          message.includes(key)
      )?.[1];

    return NextResponse.json(
      {
        error:
          friendly ||
          "Unable to transfer ownership of this Home Vault.",
      },
      {
        status:
          friendly
            ? 409
            : 500,
      }
    );
  }
}
