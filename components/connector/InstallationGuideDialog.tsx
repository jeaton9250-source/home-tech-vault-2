"use client";

import { useMemo, useState } from "react";

import Button from "@/components/ui/Button";
import ConnectorDownloadButton from "@/components/connector/ConnectorDownloadButton";
import ConnectorModal from "@/components/connector/ConnectorModal";
import { CONNECTOR_INSTALLATION_STEPS } from "@/lib/connector/installationGuide";

type InstallationGuideDialogProps = {
  open: boolean;
  onClose: () => void;
};

export default function InstallationGuideDialog({
  open,
  onClose,
}: InstallationGuideDialogProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const steps = CONNECTOR_INSTALLATION_STEPS;
  const activeStep = steps[activeIndex];

  const progressLabel = useMemo(() => {
    return `Step ${activeIndex + 1} of ${steps.length}`;
  }, [activeIndex, steps.length]);

  function goNext() {
    setActiveIndex((current) =>
      Math.min(current + 1, steps.length - 1)
    );
  }

  function goBack() {
    setActiveIndex((current) => Math.max(current - 1, 0));
  }

  return (
    <ConnectorModal
      open={open}
      title="Installation Guide"
      description="Follow these steps to download, pair, and scan with the Home Tech Vault Connector."
      onClose={onClose}
      maxWidthClassName="max-w-3xl"
    >
      <div className="flex flex-wrap gap-2">
        {steps.map((step, index) => (
          <button
            key={step.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={
              "rounded-full px-3 py-1.5 text-xs font-semibold transition " +
              (index === activeIndex
                ? "bg-charcoal text-white"
                : "bg-surface-sunken text-text-secondary hover:text-text-primary")
            }
          >
            {index + 1}. {step.title}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-[24px] border border-border-subtle bg-surface-sunken p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-tertiary">
          {progressLabel}
        </p>
        <h3 className="mt-3 text-xl font-semibold text-text-primary">
          {activeStep.title}
        </h3>
        <p className="mt-3 text-sm leading-7 text-text-secondary">
          {activeStep.description}
        </p>
        {activeStep.detail ? (
          <p className="mt-3 text-sm leading-7 text-text-secondary">
            {activeStep.detail}
          </p>
        ) : null}

        {activeStep.id === "download" ? (
          <div className="mt-5">
            <ConnectorDownloadButton />
          </div>
        ) : null}

        {activeStep.actionHref && activeStep.actionLabel ? (
          <div className="mt-5">
            <Button href={activeStep.actionHref}>
              {activeStep.actionLabel}
            </Button>
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={goBack}
          disabled={activeIndex === 0}
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={
            activeIndex === steps.length - 1
              ? onClose
              : goNext
          }
        >
          {activeIndex === steps.length - 1
            ? "Done"
            : "Next step"}
        </Button>
      </div>
    </ConnectorModal>
  );
}
