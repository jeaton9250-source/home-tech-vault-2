import Link from "next/link";

import Logo from "@/components/brand/Logo";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";

const productLinks = [
  { href: MARKETING_ROUTES.features, label: "Features" },
  { href: MARKETING_ROUTES.pricing, label: "Pricing" },
  { href: MARKETING_ROUTES.demo, label: "Demo" },
] as const;

const resourceLinks = [
  { href: MARKETING_ROUTES.faq, label: "FAQ" },
  { href: MARKETING_ROUTES.contact, label: "Contact" },
] as const;

const companyLinks = [
  { href: MARKETING_ROUTES.home, label: "About" },
  { href: MARKETING_ROUTES.contact, label: "Contact" },
] as const;

const legalLinks = [
  { href: MARKETING_ROUTES.privacy, label: "Privacy" },
  { href: MARKETING_ROUTES.terms, label: "Terms" },
] as const;

export default function MarketingFooter() {
  return (
    <footer className="border-t border-border-subtle bg-surface-card/40">
      <div className="mx-auto max-w-6xl px-6 py-16 md:px-8 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div>
            <Logo />

            <p className="mt-5 text-sm font-medium leading-7 text-text-secondary">
              Organize.
              <br />
              Protect.
              <br />
              Simplify.
            </p>
          </div>

          <FooterColumn
            title="Product"
            links={productLinks}
          />
          <FooterColumn
            title="Resources"
            links={resourceLinks}
          />
          <FooterColumn
            title="Company"
            links={companyLinks}
          />
          <FooterColumn
            title="Legal"
            links={legalLinks}
          />
        </div>

        <p className="mt-14 border-t border-border-subtle pt-8 text-xs text-text-tertiary">
          © {new Date().getFullYear()} Home Tech Vault
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
  links: ReadonlyArray<{
    href: string;
    label: string;
  }>;
}) {
  return (
    <div>
      <p className="text-overline text-text-muted">
        {title}
      </p>

      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={`${title}-${link.href}`}>
            <Link
              href={link.href}
              className="text-sm text-text-secondary transition hover:text-text-primary"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
