import { Sparkles } from "lucide-react";

import { landingTheme } from "@/components/landing/public/landingTheme";
import {
  LANDING_ADVISOR,
  LANDING_PUBLIC_SECTION_IDS,
} from "@/lib/marketing/landingPublicContent";
import { cn } from "@/lib/design-system/cn";

export default function HomeAdvisorStorySection() {
  return (
    <section
      id={LANDING_PUBLIC_SECTION_IDS.advisor}
      className={cn(landingTheme.section, landingTheme.scrollAnchor)}
    >
      <div className={landingTheme.sectionNarrow}>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className={landingTheme.eyebrow}>
              {LANDING_ADVISOR.eyebrow}
            </p>
            <h2 className={cn(landingTheme.headline, "mt-3")}>
              {LANDING_ADVISOR.title}
            </h2>
            <p className={cn(landingTheme.body, "mt-4 max-w-xl")}>
              {LANDING_ADVISOR.text}
            </p>
          </div>

          <div className={cn(landingTheme.card, "space-y-4 p-6 md:p-7")}>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EDF3F7] text-[#183B56]">
                <Sparkles size={18} aria-hidden />
              </span>
              <div>
                <p className="text-sm font-medium text-[#172033]">
                  Home Advisor
                </p>
                <p className="text-xs text-[#667085]">
                  Highest-priority recommendations
                </p>
              </div>
            </div>

            {LANDING_ADVISOR.items.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-[#E7E9EC] bg-[#FAFAF8] px-4 py-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-[#172033]">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-[#667085]">
                      {item.detail}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-[#183B56]">
                    {item.action}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
