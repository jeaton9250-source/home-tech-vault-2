"use client";

import Link from "next/link";

import {
  ArrowRight,
  Check,
  Circle,
  FileText,
  Laptop,
  Sparkles,
} from "lucide-react";

type VaultSetupProgressProps = {
  deviceCount: number;
  documentCount: number;
  hasHousehold: boolean;
  canCreate: boolean;
};

type SetupStep = {
  id: string;
  label: string;
  complete: boolean;
};

export default function VaultSetupProgress({
  deviceCount,
  documentCount,
  hasHousehold,
  canCreate,
}: VaultSetupProgressProps) {
  const steps: SetupStep[] = [
    {
      id: "account",
      label: "Account created",
      complete: true,
    },
    {
      id: "home",
      label: "Home created",
      complete: hasHousehold,
    },
    {
      id: "first-device",
      label: "Add your first device",
      complete: deviceCount >= 1,
    },
    {
      id: "three-devices",
      label: "Add 3 devices",
      complete: deviceCount >= 3,
    },
    {
      id: "document",
      label: "Save a receipt or document",
      complete: documentCount >= 1,
    },
  ];

  const completedCount =
    steps.filter(
      (step) => step.complete
    ).length;

  const percentage =
    Math.round(
      (completedCount / steps.length) *
        100
    );

  const setupComplete =
    completedCount === steps.length;

  /*
   * Once setup is fully complete the onboarding
   * card gets out of the way. The normal dashboard
   * becomes the primary experience.
   */
  /*
   * Before the 3-device milestone, the dedicated
   * DashboardUnlockGate owns the onboarding
   * experience. Avoid showing two competing setup
   * cards on the dashboard.
   */
  if (deviceCount < 3) {
    return null;
  }

  if (setupComplete) {
    return null;
  }

  const hasNoDevices =
    deviceCount === 0;

  const buildingStarterVault =
    deviceCount > 0 &&
    deviceCount < 3;

  const needsDocument =
    deviceCount >= 3 &&
    documentCount === 0;

  let eyebrow =
    "Your Vault Setup";

  let title =
    "Build your Home Tech Vault.";

  let description =
    "Start with one device you would hate to lose the details for — your TV, computer, refrigerator, router, or another important piece of technology.";

  let primaryHref =
    "/devices/add";

  let primaryLabel =
    "Add my first device";

  if (buildingStarterVault) {
    eyebrow =
      "Great start";

    const remaining =
      Math.max(3 - deviceCount, 0);

    title =
      remaining === 1
        ? "One more device to reach your first milestone."
        : `${remaining} more devices to build your starter vault.`;

    description =
      "A few real devices make Home Tech Vault much more useful. Add the technology you rely on most first.";

    primaryHref =
      "/devices/add";

    primaryLabel =
      "Add another device";
  }

  if (needsDocument) {
    eyebrow =
      "First milestone complete";

    title =
      "Now protect the information behind your devices.";

    description =
      "Save one receipt, warranty, manual, or other document so important device information is available when you actually need it.";

    primaryHref =
      "/documents/upload";

    primaryLabel =
      "Save my first document";
  }

  /*
   * After the user reaches the first 3-device
   * milestone, setup stops behaving like a hero.
   * The dashboard should now be the primary view.
   */
  if (needsDocument) {
    return (
      <section
        aria-labelledby="vault-setup-title"
        className="overflow-hidden rounded-[22px] border border-[#152638] bg-[#0b1623] text-white shadow-[0_18px_45px_-38px_rgba(11,22,35,0.8)]"
      >
        <div className="flex flex-col gap-4 px-5 py-4 sm:px-6 sm:py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-2 text-[#a9c38a]">
                <Sparkles
                  size={14}
                  aria-hidden
                />

                <p className="text-[10px] font-semibold uppercase tracking-[0.14em]">
                  First milestone complete
                </p>
              </div>

              <span className="rounded-full border border-[#8ca667]/20 bg-[#8ca667]/10 px-2.5 py-1 text-[10px] font-semibold text-[#a9c38a]">
                {percentage}% ready
              </span>
            </div>

            <h2
              id="vault-setup-title"
              className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[#f4f0e8] sm:text-2xl"
            >
              3 devices organized. Protect the paperwork next.
            </h2>

            <p className="mt-1.5 max-w-2xl text-sm leading-5 text-white/55">
              Save one receipt, warranty, or manual so it is
              already here when you need it.
            </p>
          </div>

          <div className="shrink-0">
            {canCreate ? (
              <Link
                href="/documents/upload"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#718d4f] px-4 text-sm font-semibold text-white transition hover:bg-[#617c43] sm:w-auto"
              >
                <FileText
                  size={16}
                  aria-hidden
                />

                Save a document

                <ArrowRight
                  size={15}
                  aria-hidden
                />
              </Link>
            ) : (
              <span className="text-xs text-white/45">
                Read-only household
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-white/[0.07] px-5 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-[11px] font-medium text-white/40">
            {completedCount} of {steps.length} setup steps complete
          </p>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10 sm:w-36">
            <div
              className="h-full rounded-full bg-[#8ca667] transition-[width] duration-500"
              style={{
                width: `${percentage}%`,
              }}
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="vault-setup-title"
      className="overflow-hidden rounded-[28px] border border-[#152638] bg-[#0b1623] text-white shadow-[0_24px_65px_-45px_rgba(11,22,35,0.8)]"
    >
      <div className="grid lg:grid-cols-[1.25fr_0.75fr]">
        <div className="p-6 sm:p-7 lg:p-8">
          <div className="flex items-center gap-2 text-[#a9c38a]">
            <Sparkles
              size={16}
              aria-hidden
            />

            <p className="text-xs font-semibold uppercase tracking-[0.14em]">
              {eyebrow}
            </p>
          </div>

          <h2
            id="vault-setup-title"
            className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.045em] text-[#f4f0e8] sm:text-[38px] sm:leading-[1.08]"
          >
            {title}
          </h2>

          <p className="mt-4 max-w-2xl text-[15px] leading-7 text-white/65">
            {description}
          </p>

          {canCreate ? (
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={primaryHref}
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#718d4f] px-5 text-sm font-semibold text-white transition hover:bg-[#617c43]"
              >
                {needsDocument ? (
                  <FileText
                    size={17}
                    aria-hidden
                  />
                ) : (
                  <Laptop
                    size={17}
                    aria-hidden
                  />
                )}

                {primaryLabel}

                <ArrowRight
                  size={16}
                  aria-hidden
                />
              </Link>

              {hasNoDevices ? (
                <Link
                  href="/onboarding?restart=1"
                  className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-5 text-sm font-semibold text-[#f4f0e8] transition hover:bg-white/[0.1]"
                >
                  Continue guided setup
                </Link>
              ) : null}
            </div>
          ) : (
            <p className="mt-6 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white/60">
              Your household role is read-only.
              Setup actions are available to a
              household owner or admin.
            </p>
          )}

          <div className="mt-8">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-white/45">
                Vault readiness
              </span>

              <span className="text-sm font-semibold text-[#a9c38a]">
                {percentage}%
              </span>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#8ca667] transition-[width] duration-500"
                style={{
                  width: `${percentage}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 bg-white/[0.035] p-6 sm:p-7 lg:border-l lg:border-t-0 lg:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/45">
                Setup checklist
              </p>

              <p className="mt-2 text-sm text-white/60">
                {completedCount} of{" "}
                {steps.length} complete
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#8ca667]/30 bg-[#8ca667]/10 text-[#a9c38a]">
              <span className="text-sm font-semibold">
                {percentage}%
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-1">
            {steps.map((step) => (
              <div
                key={step.id}
                className="flex items-center gap-3 rounded-xl px-2 py-3"
              >
                {step.complete ? (
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#718d4f] text-white">
                    <Check
                      size={14}
                      strokeWidth={2.5}
                      aria-hidden
                    />
                  </span>
                ) : (
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center text-white/25">
                    <Circle
                      size={21}
                      strokeWidth={1.5}
                      aria-hidden
                    />
                  </span>
                )}

                <span
                  className={
                    step.complete
                      ? "text-sm font-medium text-white/55 line-through decoration-white/20"
                      : "text-sm font-medium text-[#f4f0e8]"
                  }
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {deviceCount > 0 &&
          deviceCount < 3 ? (
            <div className="mt-5 rounded-xl border border-[#8ca667]/20 bg-[#8ca667]/10 px-4 py-3">
              <p className="text-sm font-medium text-[#c8d8b4]">
                {deviceCount} of 3 starter
                devices added
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
