import Link from "next/link";
import { ExternalLink } from "lucide-react";

import Logo from "@/components/brand/Logo";
import { brand } from "@/lib/design-system/tokens";
import {
  FOOTER_BOTTOM_LINKS,
  FOOTER_BRAND_DESCRIPTION,
  FOOTER_COMPANY_LINKS,
  FOOTER_LEGAL_LINKS,
  FOOTER_PRODUCT_LINKS,
  FOOTER_RESOURCE_LINKS,
  FOOTER_SOCIAL_LINKS,
  type FooterLink,
  type FooterSocialLink,
} from "@/lib/marketing/footer";

export default function MarketingFooter() {
  return (
    <footer className="border-t border-border-subtle bg-surface-card/40">
      <div className="mx-auto max-w-6xl px-6 py-16 md:px-8 md:py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-6">
          <div className="sm:col-span-2 lg:col-span-2">
            <Logo />

            <p className="mt-4 text-sm font-medium leading-6 text-text-secondary">
              {brand.tagline}
            </p>

            <p className="mt-3 max-w-sm text-sm leading-7 text-text-muted">
              {FOOTER_BRAND_DESCRIPTION}
            </p>

            <ul
              className="mt-6 flex flex-wrap items-center gap-2"
              aria-label="Social links"
            >
              {FOOTER_SOCIAL_LINKS.map((link) => (
                <li key={link.label}>
                  <FooterSocialLinkItem link={link} />
                </li>
              ))}
            </ul>
          </div>

          <FooterColumn
            title="Product"
            links={FOOTER_PRODUCT_LINKS}
          />
          <FooterColumn
            title="Resources"
            links={FOOTER_RESOURCE_LINKS}
          />
          <FooterColumn
            title="Company"
            links={FOOTER_COMPANY_LINKS}
          />
          <FooterColumn
            title="Legal"
            links={FOOTER_LEGAL_LINKS}
          />
        </div>

        <div className="mt-14 border-t border-border-subtle pt-8">
          <nav
            aria-label="Footer legal and utility links"
            className="flex flex-wrap items-center gap-x-2 gap-y-2 text-xs text-text-tertiary"
          >
            <span>© 2026 Home Tech Vault</span>

            {FOOTER_BOTTOM_LINKS.map((link) => (
              <span
                key={link.label}
                className="inline-flex items-center gap-2"
              >
                <span aria-hidden>•</span>

                {"comingSoon" in link ? (
                  <span>{link.label}</span>
                ) : (
                  <Link
                    href={link.href}
                    className="text-text-secondary transition hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interaction"
                  >
                    {link.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>
        </div>
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
            <FooterLinkItem link={link} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function FooterLinkItem({
  link,
}: {
  link: FooterLink;
}) {
  if ("comingSoon" in link) {
    return (
      <span className="text-sm text-text-tertiary">
        {link.label}
        <span className="sr-only">
          {" "}
          (coming soon)
        </span>
      </span>
    );
  }

  if (link.external) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary transition hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interaction"
      >
        {link.label}
        <ExternalLink
          size={13}
          aria-hidden
        />
      </a>
    );
  }

  return (
    <Link
      href={link.href}
      className="text-sm text-text-secondary transition hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interaction"
    >
      {link.label}
    </Link>
  );
}

function FooterSocialLinkItem({
  link,
}: {
  link: FooterSocialLink;
}) {
  const baseClassName =
    "inline-flex min-h-9 items-center rounded-[var(--radius-button)] border border-border-subtle px-3 text-xs font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interaction";

  if ("comingSoon" in link) {
    return (
      <span
        className={`${baseClassName} cursor-default border-border-subtle/80 bg-surface-sunken text-text-tertiary`}
      >
        {link.label}
        <span className="sr-only">
          {" "}
          (coming soon)
        </span>
      </span>
    );
  }

  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${baseClassName} bg-surface-card text-text-secondary hover:border-border-strong hover:bg-surface-hover hover:text-text-primary`}
    >
      {link.label}
    </a>
  );
}
