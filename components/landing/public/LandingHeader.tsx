"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  Menu,
  ShieldCheck,
  X,
} from "lucide-react";

import { MARKETING_ROUTES } from "@/lib/marketing/routes";

type LandingHeaderProps = {
  isSignedIn?: boolean;
};

const mainNav = [
  {
    label: "Features",
    href: "/features",
  },
  {
    label: "Demo",
    href: "/demo",
  },
  {
    label: "For Realtors",
    href: "/realtors",
  },
];

export default function LandingHeader({
  isSignedIn = false,
}: LandingHeaderProps) {
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] =
    useState(false);


  const isRealtorMarketing =
    pathname === "/realtors" ||
    pathname.startsWith("/realtors/");

  const primaryHref = isSignedIn
    ? "/dashboard"
    : isRealtorMarketing
      ? "/realtors/signup"
      : MARKETING_ROUTES.signup;

  const primaryLabel = isSignedIn
    ? "Open My Vault"
    : isRealtorMarketing
      ? "Realtor Sign Up"
      : "Start Free";

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#183047]/95 text-[#f5f1e8] backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between gap-5 px-5 md:px-8 lg:px-10">
        <Link
          href="/"
          aria-label="Home Tech Vault home"
          className="flex shrink-0 items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#718d4f]/40 bg-[#718d4f]/10 text-[#88a761]">
            <ShieldCheck
              size={20}
              strokeWidth={1.7}
              aria-hidden
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

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-1 lg:flex"
        >
          {mainNav.map((item) => {
            const active = isActive(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={[
                  "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-white/10 text-white"
                    : "text-[#c4c9cf] hover:bg-white/5 hover:text-white",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}

          <Link
            href={MARKETING_ROUTES.pricing}
            className={[
              "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive(
                MARKETING_ROUTES.pricing
              )
                ? "bg-white/10 text-white"
                : "text-[#c4c9cf] hover:bg-white/5 hover:text-white",
            ].join(" ")}
          >
            Pricing
          </Link>

          <Link
            href="/about"
            className={[
              "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive("/about")
                ? "bg-white/10 text-white"
                : "text-[#c4c9cf] hover:bg-white/5 hover:text-white",
            ].join(" ")}
          >
            About the Founder
          </Link>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {!isSignedIn ? (
            <Link
              href={MARKETING_ROUTES.login}
              className="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-xl border border-white/25 px-5 text-sm font-medium text-[#f5f1e8] transition hover:border-white/45 hover:bg-white/10"
            >
              Sign In
            </Link>
          ) : null}

          <Link
            href={primaryHref}
            className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-[#617c43]/50 bg-[#617c43] px-5 text-sm font-semibold text-white shadow-[0_10px_30px_-15px_rgba(97,124,67,0.8)] transition hover:bg-[#718d4f]"
          >
            {primaryLabel}

            <ArrowRight
              size={15}
              aria-hidden
            />
          </Link>
        </div>

        <button
          type="button"
          onClick={() =>
            setMobileOpen((value) => !value)
          }
          aria-label={
            mobileOpen
              ? "Close menu"
              : "Open menu"
          }
          aria-expanded={mobileOpen}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white md:hidden"
        >
          {mobileOpen ? (
            <X size={19} />
          ) : (
            <Menu size={19} />
          )}
        </button>
      </div>

      {mobileOpen ? (
        <div className="max-h-[calc(100vh-72px)] overflow-y-auto border-t border-white/10 bg-[#183047] px-5 pb-8 pt-4 overscroll-contain md:hidden">
          <nav className="mx-auto flex max-w-xl flex-col">
            <MobileHeading>
              Explore
            </MobileHeading>

            {mainNav.map((item) => (
              <MobileLink
                key={item.label}
                href={item.href}
                active={isActive(item.href)}
                onClick={() =>
                  setMobileOpen(false)
                }
              >
                {item.label}
              </MobileLink>
            ))}

            <MobileLink
              href={MARKETING_ROUTES.pricing}
              active={isActive(
                MARKETING_ROUTES.pricing
              )}
              onClick={() =>
                setMobileOpen(false)
              }
            >
              Pricing
            </MobileLink>

            <div className="my-3 h-px bg-white/10" />

            {!isSignedIn ? (
              <MobileLink
                href={MARKETING_ROUTES.login}
                active={isActive(
                  MARKETING_ROUTES.login
                )}
                onClick={() =>
                  setMobileOpen(false)
                }
              >
                Sign In
              </MobileLink>
            ) : null}

            <Link
              href={primaryHref}
              onClick={() =>
                setMobileOpen(false)
              }
              className="mt-4 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#617c43] px-6 text-sm font-semibold text-white"
            >
              {primaryLabel}

              <ArrowRight size={15} />
            </Link>

            {!isSignedIn ? (
              <p className="mt-3 text-center text-[11px] text-white/45">
                Free to start · No credit
                card required
              </p>
            ) : null}
          </nav>
        </div>
      ) : null}
    </header>
  );
}

function MobileHeading({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <p className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.17em] text-[#88a761]">
      {children}
    </p>
  );
}

function MobileLink({
  href,
  children,
  onClick,
  active,
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={[
        "rounded-xl px-3 py-3 text-sm font-medium transition",
        active
          ? "bg-white/10 text-white"
          : "text-[#c4c9cf] hover:bg-white/5 hover:text-white",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}
