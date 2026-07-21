"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/design-system/cn";
import { trackFoundingProgramCtaClicked } from "@/lib/founding-members/analytics";
import type { PublicFoundingProgramSummary } from "@/lib/founding-members/types";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";

type FoundingMembersBannerProps = {
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

export default function FoundingMembersBanner({
  summary,
}: FoundingMembersBannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isEnrollmentOpen =
    summary.availability === "open";
  const panelId = "founding-members-banner-panel";
  const availabilityLabel =
    getAvailabilityLabel(summary);

  return (
    <div className="border-b border-[#D8CFC0] bg-[#F7F3EA]">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-4 py-3 text-left transition hover:bg-[#EEE7DC]/60"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => setIsOpen((open) => !open)}
        >
          <span className="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-3">
            <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B6258]">
              Founding Members
            </span>
            <span className="hidden h-3 w-px shrink-0 bg-[#CFC5B6] sm:block" />
            <span className="truncate text-sm font-medium text-[#2B2621]">
              {availabilityLabel}
            </span>
          </span>

          <span className="flex shrink-0 items-center gap-2 text-sm font-medium text-[#5C5348]">
            <span className="hidden sm:inline">
              {isOpen ? "Hide details" : "Learn more"}
            </span>
            <ChevronDown
              size={18}
              className={cn(
                "text-[#6B6258] transition-transform",
                isOpen && "rotate-180"
              )}
              aria-hidden
            />
          </span>
        </button>

        {isOpen ? (
          <div
            id={panelId}
            className="border-t border-[#D8CFC0] pb-5 pt-4"
          >
            <p className="max-w-3xl text-sm leading-7 text-[#5C5348]">
              {summary.publicMessage}
            </p>

            {isEnrollmentOpen ? (
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
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
              <p className="mt-3 text-sm text-[#5C5348]">
                The first {summary.capacity} Founding
                Member spots have been claimed.
              </p>
            ) : (
              <p className="mt-3 text-sm text-[#5C5348]">
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
