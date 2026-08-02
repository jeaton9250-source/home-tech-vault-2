import { analytics } from "@heycatch/sdk";
import type Stripe from "stripe";

analytics.init({
  projectKey: "hck_pk_dIUA-aveUz3iBV0rWX75ozcaVleh5Hl8",
});

const EVENT_NAMES: Partial<Record<Stripe.Event["type"], string>> = {
  "checkout.session.completed": "checkout_completed",
  "customer.subscription.created": "subscription_started",
  "customer.subscription.updated": "subscription_updated",
  "customer.subscription.deleted": "subscription_cancelled",
  "invoice.payment_succeeded": "payment_succeeded",
  "invoice.payment_failed": "payment_failed",
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : undefined;
}

function findMetadata(
  value: unknown,
  depth = 0
): Record<string, unknown> | null {
  if (depth > 4) {
    return null;
  }

  const record = asRecord(value);
  if (!record) {
    return null;
  }

  const metadata = asRecord(record.metadata);
  if (metadata) {
    const userId =
      readString(metadata.user_id) ??
      readString(metadata.userId) ??
      readString(metadata.supabase_user_id);

    if (userId) {
      return metadata;
    }
  }

  for (const key of [
    "subscription_details",
    "parent",
    "customer_details",
    "data",
    "object",
  ]) {
    const nested = findMetadata(record[key], depth + 1);
    if (nested) {
      return nested;
    }
  }

  return metadata;
}

function resolveUserId(
  object: Record<string, unknown>,
  metadata: Record<string, unknown> | null
): string | undefined {
  return (
    readString(metadata?.user_id) ??
    readString(metadata?.userId) ??
    readString(metadata?.supabase_user_id) ??
    readString(object.client_reference_id)
  );
}

function eventProperties(
  event: Stripe.Event,
  object: Record<string, unknown>,
  metadata: Record<string, unknown> | null
): Record<string, string | number | boolean | null> {
  const plan =
    readString(metadata?.plan) ??
    readString(metadata?.plan_id) ??
    readString(metadata?.tier);

  const status = readString(object.status);
  const currency = readString(object.currency);
  const mode = readString(object.mode);

  return {
    stripe_event_id: event.id,
    stripe_event_type: event.type,
    livemode: event.livemode,
    ...(plan ? { plan } : {}),
    ...(status ? { status } : {}),
    ...(currency ? { currency } : {}),
    ...(typeof object.amount_total === "number"
      ? { amount_total: object.amount_total }
      : {}),
    ...(typeof object.amount_paid === "number"
      ? { amount_paid: object.amount_paid }
      : {}),
    ...(mode ? { mode } : {}),
  };
}

export async function trackHeyCatchStripeEvent(
  event: Stripe.Event
): Promise<void> {
  const eventName = EVENT_NAMES[event.type];
  if (!eventName) {
    return;
  }

  const object = asRecord(event.data.object);
  if (!object) {
    return;
  }

  const metadata = findMetadata(object);
  const userId = resolveUserId(object, metadata);

  if (!userId) {
    return;
  }

  const plan =
    readString(metadata?.plan) ??
    readString(metadata?.plan_id) ??
    readString(metadata?.tier);

  if (plan) {
    await analytics.setIdentity(userId, { plan });
  }

  await analytics.trackEvent(
    eventName,
    eventProperties(event, object, metadata),
    { userId }
  );
}
