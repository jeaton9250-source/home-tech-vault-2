"use client";

import {
  Activity,
  CheckCircle2,
  HeartPulse,
  HelpCircle,
  Radar,
  Wifi,
} from "lucide-react";

import { sections } from "@/lib/design-system/tokens";
import {
  LANDING_DEMO_LABEL,
  landingConnectorCategories,
  landingConnectorDemoSummary,
  landingHomePulseSummary,
} from "@/lib/marketing/landingContent";
import { cn } from "@/lib/design-system/cn";

function DemoBadge() {
  return (
    <span className="inline-flex items-center rounded-full border border-border-subtle bg-surface-sunken px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-wider text-text-muted">
      {LANDING_DEMO_LABEL}
    </span>
  );
}

export function LandingConnectorDemoSummary({
  className,
}: {
  className?: string;
}) {
  const summary = landingConnectorDemoSummary;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[var(--radius-card)] border border-border-subtle bg-surface-card shadow-[var(--shadow-md),0_24px_48px_-16px_rgb(17_24_39_/_0.16)]",
        className
      )}
      role="img"
      aria-label="Demo summary of Home Tech Vault remembering home technology"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border-subtle bg-surface-sunken/80 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-button)] bg-section-network/10 text-section-network">
            <Radar size={18} aria-hidden />
          </span>
          <div>
            <p className="text-sm font-medium text-text-primary">
              Smart Connector
            </p>
            <p className="text-xs text-text-muted">
              {summary.connectorName}
            </p>
          </div>
        </div>
        <DemoBadge />
      </div>

      <div className="space-y-4 p-5 md:p-6">
        <div className="flex items-center justify-between rounded-[var(--radius-button)] border border-home-health-muted bg-home-health-soft px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-medium text-home-health">
            <span className="relative flex h-2.5 w-2.5">
              <span className="htv-landing-pulse absolute inline-flex h-full w-full rounded-full bg-home-health/40" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-home-health" />
            </span>
            {summary.connectorStatus}
          </div>
          <p className="text-xs text-text-muted">
            Last check {summary.lastScanLabel}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            {
              label: "Remembered",
              value: summary.devicesDiscovered,
              icon: Wifi,
            },
            {
              label: "Matched",
              value: summary.devicesMatched,
              icon: CheckCircle2,
            },
            {
              label: "At home now",
              value: summary.onlineNow,
              icon: Activity,
            },
            {
              label: "Needs you",
              value: summary.needsReview,
              icon: HelpCircle,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-[var(--radius-button)] border border-border-subtle bg-surface-base px-4 py-3.5 transition-all duration-200 hover:-translate-y-px hover:shadow-sm"
            >
              <div className="flex items-center gap-2 text-text-muted">
                <item.icon size={14} aria-hidden />
                <p className="text-[0.625rem] font-semibold uppercase tracking-wider">
                  {item.label}
                </p>
              </div>
              <p className="mt-2 text-2xl font-medium tabular-nums text-text-primary">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-[var(--radius-button)] border border-border-subtle bg-surface-sunken px-4 py-3">
          <p className="text-xs leading-5 text-text-secondary">
            TVs, speakers, printers, and smart-home devices — quietly
            remembered and matched to your vault.
          </p>
        </div>
      </div>
    </div>
  );
}

export function ConnectorNetworkIllustration() {
  const nodes = [
    { label: "Router", x: "50%", y: "18%", active: true },
    { label: "TV", x: "18%", y: "42%" },
    { label: "Speaker", x: "50%", y: "48%" },
    { label: "Printer", x: "82%", y: "42%" },
    { label: "Phone", x: "28%", y: "78%" },
    { label: "Hub", x: "72%", y: "78%" },
  ] as const;

  return (
    <div
      className="relative mx-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-[var(--radius-card)] border border-border-subtle bg-[radial-gradient(circle_at_50%_35%,rgb(236_246_240)_0%,rgb(253_252_250)_55%,rgb(243_241_236)_100%)] p-6 shadow-[var(--shadow-md)]"
      aria-hidden
    >
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(231 226 218 / 0.35) 1px, transparent 1px), linear-gradient(to bottom, rgb(231 226 218 / 0.35) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="absolute left-1/2 top-[18%] h-[58%] w-[58%] -translate-x-1/2 rounded-full border border-dashed border-section-network/25" />
      <div className="absolute left-1/2 top-[18%] h-[38%] w-[38%] -translate-x-1/2 rounded-full border border-section-network/15" />

      {nodes.map((node) => (
        <div
          key={node.label}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: node.x, top: node.y }}
        >
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-2xl border bg-surface-card text-[0.625rem] font-semibold uppercase tracking-wider shadow-[var(--shadow-sm)]",
              "active" in node && node.active
                ? "border-section-network/30 text-section-network"
                : "border-border-subtle text-text-muted"
            )}
          >
            {node.label.slice(0, 3)}
          </div>
        </div>
      ))}

      <div className="absolute bottom-4 left-4 right-4 rounded-[var(--radius-button)] border border-border-subtle/80 bg-surface-card/90 px-3 py-2 text-center text-[0.6875rem] text-text-secondary backdrop-blur-sm">
        Quietly watching your home network · Private and local
      </div>
    </div>
  );
}

export function ConnectorDeviceCategoryGrid() {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {landingConnectorCategories.map((category, index) => (
        <div
          key={category}
          className={cn(
            "rounded-[var(--radius-button)] border border-border-subtle bg-surface-card px-4 py-3 text-sm text-text-secondary transition-all duration-200 hover:-translate-y-px hover:border-border-strong hover:shadow-sm",
            index === 0 && "htv-landing-delay-1",
            index === 4 && "htv-landing-delay-2"
          )}
        >
          {category}
        </div>
      ))}
    </div>
  );
}

export function HomePulseIllustration() {
  return (
    <div
      className="overflow-hidden rounded-[var(--radius-card)] border border-border-subtle bg-surface-card shadow-[var(--shadow-md)]"
      style={{
        boxShadow: `var(--shadow-md), 0 20px 40px -18px ${sections.network.accent}22`,
      }}
    >
      <div className="border-b border-border-subtle bg-surface-sunken/80 px-5 py-3.5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p
              className="text-overline"
              style={{ color: sections.network.accent }}
            >
              Home Pulse
            </p>
            <p className="mt-1 text-sm font-medium text-text-primary">
              {landingHomePulseSummary.headline}
            </p>
          </div>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-button)] bg-section-network/10 text-section-network">
            <HeartPulse size={18} aria-hidden />
          </span>
        </div>
      </div>

      <div className="space-y-2 p-4">
        {landingHomePulseSummary.items.map((item) => (
          <div
            key={item.text}
            className="flex items-start gap-3 rounded-[var(--radius-button)] border border-border-subtle bg-surface-base px-4 py-3"
          >
            <span
              className={cn(
                "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                item.tone === "success" && "bg-home-health",
                item.tone === "info" && "bg-interaction",
                item.tone === "warning" && "bg-warning"
              )}
              aria-hidden
            />
            <p className="text-sm text-text-secondary">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** @deprecated Use HomePulseIllustration */
export function MonitoringStatusIllustration() {
  return <HomePulseIllustration />;
}
