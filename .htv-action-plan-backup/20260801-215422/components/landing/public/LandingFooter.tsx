import Link from "next/link";

import Logo from "@/components/brand/Logo";

const footerLinks = [
  { label: "About", href: "/about" },
  { label: "Pricing", href: "/pricing" },
  { label: "Compare", href: "/compare" },
  { label: "Trust Center", href: "/trust" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Contact", href: "/contact" },
] as const;

export default function LandingFooter() {
  return (
    <footer className="border-t border-border-subtle bg-surface-card px-5 py-10 md:px-8 lg:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div>
          <Logo collapsed />
          <p className="mt-3 max-w-md text-sm leading-6 text-text-muted">
            The home inventory and warranty tracker built for the technology you
            rely on every day.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-3" aria-label="Footer">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-text-secondary transition hover:text-text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <p className="mx-auto mt-8 max-w-6xl border-t border-border-subtle pt-6 text-xs text-text-muted">
        © {new Date().getFullYear()} Home Tech Vault. All rights reserved.
      </p>
    </footer>
  );
}
