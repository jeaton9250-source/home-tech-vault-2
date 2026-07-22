"use client";

import { Home, Laptop, FileText, ShieldCheck } from "lucide-react";

import Button from "@/components/ui/Button";
import { MORGAN_DEMO_STATS, MORGAN_HOUSEHOLD } from "@/lib/demo/morganHousehold";

type DemoWelcomeModalProps = {
  open: boolean;
  onExplore: () => void;
  onStartTour: () => void;
};

const statItems = [
  { label: "Devices", value: MORGAN_DEMO_STATS.devices, icon: Laptop },
  {
    label: "Documents",
    value: MORGAN_DEMO_STATS.documents,
    icon: FileText,
  },
  {
    label: "Active Warranties",
    value: MORGAN_DEMO_STATS.activeWarranties,
    icon: ShieldCheck,
  },
  {
    label: "Subscriptions",
    value: MORGAN_DEMO_STATS.subscriptions,
    icon: Home,
  },
];

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
        className="w-full max-w-lg rounded-[28px] border border-border-subtle bg-surface-card p-8 shadow-2xl"
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
          Explore how one family keeps every piece of home technology
          organized.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {statItems.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-[20px] bg-surface-sunken px-4 py-3.5"
            >
              <div className="flex items-center gap-2 text-text-tertiary">
                <Icon size={14} aria-hidden />
                <span className="text-xs font-medium">{label}</span>
              </div>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-text-primary">
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Button
            type="button"
            variant="primary"
            fullWidth
            onClick={onStartTour}
          >
            Start Guided Tour
          </Button>

          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={onExplore}
          >
            Explore Freely
          </Button>
        </div>
      </div>
    </div>
  );
}
