"use client";

import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  CreditCard,
  FileText,
  Router,
  Shield,
  Smartphone,
  Users,
  Wrench,
} from "lucide-react";

import PageCard from "@/components/ui/PageCard";
import {
  getRecommendationAccent,
  getRecommendationDisplayDescription,
  getRecommendationSupportingValue,
} from "@/lib/home-health/display";
import type { HomeHealthRecommendation } from "@/lib/home-health/types";

type NextBestActionCardProps = {
  recommendation: HomeHealthRecommendation;
};

function RecommendationIcon({
  recommendationId,
  accent,
}: {
  recommendationId: string;
  accent: string;
}) {
  const iconProps = {
    size: 18,
    strokeWidth: 2,
    style: { color: accent },
    "aria-hidden": true as const,
  };

  switch (recommendationId) {
    case "network":
      return <Router {...iconProps} />;
    case "first-device":
      return (
        <Smartphone {...iconProps} />
      );
    case "warranty-expiring":
      return <Shield {...iconProps} />;
    case "maintenance-overdue":
      return <Wrench {...iconProps} />;
    case "subscriptions":
      return (
        <CreditCard {...iconProps} />
      );
    case "invite-family":
      return <Users {...iconProps} />;
    default:
      return <FileText {...iconProps} />;
  }
}

export default function NextBestActionCard({
  recommendation,
}: NextBestActionCardProps) {
  const accent = getRecommendationAccent(
    recommendation.id
  );
  const description =
    getRecommendationDisplayDescription(
      recommendation
    );
  const supportingValue =
    getRecommendationSupportingValue(
      recommendation.id
    );

  return (
    <PageCard className="flex h-full flex-col bg-surface-card">
      <div className="flex items-start gap-4">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] border border-border-subtle/70 shadow-[var(--shadow-inset)]"
          style={{
            background: accent.soft,
          }}
        >
          <RecommendationIcon
            recommendationId={
              recommendation.id
            }
            accent={accent.accent}
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-overline text-text-muted">
            Next best action
          </p>

          <h2 className="mt-2 text-xl font-medium tracking-[-0.02em] text-text-primary">
            {recommendation.title}
          </h2>
        </div>
      </div>

      <p className="mt-4 text-[0.9375rem] leading-7 text-text-muted">
        {description}
      </p>

      <p
        className="mt-3 text-sm font-medium"
        style={{ color: accent.accent }}
      >
        {supportingValue}
      </p>

      <div className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-text-secondary">
        <Clock3
          size={14}
          aria-hidden
        />
        About {recommendation.estimate}
      </div>

      <div className="mt-auto pt-6">
        <Link
          href={recommendation.href}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-charcoal px-5 py-2.5 text-sm font-medium text-surface-card transition hover:bg-charcoal-hover hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interaction sm:w-auto"
        >
          Continue
          <ArrowRight size={16} aria-hidden />
        </Link>
      </div>
    </PageCard>
  );
}
