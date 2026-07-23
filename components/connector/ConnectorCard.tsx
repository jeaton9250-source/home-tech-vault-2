"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Download,
  FileText,
  PlugZap,
  RefreshCw,
  Sparkles,
  Trash2,
} from "lucide-react";

import Button from "@/components/ui/Button";
import PageCard from "@/components/ui/PageCard";
import ConnectorDownloadButton from "@/components/connector/ConnectorDownloadButton";
import ConnectorMonitoringBadge from "@/components/connector/ConnectorMonitoringBadge";
import ConnectorUpgradePrompt from "@/components/connector/ConnectorUpgradePrompt";
import InstallationGuideDialog from "@/components/connector/InstallationGuideDialog";
import ReleaseNotesModal from "@/components/connector/ReleaseNotesModal";
import {
  describeConnectedDevice,
  describeConnectorStatus,
} from "@/hooks/useConnectorOverview";
import {
  formatConnectorRelativeTime,
  formatConnectorTimestamp,
} from "@/lib/connector/scanHistory";
import { CONNECTOR_MACOS_APP_VERSION } from "@/lib/connector/constants";

import type { ConnectorInstallationSummary } from "@/lib/connector/types";
import type { ConnectorUpdateCheckResult } from "@/lib/connector/updates";

type ConnectorCardProps = {
  isInstalled: boolean;
  primaryConnector: ConnectorInstallationSummary | null;
  monitoringEnabled: boolean;
  updateCheck: ConnectorUpdateCheckResult | null;
  canManage: boolean;
  revoking?: boolean;
  onRevoke?: (connectorId: string) => void;
};

export default function ConnectorCard({
  isInstalled,
  primaryConnector,
  monitoringEnabled,
  updateCheck,
  canManage,
  revoking = false,
  onRevoke,
}: ConnectorCardProps) {
  const [guideOpen, setGuideOpen] = useState(false);
  const [releaseNotesOpen, setReleaseNotesOpen] =
    useState(false);

  if (!isInstalled || !primaryConnector) {
    return (
      <>
        <PageCard className="p-7 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-charcoal">
                <PlugZap size={22} />
              </div>

              <p className="mt-5 text-overline text-section-network">
                Home Tech Vault Connector
              </p>

              <h2 className="mt-2 text-2xl font-semibold text-text-primary">
                Automatically discover and monitor devices on your home network.
              </h2>

              <p className="mt-3 text-sm leading-7 text-text-secondary">
                Pair a Mac, run manual scans, review discovery results, and
                import devices into your vault. Upgrade to Pro for automatic
                background monitoring.
              </p>

              <ul className="mt-5 space-y-2 text-sm text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-section-network" />
                  Discover every device on your home network
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-section-network" />
                  Match discoveries to vault devices automatically
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-section-network" />
                  Import new devices with one click
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-section-network" />
                  Upgrade to Pro for automatic 15-minute scans
                </li>
              </ul>

              {!monitoringEnabled ? (
                <div className="mt-5">
                  <ConnectorMonitoringBadge enabled={false} />
                </div>
              ) : null}
            </div>

            <div className="flex w-full shrink-0 flex-col gap-3 lg:max-w-xs">
              <ConnectorDownloadButton fullWidth />
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => setGuideOpen(true)}
              >
                <BookOpen size={16} />
                View Installation Guide
              </Button>
              <Button
                type="button"
                variant="ghost"
                fullWidth
                onClick={() => setReleaseNotesOpen(true)}
              >
                <Sparkles size={16} />
                What&apos;s New
              </Button>
            </div>
          </div>

          {!monitoringEnabled ? (
            <div className="mt-6">
              <ConnectorUpgradePrompt />
            </div>
          ) : null}
        </PageCard>

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

  return (
    <>
      <PageCard className="p-7 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-overline text-section-network">
                Connected
              </p>
              <ConnectorMonitoringBadge
                enabled={monitoringEnabled}
              />
            </div>

            <h2 className="mt-2 text-2xl font-semibold text-text-primary">
              {describeConnectedDevice(primaryConnector)}
            </h2>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <InfoRow
                label="Connector status"
                value={describeConnectorStatus(primaryConnector)}
              />
              <InfoRow
                label="Connector version"
                value={
                  primaryConnector.appVersion ??
                  CONNECTOR_MACOS_APP_VERSION
                }
              />
              <InfoRow
                label="Last heartbeat"
                value={formatConnectorRelativeTime(
                  primaryConnector.lastSeenAt
                )}
                detail={formatConnectorTimestamp(
                  primaryConnector.lastSeenAt
                )}
              />
              <InfoRow
                label="Last scan"
                value={formatConnectorRelativeTime(
                  primaryConnector.lastScanAt
                )}
                detail={formatConnectorTimestamp(
                  primaryConnector.lastScanAt
                )}
              />
            </div>

            {updateCheck?.status === "update_available" ? (
              <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {updateCheck.message}
              </p>
            ) : null}
          </div>

          <div className="flex w-full shrink-0 flex-col gap-3 lg:max-w-xs">
            <ConnectorDownloadButton
              variant="secondary"
              fullWidth
            />
            <Button href="/network/connect" variant="secondary" fullWidth>
              <RefreshCw size={16} />
              Reconnect
            </Button>
            <Button
              href="/network/diagnostics"
              variant="secondary"
              fullWidth
            >
              <FileText size={16} />
              View Logs
            </Button>
            {canManage ? (
              <Button
                type="button"
                variant="danger"
                fullWidth
                loading={revoking}
                loadingLabel="Removing..."
                onClick={() =>
                  onRevoke?.(primaryConnector.id)
                }
              >
                <Trash2 size={16} />
                Remove Connector
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setGuideOpen(true)}
          >
            <BookOpen size={16} />
            Installation Guide
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setReleaseNotesOpen(true)}
          >
            <Sparkles size={16} />
            What&apos;s New
          </Button>
          <Link
            href="/network/discovery"
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-text-secondary transition hover:bg-surface-sunken hover:text-text-primary"
          >
            <Download size={16} />
            Discovery results
          </Link>
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
    </>
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
