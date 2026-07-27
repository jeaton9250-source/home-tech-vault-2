"use client";

import CommandCenterCards from "@/components/dashboard/CommandCenterCards";
import DashboardHero from "@/components/dashboard/DashboardHero";
import HomeHealthEmptyState from "@/components/home-health/HomeHealthEmptyState";
import HomePulseAlerts from "@/components/home-health/HomePulseAlerts";
import SmartSearch from "@/components/search/SmartSearch";
import type { HomeHealthResult } from "@/lib/home-health/types";

type HomeHealthDashboardProps = {
  firstName: string;
  homeHealth: HomeHealthResult;
};

export default function HomeHealthDashboard({
  firstName,
  homeHealth,
}: HomeHealthDashboardProps) {
  return (
    <div className="space-y-8 md:space-y-10">
      <DashboardHero
        firstName={firstName}
        score={homeHealth.score}
        status={homeHealth.status}
      />

      <SmartSearch mode="dashboard" variant="hero" />

      {homeHealth.isEmpty ? (
        <HomeHealthEmptyState
          recommendation={homeHealth.recommendation}
        />
      ) : (
        <>
          <HomePulseAlerts highlights={homeHealth.highlights} />

          <CommandCenterCards homeHealth={homeHealth} />
        </>
      )}
    </div>
  );
}
