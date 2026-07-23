"use client";

import {
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  Check,
  CheckCircle2,
  HelpCircle,
  Loader2,
  Plus,
  Radar,
  RefreshCw,
  ShieldAlert,
  XCircle,
} from "lucide-react";

import Button from "@/components/ui/Button";
import PageCard from "@/components/ui/PageCard";

import {
  buildMatchReasonSignals,
  formatMatchConfidenceLabel,
} from "@/lib/connector/matchReasons";

import type {
  DiscoveredDeviceSummary,
  DiscoveryStatsSummary,
  MatchStatus,
} from "@/lib/connector/discoveryTypes";

type ConnectorSummary = {
  id: string;
  name: string;
  platform: string;
  status: string;
  lastSeenAt: string | null;
  lastScanAt: string | null;
  revokedAt: string | null;
};

type VaultDeviceOption = {
  id: string;
  device_name: string | null;
  category: string | null;
  manufacturer: string | null;
  model_number: string | null;
  mac_address: string | null;
  location?: string | null;
};

type PageTab =
  | "overview"
  | "discovered"
  | "review"
  | "activity";

const PAGE_TABS: {
  key: PageTab;
  label: string;
}[] = [
  { key: "overview", label: "Overview" },
  { key: "discovered", label: "Discovered" },
  { key: "review", label: "Review" },
  { key: "activity", label: "Activity" },
];

const REVIEW_FILTERS: {
  key: MatchStatus | "all";
  label: string;
}[] = [
  { key: "all", label: "All" },
  { key: "matched", label: "Matched automatically" },
  { key: "possible_match", label: "Possible matches" },
  { key: "new", label: "New devices" },
  { key: "ignored", label: "Ignored" },
];

function formatTimestamp(
  value: string | null | undefined
) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString();
}

function deviceTitle(device: DiscoveredDeviceSummary) {
  return (
    device.hostname ??
    device.manufacturer ??
    device.ipAddress ??
    "Discovered device"
  );
}

export default function NetworkDiscoveryDashboard(props: {
  devices: DiscoveredDeviceSummary[];
  stats: DiscoveryStatsSummary | null;
  connectors: ConnectorSummary[];
  vaultDevices: VaultDeviceOption[];
  canEdit: boolean;
  refreshing: boolean;
  errorMessage: string;
  busyId: string | null;
  onRefresh: () => void;
  onConfirmMatch: (
    discovery: DiscoveredDeviceSummary,
    vaultDeviceId: string
  ) => void;
  onIgnore: (discovery: DiscoveredDeviceSummary) => void;
  onImport: (
    discovery: DiscoveredDeviceSummary,
    force?: boolean
  ) => void;
  onTreatAsNew: (
    discovery: DiscoveredDeviceSummary
  ) => void;
}) {
  const [pageTab, setPageTab] =
    useState<PageTab>("overview");
  const [reviewFilter, setReviewFilter] = useState<
    MatchStatus | "all"
  >("all");
  const [selectedDeviceByDiscoveryId, setSelectedDeviceByDiscoveryId] =
    useState<Record<string, string>>({});
  const [importTarget, setImportTarget] =
    useState<DiscoveredDeviceSummary | null>(
      null
    );

  const activeConnectors = useMemo(
    () =>
      props.connectors.filter(
        (connector) =>
          connector.status === "active" &&
          !connector.revokedAt
      ),
    [props.connectors]
  );

  const lastScanAt = useMemo(() => {
    const timestamps = activeConnectors
      .map((connector) => connector.lastScanAt)
      .filter(Boolean) as string[];

    if (timestamps.length === 0) {
      return null;
    }

    return timestamps.sort(
      (first, second) =>
        Date.parse(second) - Date.parse(first)
    )[0];
  }, [activeConnectors]);

  const hasCompletedScan =
    lastScanAt !== null || props.devices.length > 0;

  const stats =
    props.stats ??
    ({
      totalDiscovered: props.devices.length,
      matchedDevices: props.devices.filter(
        (device) => device.matchStatus === "matched"
      ).length,
      needsReview: props.devices.filter(
        (device) =>
          device.matchStatus === "possible_match"
      ).length,
      newDevices: props.devices.filter(
        (device) => device.matchStatus === "new"
      ).length,
      ignoredDevices: props.devices.filter(
        (device) => device.matchStatus === "ignored"
      ).length,
      totalDevices: 0,
      onlineDevices: 0,
      recentlyDetected: props.devices.filter(
        (device) => device.online
      ).length,
    } satisfies DiscoveryStatsSummary);

  const reviewDevices = useMemo(() => {
    const needsReview = props.devices.filter(
      (device) =>
        device.matchStatus === "possible_match" ||
        device.matchStatus === "new"
    );

    if (pageTab === "review") {
      return needsReview;
    }

    if (reviewFilter === "all") {
      return props.devices;
    }

    return props.devices.filter(
      (device) =>
        device.matchStatus === reviewFilter
    );
  }, [pageTab, props.devices, reviewFilter]);

  function selectedVaultDeviceId(
    device: DiscoveredDeviceSummary
  ) {
    return (
      selectedDeviceByDiscoveryId[device.id] ??
      device.matchedDeviceId ??
      device.candidateDeviceIds?.[0] ??
      ""
    );
  }

  return (
    <>
      {props.errorMessage ? (
        <PageCard className="mt-6 border-red-200 bg-red-50 text-red-700">
          <div className="flex items-start gap-3">
            <ShieldAlert size={18} />
            <p className="text-sm">{props.errorMessage}</p>
          </div>
        </PageCard>
      ) : null}

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Connector status"
          value={
            activeConnectors.length > 0
              ? "Connected"
              : "Not paired"
          }
          detail={
            activeConnectors[0]?.name ??
            "Pair a Mac connector"
          }
        />
        <MetricCard
          label="Last scan"
          value={
            hasCompletedScan
              ? formatTimestamp(lastScanAt)
              : "Not yet"
          }
          detail={`${stats.totalDiscovered} devices found`}
        />
        <MetricCard
          label="Matched"
          value={String(stats.matchedDevices)}
          detail={`${stats.needsReview} need review`}
        />
        <MetricCard
          label="New"
          value={String(stats.newDevices)}
          detail={`${stats.ignoredDevices} ignored`}
        />
      </section>

      <PageCard className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {PAGE_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setPageTab(tab.key)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  pageTab === tab.key
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-text-secondary hover:bg-neutral-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={props.onRefresh}
            disabled={props.refreshing}
          >
            {props.refreshing ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <RefreshCw size={16} />
            )}
            Refresh
          </Button>
        </div>

        {!props.canEdit ? (
          <p className="mt-4 flex items-center gap-2 text-sm text-text-secondary">
            <HelpCircle size={16} />
            Viewers can review discovery results but cannot confirm matches or import devices.
          </p>
        ) : null}
      </PageCard>

      {pageTab === "overview" ? (
        <PageCard className="mt-6">
          <h2 className="text-lg font-semibold text-text-primary">
            Network discovery overview
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            Your connector identifies devices on your home network, matches them to your vault, and flags anything that needs review.
          </p>

          {!hasCompletedScan ? (
            <div className="mt-6 rounded-2xl border border-dashed border-neutral-200 px-6 py-10 text-center">
              <Radar className="mx-auto text-text-secondary" size={28} />
              <p className="mt-3 text-sm text-text-secondary">
                No network scan has been completed yet.
              </p>
              <Link
                href="/network/connect"
                className="mt-4 inline-flex text-sm font-medium text-interaction"
              >
                Set up your connector
              </Link>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <OverviewStat label="Total discovered" value={stats.totalDiscovered} />
              <OverviewStat label="Needs review" value={stats.needsReview} />
              <OverviewStat label="Recently detected" value={stats.recentlyDetected} />
              <OverviewStat label="Matched automatically" value={stats.matchedDevices} />
              <OverviewStat label="New devices" value={stats.newDevices} />
              <OverviewStat label="Ignored" value={stats.ignoredDevices} />
            </div>
          )}
        </PageCard>
      ) : null}

      {pageTab === "activity" ? (
        <PageCard className="mt-6">
          <h2 className="text-lg font-semibold text-text-primary">
            Network activity
          </h2>
          <p className="mt-3 text-sm text-text-secondary">
            Network timeline events will appear here in a future update. Phase 2B.2 focuses on identification and review, not ongoing monitoring.
          </p>
        </PageCard>
      ) : null}

      {pageTab === "discovered" || pageTab === "review" ? (
        <PageCard className="mt-6">
          {pageTab === "discovered" ? (
            <div className="flex flex-wrap gap-2">
              {REVIEW_FILTERS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setReviewFilter(tab.key)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    reviewFilter === tab.key
                      ? "bg-neutral-900 text-white"
                      : "bg-neutral-100 text-text-secondary hover:bg-neutral-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          ) : (
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                Review queue
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                Confirm likely matches or import new devices without creating duplicates.
              </p>
            </div>
          )}

          <div className="mt-6 space-y-4">
            {reviewDevices.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-200 px-6 py-10 text-center">
                <Radar className="mx-auto text-text-secondary" size={28} />
                <p className="mt-3 text-sm text-text-secondary">
                  {hasCompletedScan
                    ? "Nothing needs attention in this view."
                    : "No network scan has been completed yet."}
                </p>
              </div>
            ) : (
              reviewDevices.map((device) => (
                <DiscoveryDeviceCard
                  key={device.id}
                  device={device}
                  vaultDevices={props.vaultDevices}
                  canEdit={props.canEdit}
                  busy={props.busyId === device.id}
                  selectedVaultDeviceId={selectedVaultDeviceId(
                    device
                  )}
                  onSelectVaultDevice={(vaultDeviceId) =>
                    setSelectedDeviceByDiscoveryId(
                      (current) => ({
                        ...current,
                        [device.id]: vaultDeviceId,
                      })
                    )
                  }
                  onConfirmMatch={() =>
                    props.onConfirmMatch(
                      device,
                      selectedVaultDeviceId(device)
                    )
                  }
                  onIgnore={() => props.onIgnore(device)}
                  onImport={() => setImportTarget(device)}
                  onTreatAsNew={() =>
                    props.onTreatAsNew(device)
                  }
                />
              ))
            )}
          </div>
        </PageCard>
      ) : null}

      {importTarget ? (
        <ImportConfirmModal
          device={importTarget}
          busy={props.busyId === importTarget.id}
          onCancel={() => setImportTarget(null)}
          onConfirm={() => {
            props.onImport(importTarget);
            setImportTarget(null);
          }}
        />
      ) : null}
    </>
  );
}

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <PageCard>
      <p className="text-overline text-section-network">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-text-primary">{value}</p>
      <p className="mt-1 text-sm text-text-secondary">{detail}</p>
    </PageCard>
  );
}

function OverviewStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-surface-sunken px-5 py-4">
      <p className="text-sm text-text-secondary">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-text-primary">{value}</p>
    </div>
  );
}

function DiscoveryDeviceCard({
  device,
  vaultDevices,
  canEdit,
  busy,
  selectedVaultDeviceId,
  onSelectVaultDevice,
  onConfirmMatch,
  onIgnore,
  onImport,
  onTreatAsNew,
}: {
  device: DiscoveredDeviceSummary;
  vaultDevices: VaultDeviceOption[];
  canEdit: boolean;
  busy: boolean;
  selectedVaultDeviceId: string;
  onSelectVaultDevice: (vaultDeviceId: string) => void;
  onConfirmMatch: () => void;
  onIgnore: () => void;
  onImport: () => void;
  onTreatAsNew: () => void;
}) {
  const signals = buildMatchReasonSignals(device);
  const confidenceLabel = formatMatchConfidenceLabel(device);
  const matchedVaultDevice = device.matchedDevice;
  const selectedVault = vaultDevices.find(
    (candidate) => candidate.id === selectedVaultDeviceId
  );

  return (
    <article className="rounded-2xl border border-neutral-200 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-text-primary">
              {deviceTitle(device)}
            </h2>
            <StatusBadge status={device.matchStatus} />
            {confidenceLabel ? (
              <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-text-secondary">
                {confidenceLabel}
              </span>
            ) : null}
          </div>

          {device.matchReason ? (
            <p className="mt-2 text-sm text-text-secondary">
              {device.matchReason}
            </p>
          ) : null}

          {signals.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {signals.map((signal) => (
                <li
                  key={signal.label}
                  className="flex items-center gap-2 text-sm text-text-secondary"
                >
                  {signal.matched ? (
                    <Check size={16} className="text-emerald-600" />
                  ) : (
                    <span className="inline-block h-4 w-4 rounded-full border border-neutral-300" />
                  )}
                  {signal.label}
                </li>
              ))}
            </ul>
          ) : null}

          {matchedVaultDevice || selectedVault ? (
            <div className="mt-4 rounded-xl bg-surface-sunken px-4 py-3 text-sm">
              <p className="font-medium text-text-primary">
                Matches:{" "}
                {matchedVaultDevice?.deviceName ??
                  selectedVault?.device_name ??
                  "Vault device"}
              </p>
              <p className="mt-1 text-text-secondary">
                {matchedVaultDevice?.location ??
                  selectedVault?.location ??
                  matchedVaultDevice?.category ??
                  selectedVault?.category ??
                  "Vault device"}
              </p>
            </div>
          ) : null}

          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
            <Field label="IP address" value={device.ipAddress} />
            <Field label="MAC address" value={device.macAddress} />
            <Field label="Manufacturer" value={device.manufacturer} />
            <Field label="Last seen" value={formatTimestamp(device.lastSeenAt)} />
          </dl>
        </div>

        {canEdit ? (
          <div className="flex w-full flex-col gap-3 lg:w-72">
            {(device.matchStatus === "possible_match" ||
              device.matchStatus === "matched") &&
            vaultDevices.length > 0 ? (
              <label className="grid gap-2 text-sm">
                <span className="font-medium text-text-primary">
                  Choose vault device
                </span>
                <select
                  className="rounded-xl border border-neutral-200 px-3 py-2"
                  value={selectedVaultDeviceId}
                  onChange={(event) =>
                    onSelectVaultDevice(event.target.value)
                  }
                >
                  <option value="">Select a device</option>
                  {vaultDevices.map((vaultDevice) => (
                    <option key={vaultDevice.id} value={vaultDevice.id}>
                      {vaultDevice.device_name ?? "Unnamed device"}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <div className="flex flex-col gap-2">
              {device.matchStatus === "possible_match" ? (
                <>
                  <ActionButton
                    label="Confirm Match"
                    icon={<CheckCircle2 size={16} />}
                    busy={busy}
                    disabled={!selectedVaultDeviceId}
                    onClick={onConfirmMatch}
                  />
                  <ActionButton
                    label="Treat as New Device"
                    variant="secondary"
                    busy={busy}
                    onClick={onTreatAsNew}
                  />
                </>
              ) : null}

              {device.matchStatus === "new" ||
              device.matchStatus === "possible_match" ? (
                <ActionButton
                  label="Add to Vault"
                  icon={<Plus size={16} />}
                  busy={busy}
                  onClick={onImport}
                />
              ) : null}

              <ActionButton
                label="Ignore"
                icon={<XCircle size={16} />}
                variant="secondary"
                busy={busy}
                onClick={onIgnore}
              />
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function ActionButton({
  label,
  icon,
  busy,
  disabled,
  variant = "primary",
  onClick,
}: {
  label: string;
  icon?: ReactNode;
  busy?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={busy || disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
        variant === "primary"
          ? "bg-neutral-900 text-white hover:bg-neutral-800"
          : "border border-neutral-200 bg-white text-text-primary hover:border-neutral-300"
      }`}
    >
      {busy ? (
        <Loader2 className="animate-spin" size={16} />
      ) : (
        icon
      )}
      {label}
    </button>
  );
}

function ImportConfirmModal({
  device,
  busy,
  onCancel,
  onConfirm,
}: {
  device: DiscoveredDeviceSummary;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/40 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-semibold text-text-primary">
          Add device to vault
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          Review the prefilled details below. Nothing is imported until you confirm.
        </p>

        <dl className="mt-5 grid gap-3 text-sm">
          <Field label="Device name" value={deviceTitle(device)} />
          <Field label="Manufacturer" value={device.manufacturer} />
          <Field label="Category" value={device.deviceType} />
          <Field label="IP address" value={device.ipAddress} />
          <Field label="MAC address" value={device.macAddress} />
          <Field label="Discovery source" value={device.discoverySources.join(", ")} />
        </dl>

        {device.matchStatus === "possible_match" ? (
          <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            This looks like a device already in your vault. Confirm only if you are sure it is new.
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" onClick={onConfirm} disabled={busy}>
            {busy ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Plus size={16} />
            )}
            Confirm Import
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-text-tertiary">
        {label}
      </dt>
      <dd className="mt-1 font-medium text-text-primary">
        {value?.trim() ? value : "Unknown"}
      </dd>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: MatchStatus;
}) {
  const label =
    status === "matched"
      ? "Matched automatically"
      : status === "possible_match"
        ? "Possible match"
        : status === "new"
          ? "New device"
          : "Ignored";

  const className =
    status === "matched"
      ? "bg-emerald-100 text-emerald-800"
      : status === "possible_match"
        ? "bg-amber-100 text-amber-800"
        : status === "new"
          ? "bg-sky-100 text-sky-800"
          : "bg-neutral-100 text-text-secondary";

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}
