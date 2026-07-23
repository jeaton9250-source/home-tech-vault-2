"use client";

import PageCard from "@/components/ui/PageCard";

import type { SmartHomeSummary } from "@/lib/connector/smartHomeSummary";

type SmartHomeSummaryCardProps = {
  summary: SmartHomeSummary;
};

export default function SmartHomeSummaryCard({
  summary,
}: SmartHomeSummaryCardProps) {
  return (
    <PageCard className="p-7 md:p-8">
      <div>
        <p className="text-overline text-section-network">
          Smart home summary
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-text-primary">
          {summary.headline}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
          {summary.description}
        </p>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-3">
        {summary.metrics.map((metric) => (
          <div
            key={metric.id}
            className="rounded-[22px] border border-border-subtle p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
              {metric.label}
            </p>
            <p className="mt-2 text-3xl font-semibold text-text-primary">
              {metric.value}
            </p>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              {metric.detail}
            </p>
          </div>
        ))}
      </div>

      {summary.recommendations.length > 0 ? (
        <ul className="mt-7 space-y-2 text-sm leading-6 text-text-secondary">
          {summary.recommendations.map((item) => (
            <li
              key={item}
              className="rounded-[18px] bg-surface-sunken px-4 py-3"
            >
              {item}
            </li>
          ))}
        </ul>
      ) : null}
    </PageCard>
  );
}
