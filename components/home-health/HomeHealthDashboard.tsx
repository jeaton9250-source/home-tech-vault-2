"use client";

import RecentActivity from "@/components/dashboard/RecentActivity";
import DashboardQuickActions from "@/components/dashboard/DashboardQuickActions";
import HomeHealthCategoryGrid from "@/components/home-health/HomeHealthCategoryGrid";
import HomeHealthEmptyState from "@/components/home-health/HomeHealthEmptyState";
import HomeHealthHeader from "@/components/home-health/HomeHealthHeader";
import HomeHealthScoreCard from "@/components/home-health/HomeHealthScoreCard";
import HomePulseAlerts from "@/components/home-health/HomePulseAlerts";
import HomeSnapshotStrip from "@/components/home-health/HomeSnapshotStrip";
import NextBestActionCard from "@/components/home-health/NextBestActionCard";
import VaultCompletenessRing from "@/components/home-health/VaultCompletenessRing";
import { usePermissions } from "@/hooks/usePermissions";
import type { HomeHealthResult } from "@/lib/home-health/types";

type HomeHealthDashboardProps = {
  firstName: string;
  homeHealth: HomeHealthResult;
};

export default function HomeHealthDashboard({
  firstName,
  homeHealth,
}: HomeHealthDashboardProps) {
  const {
    getActionHref,
    getActionLabel,
  } = usePermissions();

  return (
    <div className="space-y-6 md:space-y-8">
      <HomeHealthHeader firstName={firstName} />

      {homeHealth.isEmpty ? (
        <HomeHealthEmptyState
          recommendation={
            homeHealth.recommendation
          }
        />
      ) : (
        <>
          <HomePulseAlerts
            highlights={homeHealth.highlights}
          />

          <HomeSnapshotStrip
            homeHealth={homeHealth}
          />

          <section className="grid gap-5 xl:grid-cols-[3fr_2fr] xl:items-stretch">
            {homeHealth.score !== null &&
            homeHealth.status &&
            homeHealth.statusMessage ? (
              <HomeHealthScoreCard
                score={homeHealth.score}
                status={homeHealth.status}
                statusMessage={
                  homeHealth.statusMessage
                }
                highlights={
                  homeHealth.highlights
                }
              />
            ) : null}

            {homeHealth.recommendation ? (
              <NextBestActionCard
                recommendation={
                  homeHealth.recommendation
                }
              />
            ) : null}
          </section>

          <DashboardQuickActions
            getActionHref={getActionHref}
            getActionLabel={getActionLabel}
          />

          <VaultCompletenessRing
            percentage={
              homeHealth.vaultCompleteness
            }
            cards={homeHealth.cards}
          />
        </>
      )}

      <HomeHealthCategoryGrid
        cards={homeHealth.cards}
      />

      <RecentActivity
        title="Recent activity"
        viewAllHref="/activity"
        limit={5}
      />
    </div>
  );
}
