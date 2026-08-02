import Link from "next/link";
import { ArrowRight, MessageSquareQuote, Users } from "lucide-react";

import { landingTheme } from "@/components/landing/public/landingTheme";
import {
  MARKETING_TESTIMONIALS,
  VERIFIED_HOMEOWNER_COUNT,
} from "@/lib/marketing/socialProof";

type SocialProofSectionProps = {
  foundingSummary?: unknown;
};

function readRealCount(summary: unknown): number | null {
  if (VERIFIED_HOMEOWNER_COUNT !== null) {
    return VERIFIED_HOMEOWNER_COUNT;
  }

  if (!summary || typeof summary !== "object") {
    return null;
  }

  const record = summary as Record<string, unknown>;
  const supportedKeys = [
    "totalUsers",
    "memberCount",
    "totalMembers",
    "claimedCount",
    "totalClaimed",
  ];

  for (const key of supportedKeys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value) && value >= 10) {
      return Math.floor(value);
    }
  }

  return null;
}

export default function SocialProofSection({
  foundingSummary,
}: SocialProofSectionProps) {
  const realCount = readRealCount(foundingSummary);
  const hasTestimonials = MARKETING_TESTIMONIALS.length >= 3;

  return (
    <section className="bg-surface-base px-5 py-20 md:px-8 lg:px-12">
      <div className={landingTheme.sectionNarrow}>
        {hasTestimonials ? (
          <>
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-home-health">
                Real homeowner feedback
              </p>
              <h2 className="mt-4 text-3xl font-medium tracking-[-0.035em] text-text-primary md:text-5xl">
                Built to make home technology easier to manage.
              </h2>
              {realCount ? (
                <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-card px-4 py-2 text-sm font-semibold text-text-secondary shadow-sm">
                  <Users size={16} className="text-home-health" aria-hidden />
                  Used by {realCount.toLocaleString()} homeowners
                </div>
              ) : null}
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {MARKETING_TESTIMONIALS.slice(0, 3).map((testimonial) => (
                <article
                  key={`${testimonial.firstName}-${testimonial.outcome}`}
                  className="rounded-[28px] border border-border-subtle bg-surface-card p-6 shadow-sm"
                >
                  <MessageSquareQuote
                    size={22}
                    className="text-home-health"
                    aria-hidden
                  />
                  <blockquote className="mt-5 text-base leading-7 text-text-primary">
                    “{testimonial.quote}”
                  </blockquote>
                  <p className="mt-5 text-sm font-semibold text-text-primary">
                    {testimonial.firstName}
                  </p>
                  <p className="text-sm text-text-muted">{testimonial.roleOrCity}</p>
                  <p className="mt-4 rounded-xl bg-home-health-soft px-3 py-2 text-xs font-semibold text-home-health">
                    {testimonial.outcome}
                  </p>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-[32px] border border-border-subtle bg-surface-card p-8 shadow-sm md:p-12">
            <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-home-health">
                  Founding homeowners
                </p>
                <h2 className="mt-3 text-3xl font-medium tracking-[-0.035em] text-text-primary md:text-4xl">
                  Help shape a simpler way to manage home technology.
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-text-secondary">
                  We are collecting honest feedback from early users. Try Home Tech
                  Vault, tell us what saves you time, and help us build the product
                  homeowners actually need.
                </p>
              </div>
              <Link
                href="/contact?topic=early-feedback"
                className={landingTheme.btnSecondary}
              >
                Share feedback
                <ArrowRight size={16} className="ml-2" aria-hidden />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
