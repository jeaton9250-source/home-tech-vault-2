"use client";

import { RefreshCw, Router, Wifi } from "lucide-react";

import Button from "@/components/ui/Button";
import PageCard from "@/components/ui/PageCard";
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

  function handleDemoAction() {
    onDemoAction?.();
  }

  return (
    <div className="space-y-4">
      <PageHero
        eyebrow="Home Wi-Fi"
        title="Home Wi-Fi"
        description="See what's connected to your home and anything that needs attention."
      >
        {!loading ? (
          <>
            {hasConnector ? (
              <>
                {isDemo ? (
                  <Button
                    type="button"
                    onClick={handleDemoAction}
                    className="border-[#617c43] bg-[#617c43] text-white hover:border-[#526b39] hover:bg-[#526b39]"
                  >
                    Review Devices
                    {reviewCount > 0 ? (
                      <span className="ml-1 rounded-full bg-white/15 px-2 py-0.5 text-xs font-semibold">
                        {reviewCount}
                      </span>
                    ) : null}
                  </Button>
                ) : (
                  <Button
                    href="/network/discovery"
                    className="border-[#617c43] bg-[#617c43] text-white hover:border-[#526b39] hover:bg-[#526b39]"
                  >
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
                    disabled={refreshing || loading}
                    loading={refreshing}
                    loadingLabel="Refreshing..."
                    className="border-[#e4e2dc] bg-[#fffefa] text-[#52606a] hover:border-[#718d4f]/30 hover:bg-[#f8f6f0] hover:text-[#526b39]"
                  >
                    <RefreshCw size={16} />
                    Refresh
                  </Button>
                ) : null}
              </>
            ) : isDemo ? (
              <Button
                type="button"
                onClick={handleDemoAction}
                className="border-[#617c43] bg-[#617c43] text-white hover:border-[#526b39] hover:bg-[#526b39]"
              >
                <Router size={16} />
                Connect Desktop App
              </Button>
            ) : (
              <Button
                href="/network/connect"
                className="border-[#617c43] bg-[#617c43] text-white hover:border-[#526b39] hover:bg-[#526b39]"
              >
                <Router size={16} />
                Connect Desktop App
              </Button>
            )}
          </>
        ) : null}
      </PageHero>

      {!loading && headerSummary ? (
        <p className="text-[12px] font-medium text-[#829078]">
          {headerSummary}
        </p>
      ) : null}

      {isViewer ? (
        <div className="rounded-[14px] border border-[#e4e2dc] bg-[#fffefa] px-4 py-3 text-sm text-[#68737b]">
          Viewer access · Read only
        </div>
      ) : null}

      {!loading && !hasConnector ? (
        <PageCard className="border-[#e4e2dc] bg-[#fffefa] p-5 shadow-[0_1px_2px_rgba(23,33,42,0.025)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-[#eef2e8] text-[#617c43]">
                <Wifi size={17} />
              </div>

              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-[#17212a]">
                  Automatic device discovery
                </h2>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-[#68737b]">
                  Connect the desktop app to find devices on your home network
                  and keep Home Wi-Fi information updated.
                </p>
              </div>
            </div>

            {canManageConnector ? (
              <Button
                href="/network/connect"
                variant="secondary"
                className="border-[#e4e2dc] bg-[#fffefa] text-[#52606a] hover:border-[#718d4f]/30 hover:bg-[#f8f6f0] hover:text-[#526b39]"
              >
                Set Up Connector
              </Button>
            ) : null}
          </div>
        </PageCard>
      ) : null}
    </div>
  );
}
