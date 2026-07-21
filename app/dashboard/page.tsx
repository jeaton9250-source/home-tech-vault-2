"use client";

import {
  useEffect,
  useState,
} from "react";

import { loadDashboardMetrics } from "@/lib/data/dashboardData";
import { buildDemoHomeHealth } from "@/lib/home-health/demo";
import { usePermissions } from "@/hooks/usePermissions";

import PageShell from "@/components/ui/PageShell";
import PageCard from "@/components/ui/PageCard";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import HomeHealthDashboard from "@/components/home-health/HomeHealthDashboard";

import type { HomeHealthResult } from "@/lib/home-health/types";
import { demoDashboard } from "@/lib/demoData";

export default function DashboardPage() {
  const {
    user,
    isDemo,
    householdId,
    loading: permissionsLoading,
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
    async function loadDashboard() {
      if (permissionsLoading) {
        return;
      }

      try {
        setLoadingDashboard(true);
        setErrorMessage("");

        if (isDemo || !user) {
          setFirstName(demoDashboard.firstName);
          setHomeHealth(buildDemoHomeHealth());
          return;
        }

        const metrics =
          await loadDashboardMetrics(
            user,
            householdId
          );

        setFirstName(metrics.firstName);
        setHomeHealth(metrics.homeHealth);
      } catch (error: unknown) {
        console.error(
          "Unable to load dashboard:",
          error
        );

        setErrorMessage(
          "Unable to load your Home Health dashboard."
        );
      } finally {
        setLoadingDashboard(false);
      }
    }

    void loadDashboard();
  }, [
    user,
    isDemo,
    householdId,
    permissionsLoading,
  ]);

  if (
    permissionsLoading ||
    loadingDashboard ||
    !homeHealth
  ) {
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
            Unable to load Home Health
          </h1>
          <p className="mt-2 text-sm">
            {errorMessage}
          </p>
        </PageCard>
      </PageShell>
    );
  }

  return (
    <PageShell className="space-y-8 md:space-y-10">
      <HomeHealthDashboard
        firstName={firstName}
        homeHealth={homeHealth}
      />
    </PageShell>
  );
}
