import Link from "next/link";
import {
  ArrowRight,
  Mail,
  ShieldCheck,
} from "lucide-react";

import {
  MarketingContent,
  MarketingPageHero,
} from "@/components/marketing/MarketingLayout";
import {
  SECURITY_PILLARS,
  SUPPORT_EMAIL,
  TRUST_BAR_BADGES,
  WHY_TRUST_POINTS,
} from "@/lib/marketing/trust";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";

export default function TrustCenterContent() {
  return (
    <>
      <MarketingPageHero
        eyebrow="Trust Center"
        title="Trust, security, and transparency."
        description="Learn how Home Tech Vault protects your household information with secure authentication, privacy-first design, role-based sharing, and reliable cloud infrastructure."
      />

      <MarketingContent className="pt-0">
        <section aria-label="Trust highlights">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_BAR_BADGES.map(
              ({ id, label, description, icon: Icon }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="rounded-[var(--radius-card)] border border-border-subtle bg-surface-card p-5 shadow-[var(--shadow-sm)] transition hover:border-interaction/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interaction"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] bg-interaction-soft text-interaction">
                    <Icon size={18} aria-hidden />
                  </span>
                  <h2 className="mt-4 text-base font-medium text-text-primary">
                    {label}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-text-muted">
                    {description}
                  </p>
                </a>
              )
            )}
          </div>
        </section>

        <section className="mt-16">
          <p className="text-overline text-text-muted">
            Security pillars
          </p>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {SECURITY_PILLARS.map((pillar) => (
              <article
                key={pillar.id}
                id={pillar.id}
                className="scroll-mt-28 rounded-[var(--radius-card)] border border-border-subtle bg-surface-card p-7 shadow-[var(--shadow-sm)]"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] bg-interaction-soft text-interaction">
                  <pillar.icon
                    size={18}
                    aria-hidden
                  />
                </span>
                <h2 className="mt-4 text-xl font-medium tracking-[-0.02em]">
                  {pillar.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-text-muted">
                  {pillar.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <p className="text-overline text-text-muted">
            Why people trust us
          </p>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {WHY_TRUST_POINTS.map((point) => (
              <article
                key={point.title}
                className="rounded-[var(--radius-card)] border border-border-subtle bg-surface-card p-6"
              >
                <h3 className="text-lg font-medium">
                  {point.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-text-muted">
                  {point.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-[var(--radius-card)] border border-border-subtle bg-surface-card p-8 shadow-[var(--shadow-sm)] md:p-10">
          <div className="flex items-start gap-4">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-home-health-soft text-home-health">
              <ShieldCheck size={20} aria-hidden />
            </span>
            <div>
              <h2 className="text-2xl font-medium tracking-[-0.03em]">
                More resources
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-text-muted">
                Read our policies, browse common questions,
                or contact support if you need help.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <TrustLink
              href={MARKETING_ROUTES.privacy}
              label="Privacy Policy"
            />
            <TrustLink
              href={MARKETING_ROUTES.terms}
              label="Terms of Service"
            />
            <TrustLink
              href={MARKETING_ROUTES.faq}
              label="FAQ"
            />
            <TrustLink
              href={MARKETING_ROUTES.contact}
              label="Contact Support"
            />
          </div>

          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-interaction hover:text-interaction-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interaction"
          >
            <Mail size={16} aria-hidden />
            {SUPPORT_EMAIL}
          </a>
        </section>
      </MarketingContent>
    </>
  );
}

function TrustLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-button)] border border-border-subtle bg-surface-base px-4 py-2.5 text-sm font-medium text-text-primary transition hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interaction"
    >
      {label}
      <ArrowRight size={15} aria-hidden />
    </Link>
  );
}
