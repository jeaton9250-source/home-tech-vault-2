"use client";

import DashboardHero from "@/components/dashboard/DashboardHero";
import HomeAdvisorPreview from "@/components/advisor/HomeAdvisorPreview";
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
  overviewStats: _overviewStats,
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
    <div className="mx-auto max-w-4xl space-y-10 md:space-y-12 py-4">
      {/* 1. How is my home? */}
      <DashboardHero
        firstName={firstName}
        score={homeHealth.score}
        healthSummary={healthSummary}
      />

      {/* 2. What needs attention? */}
      <HomeAdvisorPreview
        advisor={advisor}
        loading={advisorLoading}
        error={advisorError}
      />

      {/* 3. What should I do next? */}
      {homeHealth.isEmpty ? (
        <>
          <HomeHealthEmptyState
            recommendation={homeHealth.recommendation}
          />
          <SmartSearch mode="dashboard" variant="hero" />
        </>
      ) : (
        <>
          <RecommendedNextStep
            recommendation={homeHealth.recommendation}
          />
          <SmartSearch mode="dashboard" variant="hero" />
        </>
      )}
    </div>
  );
}
