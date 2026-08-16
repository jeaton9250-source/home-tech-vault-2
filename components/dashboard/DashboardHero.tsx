"use client";

import {
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import {
  formatDisplayDate,
} from "@/lib/home-health/greeting";

import { usePermissions } from "@/hooks/usePermissions";
import { MORGAN_HOUSEHOLD } from "@/lib/demo/morganHousehold";
import { humanizeAdvisorText } from "@/lib/advisor/presentation";
import CircularProgressRing from "@/components/ui/CircularProgressRing";

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
      ? "Your home technology is organized and ready. Important information is easy to find when you need it."
      : "Add your first device to begin building your Home Tech Vault.");

  const homeName = isDemo
    ? MORGAN_HOUSEHOLD.name
    : `${firstName}'s Home`;

  return (
    <section
      className="relative overflow-hidden rounded-[28px] border border-border-subtle/70 bg-surface-sunken/35 p-5 sm:p-6 lg:p-7"
      data-tour="home-pulse"
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-home-health-soft/35 blur-3xl" />

      <div className="relative flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
        {/* Status copy */}
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle/70 bg-surface-card/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">
              <Sparkles
                size={12}
                className="text-home-health"
                aria-hidden
              />
              {formatDisplayDate()}
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-home-health/15 bg-home-health-soft/40 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-home-health">
              <ShieldCheck
                size={12}
                aria-hidden
              />
              Home Pulse
            </span>
          </div>

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
            {homeName}
          </p>

          <h2 className="mt-2 text-2xl font-medium tracking-[-0.035em] text-text-primary sm:text-3xl">
            Your home at a glance.
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-6 text-text-secondary sm:text-base">
            {humanizeAdvisorText(summary)}
          </p>

          <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-home-health">
            <ShieldCheck
              size={15}
              aria-hidden
            />
            <span>
              Important details are organized and ready when you need them.
            </span>
          </div>
        </div>

        {/* Score */}
        <div className="shrink-0">
          {score !== null ? (
            <div className="rounded-[24px] border border-border-subtle/70 bg-surface-card/80 p-4 shadow-sm backdrop-blur-sm">
              <CircularProgressRing
                value={score}
                size={118}
                strokeWidth={9}
                progressColor="var(--color-home-health)"
                ariaLabel={`Home Health Score: ${score}%`}
              >
                <div className="text-center">
                  <span className="text-3xl font-semibold tracking-[-0.04em] text-text-primary">
                    {score}%
                  </span>

                  <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.14em] text-text-muted">
                    Home Health
                  </span>
                </div>
              </CircularProgressRing>

              <p className="mt-3 text-center text-[10px] font-medium text-text-muted">
                Overall home readiness
              </p>
            </div>
          ) : (
            <div className="rounded-[22px] border border-border-subtle/70 bg-surface-card/80 px-6 py-5 text-center">
              <p className="text-sm font-semibold text-text-primary">
                Getting Started
              </p>

              <p className="mt-1 text-xs text-text-muted">
                Add your first device
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}