"use client";

import { useState } from "react";

import { ChevronDown, ChevronUp } from "lucide-react";

import DeviceTimeline from "@/components/DeviceTimeline";
import PageCard from "@/components/ui/PageCard";

type DeviceProfileTimelineSlotProps = {
  deviceId: string;
  purchaseDate?: string | null;
  warrantyDate?: string | null;
};

export default function DeviceProfileTimelineSlot({
  deviceId,
  purchaseDate,
  warrantyDate,
}: DeviceProfileTimelineSlotProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <PageCard className="p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-overline text-section-technology">Timeline</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-text-primary">
            Device history
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((open) => !open)}
          className="htv-focus-ring inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface-card px-4 py-2 text-sm font-semibold text-text-primary shadow-[var(--shadow-sm)]"
          aria-expanded={expanded}
        >
          {expanded ? (
            <>
              Collapse timeline <ChevronUp size={16} />
            </>
          ) : (
            <>
              View full history <ChevronDown size={16} />
            </>
          )}
        </button>
      </div>

      <div
        className={
          expanded
            ? "mt-6"
            : "mt-6 max-h-[28rem] overflow-hidden [mask-image:linear-gradient(180deg,#000_75%,transparent)]"
        }
      >
        <DeviceTimeline
          embedded
          deviceId={deviceId}
          purchaseDate={purchaseDate}
          warrantyDate={warrantyDate}
        />
      </div>
    </PageCard>
  );
}
