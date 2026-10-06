"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  FileText,
  PackageCheck,
} from "lucide-react";

type VaultSetupProgressProps = {
  deviceCount: number;
  documentCount: number;
  hasHousehold: boolean;
  canCreate: boolean;
};

export default function VaultSetupProgress({
  deviceCount,
  documentCount,
  canCreate,
}: VaultSetupProgressProps) {
  if (deviceCount === 0 || documentCount > 0) {
    return null;
  }

  return (
    <section className="rounded-[28px] border border-[#617c43]/15 bg-[#f3f6ee] p-6 shadow-[0_20px_55px_-45px_rgba(15,25,35,0.45)] sm:p-7">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#617c43]">
            Your home record is growing
          </p>

          <h2 className="mt-2 font-serif text-2xl font-medium tracking-[-0.035em] text-[#17212a] sm:text-3xl">
            Your first thing is remembered.
          </h2>

          <p className="mt-3 text-sm leading-6 text-[#68737b]">
            Make that record more useful by saving one receipt, warranty, manual,
            or other document. You can stop there and come back whenever you need
            to.
          </p>
        </div>

        {canCreate ? (
          <Link
            href="/documents/upload"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#17212a] px-5 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
          >
            Save one document
            <ArrowRight size={16} aria-hidden />
          </Link>
        ) : null}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-2xl border border-[#617c43]/15 bg-white/65 px-4 py-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#617c43] text-white">
            <Check size={15} strokeWidth={2.5} aria-hidden />
          </span>
          <div>
            <p className="text-sm font-semibold text-[#17212a]">
              First thing added
            </p>
            <p className="text-xs text-[#7a858b]">
              {deviceCount} item{deviceCount === 1 ? "" : "s"} remembered
            </p>
          </div>
          <PackageCheck className="ml-auto text-[#617c43]" size={18} aria-hidden />
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-[#17212a]/10 bg-white/45 px-4 py-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#17212a]/10 bg-white text-[#8a9499]">
            2
          </span>
          <div>
            <p className="text-sm font-semibold text-[#17212a]">
              Add proof or paperwork
            </p>
            <p className="text-xs text-[#7a858b]">
              Receipt, warranty, or manual
            </p>
          </div>
          <FileText className="ml-auto text-[#8a9499]" size={18} aria-hidden />
        </div>
      </div>
    </section>
  );
}
