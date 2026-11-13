"use client";

import Link from "next/link";
import { track } from "@vercel/analytics";

type Props = { source: string; topic?: string };

export default function GuideSignupCallout({ source, topic }: Props) {
  const label = topic?.toLowerCase().includes("warrant")
    ? "Keep your warranty and receipt together"
    : topic?.toLowerCase().includes("serial")
      ? "Save your device's serial number"
      : "Keep your device details in one place";

  return (
    <aside className="mx-auto my-10 max-w-4xl rounded-3xl border border-[#d8d5cc] bg-[#f5f2eb] p-6 text-[#18283b] sm:p-9" aria-label="Save your device information">
      <p className="text-xs font-semibold uppercase tracking-widest text-[#74765c]">Make this guide useful later</p>
      <h2 className="mt-3 font-serif text-3xl sm:text-4xl">{label}</h2>
      <p className="mt-3 max-w-2xl text-base leading-7 text-[#536174]">
        Save one device, its model information, manual and warranty in your own free Home Tech Vault. Start small and add more whenever you need to.
      </p>
      <Link href="/signup" onClick={() => track("conversion_cta_clicked", { placement: "guide", source })}
        className="mt-6 inline-flex min-h-12 items-center rounded-full bg-[#18283b] px-6 font-semibold text-white">
        Save my first device — free
      </Link>
      <p className="mt-3 text-xs text-[#536174]">No credit card required.</p>
    </aside>
  );
}
