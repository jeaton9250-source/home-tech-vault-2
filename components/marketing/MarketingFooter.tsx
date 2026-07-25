import Link from "next/link";

import Logo from "@/components/brand/Logo";
import { brand } from "@/lib/design-system/tokens";
import {
  FOOTER_BRAND_DESCRIPTION,
  FOOTER_COPYRIGHT,
  FOOTER_GUIDE_LINKS,
  FOOTER_LEGAL_LINKS,
  FOOTER_PRODUCT_LINKS,
  FOOTER_SUPPORT_LINKS,
  type FooterLink,
} from "@/lib/marketing/footer";

export default function MarketingFooter() {
  return (
    <footer className="border-t border-border-subtle/80 bg-surface-card/30">
      <div className="mx-auto max-w-6xl px-8 py-16 md:px-10 md:py-20">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
          <div className="max-w-sm lg:max-w-md">
            <Logo />

            <p className="mt-4 text-sm leading-6 text-text-muted">
              {brand.tagline}
            </p>

            <p className="mt-3 text-sm leading-6 text-text-tertiary">
              {FOOTER_BRAND_DESCRIPTION}
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 sm:gap-10 lg:gap-12">
            <FooterColumn
              title="Product"
              links={FOOTER_PRODUCT_LINKS}
            />
            <FooterColumn
              title="Guides"
              links={FOOTER_GUIDE_LINKS}
            />
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

        <p className="mt-12 border-t border-border-subtle/80 pt-8 text-xs leading-5 text-text-tertiary">
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

      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={`${link.href}-${link.label}`}>
            <Link
              href={link.href}
              className="text-sm leading-6 text-text-secondary transition-colors duration-200 hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interaction"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
