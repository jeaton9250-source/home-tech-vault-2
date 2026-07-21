"use client";

import Link from "next/link";

import { trackFoundingProgramCtaClicked } from "@/lib/founding-members/analytics";
import type { PublicFoundingProgramSummary } from "@/lib/founding-members/types";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";

type FoundingMembersCalloutProps = {
  summary: PublicFoundingProgramSummary;
};

export default function FoundingMembersCallout({
  summary,
}: FoundingMembersCalloutProps) {
  const isOpen =
    summary.availability === "open";

  return (
    <section className="mx-auto max-w-6xl px-6 pb-16">
      <div className="rounded-[28px] border border-[#D8CFC0] bg-[#F7F3EA] px-6 py-8 md:px-10 md:py-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B6258]">
          Founding Members
        </p>

        <h2 className="mt-3 max-w-3xl text-2xl font-semibold tracking-tight text-[#2B2621] md:text-3xl">
          {summary.publicMessage}
        </h2>

        {isOpen ? (
          <p className="mt-4 text-sm text-[#5C5348]">
            {summary.remainingSpots} of{" "}
            {summary.capacity} spots remaining
          </p>
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

        {isOpen ? (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={MARKETING_ROUTES.signup}
              onClick={() =>
                trackFoundingProgramCtaClicked({
                  source: "homepage",
                  availability: summary.availability,
                })
              }
              className="inline-flex items-center justify-center rounded-full bg-[#2B2621] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#3A342E]"
            >
              Start Free
            </Link>
            <Link
              href={MARKETING_ROUTES.demo}
              className="inline-flex items-center justify-center rounded-full border border-[#CFC5B6] px-5 py-3 text-sm font-medium text-[#2B2621] transition hover:bg-[#EEE7DC]"
            >
              Explore the Demo
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
