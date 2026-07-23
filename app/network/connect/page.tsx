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
  Clock3,
  Download,
  Loader2,
  MonitorSmartphone,
  PlugZap,
  Radar,
  ShieldAlert,
  Trash2,
} from "lucide-react";

import { useDemoReadOnlyAction } from "@/components/demo/DemoExperienceProvider";
import { usePermissions } from "@/hooks/usePermissions";

import PageShell from "@/components/ui/PageShell";
import PageHero from "@/components/ui/PageHero";
import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";

import {
  getConnectorMacosReleaseLabel,
  getConnectorMacosDownloadUrl,
} from "@/lib/connector/release";
import {
  connectorPresenceDescription,
  connectorPresenceLabel,
  deriveConnectorPresence,
} from "@/lib/connector/presence";

import type {
  ConnectorInstallationSummary,
  PairInitResponse,
} from "@/lib/connector/types";

import type { ConnectorPresence } from "@/lib/connector/presence";

const macosRelease = getConnectorMacosReleaseLabel();
const macosDownloadUrl = getConnectorMacosDownloadUrl();

const STEPS = [
  {
    number: 1,
    title: "Download the connector",
    description:
      "Install the Home Tech Vault Connector for macOS on a computer that stays on your home network.",
    badge:
      macosRelease.status === "available"
        ? null
        : "Beta build preparing",
  },
  {
    number: 2,
    title: "Pair it with this household",
    description:
      "Generate a pairing code here, then enter it in the connector app to link securely.",
    badge: null,
  },
  {
    number: 3,
    title: "Scan the local network",
    description:
      "The connector submits discovered devices from your LAN. Matching and enrichment run automatically for reliable matches.",
    badge: null,
  },
  {
    number: 4,
    title: "Review devices before importing",
    description:
      "Review matched, possible, new, and ignored devices before confirming imports or enriching your vault.",
    badge: null,
  },
] as const;

function formatRemainingTime(
  expiresAt: string | null,
  now = Date.now()
): string {
  if (!expiresAt) {
    return "";
  }

  const remaining =
    new Date(expiresAt).getTime() - now;

  if (remaining <= 0) {
    return "Expired";
  }

  const minutes = Math.floor(
    remaining / (1000 * 60)
  );
  const seconds = Math.floor(
    (remaining % (1000 * 60)) / 1000
  );

  return (
    String(minutes).padStart(2, "0") +
    ":" +
    String(seconds).padStart(2, "0")
  );
}

function formatStatusLabel(
  connector: ConnectorInstallationSummary
) {
  return connectorPresenceLabel(
    deriveConnectorPresence(
      connector.status,
      connector.lastSeenAt
    )
  );
}

function statusTone(presence: ConnectorPresence) {
  if (presence === "online") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (presence === "recently_seen") {
    return "bg-sky-50 text-sky-700";
  }

  if (presence === "revoked") {
    return "bg-neutral-100 text-text-secondary";
  }

  if (presence === "pending") {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-neutral-100 text-neutral-700";
}

export default function NetworkConnectPage() {
  const {
    user,
    isDemo,
    householdId,
    isAdmin,
    isViewer,
    loading: permissionsLoading,
  } = usePermissions();

  const showReadOnlyModal =
    useDemoReadOnlyAction();

  const [connectors, setConnectors] =
    useState<
      ConnectorInstallationSummary[]
    >([]);

  const [loadingConnectors, setLoadingConnectors] =
    useState(true);

  const [pairingCode, setPairingCode] =
    useState<string | null>(null);

  const [pairingExpiresAt, setPairingExpiresAt] =
    useState<string | null>(null);

  const [generatingCode, setGeneratingCode] =
    useState(false);

  const [revokingId, setRevokingId] =
    useState<string | null>(null);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [countdownNow, setCountdownNow] =
    useState(() => Date.now());

  const canManageConnector =
    !isDemo && isAdmin && Boolean(householdId);

  const canViewConnectors =
    Boolean(householdId) &&
    (!isDemo || Boolean(user));

  const remainingLabel = useMemo(() => {
    return formatRemainingTime(
      pairingExpiresAt,
      countdownNow
    );
  }, [pairingExpiresAt, countdownNow]);

  useEffect(() => {
    let mounted = true;

    async function loadConnectorStatus() {
      if (!householdId || isDemo) {
        if (!mounted) {
          return;
        }

        setConnectors([]);
        setLoadingConnectors(false);
        return;
      }

      try {
        setLoadingConnectors(true);
        setErrorMessage("");

        const response = await fetch(
          "/api/connector/pair/status?householdId=" +
            encodeURIComponent(householdId),
          {
            cache: "no-store",
          }
        );

        const payload =
          (await response.json()) as {
            connectors?: ConnectorInstallationSummary[];
            error?: string;
          };

        if (!response.ok) {
          throw new Error(
            payload.error ??
              "Unable to load connector status."
          );
        }

        if (!mounted) {
          return;
        }

        setConnectors(
          payload.connectors ?? []
        );
      } catch (error: unknown) {
        if (!mounted) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load connector status."
        );
      } finally {
        if (mounted) {
          setLoadingConnectors(false);
        }
      }
    }

    if (permissionsLoading) {
      return () => {
        mounted = false;
      };
    }

    void loadConnectorStatus();

    return () => {
      mounted = false;
    };
  }, [
    permissionsLoading,
    householdId,
    isDemo,
  ]);

  const reloadConnectors =
    useCallback(async () => {
      if (!householdId || isDemo) {
        setConnectors([]);
        return;
      }

      const response = await fetch(
        "/api/connector/pair/status?householdId=" +
          encodeURIComponent(householdId),
        {
          cache: "no-store",
        }
      );

      const payload =
        (await response.json()) as {
          connectors?: ConnectorInstallationSummary[];
          error?: string;
        };

      if (!response.ok) {
        throw new Error(
          payload.error ??
            "Unable to load connector status."
        );
      }

      setConnectors(payload.connectors ?? []);
    }, [householdId, isDemo]);

  useEffect(() => {
    if (!canViewConnectors || permissionsLoading) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void reloadConnectors().catch(() => {
        // Keep the last known connector list during transient refresh failures.
      });
    }, 30_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [
    canViewConnectors,
    permissionsLoading,
    reloadConnectors,
  ]);

  useEffect(() => {
    if (!pairingExpiresAt) {
      return;
    }

    const intervalId = window.setInterval(() => {
      const now = Date.now();

      setCountdownNow(now);

      if (
        pairingExpiresAt &&
        new Date(pairingExpiresAt).getTime() <=
          now
      ) {
        setPairingCode(null);
        setPairingExpiresAt(null);
      }
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [pairingExpiresAt]);

  async function handleGenerateCode() {
    if (
      showReadOnlyModal({
        preventDefault: () => undefined,
      })
    ) {
      return;
    }

    if (!householdId) {
      setErrorMessage(
        "Join or create a household before pairing a connector."
      );
      return;
    }

    if (!canManageConnector) {
      setErrorMessage(
        "Household Admin permission required."
      );
      return;
    }

    try {
      setGeneratingCode(true);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch(
        "/api/connector/pair/init",
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
      );

      const payload =
        (await response.json()) as PairInitResponse & {
          error?: string;
        };

      if (!response.ok) {
        throw new Error(
          payload.error ??
            "Unable to generate a pairing code."
        );
      }

      setPairingCode(payload.code);
      setPairingExpiresAt(payload.expiresAt);
      setSuccessMessage(
        "Pairing code generated. Enter it in the connector within 10 minutes."
      );
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to generate a pairing code."
      );
    } finally {
      setGeneratingCode(false);
    }
  }

  async function handleRevoke(
    connectorId: string
  ) {
    if (
      showReadOnlyModal({
        preventDefault: () => undefined,
      })
    ) {
      return;
    }

    if (!householdId || !canManageConnector) {
      return;
    }

    try {
      setRevokingId(connectorId);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch(
        "/api/connector/pair/revoke",
        {
          method: "DELETE",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            householdId,
            connectorId,
          }),
        }
      );

      const payload =
        (await response.json()) as {
          error?: string;
        };

      if (!response.ok) {
        throw new Error(
          payload.error ??
            "Unable to revoke connector."
        );
      }

      setSuccessMessage(
        "Connector revoked. It can no longer authenticate."
      );

      await reloadConnectors();
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to revoke connector."
      );
    } finally {
      setRevokingId(null);
    }
  }

  if (permissionsLoading) {
    return (
      <PageShell>
        <div className="flex min-h-72 items-center justify-center rounded-3xl border border-neutral-200 bg-white">
          <div className="flex items-center gap-3 text-text-secondary">
            <Loader2
              className="animate-spin"
              size={22}
            />
            Loading connector setup...
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mb-6">
        <Link
          href="/network"
          className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary transition hover:text-text-primary"
        >
          <ArrowLeft size={16} />
          Back to Network
        </Link>
      </div>

      <PageHero
        section="network"
        eyebrow="Connector setup"
        title="Connect Your Home Network"
        description="Pair a secure Home Tech Vault Connector with this household."
      />

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {STEPS.map((step) => (
          <PageCard
            key={step.number}
            className="p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-sm font-semibold text-charcoal">
                {step.number}
              </div>

              {step.badge ? (
                <span className="rounded-full bg-surface-sunken px-3 py-1 text-xs font-semibold text-text-secondary">
                  {step.badge}
                </span>
              ) : null}
            </div>

            <h2 className="mt-5 text-lg font-semibold text-text-primary">
              {step.title}
            </h2>

            <p className="mt-2 text-sm leading-6 text-text-secondary">
              {step.description}
            </p>
          </PageCard>
        ))}
      </section>

      {!householdId && !isDemo ? (
        <PageCard className="mt-8 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
              <ShieldAlert size={20} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                Household required
              </h2>

              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Connectors are linked to a
                household. Create or join a
                household from Family before
                pairing.
              </p>

              <div className="mt-4">
                <Button href="/family">
                  Go to Family
                </Button>
              </div>
            </div>
          </div>
        </PageCard>
      ) : null}

      {errorMessage ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {successMessage ? (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {successMessage}
        </div>
      ) : null}

      <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <PageCard className="p-7">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-charcoal">
              <PlugZap size={20} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-overline text-section-network">
                Pairing
              </p>

              <h2 className="mt-2 text-2xl font-semibold text-text-primary">
                Generate pairing code
              </h2>

              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Household Admins can create a
                one-time code for the macOS
                connector app.
              </p>
            </div>
          </div>

          {canManageConnector ? (
            <div className="mt-7 space-y-5">
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() =>
                    void handleGenerateCode()
                  }
                  loading={generatingCode}
                  loadingLabel="Generating..."
                >
                  Generate Pairing Code
                </Button>

                {pairingCode ? (
                  <Button
                    variant="secondary"
                    onClick={() =>
                      void handleGenerateCode()
                    }
                    loading={generatingCode}
                    loadingLabel="Generating..."
                  >
                    Generate New Code
                  </Button>
                ) : null}
              </div>

              {pairingCode ? (
                <div className="rounded-[24px] border border-border-subtle bg-surface-sunken p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-tertiary">
                    Pairing code
                  </p>

                  <p className="mt-3 font-mono text-3xl font-semibold tracking-[0.2em] text-text-primary sm:text-4xl">
                    {pairingCode}
                  </p>

                  <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-text-secondary">
                    <Clock3 size={16} />
                    Expires in {remainingLabel}
                  </div>

                  <p className="mt-4 text-sm leading-6 text-text-secondary">
                    Enter this code in the
                    Home Tech Vault Connector
                    app for macOS.
                  </p>
                </div>
              ) : (
                <div className="rounded-[24px] border border-dashed border-border-subtle bg-white p-6 text-sm leading-6 text-text-secondary">
                  No active pairing code.
                  Generate one when you are
                  ready to link a connector.
                </div>
              )}
            </div>
          ) : (
            <div className="mt-7 rounded-[24px] border border-border-subtle bg-surface-sunken p-6">
              <div className="flex items-start gap-3">
                <ShieldAlert
                  className="mt-0.5 shrink-0 text-amber-700"
                  size={18}
                />

                <div>
                  <p className="font-semibold text-text-primary">
                    Household Admin permission
                    required
                  </p>

                  <p className="mt-2 text-sm leading-6 text-text-secondary">
                    Only a household Admin can
                    pair or revoke a connector.
                    {isViewer || !isAdmin
                      ? " You can still view existing connector status below."
                      : ""}
                  </p>
                </div>
              </div>
            </div>
          )}
        </PageCard>

        <PageCard className="p-7">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-charcoal">
              <Download size={20} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-overline text-section-network">
                Download
              </p>

              <h2 className="mt-2 text-2xl font-semibold text-text-primary">
                Home Tech Vault Connector for macOS
              </h2>

              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Version {macosRelease.version} ·{" "}
                {macosRelease.platform} · Pairing and
                heartbeat supported in Phase 2A. Network
                scanning arrives in Phase 2B.
              </p>

              {macosDownloadUrl ? (
                <div className="mt-5">
                  <Button
                    href={macosDownloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download for macOS
                  </Button>
                </div>
              ) : (
                <span className="mt-4 inline-flex rounded-full bg-surface-sunken px-3 py-1 text-xs font-semibold text-text-secondary">
                  macOS beta build is being prepared
                </span>
              )}

              <ol className="mt-5 list-decimal space-y-2 pl-5 text-sm leading-6 text-text-secondary">
                <li>Download and open the connector app.</li>
                <li>Generate a pairing code below.</li>
                <li>Enter the code in the connector app.</li>
                <li>
                  Confirm the connector shows Connected after
                  its first heartbeat.
                </li>
              </ol>
            </div>
          </div>
        </PageCard>
      </section>

      {canViewConnectors ? (
        <PageCard className="mt-8 p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-overline text-section-network">
                Installations
              </p>

              <h2 className="mt-2 text-2xl font-semibold text-text-primary">
                Active connectors
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
                Paired connectors for this household.
                Last seen updates when the connector sends
                a heartbeat.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 text-sm text-text-secondary">
              <MonitorSmartphone size={16} />
              {connectors.length} total
            </div>
          </div>

          {loadingConnectors ? (
            <div className="mt-8 flex items-center gap-3 text-sm text-text-secondary">
              <Loader2
                className="animate-spin"
                size={18}
              />
              Loading connectors...
            </div>
          ) : connectors.length === 0 ? (
            <div className="mt-8 rounded-[24px] border border-dashed border-border-subtle bg-surface-sunken p-6 text-sm leading-6 text-text-secondary">
              No connectors paired yet.
              Generate a pairing code when the
              connector app is available.
            </div>
          ) : (
            <div className="mt-8 space-y-3">
              {connectors.map((connector) => {
                const presence =
                  deriveConnectorPresence(
                    connector.status,
                    connector.lastSeenAt
                  );

                return (
                <div
                  key={connector.id}
                  className="flex flex-col gap-4 rounded-[24px] border border-border-subtle p-5 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="truncate text-lg font-semibold text-text-primary">
                        {connector.name}
                      </p>

                      <span
                        className={
                          "rounded-full px-3 py-1 text-xs font-semibold " +
                          statusTone(presence)
                        }
                        title={connectorPresenceDescription(
                          presence
                        )}
                      >
                        {formatStatusLabel(
                          connector
                        )}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-text-secondary">
                      {connector.platform
                        ? connector.platform
                        : "Platform not set"}
                      {connector.appVersion
                        ? " · v" +
                          connector.appVersion
                        : ""}
                    </p>

                    <p className="mt-1 text-xs text-text-tertiary">
                      Added{" "}
                      {new Date(
                        connector.createdAt
                      ).toLocaleString()}
                      {connector.lastSeenAt
                        ? ` · Last seen ${new Date(connector.lastSeenAt).toLocaleString()}`
                        : " · No heartbeat yet"}
                    </p>
                  </div>

                  {canManageConnector &&
                  connector.status !==
                    "revoked" ? (
                    <Button
                      variant="danger"
                      size="sm"
                      loading={
                        revokingId ===
                        connector.id
                      }
                      loadingLabel="Revoking..."
                      onClick={() =>
                        void handleRevoke(
                          connector.id
                        )
                      }
                    >
                      <Trash2 size={16} />
                      Revoke
                    </Button>
                  ) : null}
                </div>
              );
              })}
            </div>
          )}
        </PageCard>
      ) : null}

      <PageCard className="mt-8 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-charcoal">
              <Radar size={20} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                Review connector discovery
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
                After a connector scan syncs devices, review
                automatic matches, confirm possible matches,
                import new devices, or ignore network noise.
              </p>
            </div>
          </div>

          <Link
            href="/network/discovery"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-text-primary transition hover:border-neutral-300"
          >
            <Radar size={16} />
            Open discovery review
          </Link>
        </div>
      </PageCard>
    </PageShell>
  );
}
