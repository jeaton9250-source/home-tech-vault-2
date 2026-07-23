"use client";

import { type ReactNode, useEffect } from "react";
import { X } from "lucide-react";

type ConnectorModalProps = {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  maxWidthClassName?: string;
};

export default function ConnectorModal({
  open,
  title,
  description,
  children,
  onClose,
  maxWidthClassName = "max-w-2xl",
}: ConnectorModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/40 p-4 backdrop-blur-[2px]">
      <div
        className={`w-full ${maxWidthClassName} rounded-[28px] border border-border-subtle bg-surface-card p-6 shadow-2xl md:p-8`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="connector-modal-title"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="connector-modal-title"
              className="text-2xl font-semibold tracking-[-0.03em] text-text-primary"
            >
              {title}
            </h2>

            {description ? (
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                {description}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-surface-sunken text-text-secondary transition hover:text-text-primary"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
