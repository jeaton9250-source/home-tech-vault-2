
import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CreateGiftBody = {
  buyerEmail?: unknown;
  buyerFirstName?: unknown;
  buyerLastName?: unknown;

  addressLine1?: unknown;
  addressLine2?: unknown;
  city?: unknown;
  state?: unknown;
  postalCode?: unknown;

  giftPlan?: unknown;
  giftDurationMonths?: unknown;
};

function text(
  value: unknown
) {
  return typeof value === "string"
    ? value.trim()
    : "";
}

export async function POST(
  request: Request
) {
  try {
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
            "You must be signed in.",
        },
        {
          status: 401,
        }
      );
    }

    const body =
      (await request.json()) as CreateGiftBody;

    const buyerEmail =
      text(body.buyerEmail)
        .toLowerCase();

    const addressLine1 =
      text(body.addressLine1);

    const city =
      text(body.city);

    const state =
      text(body.state);

    const postalCode =
      text(body.postalCode);

    if (
      !buyerEmail ||
      !buyerEmail.includes("@")
    ) {
      return NextResponse.json(
        {
          error:
            "Enter a valid buyer email.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !addressLine1 ||
      !city ||
      !state ||
      !postalCode
    ) {
      return NextResponse.json(
        {
          error:
            "Enter the complete property address.",
        },
        {
          status: 400,
        }
      );
    }

    const giftPlan =
      body.giftPlan === "family"
        ? "family"
        : body.giftPlan === "free"
          ? "free"
          : "pro";

    const requestedDuration =
      typeof body.giftDurationMonths ===
        "number"
        ? Math.trunc(
            body.giftDurationMonths
          )
        : 12;

    const durationMonths =
      Math.min(
        60,
        Math.max(
          1,
          requestedDuration
        )
      );

    const admin =
      createAdminClient();

    // ------------------------------------------------------
    // Ensure Realtor Partner
    // ------------------------------------------------------

    let {
      data: partner,
      error: partnerError,
    } = await admin
      .from("realtor_partners")
      .select(
        "id, user_id, referral_code, status"
      )
      .eq(
        "user_id",
        user.id
      )
      .maybeSingle();

    if (partnerError) {
      throw partnerError;
    }

    if (!partner) {
      return NextResponse.json(
        {
          error:
            "A verified Realtor account is required to create Client Vaults.",
        },
        {
          status: 403,
        }
      );
    }

    if (
      partner.status !== "active"
    ) {
      return NextResponse.json(
        {
          error:
            "Your Realtor account is not active.",
        },
        {
          status: 403,
        }
      );
    }

    // ------------------------------------------------------
    // Create gift draft.
    //
    // Household is intentionally NOT created here yet.
    // We will attach/create the client household after
    // checkout succeeds.
    // ------------------------------------------------------

    const {
      data: gift,
      error: giftError,
    } = await admin
      .from("realtor_vault_gifts")
      .insert({
        realtor_partner_id:
          partner.id,
        realtor_user_id:
          user.id,

        buyer_email:
          buyerEmail,

        buyer_first_name:
          text(
            body.buyerFirstName
          ) || null,

        buyer_last_name:
          text(
            body.buyerLastName
          ) || null,

        property_address_line1:
          addressLine1,

        property_address_line2:
          text(
            body.addressLine2
          ) || null,

        property_city:
          city,

        property_state:
          state,

        property_postal_code:
          postalCode,

        gift_plan:
          giftPlan,

        gift_duration_months:
          durationMonths,

        status:
          giftPlan === "free"
            ? "preparing"
            : "awaiting_payment",
      })
      .select("*")
      .single();

    if (giftError) {
      throw giftError;
    }

    return NextResponse.json({
      success: true,
      gift,
      referralCode:
        partner.referral_code,
    });
  } catch (error) {
    console.error(
      "[realtor/gifts] create failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create the client Vault.",
      },
      {
        status: 500,
      }
    );
  }
}
