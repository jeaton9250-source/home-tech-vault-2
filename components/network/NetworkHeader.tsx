"use client";

import {
  Link2,
  Radar,
  RefreshCw,
  Router,
} from "lucide-react";

import Button from "@/components/ui/Button";
import PageHero from "@/components/ui/PageHero";
import type { NetworkSummary } from "@/lib/network/summary";

type NetworkHeaderProps = {
  summary: NetworkSummary | null;
  headerSummary: string | null;
  loading: boolean;
  refreshing?: boolean;
  canRefresh?: boolean;
  canManageConnector?: boolean;
  isDemo?: boolean;
  isViewer?: boolean;
  onRefresh?: () => void;
  onDemoAction?: () => void;
};

export default function NetworkHeader({
  summary,
  headerSummary,
  loading,
  refreshing = false,
  canRefresh = false,
  canManageConnector = false,
  isDemo = false,
  isViewer = false,
  onRefresh,
  onDemoAction,
}: NetworkHeaderProps) {
  const hasConnector = Boolean(summary?.hasConnector);
  const reviewCount = summary?.reviewCount ?? 0;

  return (
    <div className="space-y-4">
      <PageHero
        section="network"
        title="Network"
        description="Monitor connected devices, review recent discoveries, and link network activity to your Home Tech Vault records."
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          {isViewer ? (
            <div className="rounded-[var(--radius-button)] border border-border-subtle bg-surface-card/80 px-4 py-3 text-sm font-medium text-text-secondary shadow-[var(--shadow-sm)]">
              Viewer Access · Read Only
            </div>
          ) : null}

          {canRefresh && hasConnector ? (
            <Button
              type="button"
              variant="secondary"
              onClick={onRefresh}
              disabled={refreshing || loading}
              loading={refreshing}
              loadingLabel="Refreshing..."
            >
              <RefreshCw size={17} />
              Refresh Network
            </Button>
          ) : null}

          {isDemo ? (
            <Button type="button" variant="secondary" onClick={onDemoAction}>
              <Radar size={17} />
              Scan Network
            </Button>
          ) : null}

          {!loading && !hasConnector && (canManageConnector || isDemo) ? (
            isDemo ? (
              <Button type="button" onClick={onDemoAction}>
                <Router size={17} />
                Connect Your Home Network
              </Button>
            ) : (
              <Button href="/network/connect">
                <Router size={17} />
                Connect Your Home Network
              </Button>
            )
          ) : null}

          {!loading && hasConnector && (canManageConnector || isDemo) ? (
            isDemo ? (
              <Button type="button" variant="secondary" onClick={onDemoAction}>
                <Router size={17} />
                Manage Connector
              </Button>
            ) : (
              <Button href="/network/connect" variant="secondary">
                <Router size={17} />
                Manage Connector
              </Button>
            )
          ) : null}

          {!loading && summary ? (
            <Button href="/network/discovery">
              <Link2 size={17} />
              {reviewCount > 0 ? "Review Devices" : "Open Discovery Review"}
              {reviewCount > 0 ? (
                <span className="ml-1 rounded-full bg-white/15 px-2 py-0.5 text-xs font-semibold">
                  {reviewCount}
                </span>
              ) : null}
            </Button>
          ) : null}
        </div>
      </PageHero>

      {!loading && headerSummary ? (
        <p className="px-1 text-sm font-medium text-text-secondary">
          {headerSummary}
        </p>
      ) : null}
    </div>
  );
}
