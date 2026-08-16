"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Menu,
  ShieldCheck,
  X,
} from "lucide-react";

import { landingTheme } from "@/components/landing/public/landingTheme";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";

type LandingHeaderProps = {
  isSignedIn?: boolean;
};

export default function LandingHeader({
  isSignedIn = false,
}: LandingHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const primaryHref = isSignedIn
    ? "/dashboard"
    : MARKETING_ROUTES.signup;

  const primaryLabel = isSignedIn
    ? "Open My Vault"
    : "Create My Free Vault";

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle/70 bg-surface-base/90 backdrop-blur-xl">
      <div
        className={`${landingTheme.sectionNarrow} flex h-16 items-center justify-between px-5 md:px-8 lg:px-0`}
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5"
          aria-label="Home Tech Vault home"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-home-health-soft text-home-health">
            <ShieldCheck
              size={19}
              aria-hidden
            />
          </div>

          <div className="leading-none">
            <p className="text-sm font-semibold tracking-tight text-text-primary sm:text-base">
              Home Tech Vault
            </p>

            <p className="mt-1 hidden text-[9px] font-medium uppercase tracking-[0.14em] text-text-muted sm:block">
              Your home. Organized.
            </p>
          </div>
        </Link>

        {/* Desktop navigation */}
        <nav
          className="hidden items-center gap-7 md:flex"
          aria-label="Main navigation"
        >
          <Link
            href="#how-it-works"
            className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            How It Works
          </Link>

          <Link
            href="#pricing"
            className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            Pricing
          </Link>

          <Link
            href={MARKETING_ROUTES.demo}
            className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            Demo
          </Link>
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          {!isSignedIn && (
            <Link
              href="/login"
              className="px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              Sign In
            </Link>
          )}

          <Link
            href={primaryHref}
            className={landingTheme.btnPrimary}
          >
            {primaryLabel}

            <ArrowRight
              size={15}
              className="ml-2"
              aria-hidden
            />
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileOpen((current) => !current)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-subtle bg-surface-card text-text-primary md:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <X
              size={19}
              aria-hidden
            />
          ) : (
            <Menu
              size={19}
              aria-hidden
            />
          )}
        </button>
      </div>

      {/* Mobile navigation */}
      {mobileOpen && (
        <div className="border-t border-border-subtle bg-surface-base px-5 pb-5 pt-4 md:hidden">
          <nav
            className="mx-auto flex max-w-xl flex-col gap-1"
            aria-label="Mobile navigation"
          >
            <MobileLink
              href="#how-it-works"
              onClick={() => setMobileOpen(false)}
            >
              How It Works
            </MobileLink>

            <MobileLink
              href="#pricing"
              onClick={() => setMobileOpen(false)}
            >
              Pricing
            </MobileLink>

            <MobileLink
              href={MARKETING_ROUTES.demo}
              onClick={() => setMobileOpen(false)}
            >
              See the Demo
            </MobileLink>

            {!isSignedIn && (
              <MobileLink
                href="/login"
                onClick={() => setMobileOpen(false)}
              >
                Sign In
              </MobileLink>
            )}

            <Link
              href={primaryHref}
              onClick={() => setMobileOpen(false)}
              className={`${landingTheme.btnPrimary} mt-3 w-full justify-center`}
            >
              {primaryLabel}

              <ArrowRight
                size={15}
                className="ml-2"
                aria-hidden
              />
            </Link>

            {!isSignedIn && (
              <p className="mt-3 text-center text-[11px] font-medium text-text-muted">
                Free to start · No credit card required
              </p>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

function MobileLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="rounded-xl px-3 py-3 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-sunken hover:text-text-primary"
    >
      {children}
    </Link>
  );
}