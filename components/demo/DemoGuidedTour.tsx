"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import {
  ArrowDown,
  FileText,
  Home,
  Laptop,
  Sparkles,
  X,
} from "lucide-react";

import Button from "@/components/ui/Button";
import { MORGAN_HOUSEHOLD } from "@/lib/demo/morganHousehold";

type TourStep = {
  id: string;
  title: string;
  description: string;
  icon: typeof Home;
  href?: string;
  cta?: string;
};

const tourSteps: TourStep[] = [
  {
    id: "home-pulse",
    title: "This is Home Pulse",
    description:
      "Your entire home at a glance.",
    icon: Home,
    href: "/dashboard",
  },
  {
    id: "devices",
    title: "Every device has its own profile",
    description:
      "Photos, warranties, receipts, and notes — all in one place.",
    icon: Laptop,
    href: "/devices",
  },
  {
    id: "documents",
    title: "Store receipts, warranties, manuals and photos together",
    description:
      "Everything you need when something breaks or coverage expires.",
    icon: FileText,
    href: "/documents",
  },
  {
    id: "reports",
    title: "Generate reports for insurance and moving",
    description:
      "Export inventory, warranty, and insurance-ready summaries in seconds.",
    icon: Sparkles,
    href: "/reports",
  },
  {
    id: "create",
    title: "Now imagine this is your own home",
    description: `The ${MORGAN_HOUSEHOLD.name} took time to organize. Yours can look just like this.`,
    icon: Home,
    cta: "Create Your Vault",
  },
];

type DemoGuidedTourProps = {
  active: boolean;
  onFinish: () => void;
};

export default function DemoGuidedTour({
  active,
  onFinish,
}: DemoGuidedTourProps) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (active) {
      setStepIndex(0);
    }
  }, [active]);

  if (!active) {
    return null;
  }

  const step = tourSteps[stepIndex];
  const Icon = step.icon;
  const isLast = stepIndex === tourSteps.length - 1;

  function goNext() {
    if (isLast) {
      onFinish();
      router.push("/signup");
      return;
    }

    const nextStep = tourSteps[stepIndex + 1];

    if (nextStep.href) {
      router.push(nextStep.href);
    }

    setStepIndex((current) => current + 1);
  }

  function skipTour() {
    onFinish();
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-charcoal/30 p-4 pb-8 backdrop-blur-[1px] sm:items-center">
      <div
        className="w-full max-w-lg rounded-[28px] border border-border-subtle bg-surface-card p-6 shadow-2xl sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-tour-title"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-charcoal">
              <Icon size={20} aria-hidden />
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
              Step {stepIndex + 1} of {tourSteps.length}
            </p>
          </div>

          <button
            type="button"
            onClick={skipTour}
            aria-label="Skip tour"
            className="rounded-full p-2 text-text-secondary transition hover:bg-surface-sunken"
          >
            <X size={18} />
          </button>
        </div>

        <h2
          id="demo-tour-title"
          className="mt-5 text-xl font-semibold tracking-[-0.02em] text-text-primary"
        >
          {step.title}
        </h2>

        <p className="mt-2 text-sm leading-7 text-text-secondary">
          {step.description}
        </p>

        {!isLast ? (
          <div className="mt-4 flex justify-center text-text-tertiary">
            <ArrowDown size={18} aria-hidden />
          </div>
        ) : null}

        <div className="mt-6 flex items-center gap-3">
          {!isLast ? (
            <Button
              type="button"
              variant="ghost"
              onClick={skipTour}
            >
              Skip
            </Button>
          ) : null}

          <Button
            type="button"
            variant="primary"
            className="ml-auto"
            onClick={goNext}
          >
            {step.cta ?? (isLast ? "Create Your Vault" : "Next")}
          </Button>
        </div>

        <div className="mt-5 flex justify-center gap-1.5">
          {tourSteps.map((item, index) => (
            <span
              key={item.id}
              className={
                "h-1.5 rounded-full transition-all " +
                (index === stepIndex
                  ? "w-6 bg-charcoal"
                  : "w-1.5 bg-border-subtle")
              }
              aria-hidden
            />
          ))}
        </div>
      </div>
    </div>
  );
}
