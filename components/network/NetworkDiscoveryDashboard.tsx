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
import {
  buildIdentificationReasonSignals,
  discoveryDeviceTitle,
  formatIdentificationLabel,
} from "@/lib/connector/identificationReasons";

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
  return discoveryDeviceTitle(device);
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
  onAcceptRecognition: (
    discovery: DiscoveredDeviceSummary,
    edits?: {
      friendlyName?: string | null;
      manufacturer?: string | null;
      model?: string | null;
      category?: string | null;
      deviceTypeKey?: string | null;
    }
  ) => void;
  onDismissRecognition: (
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
        device.matchStatus === "new" ||
        ((device.identificationConfidence === "unknown" ||
          device.identificationConfidence === "medium") &&
          device.matchStatus !== "ignored" &&
          device.matchStatus !== "matched")
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
                    ? "You're all caught up. No discovered devices need review."
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
                  onAcceptRecognition={(edits) =>
                    props.onAcceptRecognition(
                      device,
                      edits
                    )
                  }
                  onDismissRecognition={() =>
                    props.onDismissRecognition(device)
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
  onAcceptRecognition,
  onDismissRecognition,
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
  onAcceptRecognition: (edits?: {
    friendlyName?: string | null;
    manufacturer?: string | null;
    model?: string | null;
    category?: string | null;
    deviceTypeKey?: string | null;
  }) => void;
  onDismissRecognition: () => void;
}) {
  const signals = buildMatchReasonSignals(device);
  const identificationSignals =
    buildIdentificationReasonSignals(device);
  const confidenceLabel = formatMatchConfidenceLabel(device);
  const identificationLabel =
    formatIdentificationLabel(device);
  const matchedVaultDevice = device.matchedDevice;
  const selectedVault = vaultDevices.find(
    (candidate) => candidate.id === selectedVaultDeviceId
  );
  const [editingRecognition, setEditingRecognition] =
    useState(false);
  const [editFriendlyName, setEditFriendlyName] = useState(
    device.recognitionSuggestion.friendlyName
  );
  const [editManufacturer, setEditManufacturer] = useState(
    device.recognitionSuggestion.manufacturer ?? ""
  );
  const [editModel, setEditModel] = useState(
    device.recognitionSuggestion.model ?? ""
  );
  const [editCategory, setEditCategory] = useState(
    device.recognitionSuggestion.category ?? ""
  );
  const [editTypeKey, setEditTypeKey] = useState(
    device.recognitionSuggestion.deviceTypeKey ?? ""
  );

  const suggestedName =
    device.recognitionSuggestion.friendlyName ||
    deviceTitle(device);

  const suggestedDescription = [
    device.recognitionSuggestion.manufacturer,
    device.recognitionSuggestion.model,
    device.recognitionSuggestion.category ??
      device.likelyCategory,
  ]
    .filter(Boolean)
    .join(" · ");

  const confidenceScore =
    device.recognitionSuggestion.confidenceScore;

  const confidenceSummary =
    confidenceScore >= 85
      ? "High confidence"
      : confidenceScore >= 60
        ? "Likely match"
        : "Needs review";

  const homeownerStatus =
    device.matchStatus === "matched"
      ? "Already linked to your vault"
      : device.matchStatus === "possible_match"
        ? "May already be in your vault"
        : device.matchStatus === "ignored"
          ? "Ignored"
          : "New device found";

  return (
    <article className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="min-w-0 truncate text-lg font-semibold text-text-primary">
                {suggestedName}
              </h2>

              <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-text-secondary">
                {homeownerStatus}
              </span>

              <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-800">
                {confidenceSummary}
              </span>
            </div>

            <p className="mt-2 text-sm text-text-secondary">
              {suggestedDescription ||
                "We found this device on your home network."}
            </p>

            {device.matchStatus === "possible_match" ? (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-sm font-medium text-amber-950">
                  Is this a device already saved in your vault?
                </p>
                <p className="mt-1 text-sm text-amber-800">
                  Select the matching device below, or add this as a
                  separate device.
                </p>
              </div>
            ) : device.matchStatus === "new" ? (
              <div className="mt-4 rounded-xl bg-sky-50 px-4 py-3">
                <p className="text-sm font-medium text-sky-950">
                  A new device was found
                </p>
                <p className="mt-1 text-sm text-sky-800">
                  Add it to your vault to track its details, warranty,
                  documents, and network status.
                </p>
              </div>
            ) : null}

            {matchedVaultDevice || selectedVault ? (
              <div className="mt-4 rounded-xl bg-surface-sunken px-4 py-3">
                <p className="text-sm font-medium text-text-primary">
                  Linked with{" "}
                  {matchedVaultDevice?.deviceName ??
                    selectedVault?.device_name ??
                    "Vault device"}
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  {matchedVaultDevice?.location ??
                    selectedVault?.location ??
                    matchedVaultDevice?.category ??
                    selectedVault?.category ??
                    "Saved device"}
                </p>
              </div>
            ) : null}
          </div>

          {canEdit ? (
            <div className="flex w-full flex-col gap-3 lg:w-72 lg:flex-none">
              {device.matchStatus === "possible_match" &&
              vaultDevices.length > 0 ? (
                <label className="grid gap-2 text-sm">
                  <span className="font-medium text-text-primary">
                    Which saved device is this?
                  </span>

                  <select
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-text-primary"
                    value={selectedVaultDeviceId}
                    onChange={(event) =>
                      onSelectVaultDevice(event.target.value)
                    }
                  >
                    <option value="">
                      Choose a saved device
                    </option>

                    {vaultDevices.map((vaultDevice) => (
                      <option
                        key={vaultDevice.id}
                        value={vaultDevice.id}
                      >
                        {vaultDevice.device_name ??
                          "Unnamed device"}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              {device.matchStatus === "possible_match" ? (
                <>
                  <ActionButton
                    label="Yes, Link This Device"
                    icon={<CheckCircle2 size={16} />}
                    busy={busy}
                    disabled={!selectedVaultDeviceId}
                    onClick={onConfirmMatch}
                  />

                  <ActionButton
                    label="No, Add as a New Device"
                    icon={<Plus size={16} />}
                    variant="secondary"
                    busy={busy}
                    onClick={onTreatAsNew}
                  />
                </>
              ) : null}

              {device.matchStatus === "new" ? (
                <ActionButton
                  label="Add to My Vault"
                  icon={<Plus size={16} />}
                  busy={busy}
                  onClick={onImport}
                />
              ) : null}

              {device.matchStatus === "matched" ? (
                <div className="rounded-xl bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-800">
                  Device linked successfully
                </div>
              ) : null}

              {device.matchStatus !== "ignored" ? (
                <details className="group rounded-xl border border-neutral-200 bg-white">
                  <summary className="cursor-pointer list-none px-4 py-3 text-center text-sm font-medium text-text-primary">
                    Review Device Name
                    <span className="ml-2 text-text-secondary group-open:hidden">
                      +
                    </span>
                    <span className="ml-2 hidden text-text-secondary group-open:inline">
                      −
                    </span>
                  </summary>

                  <div className="grid gap-2 border-t border-neutral-200 p-3">
                    <div className="rounded-lg bg-sky-50 px-3 py-3 text-sm">
                      <p className="font-medium text-sky-950">
                        Suggested name
                      </p>
                      <p className="mt-1 text-sky-900">
                        {device.recognitionSuggestion.friendlyName}
                      </p>
                      <p className="mt-1 text-xs text-sky-800">
                        {confidenceScore}% identification confidence
                      </p>
                    </div>

                    <ActionButton
                      label={
                        device.recognitionStatus === "accepted"
                          ? "Name Accepted"
                          : "Use Suggested Name"
                      }
                      icon={<CheckCircle2 size={16} />}
                      variant={
                        device.recognitionStatus === "accepted"
                          ? "secondary"
                          : "primary"
                      }
                      busy={busy}
                      disabled={
                        device.recognitionStatus === "accepted"
                      }
                      onClick={() => onAcceptRecognition()}
                    />

                    <ActionButton
                      label={
                        editingRecognition
                          ? "Cancel Changes"
                          : "Change Device Details"
                      }
                      variant="secondary"
                      busy={busy}
                      onClick={() =>
                        setEditingRecognition(
                          (current) => !current
                        )
                      }
                    />

                    {editingRecognition ? (
                      <div className="grid gap-2 rounded-xl bg-surface-sunken p-3 text-sm">
                        <label className="grid gap-1">
                          <span className="text-xs font-medium text-text-secondary">
                            Device name
                          </span>
                          <input
                            className="rounded-lg border border-neutral-200 bg-white px-3 py-2"
                            value={editFriendlyName}
                            onChange={(event) =>
                              setEditFriendlyName(
                                event.target.value
                              )
                            }
                            placeholder="Living Room TV"
                          />
                        </label>

                        <label className="grid gap-1">
                          <span className="text-xs font-medium text-text-secondary">
                            Brand
                          </span>
                          <input
                            className="rounded-lg border border-neutral-200 bg-white px-3 py-2"
                            value={editManufacturer}
                            onChange={(event) =>
                              setEditManufacturer(
                                event.target.value
                              )
                            }
                            placeholder="Samsung"
                          />
                        </label>

                        <label className="grid gap-1">
                          <span className="text-xs font-medium text-text-secondary">
                            Model
                          </span>
                          <input
                            className="rounded-lg border border-neutral-200 bg-white px-3 py-2"
                            value={editModel}
                            onChange={(event) =>
                              setEditModel(
                                event.target.value
                              )
                            }
                            placeholder="Model name or number"
                          />
                        </label>

                        <label className="grid gap-1">
                          <span className="text-xs font-medium text-text-secondary">
                            Device type
                          </span>
                          <input
                            className="rounded-lg border border-neutral-200 bg-white px-3 py-2"
                            value={editCategory}
                            onChange={(event) =>
                              setEditCategory(
                                event.target.value
                              )
                            }
                            placeholder="TV, speaker, printer..."
                          />
                        </label>

                        <details className="rounded-lg border border-neutral-200 bg-white">
                          <summary className="cursor-pointer px-3 py-2 text-xs font-medium text-text-secondary">
                            Advanced identification
                          </summary>

                          <div className="border-t border-neutral-200 p-3">
                            <input
                              className="w-full rounded-lg border border-neutral-200 px-3 py-2"
                              value={editTypeKey}
                              onChange={(event) =>
                                setEditTypeKey(
                                  event.target.value
                                )
                              }
                              placeholder="Device type key"
                            />
                          </div>
                        </details>

                        <ActionButton
                          label="Save Device Details"
                          icon={<CheckCircle2 size={16} />}
                          busy={busy}
                          onClick={() => {
                            onAcceptRecognition({
                              friendlyName: editFriendlyName,
                              manufacturer: editManufacturer,
                              model: editModel,
                              category: editCategory,
                              deviceTypeKey: editTypeKey,
                            });
                            setEditingRecognition(false);
                          }}
                        />
                      </div>
                    ) : null}

                    <ActionButton
                      label={
                        device.recognitionStatus === "dismissed"
                          ? "Suggestion Dismissed"
                          : "Device Name Is Incorrect"
                      }
                      icon={<XCircle size={16} />}
                      variant="secondary"
                      busy={busy}
                      disabled={
                        device.recognitionStatus === "dismissed"
                      }
                      onClick={onDismissRecognition}
                    />
                  </div>
                </details>
              ) : null}

              {device.matchStatus === "new" ? (
                <details className="group rounded-xl border border-neutral-200 bg-white">
                  <summary className="cursor-pointer list-none px-4 py-3 text-center text-sm font-medium text-text-secondary">
                    More options
                  </summary>

                  <div className="grid gap-2 border-t border-neutral-200 p-3">
                    <ActionButton
                      label="Confirm and Add Device"
                      icon={<CheckCircle2 size={16} />}
                      variant="secondary"
                      busy={busy}
                      onClick={onImport}
                    />
                  </div>
                </details>
              ) : null}

              <ActionButton
                label="Hide This Device"
                icon={<XCircle size={16} />}
                variant="secondary"
                busy={busy}
                busyLabel="Hiding..."
                onClick={onIgnore}
              />
            </div>
          ) : null}
        </div>

        <details className="group mt-5 rounded-xl border border-neutral-200 bg-surface-sunken">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-text-primary">
            <span>Device and network details</span>
            <span className="text-xs font-normal text-text-secondary">
              Optional
            </span>
          </summary>

          <div className="border-t border-neutral-200 px-4 py-4">
            <dl className="grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-5">
              <Field
                label="IP address"
                value={device.ipAddress}
              />
              <Field
                label="Device ID"
                value={device.macAddress}
              />
              <Field
                label="Network hostname"
                value={device.hostname}
              />
              <Field
                label="Brand"
                value={device.manufacturer}
              />
              <Field
                label="Last connected"
                value={formatTimestamp(device.lastSeenAt)}
              />
            </dl>

            {device.matchReason ? (
              <div className="mt-4 rounded-lg bg-white px-3 py-3 text-sm text-text-secondary">
                <span className="font-medium text-text-primary">
                  Why we suggested this:{" "}
                </span>
                {device.matchReason}
              </div>
            ) : null}

            {identificationSignals.length > 0 ||
            signals.length > 0 ? (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {identificationSignals.length > 0 ? (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                      Identification clues
                    </p>
                    <ul className="mt-2 space-y-2">
                      {identificationSignals.map((signal) => (
                        <li
                          key={signal.label}
                          className="flex items-center gap-2 text-sm text-text-secondary"
                        >
                          {signal.matched ? (
                            <Check
                              size={16}
                              className="text-sky-600"
                            />
                          ) : (
                            <span className="inline-block h-4 w-4 rounded-full border border-neutral-300" />
                          )}
                          {signal.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {signals.length > 0 ? (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                      Vault matching clues
                    </p>
                    <ul className="mt-2 space-y-2">
                      {signals.map((signal) => (
                        <li
                          key={`match-${signal.label}`}
                          className="flex items-center gap-2 text-sm text-text-secondary"
                        >
                          {signal.matched ? (
                            <Check
                              size={16}
                              className="text-emerald-600"
                            />
                          ) : (
                            <span className="inline-block h-4 w-4 rounded-full border border-neutral-300" />
                          )}
                          {signal.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </details>
      </div>
    </article>
  );
}


function ActionButton({
  label,
  icon,
  busy,
  busyLabel,
  disabled,
  variant = "primary",
  onClick,
}: {
  label: string;
  icon?: ReactNode;
  busy?: boolean;
  busyLabel?: string;
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
      {busy ? busyLabel ?? label : label}
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
