"use client";

import {
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  Apple,
  BookOpen,
  ChevronDown,
  FileText,
  Monitor,
  RefreshCw,
  Sparkles,
  Trash2,
} from "lucide-react";

import Button from "@/components/ui/Button";
import PageCard from "@/components/ui/PageCard";
import ConnectorDownloadActions from "@/components/connector/ConnectorDownloadActions";
import ConnectorMonitoringBadge from "@/components/connector/ConnectorMonitoringBadge";
import InstallationGuideDialog, {
  type ConnectorGuidePlatform,
} from "@/components/connector/InstallationGuideDialog";
import ReleaseNotesModal from "@/components/connector/ReleaseNotesModal";
import ConnectorUpgradePrompt from "@/components/connector/ConnectorUpgradePrompt";
import DemoSmartConnectorCard from "@/components/demo/DemoSmartConnectorCard";
import HomeAssistantLiveStates from "@/components/network/HomeAssistantLiveStates";
import { useDemoReadOnlyAction } from "@/components/demo/DemoExperienceProvider";

import {
  describeConnectorPlatform,
  describeConnectorStatus,
} from "@/hooks/useConnectorOverview";

import {
  formatConnectorRelativeTime,
  formatConnectorTimestamp,
} from "@/lib/connector/scanHistory";

import {
  formatPlatformLabel,
} from "@/lib/connector/platforms";

import type {
  NetworkPageData,
} from "@/hooks/useNetworkPageData";

import type {
  ConnectorInstallationSummary,
} from "@/lib/connector/types";

type NetworkConnectorTabProps = {
  data: NetworkPageData;
  householdName: string | null;
  planLabel: string;
  canManage: boolean;
  canControl: boolean;
  isDemo: boolean;
  householdId: string | null;
  onRevoke: (
    connectorId: string
  ) => Promise<void>;
  revoking: boolean;
};

export default function NetworkConnectorTab({
  data,
  householdName,
  planLabel,
  canManage,
  canControl,
  isDemo,
  householdId,
  onRevoke,
  revoking,
}: NetworkConnectorTabProps) {
  const [
    guidePlatform,
    setGuidePlatform,
  ] =
    useState<ConnectorGuidePlatform>(
      "macos"
    );

  const [
    guideOpen,
    setGuideOpen,
  ] = useState(false);

  const [
    releaseNotesOpen,
    setReleaseNotesOpen,
  ] = useState(false);

  const [
    confirmRevokeId,
    setConfirmRevokeId,
  ] = useState<string | null>(null);

  const [
    showSmartHomeDevices,
    setShowSmartHomeDevices,
  ] = useState(false);

  const showReadOnlyModal =
    useDemoReadOnlyAction();

  const activeConnectors =
    useMemo(
      () =>
        data.connectors.filter(
          (connector) =>
            connector.status !==
            "revoked"
        ),
      [data.connectors]
    );

  function openGuide(
    platform: ConnectorGuidePlatform
  ) {
    setGuidePlatform(platform);
    setGuideOpen(true);
  }

  if (isDemo) {
    return <DemoSmartConnectorCard />;
  }

  if (!householdId) {
    return (
      <PageCard className="p-7 md:p-8">
        <h2 className="text-xl font-semibold text-text-primary">
          Join a household to pair a
          connector
        </h2>

        <p className="mt-3 text-sm leading-7 text-text-secondary">
          Connectors are linked to a
          household vault. Create or join a
          household from Family before
          installing the connector.
        </p>

        <div className="mt-6">
          <Button href="/family">
            Go to Family
          </Button>
        </div>
      </PageCard>
    );
  }

  if (!data.monitoringEnabled) {
    return (
      <PageCard className="p-7 md:p-8">
        <p className="text-overline text-section-network">
          Home Tech Vault Connector
        </p>

        <h2 className="mt-2 text-2xl font-semibold text-text-primary">
          Upgrade to use the connector
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-text-secondary">
          Home network discovery, Home
          Assistant syncing, and automatic
          monitoring are available with Home
          Tech Vault Pro or Family.
        </p>

        <div className="mt-6">
          <ConnectorUpgradePrompt />
        </div>
      </PageCard>
    );
  }

  if (
    activeConnectors.length === 0
  ) {
    return (
      <>
        <PageCard className="p-7 md:p-8">
          <p className="text-overline text-section-network">
            Home Tech Vault Connector
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-text-primary">
            Connect your home network
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-text-secondary">
            Install the connector on a
            computer that stays on your home
            network to discover devices,
            match them to your vault, and
            keep discovery results up to
            date.
          </p>

          <ul className="mt-5 space-y-2 text-sm text-text-secondary">
            <li>
              Manual network scanning
            </li>
            <li>
              Device discovery and matching
            </li>
            <li>
              Device import into your vault
            </li>
            <li>
              Home Assistant device syncing
            </li>
            <li>
              Automatic monitoring with Pro
              or Family
            </li>
          </ul>

          {canManage ? (
            <div className="mt-6 space-y-5">
              <div className="sm:max-w-sm">
                <ConnectorDownloadActions
                  layout="stack"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    openGuide("macos")
                  }
                >
                  <Apple size={16} />
                  macOS Installation Guide
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    openGuide("windows")
                  }
                >
                  <Monitor size={16} />
                  Windows Installation Guide
                </Button>
              </div>

              <div className="sm:max-w-sm">
                <Button
                  href="/network/connect"
                  className="w-full"
                >
                  Connect Your Home Network
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-[20px] border border-border-subtle bg-surface-sunken p-4">
              <p className="text-sm font-semibold text-text-primary">
                Administrator access
                required
              </p>

              <p className="mt-1 text-sm leading-6 text-text-secondary">
                A household owner or
                administrator must install
                and pair the connector.
                Household members can view
                synced network information
                after setup.
              </p>
            </div>
          )}
        </PageCard>

        <InstallationGuideDialog
          open={guideOpen}
          platform={guidePlatform}
          onClose={() =>
            setGuideOpen(false)
          }
        />
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <PageCard className="p-6 md:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-overline text-section-network">
                  Smart Home Integration
                </p>

                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Connected
                </span>
              </div>

              <h2 className="mt-2 text-xl font-semibold text-text-primary">
                Home Assistant
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
                Your Home Assistant devices are synced with this household.
                Open the device list only when you need to review status or
                control supported devices.
              </p>
            </div>

            <button
              type="button"
              disabled={
                data.homeAssistantEntities.length === 0
              }
              onClick={() => {
                setShowSmartHomeDevices(
                  (current) => !current
                );
              }}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border-subtle bg-surface-primary px-4 py-2.5 text-sm font-semibold text-text-primary transition hover:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-50"
              aria-expanded={
                showSmartHomeDevices
              }
            >
              {showSmartHomeDevices
                ? "Hide integrated devices"
                : "View integrated devices"}

              <ChevronDown
                size={17}
                className={
                  showSmartHomeDevices
                    ? "rotate-180 transition-transform"
                    : "transition-transform"
                }
              />
            </button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <SmartHomeSummaryItem
              label="Integrated devices"
              value={String(
                data.homeAssistantStats
                  ?.entityCount ??
                  data.homeAssistantEntities
                    .length
              )}
            />

            <SmartHomeSummaryItem
              label="Available now"
              value={String(
                data.homeAssistantStats
                  ?.availableCount ?? 0
              )}
            />

            <SmartHomeSummaryItem
              label="Device categories"
              value={String(
                data.homeAssistantStats
                  ?.domainCount ?? 0
              )}
            />
          </div>
        </PageCard>

        {showSmartHomeDevices ? (
          <HomeAssistantLiveStates
            entities={
              data.homeAssistantEntities
            }
            stats={
              data.homeAssistantStats
            }
            householdId={
              householdId
            }
            canControl={
              canControl
            }
            onRefresh={
              data.refresh
            }
          />
        ) : null}

        {activeConnectors.map(
          (connector) => (
            <ConnectorInstallationCard
              key={connector.id}
              connector={connector}
              householdName={
                householdName
              }
              planLabel={planLabel}
              monitoringEnabled={
                data.monitoringEnabled
              }
              updateMessage={
                data.updateCheck
                  ?.message ?? null
              }
              canManage={canManage}
              revoking={
                revoking &&
                confirmRevokeId ===
                  connector.id
              }
              confirmRevoke={
                confirmRevokeId ===
                connector.id
              }
              onRequestRevoke={() => {
                if (
                  showReadOnlyModal({
                    preventDefault:
                      () => undefined,
                  })
                ) {
                  return;
                }

                setConfirmRevokeId(
                  connector.id
                );
              }}
              onCancelRevoke={() =>
                setConfirmRevokeId(
                  null
                )
              }
              onConfirmRevoke={() =>
                void onRevoke(
                  connector.id
                )
              }
              onOpenMacGuide={() =>
                openGuide("macos")
              }
              onOpenWindowsGuide={() =>
                openGuide("windows")
              }
              onOpenReleaseNotes={() =>
                setReleaseNotesOpen(
                  true
                )
              }
            />
          )
        )}
      </div>

      <InstallationGuideDialog
        open={guideOpen}
        platform={guidePlatform}
        onClose={() =>
          setGuideOpen(false)
        }
      />

      <ReleaseNotesModal
        open={releaseNotesOpen}
        onClose={() =>
          setReleaseNotesOpen(false)
        }
      />
    </>
  );
}

function SmartHomeSummaryItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface-sunken px-4 py-4">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-text-tertiary">
        {label}
      </p>

      <p className="mt-2 text-2xl font-semibold text-text-primary">
        {value}
      </p>
    </div>
  );
}

function ConnectorInstallationCard({
  connector,
  householdName,
  planLabel,
  monitoringEnabled,
  updateMessage,
  canManage,
  revoking,
  confirmRevoke,
  onRequestRevoke,
  onCancelRevoke,
  onConfirmRevoke,
  onOpenMacGuide,
  onOpenWindowsGuide,
  onOpenReleaseNotes,
}: {
  connector: ConnectorInstallationSummary;
  householdName: string | null;
  planLabel: string;
  monitoringEnabled: boolean;
  updateMessage: string | null;
  canManage: boolean;
  revoking: boolean;
  confirmRevoke: boolean;
  onRequestRevoke: () => void;
  onCancelRevoke: () => void;
  onConfirmRevoke: () => void;
  onOpenMacGuide: () => void;
  onOpenWindowsGuide: () => void;
  onOpenReleaseNotes: () => void;
}) {
  return (
    <PageCard className="p-7 md:p-8">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-overline text-section-network">
          Connector
        </p>

        <ConnectorMonitoringBadge
          enabled={monitoringEnabled}
        />
      </div>

      <h2 className="mt-2 text-2xl font-semibold text-text-primary">
        {connector.name}
      </h2>

      <p className="mt-1 text-sm text-text-secondary">
        {formatPlatformLabel(
          connector.platform
        )}{" "}
        ·{" "}
        {connector.appVersion ??
          "Version unknown"}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <InfoRow
          label="Connection status"
          value={describeConnectorStatus(
            connector
          )}
        />

        <InfoRow
          label="Last heartbeat"
          value={formatConnectorRelativeTime(
            connector.lastSeenAt
          )}
          detail={formatConnectorTimestamp(
            connector.lastSeenAt
          )}
        />

        <InfoRow
          label="Last scan"
          value={formatConnectorRelativeTime(
            connector.lastScanAt
          )}
          detail={formatConnectorTimestamp(
            connector.lastScanAt
          )}
        />

        <InfoRow
          label="Monitoring mode"
          value={
            monitoringEnabled
              ? "Automatic"
              : "Manual"
          }
        />

        <InfoRow
          label="Platform"
          value={describeConnectorPlatform(
            connector
          )}
        />

        <InfoRow
          label="Household"
          value={
            householdName ??
            "Current household"
          }
          detail={planLabel}
        />
      </div>

      {updateMessage ? (
        <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {updateMessage}
        </p>
      ) : null}

      {canManage ? (
        <>
          <div className="mt-6 flex flex-wrap gap-3">
            <ConnectorDownloadActions
              layout="row"
              showVersionLabel={false}
            />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onOpenMacGuide}
            >
              <Apple size={16} />
              macOS Guide
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={
                onOpenWindowsGuide
              }
            >
              <Monitor size={16} />
              Windows Guide
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={
                onOpenReleaseNotes
              }
            >
              <Sparkles size={16} />
              Check for Updates
            </Button>

            <Button
              href="/network/connect"
              variant="secondary"
            >
              <RefreshCw size={16} />
              Reconnect
            </Button>

            <Link
              href="/network/diagnostics"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-text-secondary transition hover:bg-surface-sunken hover:text-text-primary"
            >
              <FileText size={16} />
              Diagnostics
            </Link>
          </div>
        </>
      ) : (
        <div className="mt-6">
          <Link
            href="/network/diagnostics"
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-text-secondary transition hover:bg-surface-sunken hover:text-text-primary"
          >
            <FileText size={16} />
            Diagnostics
          </Link>
        </div>
      )}

      {canManage ? (
        <div className="mt-6 border-t border-border-subtle pt-6">
          {confirmRevoke ? (
            <div className="rounded-[20px] border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">
                Remove this connector from
                your household?
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="danger"
                  loading={revoking}
                  loadingLabel="Removing..."
                  onClick={
                    onConfirmRevoke
                  }
                >
                  <Trash2 size={16} />
                  Confirm removal
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={
                    onCancelRevoke
                  }
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="ghost"
              onClick={
                onRequestRevoke
              }
            >
              <Trash2 size={16} />
              Remove connector
            </Button>
          )}
        </div>
      ) : null}
    </PageCard>
  );
}

function InfoRow({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-[20px] border border-border-subtle bg-surface-sunken p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
        {label}
      </p>

      <p className="mt-2 font-semibold text-text-primary">
        {value}
      </p>

      {detail ? (
        <p className="mt-1 text-xs text-text-secondary">
          {detail}
        </p>
      ) : null}
    </div>
  );
}