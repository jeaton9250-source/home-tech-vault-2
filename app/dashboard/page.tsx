"use client";

import {
  useEffect,
  useState,
} from "react";

import { loadDashboardMetrics } from "@/lib/data/dashboardData";
import { usePermissions } from "@/hooks/usePermissions";

import PageShell from "@/components/ui/PageShell";
import PageCard from "@/components/ui/PageCard";
import { DashboardSkeleton } from "@/components/ui/Skeleton";

import DashboardHero from "@/components/dashboard/DashboardHero";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import TodaysFocus from "@/components/dashboard/TodaysFocus";
import SmartRecommendations from "@/components/dashboard/SmartRecommendations";
import DashboardQuickActions from "@/components/dashboard/DashboardQuickActions";
import RecentActivity from "@/components/dashboard/RecentActivity";
import RecentNotifications from "@/components/dashboard/RecentNotifications";

import type { VaultScoreResult } from "@/lib/calculateVaultScore";
import { demoDashboard } from "@/lib/demoData";

const defaultVaultScore: VaultScoreResult = {
  total: 0,
  protection: 0,
  organization: 0,
  documentation: 0,
  maintenance: 0,
  label: "Get Started",
  recommendations: [],
};

export default function DashboardPage() {
  const {
    user,
    isDemo,
    householdId,
    loading: permissionsLoading,
    getActionHref,
    getActionLabel,
  } = usePermissions();

  const [firstName, setFirstName] =
    useState("Homeowner");

  const [householdName, setHouseholdName] =
    useState("My Home Tech Vault");

  const [deviceCount, setDeviceCount] =
    useState(0);

  const [documentCount, setDocumentCount] =
    useState(0);

  const [roomCount, setRoomCount] =
    useState(0);

  const [familyMemberCount, setFamilyMemberCount] =
    useState(0);

  const [protectedValue, setProtectedValue] =
    useState(0);

  const [networkConfigured, setNetworkConfigured] =
    useState(false);

  const [vaultScore, setVaultScore] =
    useState<VaultScoreResult>(
      defaultVaultScore
    );

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
          setHouseholdName(
            demoDashboard.householdName
          );
          setDeviceCount(
            demoDashboard.deviceCount
          );
          setDocumentCount(
            demoDashboard.documentCount
          );
          setRoomCount(6);
          setFamilyMemberCount(3);
          setProtectedValue(
            demoDashboard.protectedValue
          );
          setNetworkConfigured(true);
          setVaultScore({
            total: 96,
            protection: 94,
            organization: 96,
            documentation: 88,
            maintenance: 90,
            label: "Excellent",
            recommendations: [
              "Upload the missing printer receipt.",
              "Complete the upcoming router firmware update.",
              "Review warranty dates for living room devices.",
            ],
          });

          return;
        }

        const metrics =
          await loadDashboardMetrics(
            user,
            householdId
          );

        setFirstName(metrics.firstName);
        setHouseholdName(
          metrics.householdName
        );
        setDeviceCount(metrics.deviceCount);
        setDocumentCount(
          metrics.documentCount
        );
        setRoomCount(metrics.roomCount);
        setFamilyMemberCount(
          metrics.familyMemberCount
        );
        setProtectedValue(
          metrics.protectedValue
        );
        setNetworkConfigured(
          metrics.networkConfigured
        );
        setVaultScore(metrics.vaultScore);
      } catch (error: unknown) {
        console.error(
          "Unable to load dashboard:",
          error
        );

        setErrorMessage(
          "Unable to load your Home Command Center."
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

  const primaryRecommendation =
    vaultScore.recommendations[0];

  if (
    permissionsLoading ||
    loadingDashboard
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
            Unable to load Home Command Center
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
      <DashboardHero
        firstName={firstName}
        householdName={householdName}
        deviceCount={deviceCount}
        documentCount={documentCount}
        protectedValue={protectedValue}
        vaultScore={vaultScore}
        isDemo={isDemo}
      />

      <DashboardMetrics
        deviceCount={deviceCount}
        documentCount={documentCount}
        roomCount={roomCount}
        protectedValue={protectedValue}
        networkConfigured={networkConfigured}
        familyMemberCount={familyMemberCount}
        getActionHref={getActionHref}
      />

      <TodaysFocus
        recommendation={primaryRecommendation}
        score={vaultScore.total}
      />

      <section className="grid gap-6 xl:grid-cols-2">
        <RecentActivity
          title="Recent Activity"
          viewAllHref="/activity"
        />

        <SmartRecommendations
          recommendations={
            vaultScore.recommendations
          }
          deviceCount={deviceCount}
          getActionHref={getActionHref}
        />
      </section>

      <DashboardQuickActions
        getActionHref={getActionHref}
        getActionLabel={getActionLabel}
      />

      <RecentNotifications />
    </PageShell>
  );
}
