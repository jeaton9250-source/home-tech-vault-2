"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

import NetworkDiscoveryDashboard from "@/components/network/NetworkDiscoveryDashboard";
import PageShell from "@/components/ui/PageShell";
import PageHero from "@/components/ui/PageHero";
import Button from "@/components/ui/Button";

import DemoConnectorExplorationBanner from "@/components/demo/DemoConnectorExplorationBanner";
import { useDemoReadOnlyAction } from "@/components/demo/DemoExperienceProvider";
import { usePermissions } from "@/hooks/usePermissions";
import { supabase } from "@/lib/supabase";
import { applyHouseholdScope } from "@/lib/data/householdScope";

import {
  buildDemoDiscoveryReviewConnectors,
  buildDemoNetworkPagePayload,
  buildDemoVaultDeviceOptions,
} from "@/lib/demo/demoConnectorExperience";

import type {
  DiscoveredDeviceSummary,
  DiscoveryStatsSummary,
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

function DiscoveryReviewContent() {
  const {
    user,
    isDemo,
    householdId,
    canEdit,
    loading: permissionsLoading,
  } = usePermissions();

  const showReadOnlyModal = useDemoReadOnlyAction();

  const [devices, setDevices] = useState<
    DiscoveredDeviceSummary[]
  >([]);
  const [stats, setStats] =
    useState<DiscoveryStatsSummary | null>(null);
  const [connectors, setConnectors] = useState<
    ConnectorSummary[]
  >([]);
  const [vaultDevices, setVaultDevices] =
    useState<VaultDeviceOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [errorMessage, setErrorMessage] =
    useState("");
  const [busyId, setBusyId] = useState<
    string | null
  >(null);

  const reloadReviewData = useCallback(
    async (showSpinner = true) => {
      if (isDemo || !user) {
        if (showSpinner) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setErrorMessage("");

        const payload = buildDemoNetworkPagePayload();

        setDevices(payload.devices);
        setStats(payload.stats);
        setConnectors(buildDemoDiscoveryReviewConnectors());
        setVaultDevices(buildDemoVaultDeviceOptions());
        setLoading(false);
        setRefreshing(false);
        return;
      }

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
                "id, device_name, category, manufacturer, model_number, mac_address, location"
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
            connectorPayload.connectors ?? []
          );
        }

        const payload =
          (await discoveryResponse.json()) as {
            devices: DiscoveredDeviceSummary[];
            stats?: DiscoveryStatsSummary;
          };

        setDevices(payload.devices ?? []);
        setStats(payload.stats ?? null);
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
    [householdId, isDemo, user]
  );

  const demoReviewData = useMemo(() => {
    if (!isDemo && user) {
      return null;
    }

    const payload = buildDemoNetworkPagePayload();

    return {
      devices: payload.devices,
      stats: payload.stats,
      connectors: buildDemoDiscoveryReviewConnectors(),
      vaultDevices: buildDemoVaultDeviceOptions(),
    };
  }, [isDemo, user]);

  useEffect(() => {
    if (permissionsLoading) {
      return;
    }

    if (demoReviewData) {
      return;
    }

    void reloadReviewData();
  }, [demoReviewData, permissionsLoading, reloadReviewData]);

  async function runAction(
    discoveryId: string,
    action: () => Promise<Response>
  ) {
    if (isDemo || !canEdit) {
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
            `This looks like a device already in your vault. ${payload.duplicateWarnings
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

  if ((loading || permissionsLoading) && !demoReviewData) {
    return (
      <PageShell>
        <div className="flex min-h-72 items-center justify-center rounded-3xl border border-neutral-200 bg-white">
          <div className="flex items-center gap-3 text-text-secondary">
            <Loader2 className="animate-spin" size={22} />
            Loading network discovery...
          </div>
        </div>
      </PageShell>
    );
  }

  const reviewDevices = demoReviewData?.devices ?? devices;
  const reviewStats = demoReviewData?.stats ?? stats;
  const reviewConnectors = demoReviewData?.connectors ?? connectors;
  const reviewVaultDevices = demoReviewData?.vaultDevices ?? vaultDevices;

  return (
    <PageShell>
      {isDemo ? (
        <div className="mb-6">
          <DemoConnectorExplorationBanner />
        </div>
      ) : null}

      <PageHero
        section="network"
        eyebrow="Network discovery"
        title="Identify devices on your home network."
        description="Match discovered devices to your vault, enrich existing records, and import new ones without creating duplicates."
      >
        <div className="flex flex-wrap gap-3">
          <Link
            href="/network/connect"
            className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-text-primary transition hover:border-neutral-300"
          >
            <ArrowLeft size={16} />
            Connector setup
          </Link>
          <Link href="/network">
            <Button type="button" variant="secondary">
              Back to network
            </Button>
          </Link>
        </div>
      </PageHero>

      <NetworkDiscoveryDashboard
        devices={reviewDevices}
        stats={reviewStats}
        connectors={reviewConnectors}
        vaultDevices={reviewVaultDevices}
        canEdit={isDemo || canEdit}
        refreshing={refreshing}
        errorMessage={errorMessage}
        busyId={busyId}
        onRefresh={() => {
          if (isDemo) {
            showReadOnlyModal();
            return;
          }

          void reloadReviewData(false);
        }}
        onConfirmMatch={(discovery, vaultDeviceId) => {
          if (!householdId) {
            return;
          }

          void runAction(discovery.id, () =>
            fetch(
              `/api/connector/discovery/${discovery.id}/confirm`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  householdId,
                  vaultDeviceId,
                }),
              }
            )
          );
        }}
        onIgnore={(discovery) => {
          if (!householdId) {
            return;
          }

          void runAction(discovery.id, () =>
            fetch(
              `/api/connector/discovery/${discovery.id}/ignore`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ householdId }),
              }
            )
          );
        }}
        onImport={(discovery, force = false) => {
          if (!householdId) {
            return;
          }

          void runAction(discovery.id, () =>
            fetch(
              `/api/connector/discovery/${discovery.id}/import`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  householdId,
                  force,
                }),
              }
            )
          );
        }}
        onTreatAsNew={(discovery) => {
          if (!householdId) {
            return;
          }

          void runAction(discovery.id, () =>
            fetch(
              `/api/connector/discovery/${discovery.id}/confirm`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
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
        }}
      />
    </PageShell>
  );
}

export default function NetworkDiscoveryReviewPage() {
  return <DiscoveryReviewContent />;
}
