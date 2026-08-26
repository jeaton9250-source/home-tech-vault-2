"use client";

import {
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import {
  loadDashboardMetrics,
  type DashboardMetrics,
} from "@/lib/data/dashboardData";
import { supabase } from "@/lib/supabase";
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
import NewVaultGettingStarted from "@/components/dashboard/NewVaultGettingStarted";

import type { DashboardOverviewStats } from "@/lib/dashboard/types";
import type { HomeHealthResult } from "@/lib/home-health/types";
import {
  demoDashboard,
  demoDevices,
} from "@/lib/demoData";
import { getWarrantyStatus } from "@/lib/home-health/warranty";

function buildDemoOverviewStats(): DashboardOverviewStats {
  const onlineDeviceCount = demoDevices.filter(
    (device) => device.online
  ).length;
  const offlineDeviceCount = demoDevices.filter(
    (device) => !device.online
  ).length;
  const activeWarrantyCount = demoDevices.filter(
    (device) => {
      const status = getWarrantyStatus(
        device.warranty_date || null
      );

      return (
        status === "active" ||
        status === "expiring"
      );
    }
  ).length;

  return {
    deviceCount: demoDashboard.deviceCount,
    onlineDeviceCount,
    offlineDeviceCount,
    documentCount: demoDashboard.documentCount,
    activeWarrantyCount,
    familyMemberCount: 4,
  };
}

type DashboardPageClientProps = {
  initialMetrics:
    DashboardMetrics | null;

  initialMetricsUserId:
    string | null;

  initialHouseholdId:
    string | null;
};

export default function DashboardPageClient({
  initialMetrics,
  initialMetricsUserId,
  initialHouseholdId,
}: DashboardPageClientProps) {
  const router = useRouter();
  const {
    user,
    isDemo,
    householdId,
    loading: permissionsLoading,
    permissionsReady,
    isVerifiedPlatformAdmin,
    canCreate,
  } = usePermissions();

  const [firstName, setFirstName] =
    useState(
      initialMetrics?.firstName ??
        "Homeowner"
    );

  const [homeHealth, setHomeHealth] =
    useState<HomeHealthResult | null>(
      initialMetrics?.homeHealth ??
        null
    );

  const [overviewStats, setOverviewStats] =
    useState<DashboardOverviewStats | null>(
      initialMetrics
        ?.overviewStats ??
        null
    );

  const [
    loadingDashboard,
    setLoadingDashboard,
  ] = useState(
    !initialMetrics
  );

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
          setFirstName(
            demoDashboard.firstName
          );

          setHomeHealth(
            buildDemoHomeHealth()
          );

          setOverviewStats(
            buildDemoOverviewStats()
          );

          setErrorMessage("");

          setLoadingDashboard(
            false
          );
        }

        return;
      }

      const initialMetricsMatch =
        Boolean(
          initialMetrics
        ) &&
        initialMetricsUserId ===
          user.id &&
        (
          initialHouseholdId ??
          null
        ) ===
          (
            householdId ??
            null
          );

      if (
        initialMetricsMatch &&
        initialMetrics
      ) {
        if (!cancelled) {
          setFirstName(
            initialMetrics.firstName
          );

          setHomeHealth(
            initialMetrics.homeHealth
          );

          setOverviewStats(
            initialMetrics
              .overviewStats
          );

          setErrorMessage("");

          setLoadingDashboard(
            false
          );
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
            householdId,
            supabase
          );

        if (cancelled) {
          return;
        }

        setFirstName(metrics.firstName);
        setHomeHealth(metrics.homeHealth);
        setOverviewStats(
          metrics.overviewStats
        );
      } catch (error: unknown) {
        console.error(
          "Unable to load dashboard:",
          error
        );

        if (!cancelled) {
          setHomeHealth(null);
          setOverviewStats(null);
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
    initialMetrics,
    initialMetricsUserId,
    initialHouseholdId,
  ]);

  const hasDashboardData =
    Boolean(
      homeHealth &&
      overviewStats
    );

  /*
   * When server metrics are already available,
   * permission verification can continue quietly
   * without replacing Home Pulse with a skeleton.
   */
  if (
    (
      permissionsLoading ||
      loadingDashboard
    ) &&
    !hasDashboardData
  ) {
    return (
      <PageShell>
        <DashboardSkeleton />
      </PageShell>
    );
  }

  if (
    errorMessage &&
    !hasDashboardData
  ) {
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

  if (!homeHealth || !overviewStats) {
    return (
      <PageShell>
        <DashboardSkeleton />
      </PageShell>
    );
  }

  return (
    <PageShell className="!pt-4 md:!pt-5">
      

      <NewVaultGettingStarted
        deviceCount={overviewStats?.deviceCount ?? 0}
        documentCount={overviewStats?.documentCount ?? 0}
      />

      <HomeHealthDashboard
        firstName={firstName}
        homeHealth={homeHealth}
        overviewStats={overviewStats}
              hasHousehold={Boolean(householdId)}
/>
    </PageShell>
  );
}
