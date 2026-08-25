"use client";

import { useState } from "react";
import Link from "next/link";

import {
  ArrowRight,
  Menu,
  ShieldCheck,
  X,
} from "lucide-react";

import SignInLink from "@/components/auth/SignInLink";
import FoundingMembersBanner from "@/components/landing/FoundingMembersBanner";
import LandingAnnouncementBar from "@/components/marketing/LandingAnnouncementBar";
import MarketingNavLink from "@/components/marketing/MarketingNavLink";
import { useDemoMode } from "@/hooks/useDemoMode";
import type { PublicFoundingProgramSummary } from "@/lib/founding-members/types";
import { LANDING_NAV_LINKS } from "@/lib/marketing/landingNav";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";

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

  const startLabel = isSignedIn
    ? "Open My Vault"
    : "Create My Free Vault";

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#183047]/95 text-[#f5f1e8] backdrop-blur-xl">
      {minimal ? (
        <LandingAnnouncementBar />
      ) : null}

      <div className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between gap-6 px-5 md:px-8">
        {/* LOGO */}

        <Link
          href={MARKETING_ROUTES.home}
          onClick={() =>
            setMobileOpen(false)
          }
          aria-label="Home Tech Vault home"
          className="flex shrink-0 items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#718d4f]/35 bg-[#718d4f]/10 text-[#718d4f]">
            <ShieldCheck
              size={20}
              strokeWidth={1.7}
            />
          </div>

          <div className="leading-none">
            <p className="font-serif text-[17px] font-semibold tracking-[-0.02em] text-[#f5f1e8]">
              Home Tech
            </p>

            <p className="mt-1 font-serif text-[17px] font-semibold tracking-[-0.02em] text-[#f5f1e8]">
              Vault
            </p>
          </div>
        </Link>

        {/* DESKTOP NAV */}

        {!minimal ? (
          <nav
            className="hidden items-center gap-7 lg:flex"
            aria-label="Primary"
          >
            {LANDING_NAV_LINKS.map((link) => (
              <MarketingNavLink
                key={link.sectionId}
                label={link.label}
                sectionId={link.sectionId}
                className="text-sm font-medium text-[#b8c0c7] transition-colors hover:text-white"
              />
            ))}
          </nav>
        ) : (
          <nav
            className="hidden items-center gap-7 lg:flex"
            aria-label="Demo navigation"
          >
            <Link
              href="/"
              className="text-sm font-medium text-[#b8c0c7] transition hover:text-white"
            >
              Home
            </Link>

            <Link
              href="/#vault-overview"
              className="text-sm font-medium text-[#b8c0c7] transition hover:text-white"
            >
              The Vault
            </Link>

            <Link
              href="/#smart-import-demo"
              className="text-sm font-medium text-[#b8c0c7] transition hover:text-white"
            >
              Smart Import
            </Link>
          </nav>
        )}

        {/* ACTIONS */}

        <div className="hidden items-center gap-3 md:flex">
          {!loading && !isSignedIn ? (
            <SignInLink className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/50 px-5 text-sm font-medium text-[#f5f1e8] transition hover:bg-white/10">
              Sign In
            </SignInLink>
          ) : null}

          <Link
            href={startHref}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#718d4f]/45 bg-[#617c43] px-5 text-sm font-semibold text-white transition hover:bg-[#718d4f]"
          >
            {startLabel}

            <ArrowRight size={15} />
          </Link>
        </div>

        {/* MOBILE BUTTON */}

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/[0.03] text-white transition hover:bg-white/[0.08] lg:hidden"
          aria-label={
            mobileOpen
              ? "Close menu"
              : "Open menu"
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

      {/* MOBILE MENU */}

      {mobileOpen ? (
        <div className="border-t border-white/10 bg-[#183047] px-5 py-5 lg:hidden">
          <nav
            className="mx-auto flex max-w-xl flex-col gap-1"
            aria-label="Primary mobile"
          >
            {!minimal ? (
              LANDING_NAV_LINKS.map((link) => (
                <MarketingNavLink
                  key={link.sectionId}
                  label={link.label}
                  sectionId={link.sectionId}
                  onNavigate={() =>
                    setMobileOpen(false)
                  }
                  className="rounded-xl px-3 py-3 text-sm font-medium text-[#b8c0c7] transition hover:bg-white/5 hover:text-white"
                />
              ))
            ) : (
              <>
                <MobileLink
                  href="/"
                  onClick={() =>
                    setMobileOpen(false)
                  }
                >
                  Home
                </MobileLink>

                <MobileLink
                  href="/#vault-overview"
                  onClick={() =>
                    setMobileOpen(false)
                  }
                >
                  The Vault
                </MobileLink>

                <MobileLink
                  href="/#smart-import-demo"
                  onClick={() =>
                    setMobileOpen(false)
                  }
                >
                  Smart Import
                </MobileLink>
              </>
            )}

            <div className="mt-3 flex flex-col gap-2 border-t border-white/10 pt-4">
              {!isSignedIn ? (
                <SignInLink
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-white/40 px-4 text-sm font-medium text-[#f5f1e8]"
                  onClick={() =>
                    setMobileOpen(false)
                  }
                >
                  Sign In
                </SignInLink>
              ) : null}

              <Link
                href={startHref}
                onClick={() =>
                  setMobileOpen(false)
                }
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#617c43] px-5 text-sm font-semibold text-white"
              >
                {startLabel}

                <ArrowRight size={15} />
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
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
      className="rounded-xl px-3 py-3 text-sm font-medium text-[#b8c0c7] transition hover:bg-white/5 hover:text-white"
    >
      {children}
    </Link>
  );
}