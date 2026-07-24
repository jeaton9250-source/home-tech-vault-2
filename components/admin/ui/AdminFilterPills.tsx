"use client";

import { cn } from "@/lib/design-system/cn";

export type AdminFilterOption = {
  id: string;
  label: string;
};

export default function AdminFilterPills({
  options,
  value,
  onChange,
}: {
  options: AdminFilterOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = value === option.id;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-medium transition",
              active
                ? "border-charcoal bg-charcoal text-surface-card shadow-sm"
                : "border-border-subtle bg-surface-card text-text-secondary hover:border-border-strong hover:text-text-primary"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
