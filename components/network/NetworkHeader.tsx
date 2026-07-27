"use client";

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Radar,
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

const QUICK_LINKS = [
  {
    label: "Discovery",
    href: "/network/discovery",
    icon: Radar,
  },
  {
    label: "Connector Status",
    href: "/network?tab=connector",
    icon: Router,
  },
  {
    label: "Diagnostics",
    href: "/network/diagnostics",
    icon: Activity,
  },
  {
    label: "Network Details",
    href: "/network/edit",
    icon: Settings,
  },
] as const;

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

  const primaryLabel = hasConnector
    ? "Review Discovered Devices"
    : "Discover Devices";

  const primaryHref = hasConnector
    ? "/network/discovery"
    : "/network/discover";

  const secondaryLabel = hasConnector
    ? "Run Network Scan"
    : "Connect Desktop App";

  const secondaryHref = hasConnector
    ? "/network/discover"
    : "/network/connect";

  function handlePrimaryClick() {
    if (isDemo) {
      onDemoAction?.();
    }
  }

  function handleSecondaryClick() {
    if (isDemo) {
      onDemoAction?.();
    }
  }

  function handleScanClick() {
    if (isDemo) {
      onDemoAction?.();
      return;
    }

    onRefresh?.();
  }

  return (
    <div className="space-y-6">
      <header className="space-y-4">
        <div className="space-y-3">
          <p className="text-overline text-text-muted">
            Network
          </p>
          <h1 className="text-[clamp(2rem,4vw,2.75rem)] font-medium tracking-[-0.04em] text-text-primary">
            Your Home Network
          </h1>
          <p className="max-w-2xl text-base leading-7 text-text-secondary">
            Discover, identify, and monitor the technology
            connected to your home.
          </p>
        </div>

        {!loading ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {isDemo ? (
              <Button type="button" onClick={handlePrimaryClick}>
                <Radar size={17} />
                {primaryLabel}
              </Button>
            ) : (
              <Button href={primaryHref}>
                <Radar size={17} />
                {primaryLabel}
                {reviewCount > 0 ? (
                  <span className="ml-1 rounded-full bg-white/15 px-2 py-0.5 text-xs font-semibold">
                    {reviewCount}
                  </span>
                ) : null}
              </Button>
            )}

            {hasConnector && canRefresh ? (
              isDemo ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleScanClick}
                  disabled={refreshing}
                >
                  <RefreshCw size={17} />
                  {secondaryLabel}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleScanClick}
                  disabled={refreshing || loading}
                  loading={refreshing}
                  loadingLabel="Scanning..."
                >
                  <RefreshCw size={17} />
                  {secondaryLabel}
                </Button>
              )
            ) : isDemo ? (
              <Button
                type="button"
                variant="secondary"
                onClick={handleSecondaryClick}
              >
                <Router size={17} />
                {secondaryLabel}
              </Button>
            ) : (
              <Button href={secondaryHref} variant="secondary">
                <Router size={17} />
                {secondaryLabel}
              </Button>
            )}
          </div>
        ) : null}

        {isViewer ? (
          <div className="rounded-[var(--radius-button)] border border-border-subtle bg-surface-card/80 px-4 py-3 text-sm font-medium text-text-secondary shadow-[var(--shadow-sm)]">
            Viewer Access · Read Only
          </div>
        ) : null}

        {!loading && headerSummary ? (
          <p className="text-sm font-medium text-text-secondary">
            {headerSummary}
          </p>
        ) : null}
      </header>

      {!loading && !hasConnector ? (
        <PageCard className="border-border-subtle/80 bg-surface-sunken/40 p-5 md:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-button)] border border-border-subtle bg-surface-card text-charcoal">
              <Wifi size={18} />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-medium tracking-[-0.02em] text-text-primary">
                Discover devices automatically
              </h2>
              <p className="mt-2 text-sm leading-7 text-text-secondary">
                Install the Home Tech Vault desktop connector to
                securely scan your local network and find TVs,
                computers, printers, smart-home devices, routers,
                and more.
              </p>

              {isDemo ? (
                <div className="mt-4 space-y-3">
                  <p className="text-sm font-medium text-text-primary">
                    Create a free account to connect your home
                    network.
                  </p>
                  <Button
                    type="button"
                    onClick={onDemoAction}
                  >
                    <Router size={17} />
                    Connect Desktop App
                  </Button>
                </div>
              ) : canManageConnector ? (
                <div className="mt-4">
                  <Button href="/network/connect">
                    <Router size={17} />
                    Connect Desktop App
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </PageCard>
      ) : null}

      <section aria-label="Network shortcuts">
        <p className="text-overline text-text-muted">
          Explore
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_LINKS.map((link) => {
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-center justify-between rounded-[var(--radius-button)] bg-surface-sunken/50 px-4 py-3.5 transition hover:bg-surface-sunken"
              >
                <span className="flex items-center gap-2.5 text-sm font-medium text-text-primary">
                  <Icon
                    size={16}
                    className="text-text-muted"
                    aria-hidden
                  />
                  {link.label}
                </span>
                <ArrowRight
                  size={15}
                  className="text-text-muted transition group-hover:text-text-secondary"
                  aria-hidden
                />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
