"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import AdvisorInsightCompact from "@/components/advisor/AdvisorInsightCompact";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import {
  getTopAdvisorInsights,
  humanizeAdvisorText,
} from "@/lib/advisor/presentation";
import type { HomeAdvisorResult } from "@/lib/advisor/types";

const PREVIEW_LIMIT = 5;

type HomeAdvisorPreviewProps = {
  advisor: HomeAdvisorResult | null;
  loading: boolean;
  error: string;
};

export default function HomeAdvisorPreview({
  advisor,
  loading,
  error,
}: HomeAdvisorPreviewProps) {
  if (loading) {
    return (
      <section
        aria-label="Home Advisor"
        className="rounded-[var(--radius-card)] bg-surface-sunken/40 px-5 py-6 md:px-6"
      >
        <DashboardSkeleton />
      </section>
    );
  }

  if (error) {
    return (
      <section
        aria-label="Home Advisor"
        className="rounded-[var(--radius-card)] bg-danger-soft/20 px-5 py-6 md:px-6"
      >
        <p className="text-sm text-danger">
          {error}
        </p>
      </section>
    );
  }

  if (!advisor) {
    return null;
  }

  const topInsights = getTopAdvisorInsights(
    advisor.insights,
    PREVIEW_LIMIT
  );
  const remainingCount = Math.max(
    advisor.insights.length -
      topInsights.length,
    0
  );

  return (
    <section
      aria-label="Home Advisor"
      className="rounded-[var(--radius-card)] bg-surface-sunken/40 px-5 py-6 md:px-6"
      data-tour="home-advisor"
    >
      <div className="space-y-1">
        <h2 className="text-[clamp(1.375rem,2.5vw,1.75rem)] font-medium tracking-[-0.03em] text-text-primary">
          🏡 Home Advisor
        </h2>
        <p className="text-sm text-text-secondary">
          Your AI-powered technology assistant.
        </p>
      </div>

      {topInsights.length > 0 ? (
        <div className="mt-6">
          {topInsights.map((insight) => (
            <AdvisorInsightCompact
              key={insight.id}
              insight={insight}
            />
          ))}
        </div>
      ) : (
        <p className="mt-6 text-sm leading-7 text-text-secondary">
          {humanizeAdvisorText(
            advisor.summary ||
              "Everything looks good right now."
          )}
        </p>
      )}

      {remainingCount > 0 ? (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle/70 pt-4">
          <p className="text-sm text-text-secondary">
            +{remainingCount} more recommendation
            {remainingCount === 1 ? "" : "s"}
          </p>

          <Link
            href="/advisor"
            className="inline-flex items-center gap-1 text-sm font-medium text-interaction hover:text-interaction-hover"
          >
            View Full Advisor
            <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
      ) : (
        <div className="mt-5 border-t border-border-subtle/70 pt-4">
          <Link
            href="/advisor"
            className="inline-flex items-center gap-1 text-sm font-medium text-interaction hover:text-interaction-hover"
          >
            View Full Advisor
            <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
      )}
    </section>
  );
}
