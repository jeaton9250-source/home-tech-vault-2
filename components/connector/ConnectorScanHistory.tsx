"use client";

import { History } from "lucide-react";

import PageCard from "@/components/ui/PageCard";
import {
  formatConnectorRelativeTime,
  formatConnectorTimestamp,
  type ConnectorScanHistoryEntry,
} from "@/lib/connector/scanHistory";
import { formatPlatformLabel } from "@/lib/connector/platforms";

type ConnectorScanHistoryProps = {
  entries: ConnectorScanHistoryEntry[];
};

export default function ConnectorScanHistory({
  entries,
}: ConnectorScanHistoryProps) {
  return (
    <PageCard className="p-7 md:p-8">
      <div>
        <p className="text-overline text-section-network">Scan history</p>
        <h2 className="mt-2 text-2xl font-semibold text-text-primary">
          Recent connector scans
        </h2>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Manual scans are available on every plan. Automatic scans every 15
          minutes require Pro.
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="mt-7 rounded-[24px] border border-dashed border-border-subtle bg-surface-sunken p-6 text-sm leading-6 text-text-secondary">
          No connector scans recorded yet. Run a manual scan from the
          connector app after pairing.
        </div>
      ) : (
        <div className="mt-7 space-y-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex flex-col gap-4 rounded-[24px] border border-border-subtle p-5 lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-charcoal">
                  <History size={18} />
                </div>
                <div>
                  <p className="font-semibold text-text-primary">
                    {entry.connectorName}
                  </p>
                  <p className="mt-1 text-sm text-text-secondary">
                    {formatPlatformLabel(entry.platform)} ·{" "}
                    {entry.source === "manual"
                      ? "Manual scan"
                      : "Scan"}
                  </p>
                </div>
              </div>

              <div className="text-sm text-text-secondary">
                <p className="font-semibold text-text-primary">
                  {formatConnectorRelativeTime(entry.scannedAt)}
                </p>
                <p className="mt-1 text-xs text-text-tertiary">
                  {formatConnectorTimestamp(entry.scannedAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageCard>
  );
}
