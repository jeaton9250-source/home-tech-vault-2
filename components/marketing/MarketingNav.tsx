"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import Logo from "@/components/brand/Logo";
import FoundingMembersBanner from "@/components/landing/FoundingMembersBanner";
import Button from "@/components/ui/Button";
import { useDemoMode } from "@/hooks/useDemoMode";
import type { PublicFoundingProgramSummary } from "@/lib/founding-members/types";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";
import { cn } from "@/lib/design-system/cn";

const fullNavLinks = [
  { href: MARKETING_ROUTES.features, label: "Features" },
  { href: MARKETING_ROUTES.pricing, label: "Pricing" },
  { href: MARKETING_ROUTES.demo, label: "Demo" },
  { href: MARKETING_ROUTES.faq, label: "FAQ" },
  { href: MARKETING_ROUTES.contact, label: "Contact" },
] as const;

const minimalNavLinks = [
  { href: MARKETING_ROUTES.features, label: "Features" },
] as const;

type MarketingNavProps = {
  foundingSummary?: PublicFoundingProgramSummary | null;
  minimal?: boolean;
};

export default function MarketingNav({
  foundingSummary = null,
  minimal = false,
}: MarketingNavProps = {}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] =
    useState(false);

  const { user, loading } = useDemoMode();

  const isSignedIn = Boolean(user);
  const startHref = isSignedIn
    ? "/dashboard"
    : MARKETING_ROUTES.signup;
  const startLabel = minimal
    ? isSignedIn
      ? "Your Vault"
      : "Create Your Vault"
    : isSignedIn
      ? "Your Vault"
      : "Start Free";

  const navLinks = minimal
    ? minimalNavLinks
    : fullNavLinks;

  function isActive(href: string) {
    return pathname === href;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-surface-base/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6 md:px-8">
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
                "rounded-[var(--radius-button)] px-3 py-2 text-sm font-medium transition-colors hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interaction",
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
              className="rounded-[var(--radius-button)] px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interaction"
            >
              Sign In
            </Link>
          )}

          <Button href={startHref} size="sm">
            {startLabel}
          </Button>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-button)] text-text-primary hover:bg-surface-sunken focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interaction lg:hidden"
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

      {!minimal &&
      !loading &&
      !isSignedIn &&
      foundingSummary ? (
        <FoundingMembersBanner
          summary={foundingSummary}
        />
      ) : null}

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
                <Button
                  href={MARKETING_ROUTES.login}
                  variant="secondary"
                  fullWidth
                  onClick={() =>
                    setMobileOpen(false)
                  }
                >
                  Sign In
                </Button>
              )}

              <Button
                href={startHref}
                fullWidth
                onClick={() =>
                  setMobileOpen(false)
                }
              >
                {startLabel}
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
