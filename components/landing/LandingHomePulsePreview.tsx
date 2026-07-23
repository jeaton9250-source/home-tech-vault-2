"use client";

import { HeartPulse } from "lucide-react";

import { useAnimatedNumber } from "@/components/home-health/useAnimatedNumber";
import {
  LANDING_DEMO_LABEL,
  landingHeroPulse,
} from "@/lib/marketing/landingContent";
import { cn } from "@/lib/design-system/cn";

export default function LandingHomePulsePreview({
  className,
}: {
  className?: string;
}) {
  const connected = useAnimatedNumber(
    landingHeroPulse.connectedDevices,
    900
  );
  const warranties = useAnimatedNumber(
    landingHeroPulse.warrantiesExpiring,
    700
  );
  const maintenance = useAnimatedNumber(
    landingHeroPulse.maintenanceReminders,
    600
  );

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[1.25rem] border border-border-subtle/80 bg-surface-card shadow-[var(--shadow-md),0_28px_56px_-20px_rgb(17_24_39_/_0.14)]",
        className
      )}
      role="img"
      aria-label="Home Pulse preview showing a calm summary of your home"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border-subtle/80 bg-[linear-gradient(180deg,rgb(253_252_250)_0%,rgb(248_246_242)_100%)] px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-home-health-soft text-home-health">
            <HeartPulse size={18} aria-hidden />
          </span>
          <div>
            <p className="text-sm font-medium text-text-primary">
              Home Pulse
            </p>
            <p className="text-xs text-text-muted">
              {landingHeroPulse.headline}
            </p>
          </div>
        </div>
        <span className="rounded-full border border-border-subtle bg-surface-sunken px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-wider text-text-muted">
          {LANDING_DEMO_LABEL}
        </span>
      </div>

      <div className="space-y-3 p-5 md:p-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            {
              label: "Connected devices",
              value: connected,
            },
            {
              label: "Warranties expiring soon",
              value: warranties,
            },
            {
              label: "Maintenance reminders",
              value: maintenance,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-border-subtle/80 bg-surface-base px-4 py-3.5"
            >
              <p className="text-[0.625rem] font-semibold uppercase tracking-wider text-text-muted">
                {stat.label}
              </p>
              <p className="mt-1.5 text-2xl font-medium tabular-nums tracking-[-0.03em] text-text-primary">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-home-health-muted/80 bg-home-health-soft/70 px-4 py-3.5">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <span className="relative flex h-2.5 w-2.5">
              <span className="htv-landing-pulse absolute inline-flex h-full w-full rounded-full bg-home-health/35" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-home-health" />
            </span>
            Last network scan
          </div>
          <p className="text-sm font-medium text-text-primary">
            {landingHeroPulse.lastScanLabel}
          </p>
        </div>
      </div>
    </div>
  );
}
