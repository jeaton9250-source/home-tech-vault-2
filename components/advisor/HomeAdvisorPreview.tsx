"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, BrainCircuit } from "lucide-react";

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
        className="htv-glass-card p-6"
      >
        <DashboardSkeleton />
      </section>
    );
  }

  if (error) {
    return (
      <section
        aria-label="Home Advisor"
        className="htv-glass-card p-6 border-danger/30 bg-danger-soft/20 text-danger"
      >
        <p className="text-sm font-semibold">{error}</p>
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
      aria-label="Home Advisor Intelligence"
      className="htv-glass-card-elevated relative overflow-hidden p-6 md:p-8 htv-ambient-plum"
      data-tour="home-advisor"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-premium-soft text-premium shadow-sm">
            <BrainCircuit size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-text-primary">
                Home Intelligence Advisor
              </h2>
              <span className="htv-glass-pill px-2.5 py-0.5 text-[0.6875rem] font-bold text-premium bg-premium-soft border-premium/20">
                AI Active
              </span>
            </div>
            <p className="text-xs text-text-secondary">
              Continuous proactive guidance & smart recommendations
            </p>
          </div>
        </div>
      </div>

      {topInsights.length > 0 ? (
        <div className="mt-6 space-y-3">
          {topInsights.map((insight) => (
            <AdvisorInsightCompact
              key={insight.id}
              insight={insight}
            />
          ))}
        </div>
      ) : (
        <div className="mt-6 htv-glass-card p-4 flex items-center gap-3">
          <Sparkles size={18} className="text-premium shrink-0" />
          <p className="text-sm font-medium text-text-primary leading-relaxed">
            {humanizeAdvisorText(
              advisor.summary ||
                "Your home OS is fully optimized. No urgent actions needed."
            )}
          </p>
        </div>
      )}

      {remainingCount > 0 ? (
        <div className="mt-6 flex items-center justify-between border-t border-border-subtle/60 pt-4">
          <p className="text-xs font-semibold text-text-secondary">
            +{remainingCount} additional smart recommendations
          </p>

          <Link
            href="/advisor"
            className="htv-glass-pill px-4 py-2 inline-flex items-center gap-1.5 text-xs font-bold text-premium hover:bg-premium-soft transition-colors"
          >
            <span>Launch Intelligence Hub</span>
            <ArrowRight size={14} aria-hidden />
          </Link>
        </div>
      ) : (
        <div className="mt-6 flex justify-end border-t border-border-subtle/60 pt-4">
          <Link
            href="/advisor"
            className="htv-glass-pill px-4 py-2 inline-flex items-center gap-1.5 text-xs font-bold text-premium hover:bg-premium-soft transition-colors"
          >
            <span>Launch Intelligence Hub</span>
            <ArrowRight size={14} aria-hidden />
          </Link>
        </div>
      )}
    </section>
  );
}

