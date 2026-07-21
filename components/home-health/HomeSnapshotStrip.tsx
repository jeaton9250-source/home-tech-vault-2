"use client";

import { buildHomeSnapshot } from "@/lib/home-health/display";
import type { HomeHealthResult } from "@/lib/home-health/types";

type HomeSnapshotStripProps = {
  homeHealth: HomeHealthResult;
};

export default function HomeSnapshotStrip({
  homeHealth,
}: HomeSnapshotStripProps) {
  const metrics = buildHomeSnapshot(
    homeHealth
  );

  return (
    <section aria-label="Your home today">
      <p className="text-overline text-text-muted">
        Your home today
      </p>

      <div className="mt-3 flex flex-wrap gap-2.5">
        {metrics.map((metric) => (
          <div
            key={metric.id}
            className="inline-flex min-w-[8.5rem] flex-1 items-center gap-3 rounded-[12px] border border-border-subtle/80 px-3.5 py-2.5 shadow-[var(--shadow-inset)]"
            style={{
              background: metric.soft,
            }}
          >
            <span
              className="text-xl font-medium tabular-nums tracking-[-0.03em]"
              style={{ color: metric.accent }}
            >
              {metric.value}
            </span>
            <span className="text-xs font-medium leading-4 text-text-secondary">
              {metric.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
