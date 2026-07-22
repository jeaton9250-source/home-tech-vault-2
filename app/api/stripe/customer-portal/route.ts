import Stripe from "stripe";
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const stripeSecretKey =
      process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      return NextResponse.json(
        {
          error:
            "STRIPE_SECRET_KEY is missing from .env.local.",
        },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey);
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
          error:
            "You must be signed in to manage billing.",
        },
        { status: 401 }
      );
    }

    const {
      data: subscription,
      error: subscriptionError,
    } = await supabase
      .from("user_subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (subscriptionError) {
      throw subscriptionError;
    }

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json(
        {
          error:
            "No Stripe customer is connected to this account.",
        },
        { status: 400 }
      );
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      new URL(request.url).origin;

    const portalSession =
      await stripe.billingPortal.sessions.create({
        customer:
          subscription.stripe_customer_id,
        return_url:
          `${appUrl}/settings?tab=billing`,
      });

    return NextResponse.json({
      url: portalSession.url,
    });
  } catch (error) {
    console.error(
      "Stripe customer portal error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to open the billing portal.",
      },
      { status: 500 }
    );
  }
}