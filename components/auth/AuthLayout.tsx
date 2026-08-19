import Link from "next/link";
import type { ReactNode } from "react";

import Logo from "@/components/brand/Logo";
import { cn } from "@/lib/design-system/cn";

type AuthLayoutProps = {
  headline: string;
  description: string;
  benefits: string[];
  brandHref?: string;
  children: ReactNode;
  className?: string;
};

export default function AuthLayout({
  brandHref = "/",
  children,
  className,
}: AuthLayoutProps) {
  return (
    <main
      className={cn(
        "relative min-h-screen overflow-hidden bg-[#eee9df] px-5 py-8",
        className
      )}
    >
      {/* Soft brand atmosphere */}
      <div
        className="pointer-events-none absolute left-1/2 top-[-220px] h-[520px] w-[760px] -translate-x-1/2 rounded-full bg-[#617c43]/10 blur-[130px]"
        aria-hidden
      />

      <div
        className="pointer-events-none absolute bottom-[-260px] right-[-180px] h-[520px] w-[520px] rounded-full bg-[#17212a]/5 blur-[130px]"
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-xl flex-col">
        {/* Brand */}
        <header className="flex justify-center pt-2 sm:pt-5">
          <Link
            href={brandHref}
            className="rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#617c43]"
            aria-label="Home Tech Vault home"
          >
            <Logo />
          </Link>
        </header>

        {/* Auth content */}
        <section className="flex flex-1 items-center justify-center py-10 sm:py-12">
          {children}
        </section>

        {/* Quiet footer */}
        <footer className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pb-2 text-xs text-[#7b858c] sm:pb-5">
          <span>Secure authentication</span>

          <span
            className="hidden h-1 w-1 rounded-full bg-[#17212a]/20 sm:block"
            aria-hidden
          />

          <Link
            href="/privacy"
            className="transition hover:text-[#17212a]"
          >
            Privacy
          </Link>

          <Link
            href="/terms"
            className="transition hover:text-[#17212a]"
          >
            Terms
          </Link>
        </footer>
      </div>
    </main>
  );
}
