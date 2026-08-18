"use client";

/**
 * Personal Stripe subscription for the signed-in user only.
 *
 * Do not use this hook for premium feature gating, device limits, or plan
 * display. Use `usePermissions()` instead — it resolves the effective plan
 * (personal subscription plus inherited Family access from the household owner).
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getLimitsForPlan,
} from "@/lib/permissions/plans";

import { supabase } from "@/lib/supabase";

export type SubscriptionPlan =
  | "free"
  | "pro"
  | "family";

export type SubscriptionStatus =
  | "inactive"
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | string;

type Subscription = {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  current_period_end: string | null;
  stripe_customer_id: string | null;
};

const defaultSubscription: Subscription = {
  plan: "free",
  status: "inactive",
  current_period_end: null,
  stripe_customer_id: null,
};

const SUBSCRIPTION_CACHE_TTL_MS =
  60_000;

const SUBSCRIPTION_CACHE_PREFIX =
  "htv:subscription:v1:";

type CachedSubscriptionState = {
  cachedAt: number;
  subscription: Subscription;
  isAdmin: boolean;
};

function readSubscriptionCache(
  userId: string
): CachedSubscriptionState | null {
  if (
    typeof window === "undefined"
  ) {
    return null;
  }

  try {
    const key =
      SUBSCRIPTION_CACHE_PREFIX +
      userId;

    const raw =
      window.sessionStorage.getItem(
        key
      );

    if (!raw) {
      return null;
    }

    const cached =
      JSON.parse(
        raw
      ) as CachedSubscriptionState;

    if (
      !cached?.cachedAt ||
      Date.now() -
        cached.cachedAt >
        SUBSCRIPTION_CACHE_TTL_MS
    ) {
      window.sessionStorage.removeItem(
        key
      );

      return null;
    }

    return cached;
  } catch {
    return null;
  }
}

function writeSubscriptionCache(
  userId: string,
  value: CachedSubscriptionState
) {
  if (
    typeof window === "undefined"
  ) {
    return;
  }

  try {
    window.sessionStorage.setItem(
      SUBSCRIPTION_CACHE_PREFIX +
        userId,
      JSON.stringify(value)
    );
  } catch {
    // Storage is only a performance enhancement.
  }
}

export function useSubscription() {
  const [loading, setLoading] =
    useState(true);

  const [isAdmin, setIsAdmin] =
    useState(false);

  const [subscription, setSubscription] =
    useState<Subscription>(
      defaultSubscription
    );

  const refreshSubscription =
    useCallback(async () => {
      let cachedState:
        | CachedSubscriptionState
        | null = null;

      try {
        setLoading(true);

        const {
          data: { session },
          error: sessionError,
        } =
          await supabase.auth.getSession();

        if (sessionError) {
          console.error(
            "Unable to load auth session:",
            sessionError
          );
        }

        const user =
          session?.user || null;

        if (!user) {
          setSubscription(
            defaultSubscription
          );

          setIsAdmin(false);
          setLoading(false);

          return;
        }

        cachedState =
          readSubscriptionCache(
            user.id
          );

        if (cachedState) {
          setSubscription(
            cachedState.subscription
          );

          setIsAdmin(
            cachedState.isAdmin
          );

          /*
           * Cached access can paint immediately.
           * The database refresh below continues
           * silently.
           */
          setLoading(false);
        }

        const [
          {
            data: subscriptionData,
            error: subscriptionError,
          },
          {
            data: profileData,
            error: profileError,
          },
        ] = await Promise.all([
          supabase
            .from("user_subscriptions")
            .select(
              `
                plan,
                status,
                current_period_end,
                stripe_customer_id
              `
            )
            .eq("user_id", user.id)
            .maybeSingle(),

          supabase
            .from("profiles")
            .select("is_admin")
            .eq("id", user.id)
            .maybeSingle(),
        ]);

        if (subscriptionError) {
          throw subscriptionError;
        }

        if (profileError) {
          console.error(
            "Unable to load admin status:",
            profileError
          );
        }

        const normalizedPlan =
          subscriptionData?.plan
            ?.trim()
            .toLowerCase();

        const plan: SubscriptionPlan =
          normalizedPlan === "family"
            ? "family"
            : normalizedPlan === "pro"
              ? "pro"
              : "free";

        const normalizedStatus =
          subscriptionData?.status
            ?.trim()
            .toLowerCase() ||
          "inactive";

        const resolvedSubscription:
          Subscription = {
          plan,
          status: normalizedStatus,
          current_period_end:
            subscriptionData
              ?.current_period_end ||
            null,
          stripe_customer_id:
            subscriptionData
              ?.stripe_customer_id ??
            null,
        };

        const resolvedIsAdmin =
          profileData?.is_admin ===
          true;

        setSubscription(
          resolvedSubscription
        );

        setIsAdmin(
          resolvedIsAdmin
        );

        writeSubscriptionCache(
          user.id,
          {
            cachedAt: Date.now(),
            subscription:
              resolvedSubscription,
            isAdmin:
              resolvedIsAdmin,
          }
        );
      } catch (error) {
        console.error(
          "Subscription loading error:",
          error
        );

        if (!cachedState) {
          setSubscription(
            defaultSubscription
          );

          setIsAdmin(false);
        }
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    refreshSubscription();

    const {
      data: {
        subscription:
          authSubscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        (event) => {
          /*
           * refreshSubscription() already ran when this hook
           * mounted. INITIAL_SESSION would immediately duplicate
           * the subscription + profile requests.
           *
           * Token refreshes also do not change billing access.
           */
          if (
            event === "INITIAL_SESSION" ||
            event === "TOKEN_REFRESHED"
          ) {
            return;
          }

          void refreshSubscription();
        }
      );

    return () => {
      authSubscription.unsubscribe();
    };
  }, [refreshSubscription]);

  const isActive = useMemo(
    () =>
      subscription.status ===
        "active" ||
      subscription.status ===
        "trialing",
    [subscription.status]
  );

  const isPro =
    subscription.plan === "pro" &&
    isActive;

  const isFamily =
    subscription.plan === "family" &&
    isActive;

  const isFree =
    !isAdmin &&
    !isPro &&
    !isFamily;

  const canUsePremiumFeatures =
    isAdmin ||
    isPro ||
    isFamily;

  const canUseFamilySharing =
    isAdmin || isFamily;

  const canManageFamilySharing =
    isAdmin || isFamily;

  const limits = getLimitsForPlan(
    isAdmin
      ? "pro"
      : isFamily
        ? "family"
        : isPro
          ? "pro"
          : "free",
    isAdmin
  );

  const hasUnlimitedDevices =
    limits.maxDevices === null;

  const hasUnlimitedDocuments =
    limits.maxDocuments === null;

  const deviceLimit =
    limits.maxDevices;

  const documentLimit =
    limits.maxDocuments;

  const familyMemberLimit =
    canUseFamilySharing
      ? 6
      : 0;

  return {
    loading,

    plan: subscription.plan,
    personalPlan: subscription.plan,

    status: subscription.status,

    currentPeriodEnd:
      subscription.current_period_end,

    hasPersonalStripeCustomer: Boolean(
      subscription.stripe_customer_id
    ),

    isActive,
    isFree,
    isPro,
    isFamily,
    isAdmin,

    canUsePremiumFeatures,
    canUseFamilySharing,
    canManageFamilySharing,

    deviceLimit,
    documentLimit,
    hasUnlimitedDevices,
    hasUnlimitedDocuments,
    familyMemberLimit,

    refreshSubscription,
  };
}
