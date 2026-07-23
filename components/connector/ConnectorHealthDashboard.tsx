"use client";

import PageCard from "@/components/ui/PageCard";
import CircularProgressRing from "@/components/ui/CircularProgressRing";

import type { ConnectorHealthSummary } from "@/lib/connector/health";

type ConnectorHealthDashboardProps = {
  health: ConnectorHealthSummary;
};

export default function ConnectorHealthDashboard({
  health,
}: ConnectorHealthDashboardProps) {
  return (
    <PageCard className="p-7 md:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-overline text-section-network">
            Connector health
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-text-primary">
            {health.label}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-text-secondary">
            {health.description}
          </p>
        </div>

        <CircularProgressRing
          value={health.score}
          size={132}
          ariaLabel={`Connector health score: ${health.score}%`}
        >
          <div className="text-center">
            <p className="text-3xl font-semibold text-text-primary">
              {health.score}
            </p>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
              Health
            </p>
          </div>
        </CircularProgressRing>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        {health.signals.map((signal) => (
          <div
            key={signal.id}
            className="rounded-[22px] border border-border-subtle p-4"
          >
            <div className="flex items-center gap-2">
              <span
                className={
                  "h-2.5 w-2.5 rounded-full " +
                  (signal.ok ? "bg-emerald-500" : "bg-amber-500")
                }
              />
              <p className="font-semibold text-text-primary">
                {signal.label}
              </p>
            </div>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              {signal.detail}
            </p>
          </div>
        ))}
      </div>
    </PageCard>
  );
}
