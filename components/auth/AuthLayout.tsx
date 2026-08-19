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
        "relative min-h-[100dvh] overflow-x-hidden bg-[#eee9df] px-4 py-5 sm:px-5 sm:py-8",
        className
      )}
    >
      <div
        className="pointer-events-none absolute left-1/2 top-[-210px] h-[440px] w-[560px] -translate-x-1/2 rounded-full bg-[#617c43]/10 blur-[110px] sm:h-[520px] sm:w-[760px] sm:blur-[130px]"
        aria-hidden
      />

      <div
        className="pointer-events-none absolute bottom-[-260px] right-[-180px] hidden h-[520px] w-[520px] rounded-full bg-[#17212a]/5 blur-[130px] sm:block"
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-xl flex-col sm:min-h-[calc(100dvh-4rem)]">
        <header className="flex shrink-0 justify-center pt-1 sm:pt-5">
          <Link
            href={brandHref}
            className="rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#617c43]"
            aria-label="Home Tech Vault home"
          >
            <Logo />
          </Link>
        </header>

        <section className="flex flex-1 items-center justify-center py-6 sm:py-12">
          {children}
        </section>

        <footer className="flex shrink-0 flex-wrap items-center justify-center gap-x-4 gap-y-2 pb-[max(0.25rem,env(safe-area-inset-bottom))] text-[11px] text-[#7b858c] sm:gap-x-5 sm:pb-5 sm:text-xs">
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
