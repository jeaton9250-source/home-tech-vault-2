"use client";

import DashboardHero from "@/components/dashboard/DashboardHero";
import DashboardRecentActivity from "@/components/dashboard/DashboardRecentActivity";
import HomeAdvisorPreview from "@/components/advisor/HomeAdvisorPreview";
import HomeOverviewStats from "@/components/dashboard/HomeOverviewStats";
import RecommendedNextStep from "@/components/dashboard/RecommendedNextStep";
import SmartSearch from "@/components/search/SmartSearch";
import HomeHealthEmptyState from "@/components/home-health/HomeHealthEmptyState";
import { useHomeAdvisor } from "@/hooks/useHomeAdvisor";
import { getHomeHealthDisplayMessage } from "@/lib/home-health/display";
import type { DashboardOverviewStats } from "@/lib/dashboard/types";
import type { HomeHealthResult } from "@/lib/home-health/types";

type HomeHealthDashboardProps = {
  firstName: string;
  homeHealth: HomeHealthResult;
  overviewStats: DashboardOverviewStats;
};

export default function HomeHealthDashboard({
  firstName,
  homeHealth,
  overviewStats,
}: HomeHealthDashboardProps) {
  const {
    advisor,
    loading: advisorLoading,
    error: advisorError,
  } = useHomeAdvisor();

  const healthSummary =
    advisor?.summary ||
    (homeHealth.status
      ? getHomeHealthDisplayMessage(
          homeHealth.status
        )
      : null);

  return (
    <div className="space-y-10 md:space-y-12">
      <DashboardHero
        firstName={firstName}
        score={homeHealth.score}
        healthSummary={healthSummary}
      />

      <HomeAdvisorPreview
        advisor={advisor}
        loading={advisorLoading}
        error={advisorError}
      />

      {homeHealth.isEmpty ? (
        <>
          <HomeHealthEmptyState
            recommendation={
              homeHealth.recommendation
            }
          />

          <SmartSearch
            mode="dashboard"
            variant="hero"
          />
        </>
      ) : (
        <>
          <RecommendedNextStep
            recommendation={
              homeHealth.recommendation
            }
          />

          <HomeOverviewStats
            stats={overviewStats}
          />

          <DashboardRecentActivity
            limit={5}
          />

          <SmartSearch
            mode="dashboard"
            variant="hero"
          />
        </>
      )}
    </div>
  );
}
