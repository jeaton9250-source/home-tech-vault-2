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
      className="group block rounded-[20px] border border-[#e1dbd1] bg-[#fffdf9] p-5 shadow-[0_8px_28px_-22px_rgba(23,32,42,0.28)] transition duration-200 hover:-translate-y-0.5 hover:border-[#cfc8bd] hover:shadow-[0_14px_32px_-22px_rgba(23,32,42,0.32)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6a62]">
            {label}
          </p>

          <p className="mt-3 text-[34px] font-semibold leading-none tracking-[-0.05em] text-[#18202b]">
            {value.toLocaleString()}
          </p>

          {hint ? (
            <p className="mt-2 truncate text-sm leading-6 text-[#5f5b55]">
              {hint}
            </p>
          ) : null}
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#e5dfd5] bg-[#f6f2ea] text-[#53606b] transition group-hover:border-[#718d4f]/30 group-hover:bg-[#718d4f]/8 group-hover:text-[#617c43]">
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
    <div className="grid overflow-hidden rounded-[20px] border border-[#e1dbd1] bg-[#fffdf9] sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map(
        (metric, index) => (
          <div
            key={metric.label}
            className={[
              "px-5 py-5",
              index > 0
                ? "border-t border-[#e6e0d6] sm:border-t-0"
                : "",
              index % 2 !== 0
                ? "sm:border-l sm:border-[#e6e0d6]"
                : "",
              index >= 2
                ? "xl:border-l xl:border-[#e6e0d6]"
                : "",
            ].join(" ")}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6a62]">
              {metric.label}
            </p>

            <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#18202b]">
              {metric.value}
            </p>

            {metric.hint ? (
              <p className="mt-1.5 text-sm leading-6 text-[#5f5b55]">
                {metric.hint}
              </p>
            ) : null}
          </div>
        )
      )}
    </div>
  );
}
