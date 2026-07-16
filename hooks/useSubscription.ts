"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

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
};

const defaultSubscription: Subscription = {
  plan: "free",
  status: "inactive",
  current_period_end: null,
};

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

          return;
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
                current_period_end
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

        setSubscription({
          plan,
          status: normalizedStatus,
          current_period_end:
            subscriptionData
              ?.current_period_end ||
            null,
        });

        setIsAdmin(
          profileData?.is_admin === true
        );
      } catch (error) {
        console.error(
          "Subscription loading error:",
          error
        );

        setSubscription(
          defaultSubscription
        );

        setIsAdmin(false);
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
        () => {
          refreshSubscription();
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

  /*
   * Family Sharing is intentionally stricter
   * than other premium features.
   *
   * Pro users do not receive access.
   */
  const canUseFamilySharing =
    isAdmin || isFamily;

  const canManageFamilySharing =
    isAdmin || isFamily;

  const hasUnlimitedDevices =
    isAdmin ||
    isPro ||
    isFamily;

  const deviceLimit =
    hasUnlimitedDevices
      ? null
      : 8;

  const familyMemberLimit =
    canUseFamilySharing
      ? 6
      : 0;

  return {
    loading,

    plan: subscription.plan,

    status: subscription.status,

    currentPeriodEnd:
      subscription.current_period_end,

    isActive,
    isFree,
    isPro,
    isFamily,
    isAdmin,

    canUsePremiumFeatures,
    canUseFamilySharing,
    canManageFamilySharing,

    deviceLimit,
    hasUnlimitedDevices,
    familyMemberLimit,

    refreshSubscription,
  };
}