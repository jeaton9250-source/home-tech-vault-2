"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import type { HomeHealthRecommendation } from "@/lib/home-health/types";

type RecommendedNextStepProps = {
  recommendation: HomeHealthRecommendation | null;
};

export default function RecommendedNextStep({
  recommendation,
}: RecommendedNextStepProps) {
  if (!recommendation) {
    return null;
  }

  return (
    <section aria-label="What should I do next">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
        What should I do next?
      </h2>

      <Link
        href={recommendation.href}
        className="group flex items-center justify-between gap-4 rounded-[28px] border border-border-subtle/80 bg-surface-card px-6 py-6 transition-all hover:border-home-health/40 hover:shadow-md"
      >
        <div className="flex items-start gap-4 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-home-health-soft text-home-health mt-0.5 shadow-sm">
            <CheckCircle2 size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-base font-semibold tracking-tight text-text-primary">
              {recommendation.title}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-text-muted">
              {recommendation.description}
            </p>
            <p className="mt-2 text-[11px] font-medium text-text-muted">
              Estimated time: {recommendation.estimate}
            </p>
          </div>
        </div>

        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-charcoal px-4 py-2 text-xs font-semibold text-white shadow-sm transition group-hover:bg-charcoal-hover">
          Continue
          <ArrowRight size={14} aria-hidden />
        </span>
      </Link>
    </section>
  );
}
