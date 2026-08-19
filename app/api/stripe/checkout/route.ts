import Stripe from "stripe";
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type CheckoutPlan = "pro" | "family";

type CheckoutBody = {
  plan?: CheckoutPlan;
};

export async function POST(request: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        {
          error:
            "STRIPE_SECRET_KEY is missing from .env.local.",
        },
        { status: 500 }
      );
    }

    const stripe = new Stripe(
      process.env.STRIPE_SECRET_KEY
    );

    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      throw userError;
    }

    if (!user) {
      return NextResponse.json(
        {
          error: "You must be signed in to upgrade.",
        },
        { status: 401 }
      );
    }

    const body = (await request.json()) as CheckoutBody;
    const plan = body.plan;

    if (plan !== "pro" && plan !== "family") {
      return NextResponse.json(
        {
          error: "Invalid subscription plan.",
        },
        { status: 400 }
      );
    }

    /*
     * Checkout authorization must also be enforced
     * server-side. Client-side disabled buttons are
     * presentation only and can be bypassed.
     */
    const {
      data: membership,
      error: membershipError,
    } = await supabase
      .from("household_members")
      .select("household_id, role")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    if (membershipError) {
      console.error(
        "Unable to verify checkout household access:",
        membershipError
      );

      return NextResponse.json(
        {
          error:
            "Unable to verify billing permissions.",
        },
        { status: 500 }
      );
    }

    const normalizedRole =
      typeof membership?.role === "string"
        ? membership.role
            .trim()
            .toLowerCase()
        : null;

    if (
      normalizedRole === "member" ||
      normalizedRole === "viewer"
    ) {
      return NextResponse.json(
        {
          error:
            "Only the household owner can start or change a subscription.",
        },
        { status: 403 }
      );
    }

    if (membership?.household_id) {
      const {
        data: household,
        error: householdError,
      } = await supabase
        .from("households")
        .select("owner_id")
        .eq(
          "id",
          membership.household_id
        )
        .maybeSingle();

      if (householdError) {
        console.error(
          "Unable to verify household billing owner:",
          householdError
        );

        return NextResponse.json(
          {
            error:
              "Unable to verify household billing permissions.",
          },
          { status: 500 }
        );
      }

      if (
        household?.owner_id &&
        household.owner_id !== user.id
      ) {
        return NextResponse.json(
          {
            error:
              "Only the household owner can start or change a subscription.",
          },
          { status: 403 }
        );
      }
    }

    const priceId =
      plan === "pro"
        ? process.env.STRIPE_PRO_PRICE_ID
        : process.env.STRIPE_FAMILY_PRICE_ID;

    if (!priceId) {
      return NextResponse.json(
        {
          error: `The Stripe Price ID for ${plan} is missing.`,
        },
        { status: 500 }
      );
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      new URL(request.url).origin;

    const { data: subscriptionRow } = await supabase
      .from("user_subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    const existingCustomerId =
      subscriptionRow?.stripe_customer_id || null;

    const session = await stripe.checkout.sessions.create({
  mode: "subscription",
  payment_method_types: ["card"],
  
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],

      customer: existingCustomerId || undefined,

      customer_email: existingCustomerId
        ? undefined
        : user.email,

      success_url:
        `${appUrl}/upgrade/success` +
        "?session_id={CHECKOUT_SESSION_ID}",

      cancel_url: `${appUrl}/upgrade`,

      allow_promotion_codes: true,

      metadata: {
        user_id: user.id,
        plan,
      },

      subscription_data: {
        metadata: {
          user_id: user.id,
          plan,
        },
      },
    });

    if (!session.url) {
      throw new Error(
        "Stripe did not return a Checkout URL."
      );
    }

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    console.error("Stripe Checkout error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to start Stripe Checkout.",
      },
      { status: 500 }
    );
  }
}