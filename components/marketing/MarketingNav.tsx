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
import {
  marketingPrimaryButtonClass,
  marketingSecondaryButtonClass,
} from "@/lib/marketing/landingStyles";
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
    <header className="sticky top-0 z-50 border-b border-border-subtle/80 bg-surface-base/90 backdrop-blur-md">
      <div
        className={cn(
          "mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between px-8 lg:px-10",
          minimal ? "gap-8" : "gap-4"
        )}
      >
        <Link
          href={MARKETING_ROUTES.home}
          className="shrink-0"
          onClick={() => setMobileOpen(false)}
          aria-label="Home Tech Vault home"
        >
          <Logo collapsed />
        </Link>

        <nav
          className={cn(
            "hidden items-center lg:flex",
            minimal ? "gap-10" : "gap-0.5"
          )}
          aria-label="Primary"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-[var(--radius-button)] px-1 py-2 text-[0.9375rem] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interaction",
                minimal
                  ? "font-normal"
                  : "px-3 font-medium",
                isActive(link.href)
                  ? minimal
                    ? "text-interaction"
                    : "text-text-primary"
                  : "text-text-muted hover:text-text-primary"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {!loading && !isSignedIn && (
            <Link
              href={MARKETING_ROUTES.login}
              className="rounded-[var(--radius-button)] px-3 py-2 text-[0.9375rem] font-normal text-text-muted transition-colors duration-200 hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interaction"
            >
              Sign In
            </Link>
          )}

          <Button
            href={startHref}
            size="sm"
            className={
              minimal
                ? marketingPrimaryButtonClass
                : undefined
            }
          >
            {startLabel}
          </Button>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-button)] text-text-primary transition-colors duration-200 hover:bg-surface-sunken focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interaction lg:hidden"
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
        <div className="border-t border-border-subtle bg-surface-base px-8 py-4 lg:hidden">
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
                    ? "bg-surface-sunken text-interaction"
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
                  className={marketingSecondaryButtonClass}
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
                className={
                  minimal
                    ? marketingPrimaryButtonClass
                    : undefined
                }
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
