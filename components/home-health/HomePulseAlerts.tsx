"use client";

import { AlertTriangle } from "lucide-react";

import PageCard from "@/components/ui/PageCard";
import type { HomeHealthHighlight } from "@/lib/home-health/types";

type HomePulseAlertsProps = {
  highlights: HomeHealthHighlight[];
};

export default function HomePulseAlerts({ highlights }: HomePulseAlertsProps) {
  const alerts = highlights.filter((highlight) => highlight.tone === "warning");

  if (alerts.length === 0) {
    return null;
  }

  return (
    <PageCard className="border-warning/20 bg-warning-soft/35">
      <p className="text-overline text-warning">Home Pulse</p>

      <h2 className="text-section-title mt-2 text-text-primary">
        A few things are worth a look
      </h2>

      <ul className="mt-5 space-y-3">
        {alerts.map((alert) => (
          <li
            key={alert.id}
            className="flex items-start gap-3 rounded-[var(--radius-button)] border border-warning/15 bg-surface-card/90 px-4 py-3.5 shadow-[var(--shadow-sm)]"
          >
            <AlertTriangle
              size={16}
              className="mt-0.5 shrink-0 text-warning"
              aria-hidden
            />

            <span className="text-sm leading-6 text-text-secondary">
              {alert.message}
            </span>
          </li>
        ))}
      </ul>
    </PageCard>
  );
}
