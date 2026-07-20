"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Menu,
  PlayCircle,
  ShieldCheck,
  X,
} from "lucide-react";

import { useDemoMode } from "@/hooks/useDemoMode";

import VaultMockup from "@/components/marketing/VaultMockup";
import LandingFeatures from "@/components/marketing/LandingFeatures";
import LandingShowcase from "@/components/marketing/LandingShowcase";
import LandingFooter from "@/components/marketing/LandingFooter";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Demo", href: "/demo" },
];

export default function LandingPage() {
  const router = useRouter();
  const { user, startDemo } = useDemoMode();
  const [menuOpen, setMenuOpen] = useState(false);

  const isSignedIn = Boolean(user);

  function handleExploreDemo() {
    startDemo();
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#F7F5EF]">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-[#E8E2D6]/70 bg-[#F7F5EF]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#111827] text-[#C8A96A]">
              <ShieldCheck size={18} />
            </div>
            <span className="text-base font-bold tracking-tight text-[#111827]">
              Home Tech Vault
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-sm font-medium text-[#6B7280] transition hover:text-[#111827]"
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {isSignedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-[#111827] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#263044]"
              >
                Go to Your Vault
                <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-[#111827] transition hover:opacity-70"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-full bg-[#111827] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#263044]"
                >
                  Start Free
                  <ArrowRight size={16} />
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E8E2D6] bg-white text-[#111827] md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-[#E8E2D6] bg-[#F7F5EF] px-5 py-4 md:hidden">
            <nav className="flex flex-col gap-1">
              {navLinks.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-2 py-2.5 text-sm font-medium text-[#111827]"
                >
                  {label}
                </Link>
              ))}
              <div className="mt-2 flex flex-col gap-2">
                {isSignedIn ? (
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#111827] px-5 py-3 text-sm font-semibold text-white"
                  >
                    Go to Your Vault
                    <ArrowRight size={16} />
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center rounded-full border border-[#E8E2D6] bg-white px-5 py-3 text-sm font-semibold text-[#111827]"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/signup"
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#111827] px-5 py-3 text-sm font-semibold text-white"
                    >
                      Start Free
                      <ArrowRight size={16} />
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-5 pt-16 md:px-8 md:pt-24">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#E8E2D6] bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#C8A96A]">
            <ShieldCheck size={14} />
            Organize. Protect. Simplify.
          </span>

          <h1 className="mt-7 text-5xl font-bold leading-[1.05] tracking-tight text-[#111827] text-balance md:text-7xl">
            The home for all your home technology.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#6B7280] text-pretty md:text-xl">
            Catalog every device, track every warranty, and keep every document
            in one beautifully simple vault. Home Tech Vault helps you protect
            what you own — without the spreadsheets.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {isSignedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#111827] px-7 py-3.5 text-base font-semibold text-white transition hover:bg-[#263044] sm:w-auto"
              >
                Go to Your Vault
                <ArrowRight size={18} />
              </Link>
            ) : (
              <Link
                href="/signup"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#111827] px-7 py-3.5 text-base font-semibold text-white transition hover:bg-[#263044] sm:w-auto"
              >
                Start Free
                <ArrowRight size={18} />
              </Link>
            )}

            <button
              type="button"
              onClick={handleExploreDemo}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#E8E2D6] bg-white px-7 py-3.5 text-base font-semibold text-[#111827] transition hover:border-[#C8A96A] sm:w-auto"
            >
              <PlayCircle size={18} />
              Explore Demo
            </button>
          </div>

          <p className="mt-4 text-xs text-[#9CA3AF]">
            No credit card required · Explore the full demo instantly
          </p>
        </div>

        {/* Product mockup */}
        <div className="mx-auto mt-16 max-w-5xl md:mt-20">
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute inset-x-8 -top-6 bottom-0 rounded-[36px] bg-[#C8A96A]/15 blur-2xl"
            />
            <div className="relative">
              <VaultMockup />
            </div>
          </div>
        </div>
      </section>

      <LandingFeatures />

      <LandingShowcase />

      {/* Closing CTA */}
      <section className="bg-[#F7F5EF] px-5 py-24 md:px-8 md:py-32">
        <div className="mx-auto max-w-4xl rounded-[40px] bg-[#111827] px-8 py-16 text-center md:px-16 md:py-20">
          <h2 className="text-4xl font-bold leading-tight tracking-tight text-white text-balance md:text-5xl">
            Start protecting what you own today.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/60 text-pretty">
            Set up your vault in minutes. Add your first devices, upload your
            documents, and never lose track of a warranty again.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {isSignedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#C8A96A] px-7 py-3.5 text-base font-semibold text-[#111827] transition hover:brightness-105 sm:w-auto"
              >
                Go to Your Vault
                <ArrowRight size={18} />
              </Link>
            ) : (
              <Link
                href="/signup"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#C8A96A] px-7 py-3.5 text-base font-semibold text-[#111827] transition hover:brightness-105 sm:w-auto"
              >
                Create your vault
                <ArrowRight size={18} />
              </Link>
            )}

            <button
              type="button"
              onClick={handleExploreDemo}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-white/5 sm:w-auto"
            >
              <PlayCircle size={18} />
              Explore Demo
            </button>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
