"use client";

import { Sparkles } from "lucide-react";

export default function DemoConnectorExplorationBanner() {
  return (
    <div className="rounded-[24px] border border-border-subtle bg-surface-sunken/80 px-5 py-4">
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-charcoal text-surface-card">
          <Sparkles size={18} aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
            Interactive Demo
          </p>
          <p className="mt-1 text-sm leading-6 text-text-secondary">
            You are exploring simulated connector data. No real network is being
            scanned.
          </p>
        </div>
      </div>
    </div>
  );
}
