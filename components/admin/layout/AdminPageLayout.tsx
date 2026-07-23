import type { ReactNode } from "react";
import { Search } from "lucide-react";

import Button from "@/components/ui/Button";
import { cn } from "@/lib/design-system/cn";

type AdminPageHeroProps = {
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    href: string;
  };
  action?: ReactNode;
  badge?: ReactNode;
};

export function AdminPageHero({
  title,
  description,
  primaryAction,
  action,
  badge,
}: AdminPageHeroProps) {
  return (
    <header className="rounded-[28px] border border-border-subtle bg-surface-card p-6 shadow-[var(--shadow-sm)] md:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-text-primary md:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-7 text-text-secondary md:text-base">
            {description}
          </p>
          {badge ? <div className="mt-4">{badge}</div> : null}
        </div>
        {action ? (
          <div className="shrink-0">{action}</div>
        ) : primaryAction ? (
          <Button href={primaryAction.href} size="md">
            {primaryAction.label}
          </Button>
        ) : null}
      </div>
    </header>
  );
}

export function AdminContentSection({
  title,
  subtitle,
  action,
  children,
  id,
  className,
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <section
      aria-labelledby={id}
      className={cn(
        "rounded-[24px] border border-border-subtle bg-surface-card p-6 shadow-[var(--shadow-sm)] md:p-8",
        className
      )}
    >
      {title ? (
        <div className="mb-6 flex items-start justify-between gap-4">
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
      ) : null}
      {children}
    </section>
  );
}

export function AdminSummaryCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: number | string;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-border-subtle bg-surface-card p-6 shadow-[var(--shadow-sm)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-text-tertiary">
            {label}
          </p>
          <p className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-text-primary">
            {typeof value === "number"
              ? value.toLocaleString()
              : value}
          </p>
          {hint ? (
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              {hint}
            </p>
          ) : null}
        </div>
        {icon ? (
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-charcoal">
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function AdminSummaryGrid({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {children}
    </div>
  );
}

export function AdminSearchField({
  id,
  label,
  value,
  onChange,
  placeholder,
  className,
}: {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      {label ? (
        <span className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-text-tertiary">
          {label}
        </span>
      ) : null}
      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary"
        />
        <input
          id={id}
          type="search"
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
          }}
          placeholder={placeholder}
          className="w-full rounded-[20px] border border-border-subtle bg-surface-card py-3.5 pl-11 pr-4 text-sm text-text-primary shadow-[var(--shadow-sm)] outline-none transition placeholder:text-text-tertiary focus-visible:border-interaction/40 focus-visible:ring-2 focus-visible:ring-interaction/15"
        />
      </div>
    </label>
  );
}

export function AdminFilterSelect({
  label,
  value,
  onChange,
  options,
  className,
  includeAll = true,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  className?: string;
  includeAll?: boolean;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-text-tertiary">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        className="w-full rounded-[20px] border border-border-subtle bg-surface-card px-4 py-3.5 text-sm text-text-primary shadow-[var(--shadow-sm)] outline-none transition focus-visible:border-interaction/40 focus-visible:ring-2 focus-visible:ring-interaction/15"
      >
        {includeAll ? <option value="">All</option> : null}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function AdminSearchFilters({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AdminContentSection>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {children}
      </div>
    </AdminContentSection>
  );
}

export function AdminLoadingState({
  label = "Loading…",
}: {
  label?: string;
}) {
  return (
    <div
      role="status"
      className="flex min-h-40 items-center justify-center rounded-[20px] border border-border-subtle bg-surface-sunken px-4 py-10 text-sm text-text-secondary"
    >
      <span className="inline-flex items-center gap-3">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-border-subtle border-t-charcoal" />
        {label}
      </span>
    </div>
  );
}

export function AdminErrorState({
  message,
}: {
  message: string;
}) {
  return (
    <div
      role="alert"
      className="rounded-[20px] border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800"
    >
      {message}
    </div>
  );
}

export function AdminEmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[20px] border border-border-subtle bg-surface-sunken px-5 py-10 text-center">
      <p className="font-medium text-text-primary">{title}</p>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        {description}
      </p>
    </div>
  );
}

export function AdminList({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ul className="divide-y divide-border-subtle overflow-hidden rounded-[20px] border border-border-subtle">
      {children}
    </ul>
  );
}

export function AdminListItem({
  children,
  onClick,
  selected,
}: {
  children: ReactNode;
  onClick?: () => void;
  selected?: boolean;
}) {
  const className = cn(
    "block w-full bg-surface-sunken px-4 py-4 text-left transition",
    selected
      ? "bg-surface-card ring-1 ring-inset ring-charcoal/10"
      : "hover:bg-surface-card",
    onClick && "cursor-pointer"
  );

  if (onClick) {
    return (
      <li>
        <button type="button" className={className} onClick={onClick}>
          {children}
        </button>
      </li>
    );
  }

  return (
    <li className={className}>{children}</li>
  );
}

export function AdminPagination({
  page,
  totalPages,
  totalLabel,
  onPrevious,
  onNext,
  hasPreviousPage,
  hasNextPage,
}: {
  page: number;
  totalPages: number;
  totalLabel: string;
  onPrevious: () => void;
  onNext: () => void;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}) {
  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-text-secondary">
        Page {page} of {totalPages} · {totalLabel}
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={!hasPreviousPage}
          onClick={onPrevious}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={!hasNextPage}
          onClick={onNext}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export function AdminStatusBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
}) {
  const toneClasses = {
    neutral:
      "border-border-subtle bg-surface-sunken text-text-secondary",
    success:
      "border-emerald-200 bg-emerald-50 text-emerald-800",
    warning:
      "border-amber-200 bg-amber-50 text-amber-800",
    danger: "border-red-200 bg-red-50 text-red-800",
    info: "border-interaction/20 bg-interaction/5 text-interaction",
  }[tone];

  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]",
        toneClasses
      )}
    >
      {children}
    </span>
  );
}

export function AdminDetailField({
  label,
  value,
  copyValue,
  onCopy,
}: {
  label: string;
  value: string;
  copyValue?: string;
  onCopy?: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border-subtle pb-4 last:border-b-0 last:pb-0">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-text-tertiary">
          {label}
        </p>
        <p className="mt-1 break-all text-sm text-text-primary">
          {value}
        </p>
      </div>
      {copyValue && onCopy ? (
        <button
          type="button"
          onClick={onCopy}
          className="rounded-xl border border-border-subtle px-2 py-1 text-xs text-text-secondary transition hover:bg-surface-sunken"
        >
          Copy
        </button>
      ) : null}
    </div>
  );
}
