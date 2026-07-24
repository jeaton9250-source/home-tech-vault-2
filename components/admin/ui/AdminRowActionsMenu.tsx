"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/design-system/cn";

export type AdminRowAction = {
  id: string;
  label: string;
  onClick: () => void;
  tone?: "default" | "danger";
  disabled?: boolean;
};

export default function AdminRowActionsMenu({
  actions,
  label = "Open actions",
}: {
  actions: AdminRowAction[];
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        !rootRef.current?.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handlePointerDown
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handlePointerDown
      );
    };
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={label}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((current) => !current);
        }}
        className="rounded-full border border-border-subtle p-2 text-text-secondary transition hover:bg-surface-sunken hover:text-text-primary"
      >
        <MoreHorizontal size={16} />
      </button>

      {open ? (
        <div className="absolute right-0 z-20 mt-2 min-w-44 overflow-hidden rounded-2xl border border-border-subtle bg-surface-card p-1 shadow-[var(--shadow-md)]">
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              disabled={action.disabled}
              onClick={(event) => {
                event.stopPropagation();
                setOpen(false);
                action.onClick();
              }}
              className={cn(
                "flex w-full rounded-xl px-3 py-2 text-left text-sm transition hover:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-50",
                action.tone === "danger"
                  ? "text-rose-700"
                  : "text-text-primary"
              )}
            >
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function AdminTableShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-border-subtle bg-surface-card shadow-[var(--shadow-sm)]">
      <div className="hidden md:block">{children}</div>
    </div>
  );
}

export function AdminMobileCards({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="grid gap-3 md:hidden">{children}</div>
  );
}

export function AdminMobileCard({
  children,
  onClick,
  selected = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  selected?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-[20px] border bg-surface-card p-4 text-left shadow-[var(--shadow-sm)] transition hover:border-border-strong",
        selected
          ? "border-charcoal ring-1 ring-charcoal/10"
          : "border-border-subtle"
      )}
    >
      {children}
    </button>
  );
}

export function AdminSortButton({
  label,
  active,
  direction,
  onClick,
}: {
  label: string;
  active: boolean;
  direction: "asc" | "desc";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 text-left text-xs font-semibold uppercase tracking-[0.12em]",
        active
          ? "text-text-primary"
          : "text-text-tertiary hover:text-text-secondary"
      )}
    >
      {label}
      <span aria-hidden="true">
        {active
          ? direction === "asc"
            ? "↑"
            : "↓"
          : "↕"}
      </span>
    </button>
  );
}
