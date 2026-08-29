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

function addMonths(
  date: Date,
  months: number
) {
  const result =
    new Date(date);

  result.setMonth(
    result.getMonth() +
      months
  );

  return result;
}

export async function GET(
  request: Request,
  context: RouteContext
) {
  const {
    id,
  } = await context.params;

  const origin =
    new URL(
      request.url
    ).origin;

  try {
    const supabase =
      await createClient();

    const {
      data: {
        user,
      },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(
        `${origin}/login?next=${encodeURIComponent(
          `/realtor/vaults/${id}`
        )}`
      );
    }

    const sessionId =
      new URL(
        request.url
      ).searchParams.get(
        "session_id"
      );

    if (!sessionId) {
      return NextResponse.redirect(
        `${origin}/realtor/vaults/${id}?checkout=missing_session`
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
          status,
          gift_duration_months,
          gift_starts_at,
          gift_expires_at,
          stripe_checkout_session_id
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
      return NextResponse.redirect(
        `${origin}/realtor?checkout=gift_not_found`
      );
    }

    if (
      [
        "preparing",
        "transfer_sent",
        "claimed",
      ].includes(
        gift.status
      )
    ) {
      return NextResponse.redirect(
        `${origin}/realtor/vaults/${gift.id}?checkout=success`
      );
    }

    const stripe =
      getStripe();

    const session =
      await stripe.checkout.sessions.retrieve(
        sessionId
      );

    if (
      session.id !==
      gift.stripe_checkout_session_id
    ) {
      throw new Error(
        "Checkout session does not match this gift."
      );
    }

    if (
      session.client_reference_id !==
      gift.id
    ) {
      throw new Error(
        "Checkout session reference does not match this gift."
      );
    }

    if (
      session.metadata?.gift_id !==
      gift.id
    ) {
      throw new Error(
        "Checkout metadata does not match this gift."
      );
    }

    if (
      session.metadata
        ?.realtor_user_id !==
      user.id
    ) {
      throw new Error(
        "Checkout belongs to another user."
      );
    }

    const checkoutCompleted =
      session.status ===
      "complete";

    const paymentSatisfied =
      session.payment_status ===
        "paid" ||
      (
        checkoutCompleted &&
        session.amount_total ===
          0
      );

    if (!paymentSatisfied) {
      return NextResponse.redirect(
        `${origin}/realtor/vaults/${gift.id}?checkout=unpaid`
      );
    }

    const months =
      Math.min(
        60,
        Math.max(
          1,
          Number(
            gift.gift_duration_months ||
              12
          )
        )
      );

    const startsAt =
      gift.gift_starts_at
        ? new Date(
            gift.gift_starts_at
          )
        : new Date();

    const expiresAt =
      gift.gift_expires_at
        ? new Date(
            gift.gift_expires_at
          )
        : addMonths(
            startsAt,
            months
          );

    const paymentIntentId =
      typeof session.payment_intent ===
        "string"
        ? session.payment_intent
        : session.payment_intent?.id ??
          null;

    const {
      error: updateError,
    } = await admin
      .from("realtor_vault_gifts")
      .update({
        status:
          "preparing",

        gift_starts_at:
          startsAt.toISOString(),

        gift_expires_at:
          expiresAt.toISOString(),

        stripe_checkout_session_id:
          session.id,

        stripe_payment_intent_id:
          paymentIntentId,
      })
      .eq(
        "id",
        gift.id
      )
      .eq(
        "realtor_user_id",
        user.id
      );

    if (updateError) {
      throw updateError;
    }

    return NextResponse.redirect(
      `${origin}/realtor/vaults/${gift.id}?checkout=success`
    );
  } catch (error) {
    console.error(
      "[realtor/checkout/complete] failed:",
      error
    );

    return NextResponse.redirect(
      `${origin}/realtor/vaults/${id}?checkout=error`
    );
  }
}
