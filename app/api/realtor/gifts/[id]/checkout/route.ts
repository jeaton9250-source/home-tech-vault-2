import Stripe from "stripe";

import {
  NextResponse,
} from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function getStripe() {
  const secretKey =
    process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error(
      "STRIPE_SECRET_KEY is not configured."
    );
  }

  return new Stripe(
    secretKey
  );
}

export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    const {
      id,
    } = await context.params;

    const supabase =
      await createClient();

    const {
      data: {
        user,
      },
      error: authError,
    } = await supabase.auth.getUser();

    if (
      authError ||
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

    const priceId =
      process.env
        .STRIPE_REALTOR_GIFT_PRICE_ID;

    if (!priceId) {
      return NextResponse.json(
        {
          error:
            "The Realtor Closing Gift price has not been configured.",
        },
        {
          status: 503,
        }
      );
    }

    const admin =
      createAdminClient();

    const {
      data: gift,
      error: giftError,
    } = await admin
      .from("realtor_vault_gifts")
      .select(
        `
          id,
          realtor_user_id,
          household_id,
          buyer_email,
          buyer_first_name,
          buyer_last_name,
          property_address_line1,
          gift_plan,
          gift_duration_months,
          status
        `
      )
      .eq(
        "id",
        id
      )
      .eq(
        "realtor_user_id",
        user.id
      )
      .maybeSingle();

    if (giftError) {
      throw giftError;
    }

    if (!gift) {
      return NextResponse.json(
        {
          error:
            "Client Vault not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (!gift.household_id) {
      return NextResponse.json(
        {
          error:
            "Prepare the Client Vault before checkout.",
        },
        {
          status: 409,
        }
      );
    }

    if (
      gift.status !==
      "awaiting_payment"
    ) {
      return NextResponse.json(
        {
          error:
            "This gift is not awaiting payment.",
        },
        {
          status: 409,
        }
      );
    }

    const stripe =
      getStripe();

    const origin =
      new URL(
        request.url
      ).origin;

    const session =
      await stripe.checkout.sessions.create({
        mode:
          "payment",

        allow_promotion_codes:
          true,

        line_items: [
          {
            price:
              priceId,
            quantity:
              1,
          },
        ],

        success_url:
          `${origin}/api/realtor/gifts/${gift.id}/checkout/complete?session_id={CHECKOUT_SESSION_ID}`,

        cancel_url:
          `${origin}/realtor/vaults/${gift.id}?checkout=cancelled`,

        customer_email:
          user.email ||
          undefined,

        client_reference_id:
          gift.id,

        metadata: {
          type:
            "realtor_closing_gift",

          gift_id:
            gift.id,

          realtor_user_id:
            user.id,

          household_id:
            gift.household_id,

          buyer_email:
            gift.buyer_email,

          gift_plan:
            gift.gift_plan,

          gift_duration_months:
            String(
              gift.gift_duration_months
            ),
        },
      });

    if (!session.url) {
      throw new Error(
        "Stripe did not return a checkout URL."
      );
    }

    const {
      error: updateError,
    } = await admin
      .from("realtor_vault_gifts")
      .update({
        stripe_checkout_session_id:
          session.id,
      })
      .eq(
        "id",
        gift.id
      );

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success:
        true,

      checkoutUrl:
        session.url,
    });
  } catch (error) {
    console.error(
      "[realtor/checkout] failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to start checkout.",
      },
      {
        status: 500,
      }
    );
  }
}
