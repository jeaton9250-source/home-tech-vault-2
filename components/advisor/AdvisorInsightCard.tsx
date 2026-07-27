"use client";

import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Sparkles,
} from "lucide-react";

import Button from "@/components/ui/Button";
import type {
  AdvisorInsight,
  AdvisorInsightGroup,
} from "@/lib/advisor/types";

type AdvisorInsightCardProps = {
  insight: AdvisorInsight;
  onDismiss?: (insightId: string) => void;
  onAskAi?: (query: string) => void;
  showDismiss?: boolean;
};

const GROUP_STYLES: Record<
  AdvisorInsightGroup,
  {
    border: string;
    background: string;
    accent: string;
    icon: typeof AlertTriangle;
  }
> = {
  urgent: {
    border: "border-danger/25",
    background: "bg-danger-soft/40",
    accent: "text-danger",
    icon: AlertTriangle,
  },
  attention: {
    border: "border-warning/25",
    background: "bg-warning-soft/35",
    accent: "text-warning",
    icon: AlertTriangle,
  },
  suggestion: {
    border: "border-accent/20",
    background: "bg-accent-soft/20",
    accent: "text-accent",
    icon: Lightbulb,
  },
  good: {
    border: "border-success/20",
    background: "bg-success-soft/30",
    accent: "text-success",
    icon: CheckCircle2,
  },
};

function renderAction(
  insight: AdvisorInsight,
  action: AdvisorInsight["actions"][number],
  onDismiss?: (insightId: string) => void,
  onAskAi?: (query: string) => void
) {
  if (action.type === "dismiss") {
    return (
      <Button
        key={`${insight.id}-${action.type}`}
        type="button"
        variant="ghost"
        className="!px-3 !py-1.5 text-xs"
        onClick={() => onDismiss?.(insight.id)}
      >
        {action.label}
      </Button>
    );
  }

  if (action.type === "ask_ai") {
    return (
      <Button
        key={`${insight.id}-${action.type}`}
        type="button"
        variant="secondary"
        className="!px-3 !py-1.5 text-xs"
        onClick={() =>
          onAskAi?.(
            action.query ||
              insight.message
          )
        }
      >
        <Sparkles
          size={14}
          className="mr-1.5"
          aria-hidden
        />
        {action.label}
      </Button>
    );
  }

  if (!action.href) {
    return null;
  }

  return (
    <Link
      key={`${insight.id}-${action.type}-${action.href}`}
      href={action.href}
      className="inline-flex items-center rounded-[var(--radius-button)] border border-border-subtle bg-surface-card px-3 py-1.5 text-xs font-medium text-text-primary transition hover:border-border-strong hover:bg-surface-sunken"
    >
      {action.label}
    </Link>
  );
}

export default function AdvisorInsightCard({
  insight,
  onDismiss,
  onAskAi,
  showDismiss = true,
}: AdvisorInsightCardProps) {
  const styles = GROUP_STYLES[insight.group];
  const Icon = styles.icon;

  const actions = [
    ...insight.actions,
    ...(showDismiss
      ? [
          {
            type: "dismiss" as const,
            label: "Dismiss",
          },
        ]
      : []),
  ];

  return (
    <article
      className={`rounded-[var(--radius-button)] border px-4 py-4 shadow-[var(--shadow-sm)] ${styles.border} ${styles.background}`}
    >
      <div className="flex items-start gap-3">
        <Icon
          size={18}
          className={`mt-0.5 shrink-0 ${styles.accent}`}
          aria-hidden
        />

        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium text-text-primary">
            {insight.title}
          </h3>
          <p className="mt-1 text-sm leading-6 text-text-secondary">
            {insight.message}
          </p>

          {actions.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {actions.map((action) =>
                renderAction(
                  insight,
                  action,
                  onDismiss,
                  onAskAi
                )
              )}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export const ADVISOR_GROUP_LABELS: Record<
  AdvisorInsightGroup,
  string
> = {
  urgent: "Urgent",
  attention: "Needs Attention",
  suggestion: "Suggestions",
  good: "Everything Looks Good",
};
