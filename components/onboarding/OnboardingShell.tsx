"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/design-system/cn";

import {
  ONBOARDING_STEP_COUNT,
  stepIndex,
} from "@/lib/onboarding/steps";

import type { OnboardingStep } from "@/lib/onboarding/types";

type OnboardingShellProps = {
  step: OnboardingStep;
  children: ReactNode;
};

export default function OnboardingShell({
  step,
  children,
}: OnboardingShellProps) {
  const current = stepIndex(step);
  const progressPercent = Math.round(
    (current / ONBOARDING_STEP_COUNT) * 100
  );

  return (
    <main className="min-h-screen bg-surface-sunken px-5 py-8 md:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <div
          className="mb-8"
          role="status"
          aria-live="polite"
          aria-label={`Onboarding step ${current} of ${ONBOARDING_STEP_COUNT}`}
        >
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-text-secondary">
              Step {current} of{" "}
              {ONBOARDING_STEP_COUNT}
            </p>

            <p className="text-sm text-text-tertiary">
              About 3 minutes
            </p>
          </div>

          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border-subtle">
            <div
              className={cn(
                "h-full rounded-full bg-charcoal transition-all duration-300"
              )}
              style={{
                width: `${progressPercent}%`,
              }}
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-[var(--radius-card)] border border-border-subtle bg-white shadow-sm">
          <div className="p-7 md:p-10">{children}</div>
        </div>
      </div>
    </main>
  );
}

export function OnboardingActions({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
      {children}
    </div>
  );
}

export function OnboardingEyebrow({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <p className="text-overline text-charcoal-soft">
      {children}
    </p>
  );
}

export function OnboardingTitle({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <h1 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-text-primary md:text-4xl">
      {children}
    </h1>
  );
}

export function OnboardingDescription({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <p className="mt-3 max-w-2xl text-base leading-7 text-text-secondary">
      {children}
    </p>
  );
}

const inputClassName =
  "w-full rounded-2xl border border-border-subtle bg-white px-4 py-3.5 text-text-primary outline-none transition placeholder:text-text-tertiary focus:border-interaction focus:ring-2 focus:ring-interaction/20";

export function OnboardingField({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block"
    >
      <span className="mb-2 block text-sm font-semibold text-text-primary">
        {label}
        {required ? (
          <span className="text-text-tertiary">
            {" "}
            *
          </span>
        ) : null}
      </span>

      {children}
    </label>
  );
}

export {
  inputClassName,
};
