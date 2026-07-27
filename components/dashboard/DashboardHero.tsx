"use client";

import {
  formatDisplayDate,
  getTimeGreeting,
} from "@/lib/home-health/greeting";
import { usePermissions } from "@/hooks/usePermissions";
import { MORGAN_HOUSEHOLD } from "@/lib/demo/morganHousehold";
import { humanizeAdvisorText } from "@/lib/advisor/presentation";

type DashboardHeroProps = {
  firstName: string;
  score: number | null;
  healthSummary?: string | null;
};

export default function DashboardHero({
  firstName,
  score,
  healthSummary,
}: DashboardHeroProps) {
  const { isDemo } = usePermissions();

  const summary =
    healthSummary?.trim() ||
    (score !== null
      ? "Your home technology overview is ready."
      : "Add your first device to start building your home technology profile.");

  return (
    <header
      className="px-1 py-2 md:px-2"
      data-tour="home-pulse"
    >
      <div className="max-w-3xl space-y-5">
        {isDemo ? (
          <h1 className="text-[clamp(2rem,4.5vw,3rem)] font-medium tracking-[-0.04em] text-text-primary">
            Welcome to the {MORGAN_HOUSEHOLD.name}.
          </h1>
        ) : (
          <h1 className="text-[clamp(2rem,4.5vw,3rem)] font-medium tracking-[-0.04em] text-text-primary">
            {getTimeGreeting(firstName)}
          </h1>
        )}

        <p className="text-sm text-text-secondary">
          {formatDisplayDate()}
        </p>

        <div className="space-y-3">
          <p className="text-overline text-text-muted">
            Home Health Score
          </p>

          {score !== null ? (
            <p className="text-[clamp(2.75rem,7vw,4rem)] font-medium tabular-nums leading-none tracking-[-0.05em] text-text-primary">
              {score}
              <span className="ml-1 text-[0.35em] font-medium text-text-secondary">
                %
              </span>
            </p>
          ) : (
            <p className="text-3xl font-medium tracking-[-0.03em] text-text-primary">
              Getting started
            </p>
          )}
        </div>

        <p className="max-w-2xl text-base leading-7 text-text-secondary">
          {humanizeAdvisorText(summary)}
        </p>
      </div>
    </header>
  );
}
