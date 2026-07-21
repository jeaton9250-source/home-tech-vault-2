import Link from "next/link";
import { ArrowRight, Mail, MessageCircle } from "lucide-react";

import { MarketingContent } from "@/components/marketing/MarketingLayout";
import PageCard from "@/components/ui/PageCard";
import {
  LANDING_SECTION_IDS,
  LANDING_SUPPORT_QUESTIONS,
} from "@/lib/marketing/landingNav";
import {
  landingCardClass,
  landingMotionRise,
  landingSectionAnchor,
  landingSectionClass,
} from "@/lib/marketing/landingStyles";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";
import { cn } from "@/lib/design-system/cn";

export default function LandingSupportSection() {
  return (
    <MarketingContent
      id={LANDING_SECTION_IDS.support}
      className={cn(
        landingSectionClass,
        landingSectionAnchor
      )}
    >
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <h2 className="text-section-title text-text-primary">
            Support
          </h2>

          <p className="mt-3 max-w-md text-sm leading-6 text-text-muted">
            Helpful answers, direct contact, and a Help
            Center when you want to go deeper.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={MARKETING_ROUTES.faq}
              className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-button)] border border-border-subtle bg-surface-card px-5 text-sm font-medium text-text-primary transition hover:-translate-y-px hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interaction"
            >
              Help Center
            </Link>

            <Link
              href={MARKETING_ROUTES.contact}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-button)] border border-border-subtle bg-surface-card px-5 text-sm font-medium text-text-primary transition hover:-translate-y-px hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interaction"
            >
              <Mail size={16} aria-hidden />
              Contact
            </Link>
          </div>
        </div>

        <PageCard
          elevated={false}
          className={cn(
            landingCardClass,
            landingMotionRise,
            "p-6 md:p-7"
          )}
        >
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-button)] border border-border-subtle bg-surface-sunken text-text-primary">
              <MessageCircle
                size={18}
                strokeWidth={1.75}
                aria-hidden
              />
            </span>

            <h3 className="text-sm font-medium text-text-primary">
              Common questions
            </h3>
          </div>

          <dl className="mt-5 space-y-5">
            {LANDING_SUPPORT_QUESTIONS.map((item) => (
              <div
                key={item.question}
                className="border-t border-border-subtle/80 pt-5 first:border-t-0 first:pt-0"
              >
                <dt className="text-sm font-medium text-text-primary">
                  {item.question}
                </dt>
                <dd className="mt-2 text-sm leading-6 text-text-muted">
                  {item.answer}{" "}
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-1 font-medium text-interaction underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interaction"
                  >
                    {item.linkLabel}
                    <ArrowRight size={14} aria-hidden />
                  </Link>
                </dd>
              </div>
            ))}
          </dl>

          <Link
            href={MARKETING_ROUTES.faq}
            className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-interaction underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interaction"
          >
            Browse all questions
            <ArrowRight size={14} aria-hidden />
          </Link>
        </PageCard>
      </div>
    </MarketingContent>
  );
}
