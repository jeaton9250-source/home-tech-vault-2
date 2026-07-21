"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import Logo from "@/components/brand/Logo";
import { useDemoMode } from "@/hooks/useDemoMode";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";
import { cn } from "@/lib/design-system/cn";

const navLinks = [
  { href: MARKETING_ROUTES.features, label: "Features" },
  { href: MARKETING_ROUTES.pricing, label: "Pricing" },
  { href: MARKETING_ROUTES.demo, label: "Demo" },
  { href: MARKETING_ROUTES.faq, label: "FAQ" },
  { href: MARKETING_ROUTES.contact, label: "Contact" },
] as const;

export default function MarketingNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] =
    useState(false);

  const { user, loading } = useDemoMode();

  const isSignedIn = Boolean(user);
  const startHref = isSignedIn
    ? "/dashboard"
    : MARKETING_ROUTES.signup;
  const startLabel = isSignedIn
    ? "Your Vault"
    : "Start Free";

  function isActive(href: string) {
    return pathname === href;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle/60 bg-surface-base/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between gap-4 px-6 md:px-8">
        <Link
          href={MARKETING_ROUTES.home}
          className="shrink-0"
          onClick={() => setMobileOpen(false)}
          aria-label="Home Tech Vault home"
        >
          <Logo collapsed />
        </Link>

        <nav
          className="hidden items-center gap-0.5 lg:flex"
          aria-label="Primary"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-[var(--radius-button)] px-3 py-2 text-sm font-medium transition-colors hover:text-text-primary",
                isActive(link.href)
                  ? "text-text-primary"
                  : "text-text-muted"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {!loading && !isSignedIn && (
            <Link
              href={MARKETING_ROUTES.login}
              className="rounded-[var(--radius-button)] px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:text-text-primary"
            >
              Sign In
            </Link>
          )}

          <Link
            href={startHref}
            className="inline-flex min-h-10 items-center justify-center rounded-[var(--radius-button)] bg-charcoal px-5 py-2 text-sm font-medium text-surface-card transition hover:bg-charcoal-hover"
          >
            {startLabel}
          </Link>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-button)] text-text-primary hover:bg-surface-sunken lg:hidden"
          aria-label={
            mobileOpen ? "Close menu" : "Open menu"
          }
          aria-expanded={mobileOpen}
          onClick={() =>
            setMobileOpen((open) => !open)
          }
        >
          {mobileOpen ? (
            <X size={20} />
          ) : (
            <Menu size={20} />
          )}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border-subtle bg-surface-base px-6 py-4 lg:hidden">
          <nav
            className="flex flex-col gap-1"
            aria-label="Primary mobile"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() =>
                  setMobileOpen(false)
                }
                className={cn(
                  "rounded-[var(--radius-button)] px-3 py-3 text-sm font-medium",
                  isActive(link.href)
                    ? "bg-surface-sunken text-text-primary"
                    : "text-text-muted"
                )}
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-3 flex flex-col gap-2 border-t border-border-subtle pt-4">
              {!isSignedIn && (
                <Link
                  href={MARKETING_ROUTES.login}
                  onClick={() =>
                    setMobileOpen(false)
                  }
                  className="rounded-[var(--radius-button)] border border-border-subtle px-4 py-3 text-center text-sm font-medium"
                >
                  Sign In
                </Link>
              )}

              <Link
                href={startHref}
                onClick={() =>
                  setMobileOpen(false)
                }
                className="rounded-[var(--radius-button)] bg-charcoal px-4 py-3 text-center text-sm font-medium text-surface-card"
              >
                {startLabel}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
