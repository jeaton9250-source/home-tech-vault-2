import Link from "next/link";
import Logo from "@/components/brand/Logo";
import { cn } from "@/lib/design-system/cn";
import { Check } from "lucide-react";
import type { ReactNode } from "react";

type AuthLayoutProps = {
  headline: string;
  description: string;
  benefits: string[];
  brandHref?: string;
  children: ReactNode;
  className?: string;
};

function AuthBenefit({
  text,
}: {
  text: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-interaction/15 text-interaction">
        <Check size={12} strokeWidth={2.5} aria-hidden />
      </span>
      <span className="text-sm leading-6 text-text-secondary">
        {text}
      </span>
    </li>
  );
}

export default function AuthLayout({
  headline,
  description,
  benefits,
  brandHref = "/",
  children,
  className,
}: AuthLayoutProps) {
  return (
    <main
      className={cn(
        "min-h-screen bg-surface-base",
        className
      )}
    >
      <div className="lg:grid lg:min-h-screen lg:grid-cols-2">
        {/* Form panel — first on mobile, right on desktop */}
        <section className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:min-h-0 lg:px-10 lg:py-12 xl:px-16">
          {children}
        </section>

        {/* Brand panel — desktop only */}
        <section
          className="htv-auth-panel relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:px-12 lg:py-14 xl:px-16"
          aria-hidden="true"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(74, 111, 165, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(74, 111, 165, 0.06) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          <div className="pointer-events-none absolute -right-20 top-12 h-64 w-64 rounded-full bg-interaction-soft/80 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-home-health-soft/70 blur-3xl" />

          <div className="relative z-10">
            <Link
              href={brandHref}
              tabIndex={-1}
              className="inline-flex rounded-[var(--radius-button)]"
            >
              <Logo />
            </Link>
          </div>

          <div className="relative z-10 max-w-md">
            <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] font-medium leading-[1.12] tracking-[-0.03em] text-text-primary">
              {headline}
            </h2>

            <p className="mt-4 text-base leading-7 text-text-muted">
              {description}
            </p>

            <ul className="mt-8 space-y-4">
              {benefits.slice(0, 3).map((benefit) => (
                <AuthBenefit
                  key={benefit}
                  text={benefit}
                />
              ))}
            </ul>
          </div>

          <div className="relative z-10" aria-hidden />
        </section>
      </div>
    </main>
  );
}
