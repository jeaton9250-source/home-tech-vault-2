"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/design-system/cn";
import { trackFoundingProgramCtaClicked } from "@/lib/founding-members/analytics";
import type { PublicFoundingProgramSummary } from "@/lib/founding-members/types";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";

type FoundingMembersCalloutProps = {
  summary: PublicFoundingProgramSummary;
};

function getAvailabilityLabel(
  summary: PublicFoundingProgramSummary
): string {
  if (summary.availability === "open") {
    return `${summary.remainingSpots} of ${summary.capacity} spots remaining`;
  }

  if (summary.availability === "full") {
    return `All ${summary.capacity} spots claimed`;
  }

  return "Enrollment temporarily paused";
}

export default function FoundingMembersCallout({
  summary,
}: FoundingMembersCalloutProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isEnrollmentOpen =
    summary.availability === "open";
  const panelId = "founding-members-panel";
  const availabilityLabel =
    getAvailabilityLabel(summary);

  return (
    <div className="mt-8 max-w-xl">
      <div className="overflow-hidden rounded-[var(--radius-card)] border border-[#D8CFC0] bg-[#F7F3EA]">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-[#EEE7DC]/70"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => setIsOpen((open) => !open)}
        >
          <span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B6258]">
              Founding Members
            </span>
            <span className="mt-1 block text-sm font-medium text-[#2B2621]">
              {availabilityLabel}
            </span>
          </span>

          <ChevronDown
            size={18}
            className={cn(
              "shrink-0 text-[#6B6258] transition-transform",
              isOpen && "rotate-180"
            )}
            aria-hidden
          />
        </button>

        {isOpen ? (
          <div
            id={panelId}
            className="border-t border-[#D8CFC0] px-5 py-5"
          >
            <p className="text-sm leading-7 text-[#5C5348]">
              {summary.publicMessage}
            </p>

            {isEnrollmentOpen ? (
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={MARKETING_ROUTES.signup}
                  onClick={() =>
                    trackFoundingProgramCtaClicked({
                      source: "homepage",
                      availability: summary.availability,
                    })
                  }
                  className="inline-flex items-center justify-center rounded-full bg-[#2B2621] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#3A342E]"
                >
                  Start Free
                </Link>
                <Link
                  href={MARKETING_ROUTES.demo}
                  className="inline-flex items-center justify-center rounded-full border border-[#CFC5B6] px-5 py-2.5 text-sm font-medium text-[#2B2621] transition hover:bg-[#EEE7DC]"
                >
                  Explore the Demo
                </Link>
              </div>
            ) : summary.availability === "full" ? (
              <p className="mt-4 text-sm text-[#5C5348]">
                The first {summary.capacity} Founding
                Member spots have been claimed.
              </p>
            ) : (
              <p className="mt-4 text-sm text-[#5C5348]">
                Founding Member enrollment is
                temporarily paused.
              </p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
