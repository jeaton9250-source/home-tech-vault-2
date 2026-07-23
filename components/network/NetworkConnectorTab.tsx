"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  FileText,
  RefreshCw,
  Sparkles,
  Trash2,
} from "lucide-react";

import Button from "@/components/ui/Button";
import PageCard from "@/components/ui/PageCard";
import ConnectorDownloadActions from "@/components/connector/ConnectorDownloadActions";
import ConnectorMonitoringBadge from "@/components/connector/ConnectorMonitoringBadge";
import InstallationGuideDialog from "@/components/connector/InstallationGuideDialog";
import ReleaseNotesModal from "@/components/connector/ReleaseNotesModal";
import ConnectorUpgradePrompt from "@/components/connector/ConnectorUpgradePrompt";
import DemoSmartConnectorCard from "@/components/demo/DemoSmartConnectorCard";
import { useDemoReadOnlyAction } from "@/components/demo/DemoExperienceProvider";
import {
  describeConnectorPlatform,
  describeConnectorStatus,
} from "@/hooks/useConnectorOverview";
import {
  formatConnectorRelativeTime,
  formatConnectorTimestamp,
} from "@/lib/connector/scanHistory";
import { formatPlatformLabel } from "@/lib/connector/platforms";

import type { NetworkPageData } from "@/hooks/useNetworkPageData";
import type { ConnectorInstallationSummary } from "@/lib/connector/types";

type NetworkConnectorTabProps = {
  data: NetworkPageData;
  householdName: string | null;
  planLabel: string;
  canManage: boolean;
  isDemo: boolean;
  householdId: string | null;
  onRevoke: (connectorId: string) => Promise<void>;
  revoking: boolean;
};

export default function NetworkConnectorTab({
  data,
  householdName,
  planLabel,
  canManage,
  isDemo,
  householdId,
  onRevoke,
  revoking,
}: NetworkConnectorTabProps) {
  const [guideOpen, setGuideOpen] = useState(false);
  const [releaseNotesOpen, setReleaseNotesOpen] = useState(false);
  const [confirmRevokeId, setConfirmRevokeId] = useState<string | null>(
    null
  );
  const showReadOnlyModal = useDemoReadOnlyAction();

  const activeConnectors = useMemo(
    () =>
      data.connectors.filter(
        (connector) => connector.status !== "revoked"
      ),
    [data.connectors]
  );

  if (isDemo) {
    return <DemoSmartConnectorCard />;
  }

  if (!householdId && !isDemo) {
    return (
      <PageCard className="p-7 md:p-8">
        <h2 className="text-xl font-semibold text-text-primary">
          Join a household to pair a connector
        </h2>
        <p className="mt-3 text-sm leading-7 text-text-secondary">
          Connectors are linked to a household vault. Create or join a household
          from Family before installing the connector.
        </p>
        <div className="mt-6">
          <Button href="/family">Go to Family</Button>
        </div>
      </PageCard>
    );
  }

  if (activeConnectors.length === 0) {
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
            Install the connector on a computer that stays on your home network
            to discover devices, match them to your vault, and keep discovery
            results up to date.
          </p>

          <ul className="mt-5 space-y-2 text-sm text-text-secondary">
            <li>Manual network scanning</li>
            <li>Device discovery and matching</li>
            <li>Device import into your vault</li>
            <li>Automatic monitoring with Pro or Family</li>
          </ul>

          <div className="mt-6 flex flex-col gap-3 sm:max-w-sm">
            <ConnectorDownloadActions layout="stack" />
            <Button
              type="button"
              variant="secondary"
              onClick={() => setGuideOpen(true)}
            >
              <BookOpen size={16} />
              Installation Guide
            </Button>
            <Button href="/network/connect">
              Connect Your Home Network
            </Button>
          </div>

          {!data.monitoringEnabled ? (
            <div className="mt-6">
              <ConnectorUpgradePrompt />
            </div>
          ) : null}
        </PageCard>

        <InstallationGuideDialog
          open={guideOpen}
          onClose={() => setGuideOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {activeConnectors.map((connector) => (
          <ConnectorInstallationCard
            key={connector.id}
            connector={connector}
            householdName={householdName}
            planLabel={planLabel}
            monitoringEnabled={data.monitoringEnabled}
            updateMessage={data.updateCheck?.message ?? null}
            canManage={canManage}
            revoking={revoking && confirmRevokeId === connector.id}
            confirmRevoke={confirmRevokeId === connector.id}
            onRequestRevoke={() => {
              if (
                showReadOnlyModal({
                  preventDefault: () => undefined,
                })
              ) {
                return;
              }

              setConfirmRevokeId(connector.id);
            }}
            onCancelRevoke={() => setConfirmRevokeId(null)}
            onConfirmRevoke={() => void onRevoke(connector.id)}
            onOpenGuide={() => setGuideOpen(true)}
            onOpenReleaseNotes={() => setReleaseNotesOpen(true)}
          />
        ))}
      </div>

      <InstallationGuideDialog
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
      />
      <ReleaseNotesModal
        open={releaseNotesOpen}
        onClose={() => setReleaseNotesOpen(false)}
      />
    </>
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
  onOpenGuide,
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
  onOpenGuide: () => void;
  onOpenReleaseNotes: () => void;
}) {
  return (
    <PageCard className="p-7 md:p-8">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-overline text-section-network">Connector</p>
        <ConnectorMonitoringBadge enabled={monitoringEnabled} />
      </div>

      <h2 className="mt-2 text-2xl font-semibold text-text-primary">
        {connector.name}
      </h2>
      <p className="mt-1 text-sm text-text-secondary">
        {formatPlatformLabel(connector.platform)} ·{" "}
        {connector.appVersion ?? "Version unknown"}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <InfoRow
          label="Connection status"
          value={describeConnectorStatus(connector)}
        />
        <InfoRow
          label="Last heartbeat"
          value={formatConnectorRelativeTime(connector.lastSeenAt)}
          detail={formatConnectorTimestamp(connector.lastSeenAt)}
        />
        <InfoRow
          label="Last scan"
          value={formatConnectorRelativeTime(connector.lastScanAt)}
          detail={formatConnectorTimestamp(connector.lastScanAt)}
        />
        <InfoRow
          label="Monitoring mode"
          value={monitoringEnabled ? "Automatic" : "Manual"}
        />
        <InfoRow
          label="Platform"
          value={describeConnectorPlatform(connector)}
        />
        <InfoRow
          label="Household"
          value={householdName ?? "Current household"}
          detail={planLabel}
        />
      </div>

      {updateMessage ? (
        <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {updateMessage}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <ConnectorDownloadActions layout="row" showVersionLabel={false} />
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Button type="button" variant="secondary" onClick={onOpenGuide}>
          <BookOpen size={16} />
          Installation Guide
        </Button>
        <Button type="button" variant="secondary" onClick={onOpenReleaseNotes}>
          <Sparkles size={16} />
          Check for Updates
        </Button>
        <Button href="/network/connect" variant="secondary">
          <RefreshCw size={16} />
          Reconnect
        </Button>
        <Link
          href="/network/diagnostics"
          className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-text-secondary transition hover:bg-surface-sunken hover:text-text-primary"
        >
          <FileText size={16} />
          Diagnostics
        </Link>
      </div>

      {canManage ? (
        <div className="mt-6 border-t border-border-subtle pt-6">
          {confirmRevoke ? (
            <div className="rounded-[20px] border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">
                Remove this connector from your household?
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="danger"
                  loading={revoking}
                  loadingLabel="Removing..."
                  onClick={onConfirmRevoke}
                >
                  <Trash2 size={16} />
                  Confirm removal
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onCancelRevoke}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button type="button" variant="ghost" onClick={onRequestRevoke}>
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
      <p className="mt-2 font-semibold text-text-primary">{value}</p>
      {detail ? (
        <p className="mt-1 text-xs text-text-secondary">{detail}</p>
      ) : null}
    </div>
  );
}
