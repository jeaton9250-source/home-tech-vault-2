import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

import Button from "@/components/ui/Button";
import AdminGlobalSearch from "@/components/admin/founder-control-center/AdminGlobalSearch";
import { getTimeGreeting } from "@/lib/home-health/greeting";

type FounderHeaderProps = {
  firstName: string;
};

export default function FounderHeader({
  firstName,
}: FounderHeaderProps) {
  const greeting = firstName
    ? getTimeGreeting(firstName).replace(/\.$/, "")
    : "Welcome back";

  return (
    <header className="rounded-[28px] border border-border-subtle bg-surface-card p-6 shadow-[var(--shadow-sm)] md:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-interaction">
            {greeting}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-text-primary md:text-4xl">
            Founder Control Center
          </h1>
          <p className="mt-3 text-sm leading-7 text-text-secondary md:text-base">
            Everything happening across Home Tech
            Vault.
          </p>
        </div>

        <Button href="/admin/users" size="md">
          Manage Users
        </Button>
      </div>

      <div className="mt-8">
        <AdminGlobalSearch />
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
      className="rounded-[24px] border border-border-subtle bg-surface-card p-6 shadow-[var(--shadow-sm)] md:p-8"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2
            id={id}
            className="text-lg font-semibold tracking-[-0.02em] text-text-primary"
          >
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-1 text-sm leading-6 text-text-secondary">
              {subtitle}
            </p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="mt-6">{children}</div>
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
      className="inline-flex items-center gap-1 text-sm font-medium text-interaction transition hover:text-interaction/80"
    >
      {label}
      <ArrowUpRight
        aria-hidden="true"
        className="h-4 w-4"
      />
    </Link>
  );
}
