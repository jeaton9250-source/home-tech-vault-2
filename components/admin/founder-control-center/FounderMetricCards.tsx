import Link from "next/link";
import type { ReactNode } from "react";

type FounderMetricCardProps = {
  label: string;
  value: number;
  hint?: string;
  href: string;
  icon: ReactNode;
};

export function FounderMetricCard({
  label,
  value,
  hint,
  href,
  icon,
}: FounderMetricCardProps) {
  return (
    <Link
      href={href}
      className="group block rounded-[24px] border border-border-subtle bg-surface-card p-6 shadow-[var(--shadow-sm)] transition hover:border-charcoal/10"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-text-tertiary">
            {label}
          </p>
          <p className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-text-primary">
            {value.toLocaleString()}
          </p>
          {hint ? (
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              {hint}
            </p>
          ) : null}
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-charcoal transition group-hover:border-charcoal/10">
          {icon}
        </div>
      </div>
    </Link>
  );
}

type FounderGrowthMetric = {
  label: string;
  value: number | string;
  hint?: string;
};

export function FounderGrowthGrid({
  metrics,
}: {
  metrics: FounderGrowthMetric[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="rounded-[20px] border border-border-subtle bg-surface-sunken px-4 py-4"
        >
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-text-tertiary">
            {metric.label}
          </p>
          <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-text-primary">
            {metric.value}
          </p>
          {metric.hint ? (
            <p className="mt-1 text-sm text-text-secondary">
              {metric.hint}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
