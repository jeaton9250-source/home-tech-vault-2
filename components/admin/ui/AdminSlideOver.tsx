"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/design-system/cn";

type AdminSlideOverProps = {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  widthClassName?: string;
};

export default function AdminSlideOver({
  open,
  title,
  subtitle,
  onClose,
  children,
  footer,
  widthClassName = "max-w-xl",
}: AdminSlideOverProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70]">
      <button
        type="button"
        aria-label="Close panel"
        className="absolute inset-0 bg-charcoal/30 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <aside
        className={cn(
          "absolute inset-y-0 right-0 flex w-full flex-col border-l border-border-subtle bg-surface-card shadow-[var(--shadow-lg)]",
          widthClassName
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-border-subtle px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold tracking-[-0.02em] text-text-primary">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-1 text-sm leading-6 text-text-secondary">
                {subtitle}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border-subtle p-2 text-text-secondary transition hover:bg-surface-sunken hover:text-text-primary"
          >
            <X size={16} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {footer ? (
          <footer className="border-t border-border-subtle px-6 py-4">
            {footer}
          </footer>
        ) : null}
      </aside>
    </div>
  );
}
