"use client";

import { Home } from "lucide-react";

import Button from "@/components/ui/Button";
import { MORGAN_HOUSEHOLD } from "@/lib/demo/morganHousehold";

type DemoWelcomeModalProps = {
  open: boolean;
  onExplore: () => void;
  onStartTour: () => void;
};

export default function DemoWelcomeModal({
  open,
  onExplore,
  onStartTour,
}: DemoWelcomeModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/40 p-4 backdrop-blur-[2px]">
      <div
        className="w-full max-w-md rounded-[28px] border border-border-subtle bg-surface-card p-8 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-welcome-title"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-sunken text-2xl">
          🏠
        </div>

        <h2
          id="demo-welcome-title"
          className="mt-6 text-2xl font-semibold tracking-[-0.03em] text-text-primary"
        >
          Welcome to the {MORGAN_HOUSEHOLD.name}
        </h2>

        <p className="mt-3 text-sm leading-7 text-text-secondary">
          You&apos;re exploring a fully organized Home Tech Vault.
          Take a guided tour or explore at your own pace.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Button
            type="button"
            variant="primary"
            fullWidth
            onClick={onStartTour}
          >
            Start Tour
          </Button>

          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={onExplore}
          >
            Explore on My Own
          </Button>
        </div>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-text-tertiary">
          <Home size={13} aria-hidden />
          Interactive Demo
        </p>
      </div>
    </div>
  );
}
