import Button from "@/components/ui/Button";
import PageCard from "@/components/ui/PageCard";
import type { NetworkPageData } from "@/hooks/useNetworkPageData";

type NetworkOverviewTabProps = {
  data: NetworkPageData;
};

function SummaryMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[20px] border border-border-subtle bg-surface-sunken p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold text-text-primary">{value}</p>
    </div>
  );
}

export default function NetworkOverviewTab({
  data,
}: NetworkOverviewTabProps) {
  const { summary, activityItems } = data;

  if (data.error) {
    return (
      <PageCard className="p-7">
        <p className="text-sm text-red-700">
          Network information is temporarily unavailable.
        </p>
      </PageCard>
    );
  }

  if (!summary.hasConnector) {
    return (
      <PageCard className="p-7 md:p-8">
        <h2 className="text-xl font-semibold text-text-primary">
          Connect your home network
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-text-secondary">
          Install and pair the Home Tech Vault Connector to begin discovering
          devices on your local network.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button href="/network/connect">Connect Your Home Network</Button>
          <Button href="/network/discovery" variant="secondary">
            Open Discovery Review
          </Button>
        </div>
      </PageCard>
    );
  }

  const overviewActions =
    summary.reviewCount > 0
      ? [
          {
            label: "Review Devices",
            href: "/network/discovery",
            variant: "primary" as const,
          },
          {
            label: "Manage Connector",
            href: "/network/connect",
            variant: "secondary" as const,
          },
        ]
      : [
          {
            label: "Manage Connector",
            href: "/network/connect",
            variant: "primary" as const,
          },
          {
            label: "Open Discovery Review",
            href: "/network/discovery",
            variant: "secondary" as const,
          },
        ];

  return (
    <div className="space-y-6">
      <PageCard className="p-7 md:p-8">
        <h2 className="text-xl font-semibold text-text-primary">
          Network summary
        </h2>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SummaryMetric
            label="Connector status"
            value={summary.connectorStatusLabel}
          />
          <SummaryMetric
            label="Monitoring"
            value={summary.monitoringLabel}
          />
          <SummaryMetric
            label="Devices discovered"
            value={
              summary.lastScan || summary.totalDiscovered > 0
                ? String(summary.totalDiscovered)
                : "—"
            }
          />
          <SummaryMetric
            label="Added to Vault"
            value={String(summary.addedToVaultCount)}
          />
          <SummaryMetric
            label="Needs review"
            value={String(summary.reviewCount)}
          />
          <SummaryMetric
            label="Last scan"
            value={
              summary.lastScan
                ? summary.lastScanLabel
                : "No scan yet"
            }
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {overviewActions.map((action) => (
            <Button
              key={action.label}
              href={action.href}
              variant={action.variant}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </PageCard>

      {activityItems.length > 0 ? (
        <PageCard className="p-7 md:p-8">
          <h3 className="text-lg font-semibold text-text-primary">
            Recent activity
          </h3>
          <ul className="mt-4 space-y-3">
            {activityItems.map((item) => (
              <li
                key={item.id}
                className="rounded-[20px] border border-border-subtle bg-surface-sunken px-4 py-3 text-sm text-text-secondary"
              >
                {item.message}
              </li>
            ))}
          </ul>
        </PageCard>
      ) : null}
    </div>
  );
}
