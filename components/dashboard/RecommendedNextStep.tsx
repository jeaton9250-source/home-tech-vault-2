"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

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
    <section aria-label="Recommended next step">
      <h2 className="text-overline text-text-muted">
        Recommended Next Step
      </h2>

      <Link
        href={recommendation.href}
        className="group mt-4 flex items-center justify-between gap-4 rounded-[var(--radius-card)] bg-surface-sunken/60 px-5 py-5 transition hover:bg-surface-sunken"
      >
        <div className="min-w-0">
          <p className="text-lg font-medium tracking-[-0.02em] text-text-primary">
            {recommendation.title}
          </p>
          <p className="mt-1 text-sm leading-6 text-text-secondary">
            {recommendation.description}
          </p>
          <p className="mt-2 text-xs text-text-muted">
            About {recommendation.estimate}
          </p>
        </div>

        <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-interaction transition group-hover:text-interaction-hover">
          Continue
          <ArrowRight size={16} aria-hidden />
        </span>
      </Link>
    </section>
  );
}
