"use client";

import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
} from "lucide-react";

import {
  ADVISOR_GROUP_LABELS,
  getPrimaryAdvisorAction,
  humanizeAdvisorInsight,
} from "@/lib/advisor/presentation";
import type { AdvisorInsight } from "@/lib/advisor/types";

type AdvisorInsightCompactProps = {
  insight: AdvisorInsight;
};

const GROUP_ICONS = {
  urgent: AlertTriangle,
  attention: AlertTriangle,
  suggestion: Lightbulb,
  good: CheckCircle2,
} as const;

const GROUP_ACCENTS = {
  urgent: "text-danger",
  attention: "text-warning",
  suggestion: "text-accent",
  good: "text-success",
} as const;

export default function AdvisorInsightCompact({
  insight,
}: AdvisorInsightCompactProps) {
  const normalized =
    humanizeAdvisorInsight(insight);
  const Icon = GROUP_ICONS[normalized.group];
  const accent =
    GROUP_ACCENTS[normalized.group];
  const primaryAction =
    getPrimaryAdvisorAction(normalized);

  return (
    <article className="flex items-start justify-between gap-4 border-b border-border-subtle/70 py-4 last:border-b-0">
      <div className="flex min-w-0 items-start gap-3">
        <Icon
          size={18}
          className={`mt-0.5 shrink-0 ${accent}`}
          aria-hidden
        />

        <div className="min-w-0">
          <p className="text-sm font-medium text-text-primary">
            {normalized.title}
          </p>
          <p className="mt-1 text-sm leading-6 text-text-secondary">
            {normalized.message}
          </p>
          <p className="mt-1 text-xs text-text-muted">
            {
              ADVISOR_GROUP_LABELS[
                normalized.group
              ]
            }
          </p>
        </div>
      </div>

      {primaryAction?.href ? (
        <Link
          href={primaryAction.href}
          className="shrink-0 rounded-[var(--radius-button)] px-3 py-1.5 text-xs font-medium text-interaction transition hover:bg-surface-sunken hover:text-interaction-hover"
        >
          {primaryAction.label}
        </Link>
      ) : null}
    </article>
  );
}
