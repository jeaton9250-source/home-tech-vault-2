import type { ReactNode } from "react";

type AdminStatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
};

export default function AdminStatCard({
  label,
  value,
  hint,
  icon,
}: AdminStatCardProps) {
  return (
    <div className="rounded-[24px] border border-border-subtle bg-surface-card p-5 shadow-[var(--shadow-sm)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
            {label}
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-text-primary">
            {value}
          </p>

          {hint && (
            <p className="mt-2 text-xs leading-5 text-text-secondary">
              {hint}
            </p>
          )}
        </div>

        {icon ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-charcoal">
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}
