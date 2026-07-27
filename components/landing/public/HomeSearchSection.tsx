import { Search } from "lucide-react";

import { landingTheme } from "@/components/landing/public/landingTheme";
import {
  LANDING_PUBLIC_SECTION_IDS,
  LANDING_SEARCH,
} from "@/lib/marketing/landingPublicContent";
import { cn } from "@/lib/design-system/cn";

export default function HomeSearchSection() {
  return (
    <section
      id={LANDING_PUBLIC_SECTION_IDS.search}
      className={cn(landingTheme.section, landingTheme.scrollAnchor)}
    >
      <div className={landingTheme.sectionNarrow}>
        <div className="mx-auto max-w-3xl text-center">
          <p className={landingTheme.eyebrow}>
            {LANDING_SEARCH.eyebrow}
          </p>
          <h2 className={cn(landingTheme.headline, "mt-3")}>
            {LANDING_SEARCH.title}
          </h2>
          <p className={cn(landingTheme.body, "mx-auto mt-4 max-w-2xl")}>
            {LANDING_SEARCH.text}
          </p>
        </div>

        <div
          className={cn(
            landingTheme.card,
            "mx-auto mt-10 max-w-3xl p-6 md:p-8"
          )}
        >
          <div className="flex items-center gap-3 rounded-full border border-[#E7E9EC] bg-[#FAFAF8] px-4 py-3.5">
            <Search
              size={18}
              className="shrink-0 text-[#667085]"
              aria-hidden
            />
            <p className="text-sm text-[#667085]">
              Search anything in your home...
            </p>
          </div>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {LANDING_SEARCH.examples.map((example) => (
              <span
                key={example}
                className="rounded-full border border-[#E7E9EC] bg-white px-3.5 py-1.5 text-sm text-[#667085]"
              >
                {example}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
