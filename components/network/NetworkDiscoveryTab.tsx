import Link from "next/link";

import Button from "@/components/ui/Button";
import PageCard from "@/components/ui/PageCard";
import { formatConnectorRelativeTime } from "@/lib/connector/scanHistory";

import type { DiscoveredDeviceSummary } from "@/lib/connector/discoveryTypes";
import type { NetworkPageData } from "@/hooks/useNetworkPageData";

type DiscoveryFilterId =
  | "needs_review"
  | "new"
  | "matched"
  | "ignored";

const FILTERS: Array<{
  id: DiscoveryFilterId;
  label: string;
}> = [
  { id: "needs_review", label: "Needs Review" },
  { id: "new", label: "New" },
  { id: "matched", label: "Matched" },
  { id: "ignored", label: "Ignored" },
];

function deviceTitle(device: DiscoveredDeviceSummary): string {
  return (
    device.hostname ??
    device.manufacturer ??
    device.ipAddress ??
    "Discovered device"
  );
}

function filterDevices(
  devices: DiscoveredDeviceSummary[],
  filter: DiscoveryFilterId
) {
  switch (filter) {
    case "needs_review":
      return devices.filter(
        (device) =>
          device.matchStatus === "new" ||
          device.matchStatus === "possible_match"
      );
    case "new":
      return devices.filter(
        (device) => device.matchStatus === "new"
      );
    case "matched":
      return devices.filter(
        (device) => device.matchStatus === "matched"
      );
    case "ignored":
      return devices.filter(
        (device) => device.matchStatus === "ignored"
      );
  }
}

function countForFilter(
  devices: DiscoveredDeviceSummary[],
  filter: DiscoveryFilterId
) {
  return filterDevices(devices, filter).length;
}

function statusLabel(device: DiscoveredDeviceSummary): string {
  switch (device.matchStatus) {
    case "matched":
      return "Matched";
    case "possible_match":
      return "Possible match";
    case "new":
      return "New";
    case "ignored":
      return "Ignored";
  }
}

type NetworkDiscoveryTabProps = {
  data: NetworkPageData;
  activeFilter: DiscoveryFilterId;
  onFilterChange: (filter: DiscoveryFilterId) => void;
};

export default function NetworkDiscoveryTab({
  data,
  activeFilter,
  onFilterChange,
}: NetworkDiscoveryTabProps) {
  const { devices, summary } = data;
  const filtered = filterDevices(devices, activeFilter).slice(0, 8);

  return (
    <div className="space-y-6">
      <PageCard className="p-7 md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">
              Discovered devices
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
              Review new devices, confirm matches, and import discoveries into
              your vault.
            </p>
          </div>
          <Button href="/network/discovery" variant="secondary">
            Open Full Discovery Review
          </Button>
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((filter) => {
            const count = countForFilter(devices, filter.id);
            const active = activeFilter === filter.id;

            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => onFilterChange(filter.id)}
                className={
                  "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition " +
                  (active
                    ? "bg-charcoal text-white"
                    : "bg-surface-sunken text-text-secondary hover:text-text-primary")
                }
              >
                {filter.label} ({count})
              </button>
            );
          })}
        </div>
      </PageCard>

      {filtered.length === 0 ? (
        <PageCard className="p-7">
          <p className="text-sm text-text-secondary">
            {!summary.hasConnector
              ? "Connect your home network to begin discovering devices."
              : !summary.lastScan
                ? "No network scan has been completed yet."
                : activeFilter === "needs_review"
                  ? "Nothing needs review right now."
                  : "No devices in this group yet."}
          </p>
        </PageCard>
      ) : (
        <div className="space-y-3">
          {filtered.map((device) => (
            <PageCard key={device.id} className="p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="font-semibold text-text-primary">
                    {deviceTitle(device)}
                  </p>
                  <p className="mt-1 text-sm text-text-secondary">
                    {[device.manufacturer, device.ipAddress]
                      .filter(Boolean)
                      .join(" · ") || "Details pending"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                    <span className="rounded-full bg-surface-sunken px-3 py-1 text-text-secondary">
                      {statusLabel(device)}
                    </span>
                    <span className="rounded-full bg-surface-sunken px-3 py-1 text-text-secondary">
                      Last detected{" "}
                      {formatConnectorRelativeTime(device.lastSeenAt)}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/network/discovery?focus=${encodeURIComponent(device.id)}`}
                  className="text-sm font-semibold text-text-secondary transition hover:text-text-primary"
                >
                  View details
                </Link>
              </div>
            </PageCard>
          ))}
        </div>
      )}
    </div>
  );
}

export type { DiscoveryFilterId };
