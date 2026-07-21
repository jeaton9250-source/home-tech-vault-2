import Link from "next/link";

import Logo from "@/components/brand/Logo";
import { brand } from "@/lib/design-system/tokens";
import {
  FOOTER_BRAND_DESCRIPTION,
  FOOTER_COPYRIGHT,
  FOOTER_LEGAL_LINKS,
  FOOTER_PRODUCT_LINKS,
  FOOTER_SUPPORT_LINKS,
  type FooterLink,
} from "@/lib/marketing/footer";

export default function MarketingFooter() {
  return (
    <footer className="border-t border-border-subtle bg-surface-card/40">
      <div className="mx-auto max-w-6xl px-6 py-16 md:px-8 md:py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo />

            <p className="mt-4 text-sm font-medium leading-6 text-text-secondary">
              {brand.tagline}
            </p>

            <p className="mt-3 max-w-sm text-sm leading-7 text-text-muted">
              {FOOTER_BRAND_DESCRIPTION}
            </p>
          </div>

          <FooterColumn
            title="Product"
            links={FOOTER_PRODUCT_LINKS}
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

        <p className="mt-14 border-t border-border-subtle pt-8 text-xs text-text-tertiary">
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
  return (
    <div>
      <p className="text-overline text-text-muted">
        {title}
      </p>

      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={`${title}-${link.label}`}>
            <Link
              href={link.href}
              className="text-sm text-text-secondary transition hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interaction"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
