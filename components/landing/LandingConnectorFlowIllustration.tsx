"use client";

import { ArrowDown, Download, LayoutGrid, ScanSearch } from "lucide-react";

import { landingConnectorFlow } from "@/lib/marketing/landingContent";
import { cn } from "@/lib/design-system/cn";

const stepIcons = [Download, ScanSearch, LayoutGrid] as const;

export default function LandingConnectorFlowIllustration({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.25rem] border border-border-subtle/80 bg-[radial-gradient(circle_at_50%_0%,rgb(236_246_240)_0%,rgb(253_252_250)_48%,rgb(248_246_242)_100%)] p-6 shadow-[var(--shadow-md)] md:p-8",
        className
      )}
      aria-hidden
    >
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <div className="htv-connector-flow-dot absolute left-[18%] top-[22%] h-2 w-2 rounded-full bg-section-network/50" />
        <div className="htv-connector-flow-dot absolute left-[50%] top-[42%] h-2 w-2 rounded-full bg-section-network/40 [animation-delay:400ms]" />
        <div className="htv-connector-flow-dot absolute left-[78%] top-[68%] h-2 w-2 rounded-full bg-section-network/35 [animation-delay:800ms]" />
      </div>

      <div className="relative space-y-3">
        {landingConnectorFlow.map((item, index) => {
          const Icon = stepIcons[index] ?? LayoutGrid;

          return (
            <div key={item.step}>
              <div className="flex items-start gap-4 rounded-2xl border border-border-subtle/80 bg-surface-card/90 px-4 py-4 shadow-[var(--shadow-sm)] backdrop-blur-sm transition-transform duration-300 hover:-translate-y-0.5">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-section-network/10 text-section-network">
                  <Icon size={20} aria-hidden />
                </span>
                <div className="min-w-0 pt-0.5">
                  <p className="text-sm font-medium text-text-primary">
                    {item.step}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-text-muted">
                    {item.detail}
                  </p>
                </div>
              </div>

              {index < landingConnectorFlow.length - 1 ? (
                <div className="flex justify-center py-1.5 text-text-tertiary">
                  <ArrowDown size={16} aria-hidden />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-5 rounded-2xl border border-border-subtle/70 bg-surface-card/80 px-4 py-3 text-center text-xs leading-5 text-text-secondary">
        Devices quietly flow into your vault — no spreadsheets required.
      </div>
    </div>
  );
}
