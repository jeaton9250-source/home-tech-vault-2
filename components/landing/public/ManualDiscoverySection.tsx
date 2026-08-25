"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  FileText,
  Search,
  Sparkles,
} from "lucide-react";

import { MARKETING_ROUTES } from "@/lib/marketing/routes";

type ManualDiscoverySectionProps = {
  isSignedIn: boolean;
};

export default function ManualDiscoverySection({
  isSignedIn,
}: ManualDiscoverySectionProps) {
  const primaryHref = isSignedIn
    ? "/dashboard"
    : MARKETING_ROUTES.signup;

  const primaryLabel = isSignedIn
    ? "Open My Vault"
    : "Try It With a Device";

  return (
    <section className="bg-[#f5f1e8] px-5 py-20 md:px-8 md:py-28 lg:px-12">
      <div className="mx-auto max-w-[1180px]">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          {/* LEFT COPY */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#617c43]">
              A little less work
            </p>

            <h2 className="mt-5 max-w-[560px] font-serif text-4xl font-medium leading-[1.04] tracking-[-0.04em] text-[#17212a] sm:text-5xl">
              You don&apos;t have to fill in every detail yourself.
            </h2>

            <p className="mt-6 max-w-[570px] text-lg leading-8 text-[#68716c]">
              Add what you know about an appliance or device and Home Tech Vault
              can help find the details that are easy to forget — like the model,
              manufacturer, and manual.
            </p>

            <div className="mt-7 space-y-3">
              <Benefit>
                Start with a name, brand, or model number
              </Benefit>

              <Benefit>
                Let Home Tech Vault help fill in useful details
              </Benefit>

              <Benefit>
                Keep the manual with the item for later
              </Benefit>
            </div>

            <div className="mt-9">
              <Link
                href={primaryHref}
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-[#617c43] px-7 text-sm font-semibold text-white transition hover:bg-[#718d4f]"
              >
                {primaryLabel}
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* RIGHT VISUAL */}
          <div className="relative">
            <div className="rounded-[32px] border border-[#17212a]/8 bg-[#fffdf8] p-5 shadow-[0_30px_80px_-50px_rgba(23,33,42,0.45)] md:p-7">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#617c43]">
                    Adding to My Home
                  </p>

                  <p className="mt-1 font-serif text-2xl text-[#17212a]">
                    Kitchen Refrigerator
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#edf2e7] text-[#617c43]">
                  <Sparkles size={18} />
                </div>
              </div>

              <div className="rounded-[22px] bg-[#f5f1e8] p-4">
                <div className="flex items-center gap-3 rounded-[16px] bg-[#fffdf8] px-4 py-3 ring-1 ring-[#17212a]/6">
                  <Search
                    size={17}
                    className="shrink-0 text-[#7c847f]"
                  />

                  <span className="text-sm text-[#59625d]">
                    Samsung RF28...
                  </span>

                  <span className="ml-auto rounded-full bg-[#edf2e7] px-3 py-1 text-[10px] font-semibold text-[#617c43]">
                    Found
                  </span>
                </div>

                <div className="mt-4 space-y-2.5">
                  <FoundRow
                    label="Brand"
                    value="Samsung"
                  />

                  <FoundRow
                    label="Model"
                    value="RF28..."
                  />

                  <FoundRow
                    label="Category"
                    value="Refrigerator"
                  />

                  <FoundRow
                    label="Manual"
                    value="Ready"
                    icon
                  />
                </div>
              </div>

              <div className="mt-5 flex items-start gap-3 rounded-[18px] bg-[#edf2e7] px-5 py-4">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#617c43]/10 text-[#617c43]">
                  <Check size={14} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#40502f]">
                    That&apos;s enough to get started.
                  </p>

                  <p className="mt-1 text-sm leading-6 text-[#68716c]">
                    You can always add the receipt, warranty, purchase date,
                    or maintenance history later.
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-5 hidden max-w-[215px] rotate-[-2deg] rounded-2xl bg-[#fffdf8] px-4 py-3 shadow-lg ring-1 ring-[#17212a]/8 lg:block">
              <p className="font-serif text-base leading-6 text-[#40502f]">
                Less typing. More useful information saved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Benefit({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#edf2e7] text-[#617c43]">
        <Check size={13} />
      </div>

      <p className="text-[15px] text-[#59625d]">
        {children}
      </p>
    </div>
  );
}

function FoundRow({
  label,
  value,
  icon = false,
}: {
  label: string;
  value: string;
  icon?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[14px] bg-[#fffdf8] px-4 py-3 ring-1 ring-[#17212a]/5">
      <span className="text-xs font-medium text-[#7c847f]">
        {label}
      </span>

      <div className="flex items-center gap-2">
        {icon && (
          <FileText
            size={13}
            className="text-[#617c43]"
          />
        )}

        <span className="text-sm font-semibold text-[#17212a]">
          {value}
        </span>
      </div>
    </div>
  );
}
