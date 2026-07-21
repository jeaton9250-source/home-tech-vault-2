import Link from "next/link";
import {
  ArrowRight,
  KeyRound,
  Lock,
  Mail,
  Users,
} from "lucide-react";

import { MarketingContent } from "@/components/marketing/MarketingLayout";
import PageCard from "@/components/ui/PageCard";
import { LANDING_SECTION_IDS } from "@/lib/marketing/landingNav";
import {
  landingCardClass,
  landingMotionRise,
  landingSectionAnchor,
  landingSectionClass,
} from "@/lib/marketing/landingStyles";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";
import { SUPPORT_EMAIL } from "@/lib/marketing/trust";
import { cn } from "@/lib/design-system/cn";

const trustPillars = [
  {
    title: "Privacy by design",
    copy: "Your vault holds information you choose to save. We do not sell personal data, and our privacy policy explains what is stored and why.",
    icon: Lock,
    href: MARKETING_ROUTES.privacy,
    linkLabel: "Read the privacy policy",
  },
  {
    title: "Data ownership",
    copy: "Your household records stay under your control. You decide what to add, update, or remove from your vault.",
    icon: KeyRound,
    href: MARKETING_ROUTES.trust,
    linkLabel: "Visit the Trust Center",
  },
  {
    title: "Household permissions",
    copy: "Family sharing uses role-based access so owners control who can view or edit devices, documents, and settings.",
    icon: Users,
    href: `${MARKETING_ROUTES.trust}#permissions`,
    linkLabel: "Learn about roles",
  },
] as const;

const trustQuestions = [
  {
    question: "Who can see my information?",
    answer:
      "Only you — and household members you explicitly invite on Family plans.",
  },
  {
    question: "How is my connection protected?",
    answer:
      "Home Tech Vault is served over HTTPS, which encrypts data in transit between your browser and the app.",
  },
] as const;

export default function LandingTrustSection() {
  return (
    <MarketingContent
      id={LANDING_SECTION_IDS.trust}
      className={cn(
        landingSectionClass,
        landingSectionAnchor
      )}
    >
      <PageCard
        elevated={false}
        className={cn(
          landingCardClass,
          landingMotionRise,
          "border-border-subtle bg-surface-sunken/30 p-7 md:p-10"
        )}
      >
        <div className="max-w-2xl">
          <h2 className="text-section-title text-text-primary">
            Built with privacy in mind.
          </h2>

          <p className="mt-3 text-sm leading-6 text-text-muted md:text-[0.9375rem] md:leading-7">
            Only you control who can access your Home Tech
            Vault.
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {trustPillars.map((pillar) => (
            <article
              key={pillar.title}
              className="rounded-[var(--radius-button)] border border-border-subtle/80 bg-surface-card px-5 py-5"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-button)] border border-border-subtle bg-surface-sunken text-text-primary">
                <pillar.icon
                  size={18}
                  strokeWidth={1.75}
                  aria-hidden
                />
              </span>

              <h3 className="mt-4 text-sm font-medium text-text-primary">
                {pillar.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-text-muted">
                {pillar.copy}
              </p>

              <Link
                href={pillar.href}
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-interaction underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interaction"
              >
                {pillar.linkLabel}
                <ArrowRight size={14} aria-hidden />
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-8 grid gap-6 border-t border-border-subtle/80 pt-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h3 className="text-sm font-medium text-text-primary">
              Common privacy questions
            </h3>

            <dl className="mt-4 space-y-4">
              {trustQuestions.map((item) => (
                <div key={item.question}>
                  <dt className="text-sm font-medium text-text-primary">
                    {item.question}
                  </dt>
                  <dd className="mt-1.5 text-sm leading-6 text-text-muted">
                    {item.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-[var(--radius-button)] border border-border-subtle/80 bg-surface-card px-5 py-5">
            <h3 className="text-sm font-medium text-text-primary">
              Questions about trust or privacy?
            </h3>

            <p className="mt-2 text-sm leading-6 text-text-muted">
              Visit the Trust Center for a fuller overview,
              or reach out if something is unclear.
            </p>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Link
                href={MARKETING_ROUTES.trust}
                className="inline-flex min-h-10 items-center justify-center rounded-[var(--radius-button)] border border-border-subtle bg-surface-base px-4 text-sm font-medium text-text-primary transition hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interaction"
              >
                Trust Center
              </Link>

              <Link
                href={MARKETING_ROUTES.contact}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[var(--radius-button)] px-4 text-sm font-medium text-interaction transition hover:text-interaction-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interaction"
              >
                <Mail size={15} aria-hidden />
                Contact
              </Link>
            </div>

            <p className="mt-4 text-xs text-text-tertiary">
              {SUPPORT_EMAIL}
            </p>
          </div>
        </div>
      </PageCard>
    </MarketingContent>
  );
}
