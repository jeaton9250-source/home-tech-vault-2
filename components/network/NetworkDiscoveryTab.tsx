import Link from "next/link";
import {
  ChevronRight,
  Laptop,
  Link2,
  Radar,
  Unlink,
  Wifi,
  WifiOff,
} from "lucide-react";

import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import PageCard from "@/components/ui/PageCard";
import { discoveryDeviceTitle } from "@/lib/connector/identificationReasons";
import { formatConnectorRelativeTime } from "@/lib/connector/scanHistory";
import { formatDemoRelativeTime } from "@/lib/demo/demoNetworkTime";
import {
  deriveDeviceNetworkPresence,
  presentDeviceNetworkPresence,
} from "@/lib/devices/devicePresence";
import { cn } from "@/lib/design-system/cn";

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
      return devices.filter((device) => device.matchStatus === "new");
    case "matched":
      return devices.filter((device) => device.matchStatus === "matched");
    case "ignored":
      return devices.filter((device) => device.matchStatus === "ignored");
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
  isDemo?: boolean;
  canLink?: boolean;
  onDemoAction?: () => void;
};

export default function NetworkDiscoveryTab({
  data,
  activeFilter,
  onFilterChange,
  isDemo = false,
  canLink = false,
  onDemoAction,
}: NetworkDiscoveryTabProps) {
  const { devices, summary } = data;
  const filtered = filterDevices(devices, activeFilter);

  function formatLastDetected(value: string) {
    return isDemo
      ? formatDemoRelativeTime(value)
      : formatConnectorRelativeTime(value);
  }

  return (
    <div className="space-y-6">
      <PageCard className="border-[#182533]/10 bg-[#f8f5ef] p-5 shadow-[0_18px_45px_-36px_rgba(15,25,35,0.45)] md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-serif text-2xl font-medium tracking-[-0.035em] text-[#17212a]">
              Discovery review
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#68737b]">
              Review new devices, confirm matches, and import discoveries into
              your vault.
            </p>
          </div>
          <Button href="/network/discovery" variant="secondary">
            Open Full Discovery Review
            <ChevronRight size={15} />
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
                className={cn(
                  "htv-focus-ring shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition",
                  active
                    ? "bg-[#617c43] text-white shadow-sm"
                    : "border border-[#182533]/10 bg-[#f8f5ef] text-[#68737b] hover:border-[#617c43]/25 hover:text-[#17212a]"
                )}
              >
                {filter.label} ({count})
              </button>
            );
          })}
        </div>
      </PageCard>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Radar}
          title={
            !summary.hasConnector
              ? "No Home Tech Vault connector is paired."
              : !summary.lastScan
                ? "No network scan has been completed yet."
                : activeFilter === "needs_review"
                  ? "Nothing needs review right now."
                  : "No devices in this group yet."
          }
          description={
            !summary.hasConnector
              ? "Pair a household connector to detect devices on your local network."
              : "Switch filters or open the full discovery review for more actions."
          }
          section="network"
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((device) => {
            const presence = presentDeviceNetworkPresence({
              online: device.online,
              lastSeenAt: device.lastSeenAt,
              firstSeenAt: device.firstSeenAt,
            });
            const PresenceIcon =
              deriveDeviceNetworkPresence({
                online: device.online,
                lastSeenAt: device.lastSeenAt,
                firstSeenAt: device.firstSeenAt,
              }) === "online"
                ? Wifi
                : WifiOff;

            return (
              <article
                key={device.id}
                className="rounded-[22px] border border-[#182533]/10 bg-[#f8f5ef] p-4 shadow-[0_16px_40px_-34px_rgba(15,25,35,0.45)] transition hover:-translate-y-0.5 hover:border-[#617c43]/20 md:p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-serif text-lg font-medium tracking-[-0.03em] text-[#17212a]">
                        {discoveryDeviceTitle(device)}
                      </p>
                      <span className="rounded-full border border-[#182533]/8 bg-[#182533]/5 px-2.5 py-1 text-xs font-semibold text-[#68737b]">
                        {statusLabel(device)}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                          presence.tone === "online"
                            ? "bg-[#617c43]/10 text-[#617c43]"
                            : "bg-[#182533]/5 text-[#68737b]"
                        )}
                      >
                        <PresenceIcon size={13} />
                        {presence.label}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-[#68737b]">
                      {[device.manufacturer, device.ipAddress]
                        .filter(Boolean)
                        .join(" · ") || "Details pending"}
                    </p>

                    <p className="mt-2 text-xs text-[#8a949b]">
                      Last detected {formatLastDetected(device.lastSeenAt)}
                    </p>

                    {device.importedDeviceId ? (
                      <Link
                        href={"/devices/" + device.importedDeviceId}
                        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#617c43] hover:text-[#718d4f]"
                      >
                        <Laptop size={14} />
                        {device.matchedDevice?.deviceName || "View linked device"}
                      </Link>
                    ) : (
                      <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-[#68737b]">
                        <Unlink size={14} />
                        Unlinked
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {!device.importedDeviceId &&
                    device.matchStatus !== "ignored" ? (
                      canLink ? (
                        <Button
                          href={
                            "/network/discovery?focus=" +
                            encodeURIComponent(device.id)
                          }
                          size="sm"
                        >
                          <Link2 size={15} />
                          Link Device
                        </Button>
                      ) : isDemo ? (
                        <Button type="button" size="sm" onClick={onDemoAction}>
                          <Link2 size={15} />
                          Link Device
                        </Button>
                      ) : null
                    ) : null}

                    <Button
                      href={
                        "/network/discovery?focus=" +
                        encodeURIComponent(device.id)
                      }
                      variant="secondary"
                      size="sm"
                    >
                      View details
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export type { DiscoveryFilterId };
