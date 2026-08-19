"use server";

import { revalidatePath } from "next/cache";

import {
  getDefaultActivityTitle,
  recordActivity,
} from "@/lib/activity";
import {
  applyHouseholdMutationScope,
  fetchHouseholdIdForUser,
  withHouseholdInsertFields,
} from "@/lib/data/householdScope";
import {
  validateSubscriptionInput,
  type SubscriptionInputForValidation,
} from "@/lib/subscriptions/subscriptionInputValidation";
import { createClient } from "@/lib/supabase/server";

export type SubscriptionMutationResult =
  | {
      success: true;
      subscriptionId: string;
    }
  | {
      success: false;
      error: string;
      code?:
        | "UNAUTHENTICATED"
        | "VALIDATION_ERROR"
        | "NOT_FOUND_OR_FORBIDDEN"
        | "UNKNOWN";
    };

export async function createSubscription(
  input: SubscriptionInputForValidation
): Promise<SubscriptionMutationResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      error:
        "You must be signed in to add a subscription.",
      code: "UNAUTHENTICATED",
    };
  }

  const validation =
    validateSubscriptionInput(input);

  if (!validation.success) {
    return {
      success: false,
      error: validation.error,
      code: "VALIDATION_ERROR",
    };
  }

  const normalized = validation.data;

  const householdId =
    await fetchHouseholdIdForUser(
      user.id,
      supabase
    );

  const {
    data: created,
    error,
  } = await supabase
    .from("subscriptions")
    .insert(
      withHouseholdInsertFields(
        {
          service_name:
            normalized.serviceName,
          category:
            normalized.category || null,
          monthly_cost:
            normalized.monthlyCost,
          renewal_date:
            normalized.renewalDate,
          billing_cycle:
            normalized.billingCycle,
          notes:
            normalized.notes || null,
        },
        householdId,
        user.id
      )
    )
    .select("id")
    .single();

  if (error || !created) {
    console.error(
      "Error adding subscription:",
      error
    );

    return {
      success: false,
      error:
        "Unable to save this subscription. Please try again.",
      code: "UNKNOWN",
    };
  }

  await recordActivity({
    activityType:
      "subscription.added",
    title: getDefaultActivityTitle(
      "subscription.added",
      normalized.serviceName
    ),
    description:
      "Subscription service recorded in the vault.",
    userId: user.id,
    householdId,
  });

  revalidatePath("/subscriptions");
  revalidatePath("/dashboard");

  return {
    success: true,
    subscriptionId: created.id,
  };
}

export async function updateSubscription(
  input: SubscriptionInputForValidation & {
    subscriptionId: string;
  }
): Promise<SubscriptionMutationResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      error:
        "You must be signed in to update a subscription.",
      code: "UNAUTHENTICATED",
    };
  }

  const subscriptionId =
    input.subscriptionId.trim();

  if (!subscriptionId) {
    return {
      success: false,
      error:
        "A subscription id is required.",
      code: "VALIDATION_ERROR",
    };
  }

  const validation =
    validateSubscriptionInput(input);

  if (!validation.success) {
    return {
      success: false,
      error: validation.error,
      code: "VALIDATION_ERROR",
    };
  }

  const normalized = validation.data;

  const householdId =
    await fetchHouseholdIdForUser(
      user.id,
      supabase
    );

  const scopedQuery =
    applyHouseholdMutationScope(
      supabase
        .from("subscriptions")
        .update({
          service_name:
            normalized.serviceName,
          category:
            normalized.category || null,
          monthly_cost:
            normalized.monthlyCost,
          renewal_date:
            normalized.renewalDate,
          billing_cycle:
            normalized.billingCycle,
          notes:
            normalized.notes || null,
        })
        .eq("id", subscriptionId)
        .select("id"),
      householdId,
      user.id
    );

  const {
    data: updated,
    error,
  } = await scopedQuery.maybeSingle();

  if (error) {
    console.error(
      "Error updating subscription:",
      error
    );

    return {
      success: false,
      error:
        "Unable to save changes. Please try again.",
      code: "UNKNOWN",
    };
  }

  if (!updated) {
    return {
      success: false,
      error:
        "This subscription could not be found or you do not have permission to edit it.",
      code:
        "NOT_FOUND_OR_FORBIDDEN",
    };
  }

  revalidatePath("/subscriptions");
  revalidatePath("/dashboard");

  return {
    success: true,
    subscriptionId,
  };
}
