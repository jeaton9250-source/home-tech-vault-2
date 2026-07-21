"use client";

import { Sparkles, X } from "lucide-react";

import Button from "@/components/ui/Button";

type DemoReadOnlyModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function DemoReadOnlyModal({
  open,
  onClose,
}: DemoReadOnlyModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/40 p-4 backdrop-blur-[2px]">
      <div
        className="w-full max-w-md rounded-[28px] border border-border-subtle bg-surface-card p-8 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-readonly-title"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-charcoal text-surface-card">
            <Sparkles size={20} aria-hidden />
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 text-text-secondary transition hover:bg-surface-sunken"
          >
            <X size={18} />
          </button>
        </div>

        <h2
          id="demo-readonly-title"
          className="mt-5 text-xl font-semibold tracking-[-0.02em] text-text-primary"
        >
          Ready to build your own Home Tech Vault?
        </h2>

        <p className="mt-3 text-sm leading-7 text-text-secondary">
          Create your free vault to save and manage your own
          information.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Button href="/signup" variant="primary" fullWidth>
            Create Your Vault
          </Button>

          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={onClose}
          >
            Continue Exploring
          </Button>
        </div>
      </div>
    </div>
  );
}
