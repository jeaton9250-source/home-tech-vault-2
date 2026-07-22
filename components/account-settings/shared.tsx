"use client";

import type { ComponentType, ReactNode } from "react";

export function SettingsCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className="rounded-[var(--radius-card)] border border-border-subtle bg-surface-card p-6 shadow-[var(--shadow-sm)] md:p-8">
      <div>
        <h2 className="text-xl font-semibold tracking-[-0.02em] text-text-primary">
          {title}
        </h2>

        {description ? (
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {description}
          </p>
        ) : null}
      </div>

      <div className="mt-6">{children}</div>

      {footer ? (
        <div className="mt-6 border-t border-border-subtle pt-6">
          {footer}
        </div>
      ) : null}
    </section>
  );
}

export function ReadOnlyRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-surface-sunken px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-text-secondary">
        {label}
      </span>

      <span className="text-sm font-medium text-text-primary sm:text-right">
        {value}
      </span>
    </div>
  );
}

export function FormField({
  label,
  icon: Icon,
  value,
  placeholder,
  onChange,
  type = "text",
  disabled = false,
  helperText,
}: {
  label: string;
  icon: ComponentType<{
    size?: number;
    className?: string;
  }>;
  value: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  type?: string;
  disabled?: boolean;
  helperText?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-text-primary">
        {label}
      </span>

      <div className="relative">
        <Icon
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary"
        />

        <input
          type={type}
          value={value}
          disabled={disabled}
          onChange={(event) =>
            onChange?.(event.target.value)
          }
          placeholder={placeholder}
          className="h-11 w-full rounded-xl border border-border-subtle bg-white px-11 text-sm text-text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-text-secondary"
        />
      </div>

      {helperText ? (
        <p className="mt-2 text-xs leading-5 text-text-tertiary">
          {helperText}
        </p>
      ) : null}
    </label>
  );
}

export function formatMemberSince(
  value: string | null
) {
  if (!value) {
    return "Recently joined";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently joined";
  }

  return date.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatSubscriptionDate(
  value: string
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
