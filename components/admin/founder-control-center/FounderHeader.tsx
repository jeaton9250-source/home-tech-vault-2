import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowUpRight,
  CircleCheck,
} from "lucide-react";

import Button from "@/components/ui/Button";
import {
  getTimeGreeting,
} from "@/lib/home-health/greeting";

type FounderHeaderProps = {
  firstName: string;
};

export default function FounderHeader({
  firstName,
}: FounderHeaderProps) {
  const greeting = firstName
    ? getTimeGreeting(firstName).replace(
        /\.$/,
        ""
      )
    : "Welcome back";

  return (
    <header className="relative overflow-hidden rounded-[30px] border border-[#182533]/[0.07] bg-[#fffdf9] px-7 py-8 shadow-[0_28px_70px_-54px_rgba(15,28,40,0.55)] md:px-9 md:py-9">
      <div
        aria-hidden="true"
        className="absolute right-0 top-0 h-56 w-56 translate-x-16 -translate-y-20 rounded-full bg-[#718d4f]/[0.06] blur-3xl"
      />

      <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-medium text-[#617c43]">
              {greeting}
            </p>

            <span className="inline-flex items-center gap-2 rounded-full border border-[#718d4f]/15 bg-[#718d4f]/[0.06] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#617c43]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#718d4f]/35" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#718d4f]" />
              </span>
              Platform operational
            </span>
          </div>

          <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8b847a]">
            Executive overview
          </p>

          <h1 className="mt-2 max-w-3xl font-serif text-[38px] font-semibold leading-[0.98] tracking-[-0.045em] text-[#17202a] md:text-[52px]">
            Founder Control Center
          </h1>

          <p className="mt-5 max-w-2xl text-[15px] leading-7 text-[#65615a] md:text-base">
            Your operating view of growth, customers,
            product activity, and platform health.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/analytics"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#182533]/10 bg-white px-4 text-sm font-medium text-[#47515a] transition hover:border-[#182533]/20 hover:text-[#17202a]"
          >
            View analytics
            <ArrowUpRight size={15} />
          </Link>

          <Button
            href="/admin/users"
            size="md"
          >
            Manage Users
          </Button>
        </div>
      </div>
    </header>
  );
}

export function FounderSection({
  title,
  subtitle,
  action,
  children,
  id,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section
      aria-labelledby={id}
      className="py-1"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2
            id={id}
            className="font-serif text-[24px] font-semibold tracking-[-0.035em] text-[#18202b]"
          >
            {title}
          </h2>

          {subtitle ? (
            <p className="mt-1.5 text-[14px] leading-6 text-[#6e6961]">
              {subtitle}
            </p>
          ) : null}
        </div>

        {action}
      </div>

      <div className="mt-5">
        {children}
      </div>
    </section>
  );
}

export function FounderLinkAction({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-sm font-medium text-[#617c43] transition hover:text-[#4e6636]"
    >
      {label}
      <ArrowUpRight
        aria-hidden="true"
        className="h-4 w-4"
      />
    </Link>
  );
}
