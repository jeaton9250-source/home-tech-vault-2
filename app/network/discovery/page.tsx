"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  Loader2,
  Plus,
  Radar,
  RefreshCw,
  ShieldAlert,
  XCircle,
} from "lucide-react";

import FeatureGate from "@/components/permissions/FeatureGate";
import PageShell from "@/components/ui/PageShell";
import PageHero from "@/components/ui/PageHero";
import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";

import { useDemoReadOnlyAction } from "@/components/demo/DemoExperienceProvider";
import { usePermissions } from "@/hooks/usePermissions";
import { supabase } from "@/lib/supabase";
import { applyHouseholdScope } from "@/lib/data/householdScope";

import type {
  DiscoveredDeviceSummary,
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
};

const REVIEW_TABS: {
  key: MatchStatus | "all";
  label: string;
}[] = [
  { key: "all", label: "All" },
  { key: "matched", label: "Matched automatically" },
  {
    key: "possible_match",
    label: "Possible matches",
  },
  { key: "unmatched", label: "New devices" },
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

function DiscoveryReviewContent() {
  const {
    user,
    householdId,
    canEdit,
    loading: permissionsLoading,
  } = usePermissions();

  const showReadOnlyModal =
    useDemoReadOnlyAction();

  const [devices, setDevices] = useState<
    DiscoveredDeviceSummary[]
  >([]);
  const [vaultDevices, setVaultDevices] =
    useState<VaultDeviceOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [errorMessage, setErrorMessage] =
    useState("");
  const [activeTab, setActiveTab] = useState<
    MatchStatus | "all"
  >("all");
  const [busyId, setBusyId] = useState<
    string | null
  >(null);
  const [selectedDeviceByDiscoveryId, setSelectedDeviceByDiscoveryId] =
    useState<Record<string, string>>({});
  const [connectors, setConnectors] = useState<
    ConnectorSummary[]
  >([]);

  const activeConnectors = useMemo(
    () =>
      connectors.filter(
        (connector) =>
          connector.status === "active" &&
          !connector.revokedAt
      ),
    [connectors]
  );

  const lastScanAt = useMemo(() => {
    const timestamps = activeConnectors
      .map(
        (connector) =>
          connector.lastScanAt
      )
      .filter(Boolean) as string[];

    if (timestamps.length === 0) {
      return null;
    }

    return timestamps.sort(
      (first, second) =>
        Date.parse(second) -
        Date.parse(first)
    )[0];
  }, [activeConnectors]);

  const hasCompletedScan =
    lastScanAt !== null || devices.length > 0;

  const reloadReviewData = useCallback(
    async (showSpinner = true) => {
      if (!householdId || !user?.id) {
        return;
      }

      if (showSpinner) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setErrorMessage("");

      try {
        const [
          discoveryResponse,
          vaultResponse,
          connectorResponse,
        ] = await Promise.all([
          fetch(
            `/api/connector/discovery?householdId=${encodeURIComponent(householdId)}`,
            { cache: "no-store" }
          ),
          applyHouseholdScope(
            supabase
              .from("devices")
              .select(
                "id, device_name, category, manufacturer, model_number, mac_address"
              )
              .order("device_name"),
            householdId,
            user.id
          ),
          fetch(
            `/api/connector/pair/status?householdId=${encodeURIComponent(householdId)}`,
            { cache: "no-store" }
          ),
        ]);

        if (!discoveryResponse.ok) {
          const payload =
            (await discoveryResponse.json()) as {
              error?: string;
            };

          throw new Error(
            payload.error ??
              "Unable to load connector discovery results."
          );
        }

        if (vaultResponse.error) {
          throw vaultResponse.error;
        }

        if (connectorResponse.ok) {
          const connectorPayload =
            (await connectorResponse.json()) as {
              connectors?: ConnectorSummary[];
            };

          setConnectors(
            connectorPayload.connectors ??
              []
          );
        }

        const payload =
          (await discoveryResponse.json()) as {
            devices: DiscoveredDeviceSummary[];
          };

        setDevices(payload.devices ?? []);
        setVaultDevices(
          (vaultResponse.data ??
            []) as VaultDeviceOption[]
        );
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load discovery review."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [householdId, user]
  );

  useEffect(() => {
    let mounted = true;

    async function loadReviewData() {
      if (
        permissionsLoading ||
        !householdId ||
        !user?.id
      ) {
        if (mounted && !permissionsLoading) {
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setErrorMessage("");

      try {
        const [
          discoveryResponse,
          vaultResponse,
          connectorResponse,
        ] = await Promise.all([
          fetch(
            `/api/connector/discovery?householdId=${encodeURIComponent(householdId)}`,
            { cache: "no-store" }
          ),
          applyHouseholdScope(
            supabase
              .from("devices")
              .select(
                "id, device_name, category, manufacturer, model_number, mac_address"
              )
              .order("device_name"),
            householdId,
            user.id
          ),
          fetch(
            `/api/connector/pair/status?householdId=${encodeURIComponent(householdId)}`,
            { cache: "no-store" }
          ),
        ]);

        if (!discoveryResponse.ok) {
          const payload =
            (await discoveryResponse.json()) as {
              error?: string;
            };

          throw new Error(
            payload.error ??
              "Unable to load connector discovery results."
          );
        }

        if (vaultResponse.error) {
          throw vaultResponse.error;
        }

        if (!mounted) {
          return;
        }

        if (connectorResponse.ok) {
          const connectorPayload =
            (await connectorResponse.json()) as {
              connectors?: ConnectorSummary[];
            };

          setConnectors(
            connectorPayload.connectors ??
              []
          );
        }

        const payload =
          (await discoveryResponse.json()) as {
            devices: DiscoveredDeviceSummary[];
          };

        setDevices(payload.devices ?? []);
        setVaultDevices(
          (vaultResponse.data ??
            []) as VaultDeviceOption[]
        );
      } catch (error) {
        if (!mounted) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load discovery review."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadReviewData();

    return () => {
      mounted = false;
    };
  }, [
    permissionsLoading,
    householdId,
    user,
  ]);

  const filteredDevices = useMemo(() => {
    if (activeTab === "all") {
      return devices;
    }

    return devices.filter(
      (device) =>
        device.matchStatus === activeTab
    );
  }, [activeTab, devices]);

  const counts = useMemo(() => {
    return devices.reduce(
      (accumulator, device) => {
        accumulator[device.matchStatus] += 1;
        return accumulator;
      },
      {
        matched: 0,
        possible_match: 0,
        unmatched: 0,
        ignored: 0,
      } as Record<MatchStatus, number>
    );
  }, [devices]);

  async function runAction(
    discoveryId: string,
    action: () => Promise<Response>
  ) {
    if (!canEdit) {
      showReadOnlyModal();
      return;
    }

    setBusyId(discoveryId);
    setErrorMessage("");

    try {
      const response = await action();

      if (!response.ok) {
        const payload =
          (await response.json()) as {
            error?: string;
            duplicateWarnings?: Array<{
              deviceName: string | null;
              reason: string;
            }>;
          };

        if (payload.duplicateWarnings?.length) {
          throw new Error(
            `${payload.error ?? "Possible duplicate detected."} ${payload.duplicateWarnings
              .map(
                (warning) =>
                  warning.deviceName ??
                  "Unnamed device"
              )
              .join(", ")}`
          );
        }

        throw new Error(
          payload.error ??
            "Unable to complete that action."
        );
      }

      await reloadReviewData(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to complete that action."
      );
    } finally {
      setBusyId(null);
    }
  }

  function confirmMatch(
    discovery: DiscoveredDeviceSummary,
    vaultDeviceId: string
  ) {
    if (!householdId) {
      return;
    }

    return runAction(discovery.id, () =>
      fetch(
        `/api/connector/discovery/${discovery.id}/confirm`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            householdId,
            vaultDeviceId,
          }),
        }
      )
    );
  }

  function ignoreDiscovery(
    discovery: DiscoveredDeviceSummary
  ) {
    if (!householdId) {
      return;
    }

    return runAction(discovery.id, () =>
      fetch(
        `/api/connector/discovery/${discovery.id}/ignore`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            householdId,
          }),
        }
      )
    );
  }

  function importDiscovery(
    discovery: DiscoveredDeviceSummary,
    force = false
  ) {
    if (!householdId) {
      return;
    }

    return runAction(discovery.id, () =>
      fetch(
        `/api/connector/discovery/${discovery.id}/import`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            householdId,
            force,
          }),
        }
      )
    );
  }

  function treatAsNewDevice(
    discovery: DiscoveredDeviceSummary
  ) {
    return runAction(discovery.id, () =>
      fetch(
        `/api/connector/discovery/${discovery.id}/confirm`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            householdId,
            action: "clear_link",
          }),
        }
      ).then(async (response) => {
        if (!response.ok) {
          return response;
        }

        return fetch(
          `/api/connector/discovery/${discovery.id}/import`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              householdId,
              force: true,
            }),
          }
        );
      })
    );
  }

  if (loading || permissionsLoading) {
    return (
      <PageShell>
        <div className="flex min-h-72 items-center justify-center rounded-3xl border border-neutral-200 bg-white">
          <div className="flex items-center gap-3 text-text-secondary">
            <Loader2
              className="animate-spin"
              size={22}
            />
            Loading discovery review...
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHero
        section="network"
        eyebrow="Connector discovery"
        title="Review discovered devices."
        description="Compare connector scan results against your vault, confirm matches, import new devices, or ignore noise."
      >
        <div className="flex flex-wrap gap-3">
          <Link
            href="/network/connect"
            className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-text-primary transition hover:border-neutral-300"
          >
            <ArrowLeft size={16} />
            Back to connector setup
          </Link>

          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              void reloadReviewData(false)
            }
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2
                className="animate-spin"
                size={16}
              />
            ) : (
              <RefreshCw size={16} />
            )}
            Refresh
          </Button>
        </div>
      </PageHero>

      {errorMessage ? (
        <PageCard className="mt-6 border-red-200 bg-red-50 text-red-700">
          <div className="flex items-start gap-3">
            <ShieldAlert size={18} />
            <p className="text-sm">{errorMessage}</p>
          </div>
        </PageCard>
      ) : null}

      <PageCard className="mt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-overline text-section-network">
              Scan status
            </p>
            <h2 className="mt-1 text-lg font-semibold text-text-primary">
              {hasCompletedScan
                ? "Network scan completed"
                : "Waiting for first scan"}
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              {hasCompletedScan
                ? `Last scan ${formatTimestamp(lastScanAt)} from ${activeConnectors.length} active connector${activeConnectors.length === 1 ? "" : "s"}.`
                : "Run Scan My Network from the Home Tech Vault Connector on a Mac connected to your home network."}
            </p>
          </div>

          <div className="rounded-2xl bg-surface-sunken px-5 py-3 text-sm">
            <p className="font-semibold text-text-primary">
              {devices.length} discovered
            </p>
            <p className="mt-1 text-text-secondary">
              {activeConnectors.length > 0
                ? `${activeConnectors.length} connector${activeConnectors.length === 1 ? "" : "s"} paired`
                : "No active connector"}
            </p>
          </div>
        </div>
      </PageCard>

      {!hasCompletedScan ? (
        <PageCard className="mt-6">
          <div className="rounded-2xl border border-dashed border-neutral-200 px-6 py-10 text-center">
            <Radar
              className="mx-auto text-text-secondary"
              size={28}
            />
            <p className="mt-3 text-sm text-text-secondary">
              No network scan has been completed yet.
            </p>
            <p className="mt-2 text-sm text-text-secondary">
              Open the connector app on your Mac, accept the privacy notice, and tap Scan My Network.
            </p>
            <Link
              href="/network/connect"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-interaction"
            >
              Connector setup
            </Link>
          </div>
        </PageCard>
      ) : (
        <>
      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Matched automatically"
          value={String(counts.matched)}
        />
        <SummaryCard
          label="Possible matches"
          value={String(counts.possible_match)}
        />
        <SummaryCard
          label="New devices"
          value={String(counts.unmatched)}
        />
        <SummaryCard
          label="Ignored"
          value={String(counts.ignored)}
        />
      </section>

      <PageCard className="mt-6">
        <div className="flex flex-wrap gap-2">
          {REVIEW_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() =>
                setActiveTab(tab.key)
              }
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeTab === tab.key
                  ? "bg-neutral-900 text-white"
                  : "bg-neutral-100 text-text-secondary hover:bg-neutral-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {!canEdit ? (
          <p className="mt-4 flex items-center gap-2 text-sm text-text-secondary">
            <HelpCircle size={16} />
            Viewers can review discovery results but cannot confirm matches or import devices.
          </p>
        ) : null}

        <div className="mt-6 space-y-4">
          {filteredDevices.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-200 px-6 py-10 text-center">
              <Radar
                className="mx-auto text-text-secondary"
                size={28}
              />
              <p className="mt-3 text-sm text-text-secondary">
                No discovered devices in this view.
                {activeTab === "all"
                  ? " Try another tab or run another scan from the connector."
                  : " Try another tab."}
              </p>
            </div>
          ) : (
            filteredDevices.map((device) => {
              const selectedVaultDeviceId =
                selectedDeviceByDiscoveryId[
                  device.id
                ] ??
                device.matchedDeviceId ??
                device.candidateDeviceIds?.[0] ??
                "";

              const isBusy =
                busyId === device.id;

              return (
                <article
                  key={device.id}
                  className="rounded-2xl border border-neutral-200 p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold text-text-primary">
                          {device.hostname ??
                            device.manufacturer ??
                            device.ipAddress ??
                            "Discovered device"}
                        </h2>
                        <StatusBadge
                          status={
                            device.matchStatus
                          }
                        />
                        {device.matchConfidence ? (
                          <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-text-secondary">
                            {device.matchConfidence}
                          </span>
                        ) : null}
                      </div>

                      {device.matchReason ? (
                        <p className="mt-2 text-sm text-text-secondary">
                          {device.matchReason}
                        </p>
                      ) : null}

                      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
                        <Field
                          label="IP address"
                          value={
                            device.ipAddress
                          }
                        />
                        <Field
                          label="MAC address"
                          value={
                            device.macAddress
                          }
                        />
                        <Field
                          label="Manufacturer"
                          value={
                            device.manufacturer
                          }
                        />
                        <Field
                          label="Model"
                          value={device.model}
                        />
                        <Field
                          label="Last seen"
                          value={formatTimestamp(
                            device.lastSeenAt
                          )}
                        />
                        <Field
                          label="Online"
                          value={
                            device.online
                              ? "Online"
                              : "Offline"
                          }
                        />
                        <Field
                          label="Matched vault device"
                          value={
                            device.matchedDevice
                              ?.deviceName ??
                            "None"
                          }
                        />
                        <Field
                          label="Fingerprint"
                          value={
                            device.localFingerprint
                          }
                        />
                      </dl>
                    </div>

                    {canEdit &&
                    device.matchStatus !==
                      "ignored" ? (
                      <div className="flex w-full flex-col gap-3 lg:w-80">
                        {device.matchStatus ===
                          "possible_match" ||
                        device.matchStatus ===
                          "matched" ? (
                          <label className="text-sm text-text-secondary">
                            Vault device
                            <select
                              className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-text-primary"
                              value={
                                selectedVaultDeviceId
                              }
                              onChange={(
                                event
                              ) =>
                                setSelectedDeviceByDiscoveryId(
                                  (
                                    current
                                  ) => ({
                                    ...current,
                                    [device.id]:
                                      event
                                        .target
                                        .value,
                                  })
                                )
                              }
                            >
                              <option value="">
                                Select a vault device
                              </option>
                              {vaultDevices.map(
                                (vaultDevice) => (
                                  <option
                                    key={
                                      vaultDevice.id
                                    }
                                    value={
                                      vaultDevice.id
                                    }
                                  >
                                    {vaultDevice.device_name ??
                                      "Unnamed device"}
                                  </option>
                                )
                              )}
                            </select>
                          </label>
                        ) : null}

                        <div className="flex flex-wrap gap-2">
                          {device.matchStatus ===
                            "possible_match" ||
                          device.matchStatus ===
                            "matched" ? (
                            <Button
                              type="button"
                              disabled={
                                isBusy ||
                                !selectedVaultDeviceId
                              }
                              onClick={() =>
                                void confirmMatch(
                                  device,
                                  selectedVaultDeviceId
                                )
                              }
                            >
                              {isBusy ? (
                                <Loader2
                                  className="animate-spin"
                                  size={16}
                                />
                              ) : (
                                <CheckCircle2
                                  size={16}
                                />
                              )}
                              Confirm Match
                            </Button>
                          ) : null}

                          {device.matchStatus ===
                            "unmatched" ||
                          device.matchStatus ===
                            "possible_match" ? (
                            <Button
                              type="button"
                              variant="secondary"
                              disabled={isBusy}
                              onClick={() =>
                                void importDiscovery(
                                  device
                                )
                              }
                            >
                              {isBusy ? (
                                <Loader2
                                  className="animate-spin"
                                  size={16}
                                />
                              ) : (
                                <Plus size={16} />
                              )}
                              Import as New
                            </Button>
                          ) : null}

                          {device.matchStatus ===
                            "possible_match" ? (
                            <Button
                              type="button"
                              variant="secondary"
                              disabled={isBusy}
                              onClick={() =>
                                void treatAsNewDevice(
                                  device
                                )
                              }
                            >
                              Treat as New Device
                            </Button>
                          ) : null}

                          <Button
                            type="button"
                            variant="secondary"
                            disabled={isBusy}
                            onClick={() =>
                              void ignoreDiscovery(
                                device
                              )
                            }
                          >
                            {isBusy ? (
                              <Loader2
                                className="animate-spin"
                                size={16}
                              />
                            ) : (
                              <XCircle size={16} />
                            )}
                            Ignore
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </PageCard>
        </>
      )}
    </PageShell>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <PageCard>
      <p className="text-sm text-text-secondary">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold text-text-primary">
        {value}
      </p>
    </PageCard>
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
      <dt className="text-xs uppercase tracking-wide text-text-secondary">
        {label}
      </dt>
      <dd className="mt-1 break-all text-text-primary">
        {value?.trim() ? value : "—"}
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
      ? "Matched"
      : status === "possible_match"
        ? "Possible match"
        : status === "unmatched"
          ? "New"
          : "Ignored";

  const className =
    status === "matched"
      ? "bg-emerald-100 text-emerald-800"
      : status === "possible_match"
        ? "bg-amber-100 text-amber-900"
        : status === "unmatched"
          ? "bg-sky-100 text-sky-900"
          : "bg-neutral-100 text-text-secondary";

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}

export default function NetworkDiscoveryReviewPage() {
  return (
    <FeatureGate
      feature="networkDiscover"
      description="Review connector discovery results and enrich existing vault devices without creating duplicates."
    >
      <DiscoveryReviewContent />
    </FeatureGate>
  );
}
