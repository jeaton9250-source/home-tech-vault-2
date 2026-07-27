"use client";

import {
  formatDisplayDate,
  getTimeGreeting,
} from "@/lib/home-health/greeting";
import { usePermissions } from "@/hooks/usePermissions";
import { MORGAN_HOUSEHOLD } from "@/lib/demo/morganHousehold";
import { getHomeHealthDisplayMessage } from "@/lib/home-health/display";
import type { HomeHealthStatusLabel } from "@/lib/home-health/types";

import HomeHealthScoreRing from "@/components/home-health/HomeHealthScoreRing";

type DashboardHeroProps = {
  firstName: string;
  score: number | null;
  status: HomeHealthStatusLabel | null;
};

export default function DashboardHero({
  firstName,
  score,
  status,
}: DashboardHeroProps) {
  const { isDemo } = usePermissions();

  const statusMessage = status
    ? getHomeHealthDisplayMessage(status)
    : "Add your first device to start building your home technology command center.";

  return (
    <header
      className="rounded-[var(--radius-card)] border border-border-subtle bg-gradient-to-br from-surface-card via-surface-card to-section-home-health-soft/30 p-6 md:p-8"
      data-tour="home-pulse"
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="space-y-3">
          <p className="text-overline text-home-health">
            Home Technology Command Center
          </p>

          {isDemo ? (
            <h1 className="text-[clamp(1.875rem,4vw,2.75rem)] font-medium tracking-[-0.03em] text-text-primary">
              Welcome to the {MORGAN_HOUSEHOLD.name}.
            </h1>
          ) : (
            <h1 className="text-[clamp(1.875rem,4vw,2.75rem)] font-medium tracking-[-0.03em] text-text-primary">
              {getTimeGreeting(firstName)}
            </h1>
          )}

          <p className="text-sm text-text-secondary">
            {formatDisplayDate()}
          </p>

          <div className="pt-2">
            <p className="text-overline text-text-muted">
              Your Home Health Score
            </p>
            {score !== null && status ? (
              <div className="mt-2 flex flex-wrap items-end gap-x-4 gap-y-2">
                <p className="text-[clamp(2.5rem,6vw,3.5rem)] font-medium tabular-nums leading-none tracking-[-0.04em] text-text-primary">
                  {score}
                  <span className="text-[0.45em] font-medium text-text-secondary">
                    %
                  </span>
                </p>
                <p className="pb-1 text-base font-medium text-text-primary">
                  {status}
                </p>
              </div>
            ) : (
              <p className="mt-2 text-2xl font-medium text-text-primary">
                Getting started
              </p>
            )}
          </div>

          <div className="max-w-xl pt-1">
            <p className="text-overline text-text-muted">
              Home technology status
            </p>
            <p className="mt-2 text-[0.9375rem] leading-7 text-text-secondary">
              {isDemo
                ? "Everything is running smoothly today."
                : statusMessage}
            </p>
          </div>
        </div>

        {score !== null && status ? (
          <div className="hidden lg:block">
            <HomeHealthScoreRing
              score={score}
              status={status}
              size={160}
            />
          </div>
        ) : null}
      </div>
    </header>
  );
}
