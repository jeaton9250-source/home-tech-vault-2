"use client";

import { cn } from "@/lib/design-system/cn";
import type { HomeHealthHighlight } from "@/lib/home-health/types";
import {
  AlertTriangle,
  Check,
} from "lucide-react";

type HomeHealthHighlightsProps = {
  highlights: HomeHealthHighlight[];
};

export default function HomeHealthHighlights({
  highlights,
}: HomeHealthHighlightsProps) {
  if (highlights.length === 0) {
    return (
      <p className="text-sm leading-6 text-text-muted">
        Add devices, documents, or network
        details to see highlights here.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {highlights.map((highlight) => {
        const isPositive =
          highlight.tone === "positive";

        return (
          <li
            key={highlight.id}
            className="flex items-start gap-2.5"
          >
            <span
              className={cn(
                "mt-0.5 inline-flex shrink-0",
                isPositive
                  ? "text-home-health"
                  : "text-warning"
              )}
              aria-hidden
            >
              {isPositive ? (
                <Check size={15} strokeWidth={2.5} />
              ) : (
                <AlertTriangle
                  size={15}
                  strokeWidth={2.25}
                />
              )}
            </span>

            <span className="text-[0.9375rem] leading-6 text-text-secondary">
              {highlight.message}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
