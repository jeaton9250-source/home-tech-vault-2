import { NextResponse } from "next/server";

import {
  setClientVaultMode,
} from "@/lib/realtor/clientVaultMode";
import {
  createAdminClient,
} from "@/lib/supabase/admin";
import {
  createClient,
} from "@/lib/supabase/server";
import {
  isSafeUuid,
} from "@/lib/security/supabaseFilters";

export const dynamic =
  "force-dynamic";

export async function POST(
  request: Request
) {
  try {
    const supabase =
      await createClient();

    const {
      data: { user },
    } =
      await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error:
            "You must be signed in.",
        },
        { status: 401 }
      );
    }

    const body =
      (await request.json()) as {
        giftId?: string;
      };

    const giftId =
      body.giftId?.trim();

    if (
      !giftId ||
      !isSafeUuid(giftId)
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid Client Vault.",
        },
        { status: 400 }
      );
    }

    const admin =
      createAdminClient();

    const {
      data: gift,
      error: giftError,
    } = await admin
      .from(
        "realtor_vault_gifts"
      )
      .select(
        `
          id,
          household_id,
          realtor_user_id,
          status
        `
      )
      .eq("id", giftId)
      .eq(
        "realtor_user_id",
        user.id
      )
      .neq(
        "status",
        "claimed"
      )
      .maybeSingle();

    if (giftError) {
      throw giftError;
    }

    if (
      !gift ||
      !gift.household_id
    ) {
      return NextResponse.json(
        {
          error:
            "This Client Vault is no longer available.",
        },
        { status: 403 }
      );
    }

    const {
      data: household,
      error: householdError,
    } = await admin
      .from("households")
      .select("id")
      .eq(
        "id",
        gift.household_id
      )
      .eq(
        "owner_id",
        user.id
      )
      .maybeSingle();

    if (householdError) {
      throw householdError;
    }

    if (!household) {
      return NextResponse.json(
        {
          error:
            "This Client Vault has already transferred to the buyer.",
        },
        { status: 403 }
      );
    }

    await setClientVaultMode(
      gift.id,
      gift.household_id
    );

    return NextResponse.json({
      ok: true,
      redirectTo:
        "/dashboard",
    });
  } catch (error) {
    console.error(
      "Enter Client Vault failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to open Client Vault.",
      },
      { status: 500 }
    );
  }
}
