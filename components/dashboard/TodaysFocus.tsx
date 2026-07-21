"use client";

import { ArrowRight, Sparkles } from "lucide-react";

import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";

import { sections } from "@/lib/design-system/tokens";

type TodaysFocusProps = {
  recommendation?: string;
  score: number;
};

export default function TodaysFocus({
  recommendation,
  score,
}: TodaysFocusProps) {
  const isHealthy = score >= 90;
  const focusText =
    recommendation ||
    (isHealthy
      ? "Everything looks great today."
      : "Take a moment to review your vault health.");

  const description = isHealthy
    ? "Your home technology is well protected and thoughtfully organized. No urgent actions need your attention."
    : "Personalized guidance based on your current vault health.";

  return (
    <PageCard elevated interactive className="overflow-hidden">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div
            className="htv-icon-well h-12 w-12 shrink-0"
            style={{
              background: sections.insights.soft,
              color: sections.insights.accent,
            }}
          >
            <Sparkles size={20} />
          </div>

          <div>
            <p
              className="text-overline"
              style={{ color: sections.insights.accent }}
            >
              Today&apos;s Focus
            </p>

            <h2 className="text-section-title mt-2 text-text-primary">
              {focusText}
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-text-muted">
              {description}
            </p>
          </div>
        </div>

        <Button href="/insights" variant="secondary" className="shrink-0">
          View insights
          <ArrowRight size={16} />
        </Button>
      </div>
    </PageCard>
  );
}
