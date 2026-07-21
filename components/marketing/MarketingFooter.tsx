import Link from "next/link";

import Logo from "@/components/brand/Logo";
import { brand } from "@/lib/design-system/tokens";
import {
  FOOTER_BRAND_DESCRIPTION,
  FOOTER_COPYRIGHT,
  FOOTER_LEGAL_LINKS,
  FOOTER_SUPPORT_LINKS,
  type FooterLink,
} from "@/lib/marketing/footer";

export default function MarketingFooter() {
  return (
    <footer className="border-t border-border-subtle bg-surface-card/40">
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-8 md:py-24">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between lg:gap-20">
          <div className="max-w-md border-b border-border-subtle pb-12 lg:border-b-0 lg:pb-0">
            <Logo />

            <p className="mt-5 text-sm font-medium leading-6 text-text-secondary">
              {brand.tagline}
            </p>

            <p className="mt-4 text-sm leading-7 text-text-muted">
              {FOOTER_BRAND_DESCRIPTION}
            </p>
          </div>

          <div className="grid gap-12 sm:grid-cols-2 sm:gap-16 lg:gap-20">
            <FooterColumn
              title="Support"
              links={FOOTER_SUPPORT_LINKS}
            />
            <FooterColumn
              title="Legal"
              links={FOOTER_LEGAL_LINKS}
            />
          </div>
        </div>

        <p className="mt-16 border-t border-border-subtle pt-10 text-xs text-text-tertiary">
          {FOOTER_COPYRIGHT}
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: FooterLink[];
}) {
  const headingId = `footer-${title.toLowerCase()}`;

  return (
    <nav aria-labelledby={headingId}>
      <p
        id={headingId}
        className="text-overline text-text-muted"
      >
        {title}
      </p>

      <ul className="mt-5 space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-sm text-text-secondary transition hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interaction"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
