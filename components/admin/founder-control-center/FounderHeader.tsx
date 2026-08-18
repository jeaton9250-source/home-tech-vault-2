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
    <header className="flex flex-col gap-5 border-b border-[#ded8ce] pb-7 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm font-medium text-[#617c43]">
            {greeting}
          </p>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#718d4f]/20 bg-[#718d4f]/8 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.13em] text-[#617c43]">
            <CircleCheck size={12} />
            Production Live
          </span>
        </div>

        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-[#17202a] md:text-[40px] md:leading-none">
          Founder Control Center
        </h1>

        <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#5d5a54] md:text-base">
          Growth, customers, product activity,
          and platform health in one place.
        </p>
      </div>

      <Button
        href="/admin/users"
        size="md"
      >
        Manage Users
      </Button>
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
            className="text-xl font-semibold tracking-[-0.025em] text-[#18202b]"
          >
            {title}
          </h2>

          {subtitle ? (
            <p className="mt-1 text-[15px] leading-6 text-[#5d5a54]">
              {subtitle}
            </p>
          ) : null}
        </div>

        {action}
      </div>

      <div className="mt-4">
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
