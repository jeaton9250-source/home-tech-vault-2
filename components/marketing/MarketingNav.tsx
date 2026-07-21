"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import Logo from "@/components/brand/Logo";
import FoundingMembersBanner from "@/components/landing/FoundingMembersBanner";
import LandingAnnouncementBar from "@/components/marketing/LandingAnnouncementBar";
import MarketingNavLink from "@/components/marketing/MarketingNavLink";
import Button from "@/components/ui/Button";
import { useDemoMode } from "@/hooks/useDemoMode";
import type { PublicFoundingProgramSummary } from "@/lib/founding-members/types";
import { LANDING_NAV_LINKS } from "@/lib/marketing/landingNav";
import {
  marketingPrimaryButtonClass,
  marketingSecondaryButtonClass,
} from "@/lib/marketing/landingStyles";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";
import { cn } from "@/lib/design-system/cn";

type MarketingNavProps = {
  foundingSummary?: PublicFoundingProgramSummary | null;
  minimal?: boolean;
};

export default function MarketingNav({
  foundingSummary = null,
  minimal = false,
}: MarketingNavProps = {}) {
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

  const navLinkClassName = cn(
    "rounded-[var(--radius-button)] px-1 py-2 text-[0.9375rem] font-normal transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interaction",
    minimal
      ? "text-text-muted hover:text-text-primary"
      : "px-3 text-text-muted hover:text-text-primary"
  );

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle/80 bg-surface-base/90 backdrop-blur-md">
      {minimal ? <LandingAnnouncementBar /> : null}

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
            minimal ? "gap-8 xl:gap-10" : "gap-6"
          )}
          aria-label="Primary"
        >
          {LANDING_NAV_LINKS.map((link) => (
            <MarketingNavLink
              key={link.sectionId}
              label={link.label}
              sectionId={link.sectionId}
              className={navLinkClassName}
            />
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
            {LANDING_NAV_LINKS.map((link) => (
              <MarketingNavLink
                key={link.sectionId}
                label={link.label}
                sectionId={link.sectionId}
                onNavigate={() =>
                  setMobileOpen(false)
                }
                className="rounded-[var(--radius-button)] px-3 py-3 text-sm font-medium text-text-muted hover:bg-surface-sunken hover:text-text-primary"
              />
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
