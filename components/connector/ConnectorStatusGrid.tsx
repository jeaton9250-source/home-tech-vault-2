"use client";

import { cn } from "@/lib/design-system/cn";

type ConnectorStatusItem = {
  label: string;
  value: string;
  detail?: string;
};

type ConnectorStatusGridProps = {
  items: ConnectorStatusItem[];
  className?: string;
};

export default function ConnectorStatusGrid({
  items,
  className,
}: ConnectorStatusGridProps) {
  return (
    <dl
      className={cn(
        "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
        className
      )}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-[22px] border border-border-subtle bg-surface-sunken p-4"
        >
          <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
            {item.label}
          </dt>
          <dd className="mt-2 text-lg font-semibold text-text-primary">
            {item.value}
          </dd>
          {item.detail ? (
            <p className="mt-1 text-xs leading-5 text-text-secondary">
              {item.detail}
            </p>
          ) : null}
        </div>
      ))}
    </dl>
  );
}
