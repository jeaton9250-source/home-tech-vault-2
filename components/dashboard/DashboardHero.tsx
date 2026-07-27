"use client";

import { Sparkles, ShieldCheck } from "lucide-react";
import {
  formatDisplayDate,
  getTimeGreeting,
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
      ? "Your home technology is operating smoothly. Everything connected is clear."
      : "Add your first device to start building your home profile.");

  return (
    <header
      className="htv-glass-card-elevated relative overflow-hidden p-7 md:p-10 border border-border-subtle/80 rounded-[32px] bg-surface-card shadow-lift"
      data-tour="home-pulse"
    >
      <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="htv-glass-pill px-3 py-1 text-xs font-semibold text-text-secondary flex items-center gap-1.5 border border-border-subtle/80 bg-surface-card">
              <Sparkles size={13} className="text-home-health" />
              <span>{formatDisplayDate()}</span>
            </span>
          </div>

          {isDemo ? (
            <h1 className="text-3xl font-medium tracking-[-0.035em] text-text-primary sm:text-4xl md:text-5xl">
              Welcome to {MORGAN_HOUSEHOLD.name}
            </h1>
          ) : (
            <h1 className="text-3xl font-medium tracking-[-0.035em] text-text-primary sm:text-4xl md:text-5xl">
              {getTimeGreeting(firstName)}
            </h1>
          )}

          <div className="flex items-center gap-2 text-sm font-semibold text-home-health">
            <ShieldCheck size={18} />
            <span>How is my home today</span>
          </div>

          <p className="text-base leading-7 text-text-muted md:text-lg">
            {humanizeAdvisorText(summary)}
          </p>
        </div>

        {/* Ambient Apple Health Style Score Dial */}
        <div className="flex shrink-0 items-center justify-center pt-2 md:pt-0">
          {score !== null ? (
            <div className="flex flex-col items-center">
              <CircularProgressRing
                value={score}
                size={130}
                strokeWidth={10}
                progressColor="var(--color-home-health)"
                ariaLabel={`Home Health Score: ${score}%`}
              >
                <div className="text-center">
                  <span className="text-3xl font-bold tracking-tight text-text-primary">
                    {score}%
                  </span>
                  <span className="block text-[0.6875rem] font-semibold uppercase tracking-wider text-text-muted">
                    Home Health
                  </span>
                </div>
              </CircularProgressRing>
            </div>
          ) : (
            <div className="htv-glass-pill px-6 py-4 text-center rounded-2xl border border-border-subtle">
              <p className="text-sm font-semibold text-text-primary">Getting Started</p>
              <p className="text-xs text-text-muted mt-0.5">Initializing Profile</p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
