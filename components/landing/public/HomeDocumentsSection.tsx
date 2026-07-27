import { Check, FileText } from "lucide-react";

import { landingTheme } from "@/components/landing/public/landingTheme";
import {
  LANDING_DOCUMENTS,
  LANDING_PUBLIC_SECTION_IDS,
} from "@/lib/marketing/landingPublicContent";
import { cn } from "@/lib/design-system/cn";

export default function HomeDocumentsSection() {
  return (
    <section
      id={LANDING_PUBLIC_SECTION_IDS.documents}
      className={cn(
        "bg-[#EDF3F7]/50 px-5 py-16 md:px-8 md:py-24 lg:px-10",
        landingTheme.scrollAnchor
      )}
    >
      <div className={landingTheme.sectionNarrow}>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className={landingTheme.eyebrow}>
              {LANDING_DOCUMENTS.eyebrow}
            </p>
            <h2 className={cn(landingTheme.headline, "mt-3")}>
              {LANDING_DOCUMENTS.title}
            </h2>
            <p className={cn(landingTheme.body, "mt-4 max-w-xl")}>
              {LANDING_DOCUMENTS.text}
            </p>

            <ul className="mt-8 space-y-3">
              {LANDING_DOCUMENTS.items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm leading-6 text-[#172033]"
                >
                  <Check
                    size={16}
                    className="mt-1 shrink-0 text-[#3BAF75]"
                    aria-hidden
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className={cn(landingTheme.card, "space-y-4 p-6 md:p-7")}>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EDF3F7] text-[#183B56]">
                <FileText size={18} aria-hidden />
              </span>
              <div>
                <p className="text-sm font-medium text-[#172033]">
                  Living Room TV
                </p>
                <p className="text-xs text-[#667085]">
                  Documents ready when you need them
                </p>
              </div>
            </div>

            {[
              "Purchase receipt · Jan 2025",
              "Manufacturer warranty · Active",
              "Setup guide · Attached",
            ].map((row) => (
              <div
                key={row}
                className="rounded-2xl border border-[#E7E9EC] bg-[#FAFAF8] px-4 py-3.5 text-sm text-[#667085]"
              >
                {row}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
