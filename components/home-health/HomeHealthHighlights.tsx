"use client";

import { cn } from "@/lib/design-system/cn";
import type { HomeHealthHighlight } from "@/lib/home-health/types";
import { Check, CircleAlert } from "lucide-react";

type HomeHealthHighlightsProps = {
  highlights: HomeHealthHighlight[];
};

export default function HomeHealthHighlights({
  highlights,
}: HomeHealthHighlightsProps) {
  if (highlights.length === 0) {
    return null;
  }

  return (
    <ul className="space-y-2.5">
      {highlights.map((highlight) => (
        <li
          key={highlight.id}
          className="flex items-start gap-2.5 text-sm leading-6 text-text-secondary"
        >
          {highlight.tone === "positive" ? (
            <Check
              size={16}
              className="mt-1 shrink-0 text-home-health"
              aria-hidden
            />
          ) : (
            <CircleAlert
              size={16}
              className="mt-1 shrink-0 text-warning"
              aria-hidden
            />
          )}
          <span>{highlight.message}</span>
        </li>
      ))}
    </ul>
  );
}
