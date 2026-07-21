"use client";

import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";

import PageCard from "@/components/ui/PageCard";
import type { HomeHealthRecommendation } from "@/lib/home-health/types";

type NextBestActionCardProps = {
  recommendation: HomeHealthRecommendation;
};

export default function NextBestActionCard({
  recommendation,
}: NextBestActionCardProps) {
  return (
    <PageCard className="h-full bg-surface-card">
      <p className="text-overline text-text-muted">
        Next best action
      </p>

      <h2 className="mt-3 text-xl font-medium tracking-[-0.02em] text-text-primary">
        {recommendation.title}
      </h2>

      <p className="mt-3 text-sm leading-7 text-text-muted">
        {recommendation.description}
      </p>

      <div className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-text-secondary">
        <Clock3
          size={14}
          aria-hidden
        />
        About {recommendation.estimate}
      </div>

      <Link
        href={recommendation.href}
        className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-button)] bg-charcoal px-5 py-2.5 text-sm font-medium text-surface-card transition hover:bg-charcoal-hover hover:-translate-y-0.5"
      >
        Continue
        <ArrowRight size={16} aria-hidden />
      </Link>
    </PageCard>
  );
}
