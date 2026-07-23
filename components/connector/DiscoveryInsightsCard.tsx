"use client";

import PageCard from "@/components/ui/PageCard";

import type { DiscoveryStatsSummary } from "@/lib/connector/discoveryTypes";

type DiscoveryInsightsCardProps = {
  stats: DiscoveryStatsSummary | null;
};

export default function DiscoveryInsightsCard({
  stats,
}: DiscoveryInsightsCardProps) {
  const metrics = [
    {
      label: "Discovered",
      value: stats?.totalDiscovered ?? 0,
      detail: "Devices seen on your network",
    },
    {
      label: "Matched",
      value: stats?.matchedDevices ?? 0,
      detail: "Linked to vault devices",
    },
    {
      label: "Needs review",
      value: stats?.needsReview ?? 0,
      detail: "Possible matches to confirm",
    },
    {
      label: "New",
      value: stats?.newDevices ?? 0,
      detail: "Ready to import or ignore",
    },
  ];

  return (
    <PageCard className="p-7 md:p-8">
      <div>
        <p className="text-overline text-section-network">
          Discovery insights
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-text-primary">
          What the connector found
        </h2>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Discovery, matching, and import are included on Free. Review results
          anytime after a manual scan.
        </p>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-[22px] bg-surface-sunken p-4"
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
    </PageCard>
  );
}
