import Link from "next/link";

import { TRUST_BAR_BADGES } from "@/lib/marketing/trust";

export default function TrustBar() {
  return (
    <section
      aria-label="Trust highlights"
      className="border-y border-border-subtle bg-surface-card/60 px-6 py-5 md:px-8"
    >
      <div className="mx-auto grid max-w-6xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {TRUST_BAR_BADGES.map(
          ({ id, label, description, href, icon: Icon }) => (
            <Link
              key={id}
              href={href}
              className="group flex items-start gap-3 rounded-[var(--radius-button)] border border-border-subtle bg-surface-card px-4 py-3.5 shadow-[var(--shadow-sm)] transition hover:border-interaction/30 hover:shadow-[var(--shadow-md)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interaction"
            >
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-interaction-soft text-interaction">
                <Icon size={16} aria-hidden />
              </span>

              <span className="min-w-0">
                <span className="block text-sm font-medium text-text-primary group-hover:text-interaction">
                  {label}
                </span>
                <span className="mt-0.5 block text-xs leading-5 text-text-muted">
                  {description}
                </span>
              </span>
            </Link>
          )
        )}
      </div>
    </section>
  );
}
