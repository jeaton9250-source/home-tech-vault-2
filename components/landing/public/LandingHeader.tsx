"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import Logo from "@/components/brand/Logo";
import LandingTrackedLink from "@/components/landing/public/LandingTrackedLink";
import { landingTheme } from "@/components/landing/public/landingTheme";
import { LANDING_PUBLIC_SECTION_IDS } from "@/lib/marketing/landingPublicContent";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";
import { cn } from "@/lib/design-system/cn";

const NAV_LINKS = [
  {
    label: "How It Works",
    sectionId: LANDING_PUBLIC_SECTION_IDS.howItWorks,
  },
  {
    label: "Features",
    sectionId: LANDING_PUBLIC_SECTION_IDS.features,
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
    ? "Your Vault"
    : "Start Free";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-[#E7E9EC] bg-white/95 shadow-[0_8px_30px_-20px_rgba(23,32,51,0.18)] backdrop-blur-md"
          : "bg-[#FAFAF8]/80 backdrop-blur-sm"
      )}
    >
      <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between gap-4 px-5 md:px-8 lg:px-10">
        <Link
          href={MARKETING_ROUTES.home}
          className="shrink-0 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#183B56]"
          aria-label="Home Tech Vault home"
          onClick={() => setMobileOpen(false)}
        >
          <Logo collapsed />
        </Link>

        <nav
          className="hidden items-center gap-8 lg:flex"
          aria-label="Primary"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.sectionId}
              href={`#${link.sectionId}`}
              className="rounded-md px-1 py-2 text-sm text-[#667085] transition hover:text-[#172033] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#183B56]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {!isSignedIn ? (
            <>
              <Link
                href={MARKETING_ROUTES.demo}
                className="rounded-full px-3 py-2 text-sm text-[#667085] transition hover:text-[#172033] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#183B56]"
              >
                Demo
              </Link>

              <Link
                href={MARKETING_ROUTES.login}
                className="rounded-full px-3 py-2 text-sm text-[#667085] transition hover:text-[#172033] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#183B56]"
              >
                Sign In
              </Link>
            </>
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
              "min-h-10 px-4 py-2 text-xs"
            )}
          >
            {startLabel}
          </LandingTrackedLink>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E7E9EC] bg-white text-[#172033] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#183B56]"
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
        <div className="border-t border-[#E7E9EC] bg-white px-5 py-4 md:hidden">
          <nav
            className="flex flex-col gap-1"
            aria-label="Primary mobile"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.sectionId}
                href={`#${link.sectionId}`}
                className="rounded-xl px-3 py-3 text-sm font-medium text-[#667085] hover:bg-[#EDF3F7] hover:text-[#172033]"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}

            {!isSignedIn ? (
              <>
                <Link
                  href={MARKETING_ROUTES.demo}
                  className="rounded-xl px-3 py-3 text-sm font-medium text-[#667085] hover:bg-[#EDF3F7] hover:text-[#172033]"
                  onClick={() => setMobileOpen(false)}
                >
                  Explore Demo
                </Link>

                <Link
                  href={MARKETING_ROUTES.login}
                  className="mt-2 rounded-xl px-3 py-3 text-sm font-medium text-[#667085] hover:bg-[#EDF3F7]"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign In
                </Link>
              </>
            ) : null}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
