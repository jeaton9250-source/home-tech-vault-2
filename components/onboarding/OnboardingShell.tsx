"use client";

import { useEffect, useRef, type ReactNode } from "react";

import type { OnboardingStep } from "@/lib/onboarding/types";

type OnboardingShellProps = {
  step: OnboardingStep;
  children: ReactNode;
};

export default function OnboardingShell({
  step,
  children,
}: OnboardingShellProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    contentRef.current?.querySelector<HTMLElement>("h1")?.focus();
  }, [step]);
  const chapters: Record<OnboardingStep, string> = {
    welcome: "Welcome home", home: "A place to begin", device: "Remember",
    document: "Keep it together", network: "Stay connected", complete: "Your home record",
  };
  return (
    <main className="min-h-screen bg-[#f7f4ec] px-5 py-8 text-[#172c3e] md:px-8 md:py-14">
      <div className={`mx-auto w-full max-w-3xl ${step === "welcome" ? "flex min-h-[calc(100svh-7rem)] flex-col" : ""}`}>
        <p className="mb-12 font-serif text-xl">Home Tech Vault</p>
        <p className="sr-only" role="status" aria-live="polite">{chapters[step]}</p>
        <div ref={contentRef} key={step} className={`motion-safe:animate-[onboarding-arrive_350ms_ease-out] ${step === "welcome" ? "my-auto w-full" : ""}`}>
          <div className="py-4 md:py-8">{children}</div>
        </div>
      </div>
      <style>{`
        @keyframes onboarding-arrive { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes onboarding-welcome-reveal { from { opacity: 0.25; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @media (prefers-reduced-motion: no-preference) {
          .onboarding-welcome-title { animation: onboarding-welcome-reveal 650ms ease-out both; }
          .onboarding-welcome-copy { animation: onboarding-welcome-reveal 850ms ease-out both; }
          .onboarding-welcome-action { animation: onboarding-welcome-reveal 1000ms ease-out both; }
        }
      `}</style>
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
    <h1 tabIndex={-1} className="outline-none mt-3 font-serif text-4xl font-normal leading-tight tracking-[-0.025em] text-[#172c3e] md:text-6xl">
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
