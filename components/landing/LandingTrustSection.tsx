import Link from "next/link";

import { MarketingContent } from "@/components/marketing/MarketingLayout";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";
import { TRUST_BAR_BADGES } from "@/lib/marketing/trust";

export default function LandingTrustSection() {
  return (
    <MarketingContent className="py-12 md:py-16">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {TRUST_BAR_BADGES.map(
          ({ id, label, href, icon: Icon }) => (
            <Link
              key={id}
              href={href}
              className="flex items-center gap-3 rounded-[var(--radius-button)] border border-border-subtle bg-surface-card px-4 py-3.5 shadow-[var(--shadow-sm)] transition hover:border-interaction/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interaction"
            >
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-interaction-soft text-interaction">
                <Icon size={16} aria-hidden />
              </span>
              <span className="text-sm font-medium text-text-primary">
                {label}
              </span>
            </Link>
          )
        )}
      </div>

      <p className="mt-6 max-w-2xl text-sm leading-6 text-text-muted">
        Your household data stays private and under your control.{" "}
        <Link
          href={MARKETING_ROUTES.privacy}
          className="font-medium text-interaction underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interaction"
        >
          Read our privacy policy
        </Link>{" "}
        or visit the{" "}
        <Link
          href={MARKETING_ROUTES.trust}
          className="font-medium text-interaction underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interaction"
        >
          Trust Center
        </Link>
        .
      </p>
    </MarketingContent>
  );
}
