import Link from "next/link";
import Logo from "@/components/brand/Logo";
import { cn } from "@/lib/design-system/cn";
import { Check } from "lucide-react";
import type { ReactNode } from "react";

type AuthLayoutProps = {
  overline?: string;
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
    <li className="flex items-start gap-3 rounded-2xl border border-white/60 bg-white/50 px-4 py-3.5 shadow-[var(--shadow-sm)] backdrop-blur-sm">
      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-interaction-soft text-interaction">
        <Check size={12} strokeWidth={2.5} aria-hidden />
      </span>
      <span className="text-sm leading-6 text-text-secondary">
        {text}
      </span>
    </li>
  );
}

export default function AuthLayout({
  overline,
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
        "min-h-screen bg-surface-base px-4 py-6 md:px-8 md:py-10",
        className
      )}
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch lg:gap-0 lg:overflow-hidden lg:rounded-[32px] lg:border lg:border-border-subtle lg:bg-white lg:shadow-[var(--shadow-sm),var(--shadow-md)]">
          <section className="htv-auth-panel relative overflow-hidden px-6 py-8 md:px-10 md:py-12 lg:min-h-[680px] lg:px-12 lg:py-14">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.35]"
              aria-hidden
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(74, 111, 165, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(74, 111, 165, 0.06) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />

            <div className="pointer-events-none absolute -right-24 top-16 h-72 w-72 rounded-full bg-interaction-soft/80 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-home-health-soft/70 blur-3xl" />

            <div className="relative z-10">
              <Link
                href={brandHref}
                className="inline-flex rounded-[var(--radius-button)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interaction"
              >
                <Logo />
              </Link>

              {overline ? (
                <p className="mt-10 text-overline text-interaction">
                  {overline}
                </p>
              ) : null}

              <h2 className="mt-4 max-w-xl text-[clamp(2rem,4vw,3.25rem)] font-medium leading-[1.08] tracking-[-0.04em] text-text-primary">
                {headline}
              </h2>

              <p className="mt-5 max-w-lg text-base leading-7 text-text-muted md:text-lg md:leading-8">
                {description}
              </p>

              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {benefits.map((benefit) => (
                  <AuthBenefit
                    key={benefit}
                    text={benefit}
                  />
                ))}
              </ul>
            </div>
          </section>

          <section className="flex items-center justify-center px-2 py-2 lg:px-8 lg:py-12">
            {children}
          </section>
        </div>
      </div>
    </main>
  );
}
