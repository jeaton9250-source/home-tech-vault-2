"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  {
    label: "What It Remembers",
    href: "/what-it-remembers",
  },
  {
    label: "Explore",
    href: "/explore",
  },
  {
    label: "For Realtors",
    href: "/realtors",
  },
  {
    label: "Pricing",
    href: "/pricing",
  },
  {
    label: "Our Story",
    href: "/our-story",
  },
];

export default function MarketingHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] =
    useState(false);

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
    <>
      <header className="sticky top-0 z-[100] w-full border-b border-white/[0.08] bg-[#132231]/95 text-white backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 sm:px-6 lg:px-10">
          {/* LOGO */}

          <Link
            href="/"
            className="flex shrink-0 items-center gap-3"
          >
            <span className="font-serif text-[28px] font-semibold leading-none tracking-[-0.04em] text-white">
              Home Tech
              <br />
              Vault
            </span>
          </Link>

          {/* DESKTOP NAV */}

          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-white/[0.08] text-white"
                      : "text-white/65 hover:bg-white/[0.05] hover:text-white",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* DESKTOP ACTIONS */}

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/login"
              className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/[0.06]"
            >
              Sign In
            </Link>

            <Link
              href="/realtors/signup"
              className="inline-flex items-center gap-2 rounded-full bg-[#a8a842] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#96963a]"
            >
              Realtor Sign Up
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* MOBILE MENU BUTTON */}

          <button
            type="button"
            onClick={() =>
              setMobileOpen((value) => !value)
            }
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white lg:hidden"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* MOBILE NAV */}

        {mobileOpen && (
          <div className="border-t border-white/[0.08] bg-[#132231] px-5 py-5 lg:hidden">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const active = isActive(
                  item.href
                );

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() =>
                      setMobileOpen(false)
                    }
                    className={[
                      "rounded-2xl px-4 py-3 text-sm font-medium transition",
                      active
                        ? "bg-white/[0.08] text-white"
                        : "text-white/70 hover:bg-white/[0.05] hover:text-white",
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>
                );
              })}

              <div className="my-3 h-px bg-white/[0.08]" />

              <Link
                href="/login"
                onClick={() =>
                  setMobileOpen(false)
                }
                className="rounded-2xl border border-white/15 px-4 py-3 text-center text-sm font-medium text-white"
              >
                Sign In
              </Link>

              <Link
                href="/realtors/signup"
                onClick={() =>
                  setMobileOpen(false)
                }
                className="mt-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#a8a842] px-4 py-3 text-sm font-semibold text-white"
              >
                Realtor Sign Up
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
