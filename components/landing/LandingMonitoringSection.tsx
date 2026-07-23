import {
  Clock3,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import {
  MonitoringStatusIllustration,
} from "@/components/landing/LandingConnectorIllustrations";
import { LANDING_SECTION_IDS } from "@/lib/marketing/landingNav";
import {
  LANDING_DEMO_LABEL,
  landingMonitoringDemoDevices,
} from "@/lib/marketing/landingConnectorDemo";
import {
  landingMotionRise,
  landingSectionClass,
  landingSectionAnchor,
} from "@/lib/marketing/landingStyles";
import { cn } from "@/lib/design-system/cn";

const toneClasses = {
  success: "bg-home-health-soft text-home-health",
  info: "bg-interaction-soft text-interaction",
  warning: "bg-warning-soft text-warning",
} as const;

export default function LandingMonitoringSection() {
  return (
    <section
      id={LANDING_SECTION_IDS.monitoring}
      className={cn(
        landingSectionClass,
        landingSectionAnchor,
        "border-y border-border-subtle/80 bg-surface-sunken/35 px-8 py-14 md:py-16 lg:px-10"
      )}
    >
      <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div className={landingMotionRise}>
          <p className="text-overline text-section-network">
            Live Monitoring
          </p>
          <h2 className="mt-3 text-3xl font-medium tracking-[-0.03em] text-text-primary md:text-4xl">
            Know what is online, what changed, and what needs attention.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-text-muted">
            After discovery, Home Tech Vault tracks presence over time —
            online, recently detected, or not recently seen — without
            pretending every device is live just because a scan ran.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <article className="rounded-[var(--radius-card)] border border-border-subtle bg-surface-card p-5">
              <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
                <Clock3 size={16} className="text-text-muted" />
                Free
              </div>
              <p className="mt-3 text-sm leading-6 text-text-muted">
                Manual scans from the connector when you choose. Review
                discoveries and refresh device network fields on demand.
              </p>
            </article>

            <article className="rounded-[var(--radius-card)] border border-charcoal/10 bg-surface-card p-5 shadow-[var(--shadow-sm)] ring-1 ring-charcoal/5">
              <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
                <Sparkles size={16} className="text-home-health" />
                Pro &amp; Family
              </div>
              <p className="mt-3 text-sm leading-6 text-text-muted">
                Automatic background monitoring with scheduled scans,
                timeline events, and live Home Pulse updates.
              </p>
            </article>
          </div>
        </div>

        <div className={cn(landingMotionRise, "htv-landing-delay-1")}>
          <MonitoringStatusIllustration />

          <div className="mt-4 overflow-hidden rounded-[var(--radius-card)] border border-border-subtle bg-surface-card">
            <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
                <RefreshCw size={15} className="text-section-network" />
                Example statuses
              </div>
              <span className="text-[0.625rem] font-semibold uppercase tracking-wider text-text-muted">
                {LANDING_DEMO_LABEL}
              </span>
            </div>

            <ul className="divide-y divide-border-subtle">
              {landingMonitoringDemoDevices.map((device) => (
                <li
                  key={device.name}
                  className="flex items-center justify-between gap-4 px-4 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text-primary">
                      {device.name}
                    </p>
                    <p className="truncate text-xs text-text-muted">
                      {device.location} · {device.lastSeen}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-wider",
                      toneClasses[device.tone]
                    )}
                  >
                    {device.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
