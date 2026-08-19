"use client";

import {
  Check,
  FileText,
  Laptop,
  Network,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import {
  useSearchParams,
} from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

type NewVaultGettingStartedProps = {
  deviceCount: number;
  documentCount: number;
};

type SetupItem = {
  title: string;
  description: string;
  href: string;
  action: string;
  complete: boolean;
  icon: typeof Laptop;
};

export default function NewVaultGettingStarted({
  deviceCount,
  documentCount,
}: NewVaultGettingStartedProps) {
  const searchParams =
    useSearchParams();

  const [dismissed, setDismissed] =
    useState(false);

  const [justCompletedOnboarding, setJustCompletedOnboarding] =
    useState(false);

  useEffect(() => {
    setJustCompletedOnboarding(
      searchParams.get("welcome") === "1"
    );
  }, [searchParams]);

  const items = useMemo<SetupItem[]>(
    () => [
      {
        title: "Add your first device",
        description:
          "Smart Scan can identify a product and fill in the important details for you.",
        href: "/devices/add",
        action:
          deviceCount > 0
            ? "Add another device"
            : "Smart Scan a device",
        complete: deviceCount > 0,
        icon: Laptop,
      },
      {
        title: "Save a receipt or manual",
        description:
          "Keep proof of purchase, manuals, and other important files with your home records.",
        href: "/documents/upload",
        action: "Add a document",
        complete:
          documentCount > 0,
        icon: FileText,
      },
      {
        title: "Document your home network",
        description:
          "Save the router, provider, and network details that matter when something stops working.",
        href: "/network/edit",
        action: "Add network details",
        complete: false,
        icon: Network,
      },
    ],
    [
      deviceCount,
      documentCount,
    ]
  );

  const completedCount =
    items.filter(
      (item) => item.complete
    ).length;

  const shouldShow =
    justCompletedOnboarding ||
    (
      deviceCount <= 1 &&
      documentCount === 0
    );

  if (
    dismissed ||
    !shouldShow
  ) {
    return null;
  }

  const primaryItem =
    items.find(
      (item) => !item.complete
    ) ?? items[0];

  return (
    <section className="relative mb-6 overflow-hidden rounded-[28px] border border-[#617c43]/20 bg-[#f3f6ee] shadow-[0_24px_60px_-46px_rgba(15,25,35,0.55)]">
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-[#617c43]/10 blur-3xl"
        aria-hidden
      />

      <div className="relative p-5 sm:p-6 lg:p-7">
        <div className="flex items-start justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 text-[#617c43]">
              <Sparkles
                size={15}
                aria-hidden
              />

              <p className="text-[10px] font-semibold uppercase tracking-[0.16em]">
                Getting started
              </p>
            </div>

            <h2 className="mt-3 font-serif text-3xl font-medium tracking-[-0.04em] text-[#17212a] sm:text-4xl">
              Your vault is ready.
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#68737b] sm:text-base">
              You have the foundation.
              Build it out a little at a
              time — there is no need to
              organize your whole home
              today.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setDismissed(true)
            }
            aria-label="Dismiss getting started"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#182533]/10 bg-white/50 text-[#758087] transition hover:bg-white hover:text-[#17212a]"
          >
            <X
              size={16}
              aria-hidden
            />
          </button>
        </div>

        <div className="mt-7 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#d9dfd0]">
            <div
              className="h-full rounded-full bg-[#617c43] transition-all duration-500"
              style={{
                width: `${Math.max(
                  12,
                  (
                    completedCount /
                    items.length
                  ) *
                    100
                )}%`,
              }}
            />
          </div>

          <span className="shrink-0 text-xs font-semibold text-[#617c43]">
            {completedCount} of{" "}
            {items.length} started
          </span>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-3">
          {items.map(
            (item, index) => {
              const Icon =
                item.icon;

              return (
                <article
                  key={
                    item.title
                  }
                  className={`rounded-[22px] border p-5 transition ${
                    item.complete
                      ? "border-[#617c43]/20 bg-[#617c43]/5"
                      : "border-[#182533]/10 bg-[#f8f5ef]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        item.complete
                          ? "bg-[#617c43] text-white"
                          : "bg-[#617c43]/10 text-[#617c43]"
                      }`}
                    >
                      {item.complete ? (
                        <Check
                          size={18}
                          aria-hidden
                        />
                      ) : (
                        <Icon
                          size={18}
                          aria-hidden
                        />
                      )}
                    </div>

                    <span className="font-serif text-sm text-[#a1a8a2]">
                      0{index + 1}
                    </span>
                  </div>

                  <h3 className="mt-5 text-sm font-semibold text-[#17212a]">
                    {item.title}
                  </h3>

                  <p className="mt-2 min-h-[60px] text-xs leading-5 text-[#707a81]">
                    {
                      item.description
                    }
                  </p>

                  {item.complete ? (
                    <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#617c43]">
                      <Check
                        size={13}
                        aria-hidden
                      />
                      Started
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className="mt-4 inline-flex text-xs font-semibold text-[#17212a] underline decoration-[#17212a]/20 underline-offset-4 transition hover:text-[#617c43]"
                    >
                      {item.action} →
                    </Link>
                  )}
                </article>
              );
            }
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-[#182533]/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-[#788289]">
            Home Tech Vault gets more useful
            as you add information — but one
            useful record is enough to start.
          </p>

          <div className="flex shrink-0 gap-3">
            <button
              type="button"
              onClick={() =>
                setDismissed(true)
              }
              className="rounded-xl px-4 py-2.5 text-xs font-semibold text-[#707a81] transition hover:text-[#17212a]"
            >
              Explore dashboard
            </button>

            <Link
              href={
                primaryItem.href
              }
              className="inline-flex items-center justify-center rounded-xl bg-[#17212a] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#27333d]"
            >
              {
                primaryItem.action
              }
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
