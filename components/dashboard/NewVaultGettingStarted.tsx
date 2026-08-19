"use client";

import Link from "next/link";

import {
  ArrowRight,
  Check,
  FileText,
  ScanBarcode,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

type NewVaultGettingStartedProps = {
  deviceCount: number;
  documentCount: number;
  networkConfigured?: boolean;

  /*
   * Allow the dashboard to continue passing
   * any existing optional props without making
   * this component brittle.
   */
  [key: string]: unknown;
};

const DISMISSED_KEY =
  "htv:new-vault-getting-started:v2";

export default function NewVaultGettingStarted({
  deviceCount,
  documentCount,
}: NewVaultGettingStartedProps) {
  const [
    ready,
    setReady,
  ] = useState(false);

  const [
    dismissed,
    setDismissed,
  ] = useState(false);

  useEffect(() => {
    const params =
      new URLSearchParams(
        window.location.search
      );

    const arrivingFromOnboarding =
      params.get("welcome") === "1";

    const previouslyDismissed =
      window.localStorage.getItem(
        DISMISSED_KEY
      ) === "1";

    setDismissed(
      !arrivingFromOnboarding &&
        previouslyDismissed
    );

    setReady(true);
  }, []);

  /*
   * Once someone has several devices,
   * the normal dashboard is more useful
   * than beginner guidance.
   */
  const isNewVault =
    deviceCount <= 3;

  if (
    !ready ||
    dismissed ||
    !isNewVault
  ) {
    return null;
  }

  const hasDevice =
    deviceCount > 0;

  const hasDocument =
    documentCount > 0;

  const primaryHref =
    hasDevice
      ? "/devices/add"
      : "/devices/add?first=1";

  const primaryLabel =
    hasDevice
      ? "Scan another device"
      : "Scan your first device";

  function dismiss() {
    window.localStorage.setItem(
      DISMISSED_KEY,
      "1"
    );

    setDismissed(true);
  }

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-[#17212a]/10 bg-[#f8f5ef] shadow-[0_24px_70px_-52px_rgba(23,33,42,0.55)]">
      <div
        className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-[#617c43]/10 blur-3xl"
        aria-hidden
      />

      <div className="relative p-5 sm:p-7 lg:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#617c43]/15 bg-[#617c43]/8 px-3 py-1.5 text-[11px] font-semibold text-[#617c43]">
            <Sparkles
              size={13}
            />

            {hasDevice
              ? "YOUR VAULT IS TAKING SHAPE"
              : "START HERE"}
          </div>

          <button
            type="button"
            onClick={
              dismiss
            }
            aria-label="Dismiss getting started"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#8b938f] transition hover:bg-[#17212a]/5 hover:text-[#17212a]"
          >
            <X
              size={16}
            />
          </button>
        </div>

        <div className="mt-5 max-w-2xl">
          <h2 className="font-serif text-[29px] font-medium leading-[1.06] tracking-[-0.04em] text-[#17212a] sm:text-4xl">
            {hasDevice
              ? "You have already started."
              : "Start with one thing you own."}
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-6 text-[#6f797f] sm:text-[15px]">
            {hasDevice
              ? "Keep going while it is easy. Scan another device and Home Tech Vault will help keep the important details and paperwork together."
              : "Scan a TV, router, laptop, appliance, game console, or anything else with a product barcode. Home Tech Vault will do as much of the setup as it can for you."}
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#17212a]/8 bg-white/60 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#617c43]/10 text-[#617c43]">
                <ScanBarcode
                  size={18}
                />
              </div>

              <div>
                <p className="text-2xl font-semibold tracking-[-0.04em] text-[#17212a]">
                  {deviceCount}
                </p>

                <p className="text-xs text-[#788187]">
                  {deviceCount === 1
                    ? "device organized"
                    : "devices organized"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#17212a]/8 bg-white/60 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#17212a]/6 text-[#17212a]">
                <FileText
                  size={18}
                />
              </div>

              <div>
                <p className="text-2xl font-semibold tracking-[-0.04em] text-[#17212a]">
                  {documentCount}
                </p>

                <p className="text-xs text-[#788187]">
                  {documentCount === 1
                    ? "document saved"
                    : "documents saved"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-[#617c43]/15 bg-[#f1f4ed] p-4 sm:p-5">
          <div className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#617c43] text-white">
              <ShieldCheck
                size={18}
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-[#17212a]">
                Why this matters
              </p>

              <p className="mt-1 text-sm leading-6 text-[#69747a]">
                If something breaks, gets stolen, or needs a warranty claim, you will not have to start from scratch looking for the model, purchase information, receipt, or manual.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href={
              primaryHref
            }
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#17212a] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
          >
            <ScanBarcode
              size={17}
            />

            {primaryLabel}

            <ArrowRight
              size={16}
            />
          </Link>

          {hasDevice &&
          !hasDocument ? (
            <Link
              href="/documents/upload"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[#17212a]/10 bg-white/65 px-5 py-3 text-sm font-semibold text-[#17212a] transition hover:bg-white"
            >
              <FileText
                size={17}
              />

              Add a receipt
            </Link>
          ) : null}
        </div>

        {hasDevice ? (
          <div className="mt-6 border-t border-[#17212a]/8 pt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#8a928f]">
              Home Tech Vault is already doing the boring part
            </p>

            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {[
                "Remember the product",
                "Keep its paperwork nearby",
                "Be ready when something goes wrong",
              ].map(
                (item) => (
                  <div
                    key={
                      item
                    }
                    className="flex items-start gap-2 text-xs leading-5 text-[#69747a]"
                  >
                    <Check
                      size={14}
                      className="mt-0.5 shrink-0 text-[#617c43]"
                    />

                    {item}
                  </div>
                )
              )}
            </div>
          </div>
        ) : null}

        <p className="mt-5 text-xs leading-5 text-[#929997]">
          You do not need to organize your whole house today. One useful device is enough to start.
        </p>
      </div>
    </section>
  );
}
