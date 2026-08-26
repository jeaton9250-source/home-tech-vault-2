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
          <p className="text-overline text-[#718d4f]">
            Home Wi-Fi
          </p>

          <h1 className="mt-1 font-serif text-3xl font-medium tracking-[-0.04em] text-[#17212a] md:text-4xl">
            Your Home Wi-Fi
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#68737b] md:text-base">
            See what&apos;s connected to your home and anything that needs attention.
          </p>
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
        <div className="rounded-[var(--radius-button)] border border-border-subtle bg-surface-card px-4 py-3 text-sm text-[#68737b]">
          Viewer access · Read only
        </div>
      ) : null}

      {!loading && !hasConnector ? (
        <PageCard className="border-[#182533]/10 bg-[#f8f5ef] p-4 shadow-[0_16px_40px_-34px_rgba(15,25,35,0.4)] md:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-button)] bg-surface-sunken text-[#17212a]">
                <Wifi size={17} />
              </div>

              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-[#17212a]">
                  Automatic device discovery
                </h2>

                <p className="mt-1 text-sm leading-6 text-[#68737b]">
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

      <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-[#182533]/10 pt-4 text-sm">
        <Link
          href="/network?tab=connector"
          className="inline-flex items-center gap-2 font-medium text-[#68737b] transition hover:text-[#17212a]"
        >
          <Router size={15} />
          Connector
        </Link>

        <Link
          href="/network/diagnostics"
          className="inline-flex items-center gap-2 font-medium text-[#68737b] transition hover:text-[#17212a]"
        >
          <Activity size={15} />
          Diagnostics
        </Link>

        <Link
          href="/network/edit"
          className="inline-flex items-center gap-2 font-medium text-[#68737b] transition hover:text-[#17212a]"
        >
          <Settings size={15} />
          Home Wi-Fi
        </Link>
      </div>
    </div>
  );
}
