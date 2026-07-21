"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import PageCard from "@/components/ui/PageCard";
import type { HomeHealthRecommendation } from "@/lib/home-health/types";

type HomeHealthEmptyStateProps = {
  recommendation: HomeHealthRecommendation | null;
};

export default function HomeHealthEmptyState({
  recommendation,
}: HomeHealthEmptyStateProps) {
  return (
    <PageCard className="bg-surface-card">
      <p className="text-overline text-text-muted">
        Welcome
      </p>

      <h2 className="mt-3 text-3xl font-medium tracking-[-0.03em] text-text-primary">
        Let&apos;s build your vault.
      </h2>

      <p className="mt-4 max-w-2xl text-base leading-8 text-text-muted">
        Start with one device, a receipt, or your network
        details. Your Home Pulse score will appear once real
        data is in place.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/onboarding"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-button)] bg-charcoal px-6 py-3 text-sm font-medium text-surface-card transition hover:bg-charcoal-hover"
        >
          Start onboarding
          <ArrowRight size={16} aria-hidden />
        </Link>

        {recommendation ? (
          <Link
            href={recommendation.href}
            className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-button)] border border-border-subtle px-6 py-3 text-sm font-medium text-text-primary transition hover:bg-surface-hover"
          >
            {recommendation.title}
          </Link>
        ) : null}
      </div>
    </PageCard>
  );
}
