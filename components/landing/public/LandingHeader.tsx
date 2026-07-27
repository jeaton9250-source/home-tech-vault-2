"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, Sparkles } from "lucide-react";

import SignInLink from "@/components/auth/SignInLink";
import Logo from "@/components/brand/Logo";
import LandingTrackedLink from "@/components/landing/public/LandingTrackedLink";
import { landingTheme } from "@/components/landing/public/landingTheme";
import { LANDING_PUBLIC_SECTION_IDS } from "@/lib/marketing/landingPublicContent";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";
import { cn } from "@/lib/design-system/cn";

const NAV_LINKS = [
  {
    label: "Home Health",
    sectionId: LANDING_PUBLIC_SECTION_IDS.homeHealth,
  },
  {
    label: "Advisor",
    sectionId: LANDING_PUBLIC_SECTION_IDS.advisor,
  },
  {
    label: "Pricing",
    sectionId: LANDING_PUBLIC_SECTION_IDS.pricing,
  },
] as const;

type LandingHeaderProps = {
  isSignedIn?: boolean;
};

export default function LandingHeader({
  isSignedIn = false,
}: LandingHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const startHref = isSignedIn
    ? "/dashboard"
    : MARKETING_ROUTES.signup;
  const startLabel = isSignedIn
    ? "Open Home OS"
    : "Experience Free";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300 px-4 py-3 md:px-8",
        scrolled
          ? "border-b border-border-subtle/70 bg-surface-card/85 backdrop-blur-xl shadow-md"
          : "bg-surface-base/80 backdrop-blur-md"
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4">
        <Link
          href={MARKETING_ROUTES.home}
          className="shrink-0 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal"
          aria-label="Home Tech Vault home"
          onClick={() => setMobileOpen(false)}
        >
          <Logo collapsed />
        </Link>

        <nav
          className="hidden items-center gap-1 rounded-full border border-border-subtle/70 bg-surface-card/90 px-3 py-1.5 shadow-sm backdrop-blur-lg lg:flex"
          aria-label="Primary"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.sectionId}
              href={`#${link.sectionId}`}
              className="rounded-full px-4 py-1.5 text-xs font-semibold text-text-secondary transition-all hover:bg-surface-hover hover:text-text-primary focus-visible:outline-none"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href={MARKETING_ROUTES.demo}
            className="flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-text-secondary transition hover:bg-surface-hover hover:text-text-primary"
          >
            <Sparkles size={14} className="text-premium" />
            <span>Live Demo</span>
          </Link>

          {!isSignedIn ? (
            <SignInLink className="rounded-full px-4 py-2 text-xs font-semibold text-text-secondary transition hover:bg-surface-hover hover:text-text-primary">
              Sign In
            </SignInLink>
          ) : null}

          <LandingTrackedLink
            href={startHref}
            className={landingTheme.btnPrimary}
          >
            {startLabel}
          </LandingTrackedLink>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <LandingTrackedLink
            href={startHref}
            className={cn(
              landingTheme.btnPrimary,
              "min-h-9 px-4 py-1.5 text-xs"
            )}
          >
            {startLabel}
          </LandingTrackedLink>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-surface-card text-text-primary shadow-sm"
            aria-label={
              mobileOpen ? "Close menu" : "Open menu"
            }
            aria-expanded={mobileOpen}
            onClick={() =>
              setMobileOpen((open) => !open)
            }
          >
            {mobileOpen ? (
              <X size={18} />
            ) : (
              <Menu size={18} />
            )}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="mt-3 rounded-3xl border border-border-subtle bg-surface-card p-5 shadow-xl md:hidden">
          <nav
            className="flex flex-col gap-2"
            aria-label="Primary mobile"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.sectionId}
                href={`#${link.sectionId}`}
                className="rounded-2xl px-4 py-3 text-sm font-semibold text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}

            <Link
              href={MARKETING_ROUTES.demo}
              className="rounded-2xl px-4 py-3 text-sm font-semibold text-text-secondary hover:bg-surface-hover hover:text-text-primary"
              onClick={() => setMobileOpen(false)}
            >
              Explore Demo
            </Link>

            {!isSignedIn ? (
              <SignInLink
                className="rounded-2xl px-4 py-3 text-sm font-semibold text-text-secondary hover:bg-surface-hover"
                onClick={() => setMobileOpen(false)}
              >
                Sign In
              </SignInLink>
            ) : null}
          </nav>
        </div>
      ) : null}
    </header>
  );
}

