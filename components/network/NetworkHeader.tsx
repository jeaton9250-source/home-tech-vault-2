"use client";

import Link from "next/link";
import {
  Activity,
  RefreshCw,
  Router,
  Settings,
  Wifi,
} from "lucide-react";

import Button from "@/components/ui/Button";
import PageCard from "@/components/ui/PageCard";
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
  const hasConnector =
    Boolean(summary?.hasConnector);

  const reviewCount =
    summary?.reviewCount ?? 0;

  function handleDemoAction() {
    onDemoAction?.();
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-overline text-text-muted">
            Network
          </p>

          <h1 className="mt-1 text-3xl font-medium tracking-[-0.035em] text-text-primary md:text-4xl">
            Your Home Network
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary md:text-base">
            View connected devices, Home Assistant
            states, monitoring, and connector status.
          </p>

          {!loading && headerSummary ? (
            <p className="mt-2 text-sm font-medium text-text-secondary">
              {headerSummary}
            </p>
          ) : null}
        </div>

        {!loading ? (
          <div className="flex flex-wrap gap-2">
            {hasConnector ? (
              <>
                {isDemo ? (
                  <Button
                    type="button"
                    onClick={
                      handleDemoAction
                    }
                  >
                    Review Devices
                    {reviewCount > 0 ? (
                      <span className="ml-1 rounded-full bg-white/15 px-2 py-0.5 text-xs font-semibold">
                        {reviewCount}
                      </span>
                    ) : null}
                  </Button>
                ) : (
                  <Button href="/network/discovery">
                    Review Devices
                    {reviewCount > 0 ? (
                      <span className="ml-1 rounded-full bg-white/15 px-2 py-0.5 text-xs font-semibold">
                        {reviewCount}
                      </span>
                    ) : null}
                  </Button>
                )}

                {canRefresh ? (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      if (isDemo) {
                        handleDemoAction();
                        return;
                      }

                      onRefresh?.();
                    }}
                    disabled={
                      refreshing ||
                      loading
                    }
                    loading={refreshing}
                    loadingLabel="Refreshing..."
                  >
                    <RefreshCw size={16} />
                    Refresh
                  </Button>
                ) : null}
              </>
            ) : isDemo ? (
              <Button
                type="button"
                onClick={
                  handleDemoAction
                }
              >
                <Router size={16} />
                Connect Desktop App
              </Button>
            ) : (
              <Button href="/network/connect">
                <Router size={16} />
                Connect Desktop App
              </Button>
            )}
          </div>
        ) : null}
      </header>

      {isViewer ? (
        <div className="rounded-[var(--radius-button)] border border-border-subtle bg-surface-card px-4 py-3 text-sm text-text-secondary">
          Viewer access · Read only
        </div>
      ) : null}

      {!loading && !hasConnector ? (
        <PageCard className="p-4 md:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-button)] bg-surface-sunken text-text-primary">
                <Wifi size={17} />
              </div>

              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-text-primary">
                  Automatic device discovery
                </h2>

                <p className="mt-1 text-sm leading-6 text-text-secondary">
                  Connect the desktop app to scan
                  your local network and sync Home
                  Assistant devices.
                </p>
              </div>
            </div>

            {canManageConnector ? (
              <Button
                href="/network/connect"
                variant="secondary"
              >
                Set Up Connector
              </Button>
            ) : null}
          </div>
        </PageCard>
      ) : null}

      <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-border-subtle pt-3 text-sm">
        <Link
          href="/network?tab=connector"
          className="inline-flex items-center gap-2 font-medium text-text-secondary transition hover:text-text-primary"
        >
          <Router size={15} />
          Connector
        </Link>

        <Link
          href="/network/diagnostics"
          className="inline-flex items-center gap-2 font-medium text-text-secondary transition hover:text-text-primary"
        >
          <Activity size={15} />
          Diagnostics
        </Link>

        <Link
          href="/network/edit"
          className="inline-flex items-center gap-2 font-medium text-text-secondary transition hover:text-text-primary"
        >
          <Settings size={15} />
          Network Details
        </Link>
      </div>
    </div>
  );
}
