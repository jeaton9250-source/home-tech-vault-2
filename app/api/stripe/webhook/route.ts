import Stripe from "stripe";
import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type SubscriptionPlan = "free" | "pro" | "family";

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error(
      "STRIPE_SECRET_KEY is missing."
    );
  }

  return new Stripe(secretKey);
}

export async function POST(request: Request) {
  try {
    const webhookSecret =
      process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return NextResponse.json(
        {
          error:
            "STRIPE_WEBHOOK_SECRET is missing.",
        },
        { status: 500 }
      );
    }

    const signature =
      request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        {
          error: "Stripe signature is missing.",
        },
        { status: 400 }
      );
    }

    /*
      Stripe signature verification requires the
      unmodified raw request body.
    */
    const rawBody = await request.text();

    const stripe = getStripe();

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret
      );
    } catch (error) {
      console.error(
        "Stripe webhook signature error:",
        error
      );

      return NextResponse.json(
        {
          error: "Invalid webhook signature.",
        },
        { status: 400 }
      );
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session =
          event.data.object as Stripe.Checkout.Session;

        await handleCheckoutCompleted(
          stripe,
          session
        );

        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription =
          event.data.object as Stripe.Subscription;

        await syncSubscription(subscription);

        break;
      }

      case "customer.subscription.deleted": {
        const subscription =
          event.data.object as Stripe.Subscription;

        await deactivateSubscription(subscription);

        break;
      }

      case "invoice.payment_failed": {
        const invoice =
          event.data.object as Stripe.Invoice;

        await handleFailedPayment(invoice);

        break;
      }

      default: {
        console.log(
          `Unhandled Stripe event: ${event.type}`
        );
      }
    }

    return NextResponse.json({
      received: true,
    });
  } catch (error) {
    console.error("Stripe webhook error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Webhook processing failed.",
      },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(
  stripe: Stripe,
  session: Stripe.Checkout.Session
) {
  const userId = session.metadata?.user_id;
  const plan = normalizePlan(
    session.metadata?.plan
  );

  if (!userId) {
    throw new Error(
      "Checkout session is missing user_id metadata."
    );
  }

  const customerId = getId(session.customer);
  const subscriptionId = getId(
    session.subscription
  );

  if (!subscriptionId) {
    throw new Error(
      "Checkout session is missing a subscription ID."
    );
  }

  const subscription =
    await stripe.subscriptions.retrieve(
      subscriptionId
    );

  await saveSubscription({
    userId,
    plan,
    status: subscription.status,
    customerId,
    subscriptionId,
    currentPeriodEnd:
      getCurrentPeriodEnd(subscription),
  });
}

async function syncSubscription(
  subscription: Stripe.Subscription
) {
  const userId =
    subscription.metadata?.user_id;

  if (!userId) {
    console.warn(
      `Subscription ${subscription.id} has no user_id metadata.`
    );

    return;
  }

  const plan = normalizePlan(
    subscription.metadata?.plan
  );

  const customerId = getId(
    subscription.customer
  );

  await saveSubscription({
    userId,
    plan,
    status: subscription.status,
    customerId,
    subscriptionId: subscription.id,
    currentPeriodEnd:
      getCurrentPeriodEnd(subscription),
  });
}

async function deactivateSubscription(
  subscription: Stripe.Subscription
) {
  const supabase = createAdminClient();

  const userId =
    subscription.metadata?.user_id;

  const subscriptionId = subscription.id;

  let query = supabase
    .from("user_subscriptions")
    .update({
      plan: "free",
      status: "canceled",
      current_period_end:
        getCurrentPeriodEnd(subscription),
    });

  if (userId) {
    query = query.eq("user_id", userId);
  } else {
    query = query.eq(
      "stripe_subscription_id",
      subscriptionId
    );
  }

  const { error } = await query;

  if (error) {
    throw error;
  }
}

async function handleFailedPayment(
  invoice: Stripe.Invoice
) {
  const supabase = createAdminClient();

  const customerId = getId(invoice.customer);

  if (!customerId) {
    return;
  }

  const { error } = await supabase
    .from("user_subscriptions")
    .update({
      status: "past_due",
    })
    .eq("stripe_customer_id", customerId);

  if (error) {
    throw error;
  }
}

async function saveSubscription({
  userId,
  plan,
  status,
  customerId,
  subscriptionId,
  currentPeriodEnd,
}: {
  userId: string;
  plan: SubscriptionPlan;
  status: Stripe.Subscription.Status;
  customerId: string | null;
  subscriptionId: string;
  currentPeriodEnd: string | null;
}) {
  const supabase = createAdminClient();

  const activePlan = isPaidStatus(status)
    ? plan
    : "free";

  const { error } = await supabase
    .from("user_subscriptions")
    .upsert(
      {
        user_id: userId,
        plan: activePlan,
        status,
        stripe_customer_id: customerId,
        stripe_subscription_id:
          subscriptionId,
        current_period_end:
          currentPeriodEnd,
      },
      {
        onConflict: "user_id",
      }
    );

  if (error) {
    throw error;
  }
}

function isPaidStatus(
  status: Stripe.Subscription.Status
) {
  return (
    status === "active" ||
    status === "trialing"
  );
}

function normalizePlan(
  value?: string | null
): SubscriptionPlan {
  const normalized =
    value?.trim().toLowerCase();

  if (normalized === "family") {
    return "family";
  }

  if (normalized === "pro") {
    return "pro";
  }

  return "free";
}

function getCurrentPeriodEnd(
  subscription: Stripe.Subscription
) {
  const periodEnd =
    subscription.items.data[0]
      ?.current_period_end;

  if (!periodEnd) {
    return null;
  }

  return new Date(
    periodEnd * 1000
  ).toISOString();
}

function getId(
  value:
    | string
    | { id: string }
    | null
    | undefined
) {
  if (!value) {
    return null;
  }

  return typeof value === "string"
    ? value
    : value.id;
}