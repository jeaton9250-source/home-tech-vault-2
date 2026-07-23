"use client";

import { useMemo, useState } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";

import LandingTrackedLink from "@/components/landing/public/LandingTrackedLink";
import { landingTheme } from "@/components/landing/public/landingTheme";
import {
  LANDING_ANALYTICS_EVENTS,
  trackLandingEvent,
} from "@/lib/marketing/landingAnalytics";
import {
  LANDING_ESTIMATOR_QUESTIONS,
  LANDING_PUBLIC_SECTION_IDS,
} from "@/lib/marketing/landingPublicContent";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";
import { cn } from "@/lib/design-system/cn";

type Answers = Record<string, number | undefined>;

function calculateEstimate(answers: Answers) {
  const devices = LANDING_ESTIMATOR_QUESTIONS.reduce(
    (total, question) =>
      total + (answers[question.id] ?? 0),
    0
  );

  const documents = devices * 2;
  const warranties = Math.round(devices * 0.65);
  const maintenance = Math.max(
    1,
    Math.round(devices * 0.35)
  );

  return {
    devices,
    documents,
    warranties,
    maintenance,
  };
}

type HomeVaultEstimatorProps = {
  isSignedIn?: boolean;
};

export default function HomeVaultEstimator({
  isSignedIn = false,
}: HomeVaultEstimatorProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);

  const currentQuestion =
    LANDING_ESTIMATOR_QUESTIONS[stepIndex];
  const selectedValue = currentQuestion
    ? answers[currentQuestion.id]
    : undefined;
  const isLastStep =
    stepIndex ===
    LANDING_ESTIMATOR_QUESTIONS.length - 1;
  const estimate = useMemo(
    () => calculateEstimate(answers),
    [answers]
  );

  const startHref = isSignedIn
    ? "/dashboard"
    : MARKETING_ROUTES.signup;

  const handleSelect = (value: number) => {
    if (!currentQuestion) {
      return;
    }

    if (!started) {
      setStarted(true);
      trackLandingEvent(
        LANDING_ANALYTICS_EVENTS.estimatorStarted
      );
    }

    setAnswers((current) => ({
      ...current,
      [currentQuestion.id]: value,
    }));
  };

  const handleContinue = () => {
    if (selectedValue === undefined) {
      return;
    }

    if (isLastStep) {
      setCompleted(true);
      trackLandingEvent(
        LANDING_ANALYTICS_EVENTS.estimatorCompleted,
        {
          estimated_devices: estimate.devices,
        }
      );
      return;
    }

    setStepIndex((index) => index + 1);
  };

  const handleBack = () => {
    if (completed) {
      return;
    }

    setStepIndex((index) => Math.max(index - 1, 0));
  };

  const handleRestart = () => {
    setStepIndex(0);
    setAnswers({});
    setStarted(false);
    setCompleted(false);
  };

  return (
    <section
      id={LANDING_PUBLIC_SECTION_IDS.estimator}
      className={cn(
        landingTheme.section,
        landingTheme.scrollAnchor
      )}
    >
      <div className={landingTheme.sectionNarrow}>
        <div className="mx-auto max-w-2xl text-center">
          <p className={landingTheme.eyebrow}>
            Quick estimate
          </p>
          <h2 className={cn(landingTheme.headline, "mt-3")}>
            What would your Home Tech Vault look like?
          </h2>
          <p className={cn(landingTheme.body, "mt-4")}>
            Answer four quick questions to see how much home
            technology you may already be managing.
          </p>
        </div>

        <div
          className={cn(
            landingTheme.card,
            "mx-auto mt-10 max-w-2xl p-6 md:p-8"
          )}
        >
          {!completed ? (
            <>
              <p className="text-sm font-medium text-[#667085]">
                Step {stepIndex + 1} of{" "}
                {LANDING_ESTIMATOR_QUESTIONS.length}
              </p>
              <h3 className="mt-3 text-xl font-medium text-[#172033]">
                {currentQuestion?.label}
              </h3>

              <div className="mt-6 grid gap-3">
                {currentQuestion?.options.map((option) => {
                  const isSelected =
                    selectedValue === option.value;

                  return (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() =>
                        handleSelect(option.value)
                      }
                      className={cn(
                        "rounded-2xl border px-4 py-4 text-left text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#183B56]",
                        isSelected
                          ? "border-[#3BAF75] bg-[#EAF8F0] text-[#172033]"
                          : "border-[#E7E9EC] bg-[#FAFAF8] text-[#667085] hover:border-[#183B56]/20"
                      )}
                      aria-pressed={isSelected}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={stepIndex === 0}
                  className="rounded-full px-4 py-2.5 text-sm font-medium text-[#667085] transition enabled:hover:text-[#172033] disabled:opacity-40"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={selectedValue === undefined}
                  className={cn(
                    landingTheme.btnPrimary,
                    "disabled:cursor-not-allowed disabled:opacity-50"
                  )}
                >
                  {isLastStep ? "See estimate" : "Continue"}
                  <ArrowRight
                    size={16}
                    className="ml-2"
                    aria-hidden
                  />
                </button>
              </div>
            </>
          ) : (
            <div>
              <p className="text-sm font-medium text-[#667085]">
                Estimated overview
              </p>
              <h3 className="mt-3 text-2xl font-medium tracking-[-0.03em] text-[#172033]">
                Your home may already have{" "}
                {estimate.devices} devices to keep track
                of.
              </h3>
              <p className="mt-4 text-sm leading-7 text-[#667085]">
                Home Tech Vault gives each one a permanent
                place for its receipts, warranties,
                manuals, photos, and maintenance history.
              </p>
              <p className="mt-2 text-xs text-[#667085]">
                These numbers are estimates based on your
                selections, not a scan of your home.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  {
                    label: "Devices",
                    value: estimate.devices,
                  },
                  {
                    label: "Documents",
                    value: estimate.documents,
                  },
                  {
                    label: "Warranties",
                    value: estimate.warranties,
                  },
                  {
                    label: "Maintenance reminders",
                    value: estimate.maintenance,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-[#E7E9EC] bg-[#FAFAF8] px-4 py-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
                      {item.label}
                    </p>
                    <p className="mt-1 text-2xl font-medium tabular-nums text-[#172033]">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <LandingTrackedLink
                  href={startHref}
                  eventName={
                    LANDING_ANALYTICS_EVENTS.heroStartFree
                  }
                  className={landingTheme.btnPrimary}
                >
                  Start Free
                </LandingTrackedLink>

                <button
                  type="button"
                  onClick={handleRestart}
                  className={landingTheme.btnSecondary}
                >
                  <RotateCcw
                    size={16}
                    className="mr-2"
                    aria-hidden
                  />
                  Restart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
