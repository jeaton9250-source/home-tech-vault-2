"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from "react";

import Link from "next/link";
import {
  CheckCircle2,
  ChevronRight,
  Clock3,
  Laptop,
  Link2,
  MoreHorizontal,
  Radar,
  RefreshCw,
  Router,
  Search,
  SlidersHorizontal,
  Unlink,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";

import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import PageCard from "@/components/ui/PageCard";
import { discoveryDeviceTitle } from "@/lib/connector/identificationReasons";
import { formatPlatformLabel } from "@/lib/connector/platforms";
import {
  connectorPresenceDescription,
  deriveConnectorPresence,
} from "@/lib/connector/presence";
import {
  formatConnectorRelativeTime,
  formatConnectorTimestamp,
} from "@/lib/connector/scanHistory";
import { formatDemoRelativeTime } from "@/lib/demo/demoNetworkTime";
import {
  deriveDeviceNetworkPresence,
  presentDeviceNetworkPresence,
} from "@/lib/devices/devicePresence";
import { cn } from "@/lib/design-system/cn";

import type { DiscoveredDeviceSummary } from "@/lib/connector/discoveryTypes";
import type { NetworkPageData } from "@/hooks/useNetworkPageData";

type NetworkStatusFilter =
  | "all"
  | "online"
  | "offline"
  | "new"
  | "unlinked";

type NetworkLinkFilter = "all" | "linked" | "unlinked";

type NetworkSort =
  | "last-seen-newest"
  | "last-seen-oldest"
  | "name-asc"
  | "manufacturer-asc"
  | "first-seen-newest";

type NetworkIcon = ComponentType<{
  size?: number;
  className?: string;
}>;

type NetworkOverviewTabProps = {
  data: NetworkPageData;
  isDemo?: boolean;
  canLink?: boolean;
  canRefresh?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onDemoAction?: () => void;
};

function getDevicePresence(device: DiscoveredDeviceSummary) {
  return deriveDeviceNetworkPresence({
    online: device.online,
    lastSeenAt: device.lastSeenAt,
    firstSeenAt: device.firstSeenAt,
  });
}

function isOnlineDevice(device: DiscoveredDeviceSummary) {
  const state = getDevicePresence(device);
  return state === "online" || state === "recently_detected";
}

function isOfflineDevice(device: DiscoveredDeviceSummary) {
  return !isOnlineDevice(device);
}

function isUnlinkedDevice(device: DiscoveredDeviceSummary) {
  return !device.importedDeviceId && device.matchStatus !== "ignored";
}

function isNewlyDiscovered(device: DiscoveredDeviceSummary) {
  return device.matchStatus === "new";
}

export default function NetworkOverviewTab({
  data,
  isDemo = false,
  canLink = false,
  canRefresh = false,
  refreshing = false,
  onRefresh,
  onDemoAction,
}: NetworkOverviewTabProps) {
  const { summary, devices, stats } = data;

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<NetworkStatusFilter>("all");
  const [linkFilter, setLinkFilter] =
    useState<NetworkLinkFilter>("all");
  const [manufacturerFilter, setManufacturerFilter] =
    useState("all");
  const [sortOption, setSortOption] =
    useState<NetworkSort>("last-seen-newest");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const onlineDevices = useMemo(
    () => devices.filter(isOnlineDevice),
    [devices]
  );
  const offlineDevices = useMemo(
    () => devices.filter(isOfflineDevice),
    [devices]
  );
  const newDevices = useMemo(
    () => devices.filter(isNewlyDiscovered),
    [devices]
  );
  const unlinkedDevices = useMemo(
    () => devices.filter(isUnlinkedDevice),
    [devices]
  );

  const manufacturerOptions = useMemo(() => {
    const values = new Set<string>();

    for (const device of devices) {
      const manufacturer = device.manufacturer?.trim();
      if (manufacturer) {
        values.add(manufacturer);
      }
    }

    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [devices]);

  const filteredDevices = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    const filtered = devices.filter((device) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "online" && isOnlineDevice(device)) ||
        (statusFilter === "offline" && isOfflineDevice(device)) ||
        (statusFilter === "new" && isNewlyDiscovered(device)) ||
        (statusFilter === "unlinked" && isUnlinkedDevice(device));

      const linked = Boolean(device.importedDeviceId);
      const matchesLink =
        linkFilter === "all" ||
        (linkFilter === "linked" && linked) ||
        (linkFilter === "unlinked" && !linked);

      const matchesManufacturer =
        manufacturerFilter === "all" ||
        (device.manufacturer?.trim() || "") === manufacturerFilter;

      const searchableText = [
        discoveryDeviceTitle(device),
        device.hostname,
        device.manufacturer,
        device.model,
        device.ipAddress,
        device.macAddress,
        device.matchedDevice?.deviceName,
        device.deviceType,
        device.friendlyName,
      ]
        .map((value) => String(value ?? "").toLowerCase())
        .join(" ");

      const matchesSearch =
        query === "" || searchableText.includes(query);

      return (
        matchesStatus &&
        matchesLink &&
        matchesManufacturer &&
        matchesSearch
      );
    });

    return [...filtered].sort((first, second) => {
      if (sortOption === "name-asc") {
        return discoveryDeviceTitle(first).localeCompare(
          discoveryDeviceTitle(second)
        );
      }

      if (sortOption === "manufacturer-asc") {
        return (first.manufacturer ?? "").localeCompare(
          second.manufacturer ?? ""
        );
      }

      if (sortOption === "first-seen-newest") {
        return (
          new Date(second.firstSeenAt).getTime() -
          new Date(first.firstSeenAt).getTime()
        );
      }

      const firstSeen = new Date(first.lastSeenAt).getTime();
      const secondSeen = new Date(second.lastSeenAt).getTime();

      if (sortOption === "last-seen-oldest") {
        return firstSeen - secondSeen;
      }

      return secondSeen - firstSeen;
    });
  }, [
    devices,
    searchTerm,
    statusFilter,
    linkFilter,
    manufacturerFilter,
    sortOption,
  ]);

  const filtersActive =
    searchTerm.trim() !== "" ||
    statusFilter !== "all" ||
    linkFilter !== "all" ||
    manufacturerFilter !== "all" ||
    sortOption !== "last-seen-newest";

  function clearFilters() {
    setSearchTerm("");
    setStatusFilter("all");
    setLinkFilter("all");
    setManufacturerFilter("all");
    setSortOption("last-seen-newest");
  }

  function formatRelative(value: string | null | undefined) {
    if (!value) {
      return "Never";
    }

    return isDemo
      ? formatDemoRelativeTime(value)
      : formatConnectorRelativeTime(value);
  }

  if (data.error && devices.length === 0) {
    return null;
  }

  const connector = summary.primaryConnector;
  const connectorPresence = connector
    ? deriveConnectorPresence(connector.status, connector.lastSeenAt)
    : null;

  const summaryCards: Array<{
    id: NetworkStatusFilter;
    title: string;
    value: number;
    description: string;
    icon: NetworkIcon;
    iconClassName: string;
  }> = [
    {
      id: "online",
      title: "Online",
      value: onlineDevices.length,
      description: "Currently detected",
      icon: Wifi,
      iconClassName: "bg-[#617c43]/10 text-[#617c43]",
    },
    {
      id: "offline",
      title: "Offline",
      value: offlineDevices.length,
      description: "Not recently detected",
      icon: WifiOff,
      iconClassName: "bg-[#182533]/5 text-[#68737b]",
    },
    {
      id: "new",
      title: "Newly Discovered",
      value: newDevices.length,
      description: "First seen recently",
      icon: Radar,
      iconClassName: "bg-[#b58a42]/10 text-[#916c31]",
    },
    {
      id: "unlinked",
      title: "Unlinked",
      value: unlinkedDevices.length,
      description: "Needs a vault match",
      icon: Unlink,
      iconClassName: "bg-[#182533]/5 text-[#17212a]",
    },
  ];

  return (
    <div className="space-y-6">
      <ConnectorStatusPanel
        summary={summary}
        connectorPresence={connectorPresence}
        formatRelative={formatRelative}
        canManage={canRefresh || canLink}
        isDemo={isDemo}
        onDemoAction={onDemoAction}
      />

      {summary.hasConnector || devices.length > 0 ? (
        <PageCard className="overflow-hidden border-[#182533]/10 bg-[#f8f5ef] p-0 shadow-[0_18px_45px_-36px_rgba(15,25,35,0.4)]">
          <div className="p-6 md:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#718d4f]">
                  Your network
                </p>

                <h2 className="mt-2 font-serif text-2xl font-medium tracking-[-0.035em] text-[#17212a]">
                  {devices.length}{" "}
                  {devices.length === 1
                    ? "device"
                    : "devices"}{" "}
                  found
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#68737b]">
                  A quick look at what&apos;s happening around your home.
                </p>
              </div>

              <Button
                href="/network?tab=discovery"
                variant="secondary"
              >
                View Devices
                <ChevronRight size={16} />
              </Button>
            </div>

            <div className="mt-7 grid grid-cols-3 divide-x divide-[#182533]/10 border-t border-[#182533]/10 pt-6">
              <div className="pr-4">
                <p className="font-serif text-3xl font-medium tracking-[-0.04em] text-[#17212a]">
                  {onlineDevices.length}
                </p>

                <p className="mt-1 text-xs font-medium text-[#68737b]">
                  Online
                </p>
              </div>

              <div className="px-4">
                <p className="font-serif text-3xl font-medium tracking-[-0.04em] text-[#17212a]">
                  {newDevices.length}
                </p>

                <p className="mt-1 text-xs font-medium text-[#68737b]">
                  New
                </p>
              </div>

              <div className="pl-4">
                <p className="font-serif text-3xl font-medium tracking-[-0.04em] text-[#17212a]">
                  {unlinkedDevices.length}
                </p>

                <p className="mt-1 text-xs font-medium text-[#68737b]">
                  Need matching
                </p>
              </div>
            </div>
          </div>
        </PageCard>
      ) : null}
    </div>
  );
}

function ConnectorStatusPanel({
  summary,
  connectorPresence,
  formatRelative,
  canManage,
  isDemo,
  onDemoAction,
}: {
  summary: NetworkPageData["summary"];
  connectorPresence: ReturnType<typeof deriveConnectorPresence> | null;
  formatRelative: (value: string | null | undefined) => string;
  canManage: boolean;
  isDemo: boolean;
  onDemoAction?: () => void;
}) {
  if (!summary.hasConnector || !summary.primaryConnector) {
    return (
      <PageCard className="border-[#182533]/10 bg-[#f8f5ef] p-6 shadow-[0_18px_45px_-36px_rgba(15,25,35,0.4)]">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#182533]/5 text-[#68737b]">
              <Router size={19} />
            </div>

            <div>
              <p className="font-serif text-lg font-medium text-[#17212a]">
                Connect your home
              </p>

              <p className="mt-1 text-sm leading-6 text-[#68737b]">
                Connect the desktop app to automatically find devices on your Wi-Fi.
              </p>
            </div>
          </div>

          {canManage || isDemo ? (
            isDemo ? (
              <Button
                type="button"
                onClick={onDemoAction}
              >
                Connect Home Wi-Fi
              </Button>
            ) : (
              <Button href="/network/connect">
                Connect Home Wi-Fi
              </Button>
            )
          ) : null}
        </div>
      </PageCard>
    );
  }

  const connector = summary.primaryConnector;

  const presenceLabel =
    connectorPresence === "online"
      ? "Connected"
      : connectorPresence === "recently_seen"
        ? "Recently connected"
        : connectorPresence === "pending"
          ? "Connecting"
          : "Offline";

  const presenceTone =
    connectorPresence === "online"
      ? "bg-[#617c43]/10 text-[#617c43]"
      : connectorPresence === "recently_seen" ||
          connectorPresence === "pending"
        ? "bg-[#b58a42]/10 text-[#916c31]"
        : "bg-[#a6584e]/10 text-[#984e46]";

  return (
    <PageCard className="border-[#182533]/10 bg-[#f8f5ef] p-6 shadow-[0_18px_45px_-36px_rgba(15,25,35,0.4)] md:p-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
              presenceTone
            )}
          >
            <Router size={20} />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate font-serif text-xl font-medium tracking-[-0.03em] text-[#17212a]">
                {connector.name}
              </h2>

              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-[10px] font-semibold",
                  presenceTone
                )}
              >
                {presenceLabel}
              </span>
            </div>

            <p className="mt-2 text-sm text-[#68737b]">
              Last checked{" "}
              {connector.lastSeenAt
                ? formatRelative(connector.lastSeenAt)
                : "never"}
            </p>

            <p className="mt-1 text-xs text-[#8a949b]">
              {summary.monitoringLabel} monitoring
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#68737b]">
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              connectorPresence === "online"
                ? "bg-[#718d4f]"
                : "bg-[#b58a42]"
            )}
          />

          {summary.connectorStatusLabel}
        </div>
      </div>
    </PageCard>
  );
}

function ConnectorMeta({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-xl border border-[#182533]/8 bg-[#eee9df]/55 px-4 py-3">
      <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#7a858d]">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-[#17212a]">{value}</p>
      {detail ? (
        <p className="mt-1 text-xs text-[#8a949b]">{detail}</p>
      ) : null}
    </div>
  );
}

function ScanMetadataCard({
  summary,
  stats,
  onlineCount,
  unlinkedCount,
  newCount,
  formatRelative,
}: {
  summary: NetworkPageData["summary"];
  stats: NetworkPageData["stats"];
  onlineCount: number;
  unlinkedCount: number;
  newCount: number;
  formatRelative: (value: string | null | undefined) => string;
}) {
  if (!summary.lastScan) {
    return (
      <PageCard className="border-[#182533]/10 bg-[#f8f5ef] p-5 shadow-[0_18px_45px_-36px_rgba(15,25,35,0.45)] md:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-button)] bg-[#182533]/5 text-[#68737b]">
            <Clock3 size={18} />
          </div>
          <div>
            <p className="font-semibold text-text-primary">Scan activity</p>
            <p className="mt-1 text-sm text-[#68737b]">
              No network scan has been completed yet.
            </p>
          </div>
        </div>
      </PageCard>
    );
  }

  return (
    <PageCard className="border-[#182533]/10 bg-[#f8f5ef] p-5 shadow-[0_18px_45px_-36px_rgba(15,25,35,0.45)] md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#7a858d]">
            Last scan
          </p>
          <p className="mt-1 text-lg font-semibold text-text-primary">
            Completed {formatRelative(summary.lastScan)}
          </p>
          <p className="mt-1 text-sm text-[#68737b]">
            {formatConnectorTimestamp(summary.lastScan)}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-sunken px-3 py-1.5 text-xs font-semibold text-text-secondary">
          <Radar size={13} />
          {summary.monitoringLabel} monitoring
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <ConnectorMeta
          label="Devices found"
          value={String(stats?.totalDiscovered ?? summary.totalDiscovered)}
        />
        <ConnectorMeta label="Newly discovered" value={String(newCount)} />
        <ConnectorMeta
          label="Linked"
          value={String(summary.addedToVaultCount)}
        />
        <ConnectorMeta label="Unlinked" value={String(unlinkedCount)} />
      </div>

      <p className="mt-4 text-xs text-text-tertiary">
        {onlineCount} currently detected · {summary.reviewCount} need review
      </p>
    </PageCard>
  );
}

function NetworkEmptyFilterState({
  statusFilter,
  searchTerm,
  onClear,
}: {
  statusFilter: NetworkStatusFilter;
  searchTerm: string;
  onClear: () => void;
}) {
  if (searchTerm.trim()) {
    return (
      <EmptyState
        icon={Search}
        title="No network devices match your search."
        description="Try another device name, hostname, manufacturer, IP, or MAC address."
        section="network"
      >
        <Button
          type="button"
          variant="secondary"
          className="mt-6"
          onClick={onClear}
        >
          Clear Filters
        </Button>
      </EmptyState>
    );
  }

  let title = "No network devices found.";
  let description = "Try another filter to review discoveries on your network.";

  if (statusFilter === "online") {
    title = "No devices are currently online.";
    description = "Nothing was recently detected on the household network.";
  } else if (statusFilter === "offline") {
    title = "No offline devices found.";
    description = "All listed devices were detected recently.";
  } else if (statusFilter === "new") {
    title = "No newly discovered devices.";
    description = "New discoveries will appear here after the next scan.";
  } else if (statusFilter === "unlinked") {
    title = "All discovered devices are linked.";
    description = "Every reviewed discovery is matched to a vault device.";
  }

  return (
    <EmptyState
      icon={CheckCircle2}
      title={title}
      description={description}
      section="network"
    >
      <Button
        type="button"
        variant="secondary"
        className="mt-6"
        onClick={onClear}
      >
        View All Devices
      </Button>
    </EmptyState>
  );
}

function NetworkDeviceCard({
  device,
  formatRelative,
  canLink,
  isDemo,
  menuOpen,
  onMenuOpenChange,
  onDemoAction,
}: {
  device: DiscoveredDeviceSummary;
  formatRelative: (value: string | null | undefined) => string;
  canLink: boolean;
  isDemo: boolean;
  menuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
  onDemoAction?: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  const presence = presentDeviceNetworkPresence({
    online: device.online,
    lastSeenAt: device.lastSeenAt,
    firstSeenAt: device.firstSeenAt,
  });
  const title = discoveryDeviceTitle(device);
  const linked = Boolean(device.importedDeviceId);
  const isNew = isNewlyDiscovered(device);
  const source =
    device.discoverySources.length > 0
      ? device.discoverySources.join(", ")
      : "Connector";

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (menuRef.current?.contains(event.target as Node)) {
        return;
      }

      onMenuOpenChange(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onMenuOpenChange(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen, onMenuOpenChange]);

  const statusTone =
    presence.tone === "online"
      ? "bg-[#617c43]/10 text-[#617c43]"
      : presence.tone === "recent"
        ? "bg-[#b58a42]/10 text-[#916c31]"
        : presence.tone === "stale"
          ? "bg-[#182533]/5 text-[#68737b]"
          : "bg-[#182533]/5 text-[#8a949b]";

  const StatusIcon =
    presence.tone === "online"
      ? Wifi
      : presence.tone === "recent"
        ? Clock3
        : WifiOff;

  return (
    <article className="rounded-[22px] border border-[#182533]/10 bg-[#f8f5ef] p-4 shadow-[0_16px_40px_-34px_rgba(15,25,35,0.45)] transition hover:-translate-y-0.5 hover:border-[#617c43]/20 md:p-5">
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1.5fr)_10rem_9rem_minmax(0,1fr)_8rem_auto] lg:items-center lg:gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-serif text-lg font-medium tracking-[-0.03em] text-[#17212a]">
              {title}
            </h3>
            {isNew ? (
              <span className="inline-flex items-center rounded-full bg-warning-soft px-2.5 py-1 text-xs font-semibold text-warning">
                New
              </span>
            ) : null}
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold lg:hidden",
                statusTone
              )}
            >
              <StatusIcon size={13} />
              {presence.label}
            </span>
          </div>

          <p className="mt-1 text-sm text-[#68737b]">
            {[device.manufacturer, device.model, device.deviceType]
              .filter(Boolean)
              .join(" · ") || "Manufacturer unavailable"}
          </p>

          {isNew ? (
            <p className="mt-2 text-xs text-[#8a949b]">
              First detected {formatRelative(device.firstSeenAt)}
            </p>
          ) : null}
        </div>

        <div className="text-sm">
          <p className="font-medium text-text-primary">
            {device.ipAddress || "No IP"}
          </p>
          <p className="mt-1 break-all text-xs text-text-tertiary">
            {device.macAddress || "No MAC"}
          </p>
          <p className="mt-1 text-xs text-text-tertiary lg:hidden">
            Source · {source}
          </p>
        </div>

        <div className="text-sm">
          <p className="font-medium text-text-primary">
            {formatRelative(device.lastSeenAt)}
          </p>
          <p className="mt-1 text-xs text-[#8a949b]">
            First seen {formatRelative(device.firstSeenAt)}
          </p>
        </div>

        <div className="min-w-0 text-sm">
          {linked && device.matchedDevice ? (
            <Link
              href={"/devices/" + device.matchedDevice.id}
              className="htv-focus-ring inline-flex max-w-full items-center gap-1.5 rounded-md font-medium text-interaction hover:text-interaction-hover"
            >
              <Laptop size={14} className="shrink-0" />
              <span className="truncate">
                {device.matchedDevice.deviceName || "Linked device"}
              </span>
            </Link>
          ) : linked && device.importedDeviceId ? (
            <Link
              href={"/devices/" + device.importedDeviceId}
              className="htv-focus-ring inline-flex items-center gap-1.5 rounded-md font-medium text-interaction hover:text-interaction-hover"
            >
              <Laptop size={14} />
              View linked device
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-text-secondary">
              <Unlink size={14} />
              Unlinked
            </span>
          )}
          <p className="mt-1 text-xs text-text-tertiary capitalize">
            {device.matchStatus.replace("_", " ")}
          </p>
        </div>

        <span
          className={cn(
            "hidden w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold lg:inline-flex",
            statusTone
          )}
        >
          <StatusIcon size={13} />
          {presence.label}
        </span>

        <div
          className="relative flex items-center justify-between gap-2 lg:justify-end"
          ref={menuRef}
        >
          <div className="flex flex-wrap gap-2 lg:hidden">
            {linked && device.importedDeviceId ? (
              <Button
                href={"/devices/" + device.importedDeviceId}
                variant="secondary"
                size="sm"
              >
                View Device
              </Button>
            ) : canLink || isDemo ? (
              isDemo ? (
                <Button type="button" size="sm" onClick={onDemoAction}>
                  Link Device
                </Button>
              ) : (
                <Button
                  href={
                    "/network/discovery?focus=" + encodeURIComponent(device.id)
                  }
                  size="sm"
                >
                  Link Device
                </Button>
              )
            ) : null}
          </div>

          <div className="relative">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="px-3"
              aria-label="Device actions"
              aria-expanded={menuOpen}
              onClick={() => onMenuOpenChange(!menuOpen)}
            >
              <MoreHorizontal size={16} />
            </Button>

            {menuOpen ? (
              <div
                role="menu"
                className="absolute right-0 top-full z-20 mt-2 w-52 overflow-hidden rounded-[var(--radius-dialog)] border border-border-subtle bg-surface-card shadow-lg"
              >
                <Link
                  href={
                    "/network/discovery?focus=" + encodeURIComponent(device.id)
                  }
                  role="menuitem"
                  className="htv-focus-ring flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-text-primary transition hover:bg-surface-sunken"
                  onClick={() => onMenuOpenChange(false)}
                >
                  <Radar size={15} />
                  Review Discovery
                </Link>

                {linked && device.importedDeviceId ? (
                  <Link
                    href={"/devices/" + device.importedDeviceId}
                    role="menuitem"
                    className="htv-focus-ring flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-text-primary transition hover:bg-surface-sunken"
                    onClick={() => onMenuOpenChange(false)}
                  >
                    <Laptop size={15} />
                    View Device
                    <ChevronRight size={14} className="ml-auto" />
                  </Link>
                ) : canLink || isDemo ? (
                  isDemo ? (
                    <button
                      type="button"
                      role="menuitem"
                      className="htv-focus-ring flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-text-primary transition hover:bg-surface-sunken"
                      onClick={() => {
                        onMenuOpenChange(false);
                        onDemoAction?.();
                      }}
                    >
                      <Link2 size={15} />
                      Link Device
                    </button>
                  ) : (
                    <Link
                      href={
                        "/network/discovery?focus=" +
                        encodeURIComponent(device.id)
                      }
                      role="menuitem"
                      className="htv-focus-ring flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-text-primary transition hover:bg-surface-sunken"
                      onClick={() => onMenuOpenChange(false)}
                    >
                      <Link2 size={15} />
                      Link Device
                    </Link>
                  )
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
