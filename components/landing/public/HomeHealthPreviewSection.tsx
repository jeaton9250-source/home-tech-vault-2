import { landingTheme } from "@/components/landing/public/landingTheme";
import {
  LANDING_HOME_HEALTH,
  LANDING_PUBLIC_SECTION_IDS,
} from "@/lib/marketing/landingPublicContent";
import { cn } from "@/lib/design-system/cn";

export default function HomeHealthPreviewSection() {
  return (
    <section
      id={LANDING_PUBLIC_SECTION_IDS.homeHealth}
      className={cn(landingTheme.section, landingTheme.scrollAnchor)}
    >
      <div className={landingTheme.sectionNarrow}>
        <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <div>
            <p className={landingTheme.eyebrow}>
              {LANDING_HOME_HEALTH.eyebrow}
            </p>
            <h2 className={cn(landingTheme.headline, "mt-3")}>
              {LANDING_HOME_HEALTH.title}
            </h2>
            <p className={cn(landingTheme.body, "mt-4 max-w-xl")}>
              {LANDING_HOME_HEALTH.text}
            </p>
          </div>

          <div
            className={cn(
              landingTheme.card,
              "overflow-hidden bg-gradient-to-br from-white via-white to-[#EAF8F0]/60 p-6 md:p-8"
            )}
          >
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#667085]">
                  Good morning
                </p>
                <p className="mt-3 text-[3.25rem] font-medium leading-none tracking-[-0.05em] text-[#172033]">
                  {LANDING_HOME_HEALTH.score}
                  <span className="ml-1 text-lg font-medium text-[#667085]">
                    %
                  </span>
                </p>
                <p className="mt-3 text-sm font-medium text-[#3BAF75]">
                  {LANDING_HOME_HEALTH.status}
                </p>
              </div>
              <p className="max-w-xs text-sm leading-6 text-[#667085]">
                {LANDING_HOME_HEALTH.summary}
              </p>
            </div>

            <div className="mt-8 space-y-3">
              {LANDING_HOME_HEALTH.insights.map((insight) => (
                <div
                  key={insight.title}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-[#E7E9EC] bg-white/90 px-4 py-3.5"
                >
                  <div>
                    <p className="text-sm font-medium text-[#172033]">
                      {insight.title}
                    </p>
                    <p className="mt-0.5 text-xs text-[#667085]">
                      {insight.detail}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[0.625rem] font-medium",
                      insight.tone === "attention"
                        ? "bg-[#FFF4E5] text-[#B54708]"
                        : "bg-[#EDF3F7] text-[#183B56]"
                    )}
                  >
                    {insight.tone === "attention"
                      ? "Needs attention"
                      : "Suggestion"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
