"use client";

import {
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { loadDashboardMetrics } from "@/lib/data/dashboardData";
import { buildDemoHomeHealth } from "@/lib/home-health/demo";
import { usePermissions } from "@/hooks/usePermissions";
import {
  resolveCreateAccountInvitePath,
  userHasHouseholdMembership,
} from "@/lib/auth/inviteOnboarding";

import PageShell from "@/components/ui/PageShell";
import PageCard from "@/components/ui/PageCard";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import HomeHealthDashboard from "@/components/home-health/HomeHealthDashboard";

import type { HomeHealthResult } from "@/lib/home-health/types";
import { demoDashboard } from "@/lib/demoData";

export default function DashboardPage() {
  const router = useRouter();
  const {
    user,
    isDemo,
    householdId,
    loading: permissionsLoading,
    permissionsReady,
    isVerifiedPlatformAdmin,
  } = usePermissions();

  const [firstName, setFirstName] =
    useState("Homeowner");

  const [homeHealth, setHomeHealth] =
    useState<HomeHealthResult | null>(null);

  const [
    loadingDashboard,
    setLoadingDashboard,
  ] = useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    if (
      !permissionsReady ||
      isDemo ||
      !user ||
      isVerifiedPlatformAdmin
    ) {
      return;
    }

    let cancelled = false;

    async function redirectIncompleteInvitee() {
      const activeUser = user;

      if (!activeUser) {
        return;
      }

      const hasHousehold = householdId
        ? true
        : await userHasHouseholdMembership(
            activeUser.id
          );

      if (cancelled) {
        return;
      }

      const invitePath = resolveCreateAccountInvitePath({
        user: activeUser,
        hasHousehold,
        isPlatformAdmin: false,
      });

      if (!invitePath) {
        return;
      }

      console.info("Invite onboarding route", {
        userId: activeUser.id,
        invitationType:
          activeUser.user_metadata?.invitation_type ??
          null,
        onboardingMode:
          activeUser.user_metadata?.onboarding_mode ??
          null,
        hasHousehold,
        destination: invitePath,
      });

      router.replace(invitePath);
    }

    void redirectIncompleteInvitee();

    return () => {
      cancelled = true;
    };
  }, [
    user,
    isDemo,
    householdId,
    permissionsReady,
    isVerifiedPlatformAdmin,
    router,
  ]);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      if (!permissionsReady) {
        return;
      }

      if (isDemo || !user) {
        if (!cancelled) {
          setFirstName(demoDashboard.firstName);
          setHomeHealth(buildDemoHomeHealth());
          setErrorMessage("");
          setLoadingDashboard(false);
        }
        return;
      }

      try {
        if (!cancelled) {
          setLoadingDashboard(true);
          setErrorMessage("");
        }

        const metrics =
          await loadDashboardMetrics(
            user,
            householdId
          );

        if (cancelled) {
          return;
        }

        setFirstName(metrics.firstName);
        setHomeHealth(metrics.homeHealth);
      } catch (error: unknown) {
        console.error(
          "Unable to load dashboard:",
          error
        );

        if (!cancelled) {
          setHomeHealth(null);
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load your Home Pulse dashboard."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingDashboard(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [
    user,
    isDemo,
    householdId,
    permissionsReady,
  ]);

  if (permissionsLoading || loadingDashboard) {
    return (
      <PageShell>
        <DashboardSkeleton />
      </PageShell>
    );
  }

  if (errorMessage) {
    return (
      <PageShell>
        <PageCard className="border-danger/30 bg-danger-soft text-danger">
          <h1 className="text-section-title">
            Unable to load Home Pulse
          </h1>
          <p className="mt-2 text-sm">
            {errorMessage}
          </p>
        </PageCard>
      </PageShell>
    );
  }

  if (!homeHealth) {
    return (
      <PageShell>
        <DashboardSkeleton />
      </PageShell>
    );
  }

  return (
    <PageShell className="!pt-4 md:!pt-5 space-y-6 md:space-y-8">
      <HomeHealthDashboard
        firstName={firstName}
        homeHealth={homeHealth}
      />
    </PageShell>
  );
}
