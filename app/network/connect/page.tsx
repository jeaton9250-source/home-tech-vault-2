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
  Loader2,
  ShieldAlert,
  Trash2,
} from "lucide-react";

import ConnectorDownloadButton from "@/components/connector/ConnectorDownloadButton";
import ConnectorMultiList from "@/components/connector/ConnectorMultiList";
import ConnectorPlatformList from "@/components/connector/ConnectorPlatformList";
import ConnectorUpgradePrompt from "@/components/connector/ConnectorUpgradePrompt";
import InstallationGuideDialog from "@/components/connector/InstallationGuideDialog";
import ReleaseNotesModal from "@/components/connector/ReleaseNotesModal";
import { useDemoReadOnlyAction } from "@/components/demo/DemoExperienceProvider";
import { usePermissions } from "@/hooks/usePermissions";
import {
  canPairAnotherConnector,
  connectorLimitLabel,
} from "@/lib/connector/access";
import { getConnectorMacosReleaseLabel } from "@/lib/connector/release";
import { CONNECTOR_INSTALLATION_STEPS } from "@/lib/connector/installationGuide";

import PageShell from "@/components/ui/PageShell";
import PageHero from "@/components/ui/PageHero";
import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";

import type {
  ConnectorInstallationSummary,
  PairInitResponse,
} from "@/lib/connector/types";

const macosRelease = getConnectorMacosReleaseLabel();

function formatRemainingTime(
  expiresAt: string | null,
  now = Date.now()
): string {
  if (!expiresAt) {
    return "";
  }

  const remaining = new Date(expiresAt).getTime() - now;

  if (remaining <= 0) {
    return "Expired";
  }

  const minutes = Math.floor(remaining / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

  return (
    String(minutes).padStart(2, "0") +
    ":" +
    String(seconds).padStart(2, "0")
  );
}

export default function NetworkConnectPage() {
  const {
    user,
    isDemo,
    householdId,
    isAdmin,
    isViewer,
    plan,
    isPlatformAdmin,
    canViewFeature,
    loading: permissionsLoading,
  } = usePermissions();

  const showReadOnlyModal = useDemoReadOnlyAction();
  const monitoringEnabled = canViewFeature("connectorMonitoring");

  const [connectors, setConnectors] = useState<
    ConnectorInstallationSummary[]
  >([]);
  const [loadingConnectors, setLoadingConnectors] =
    useState(true);
  const [pairingCode, setPairingCode] = useState<string | null>(
    null
  );
  const [pairingExpiresAt, setPairingExpiresAt] = useState<
    string | null
  >(null);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [countdownNow, setCountdownNow] = useState(() => Date.now());
  const [guideOpen, setGuideOpen] = useState(false);
  const [releaseNotesOpen, setReleaseNotesOpen] = useState(false);

  const canManageConnector =
    !isDemo && isAdmin && Boolean(householdId);
  const canViewConnectors =
    Boolean(householdId) && (!isDemo || Boolean(user));

  const activeConnectors = connectors.filter(
    (connector) => connector.status !== "revoked"
  );

  const canPairMore = canPairAnotherConnector({
    plan,
    isPlatformAdmin,
    activeConnectorCount: activeConnectors.length,
  });

  const remainingLabel = useMemo(() => {
    return formatRemainingTime(pairingExpiresAt, countdownNow);
  }, [pairingExpiresAt, countdownNow]);

  const reloadConnectors = useCallback(async () => {
    if (!householdId || isDemo) {
      setConnectors([]);
      return;
    }

    const response = await fetch(
      "/api/connector/pair/status?householdId=" +
        encodeURIComponent(householdId),
      { cache: "no-store" }
    );

    const payload = (await response.json()) as {
      connectors?: ConnectorInstallationSummary[];
      error?: string;
    };

    if (!response.ok) {
      throw new Error(
        payload.error ?? "Unable to load connector status."
      );
    }

    setConnectors(payload.connectors ?? []);
  }, [householdId, isDemo]);

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
        await reloadConnectors();
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
  }, [permissionsLoading, householdId, isDemo, reloadConnectors]);

  useEffect(() => {
    if (!canViewConnectors || permissionsLoading) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void reloadConnectors().catch(() => undefined);
    }, 30_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [canViewConnectors, permissionsLoading, reloadConnectors]);

  useEffect(() => {
    if (!pairingExpiresAt) {
      return;
    }

    const intervalId = window.setInterval(() => {
      const now = Date.now();
      setCountdownNow(now);

      if (
        pairingExpiresAt &&
        new Date(pairingExpiresAt).getTime() <= now
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
      setErrorMessage("Household Admin permission required.");
      return;
    }

    if (!canPairMore) {
      setErrorMessage(
        `${connectorLimitLabel(plan)}. Remove a connector or upgrade to pair another Mac.`
      );
      return;
    }

    try {
      setGeneratingCode(true);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch("/api/connector/pair/init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ householdId }),
      });

      const payload = (await response.json()) as PairInitResponse & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          payload.error ?? "Unable to generate a pairing code."
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

  async function handleRevoke(connectorId: string) {
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

      const response = await fetch("/api/connector/pair/revoke", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          householdId,
          connectorId,
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to revoke connector.");
      }

      setSuccessMessage(
        "Connector removed. It can no longer authenticate."
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
            <Loader2 className="animate-spin" size={22} />
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
        title="Home Tech Vault Connector"
        description="Download, pair, and manage connectors for your household. Manual discovery is included on Free; automatic monitoring requires Pro."
      >
        <div className="flex flex-wrap gap-3">
          <ConnectorDownloadButton />
          <Button
            type="button"
            variant="secondary"
            onClick={() => setGuideOpen(true)}
          >
            View Installation Guide
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setReleaseNotesOpen(true)}
          >
            What&apos;s New
          </Button>
        </div>
      </PageHero>

      {!monitoringEnabled ? (
        <section className="mt-8">
          <ConnectorUpgradePrompt />
        </section>
      ) : null}

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {CONNECTOR_INSTALLATION_STEPS.slice(0, 4).map((step, index) => (
          <PageCard key={step.id} className="p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-sm font-semibold text-charcoal">
              {index + 1}
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
                Connectors are linked to a household. Create or join a household
                from Family before pairing.
              </p>
              <div className="mt-4">
                <Button href="/family">Go to Family</Button>
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
          <p className="text-overline text-section-network">Pairing</p>
          <h2 className="mt-2 text-2xl font-semibold text-text-primary">
            Generate pairing code
          </h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {connectorLimitLabel(plan)}. Household Admins can create a one-time
            code for the connector app.
          </p>

          {canManageConnector ? (
            <div className="mt-7 space-y-5">
              <Button
                onClick={() => void handleGenerateCode()}
                loading={generatingCode}
                loadingLabel="Generating..."
                disabled={!canPairMore}
              >
                Generate Pairing Code
              </Button>

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
                </div>
              ) : (
                <div className="rounded-[24px] border border-dashed border-border-subtle bg-white p-6 text-sm leading-6 text-text-secondary">
                  No active pairing code. Generate one when you are ready to
                  link a connector.
                </div>
              )}
            </div>
          ) : (
            <div className="mt-7 rounded-[24px] border border-border-subtle bg-surface-sunken p-6 text-sm leading-6 text-text-secondary">
              Household Admin permission required.
              {isViewer || !isAdmin
                ? " You can still view connector status below."
                : ""}
            </div>
          )}
        </PageCard>

        <PageCard className="p-7">
          <p className="text-overline text-section-network">Download</p>
          <h2 className="mt-2 text-2xl font-semibold text-text-primary">
            Home Tech Vault Connector
          </h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Version {macosRelease.version} · Manual scans, discovery, matching,
            and import are included on Free.
          </p>
          <div className="mt-5">
            <ConnectorDownloadButton />
          </div>
          <div className="mt-6">
            <ConnectorPlatformList />
          </div>
        </PageCard>
      </section>

      {canViewConnectors ? (
        <PageCard className="mt-8 p-7">
          <p className="text-overline text-section-network">Installations</p>
          <h2 className="mt-2 text-2xl font-semibold text-text-primary">
            Active connectors
          </h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {connectorLimitLabel(plan)}. Automatic monitoring requires Pro.
          </p>

          {loadingConnectors ? (
            <div className="mt-8 flex items-center gap-3 text-sm text-text-secondary">
              <Loader2 className="animate-spin" size={18} />
              Loading connectors...
            </div>
          ) : (
            <div className="mt-8 space-y-3">
              <ConnectorMultiList connectors={connectors} />
              {activeConnectors.map((connector) =>
                canManageConnector &&
                connector.status !== "revoked" ? (
                  <div key={`actions-${connector.id}`} className="flex justify-end">
                    <Button
                      variant="danger"
                      size="sm"
                      loading={revokingId === connector.id}
                      loadingLabel="Removing..."
                      onClick={() => void handleRevoke(connector.id)}
                    >
                      <Trash2 size={16} />
                      Remove {connector.name}
                    </Button>
                  </div>
                ) : null
              )}
            </div>
          )}
        </PageCard>
      ) : null}

      <PageCard className="mt-8 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              Review connector discovery
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
              After a connector scan syncs devices, review matches, import new
              devices, or ignore network noise.
            </p>
          </div>
          <Button href="/network/discovery" variant="secondary">
            Open discovery review
          </Button>
        </div>
      </PageCard>

      <InstallationGuideDialog
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
      />
      <ReleaseNotesModal
        open={releaseNotesOpen}
        onClose={() => setReleaseNotesOpen(false)}
      />
    </PageShell>
  );
}
