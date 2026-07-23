import { landingTheme } from "@/components/landing/public/landingTheme";
import { LANDING_SCENARIOS } from "@/lib/marketing/landingPublicContent";
import { cn } from "@/lib/design-system/cn";

export default function ScenarioSection() {
  return (
    <section className="bg-[#EDF3F7]/45 px-5 py-16 md:px-8 md:py-24 lg:px-10">
      <div className={landingTheme.sectionNarrow}>
        <div className="max-w-2xl">
          <p className={landingTheme.eyebrow}>
            Real life
          </p>
          <h2 className={cn(landingTheme.headline, "mt-3")}>
            Home Tech Vault is ready when life happens.
          </h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {LANDING_SCENARIOS.map((scenario) => (
            <article
              key={scenario.title}
              className={cn(
                landingTheme.cardSoft,
                "htv-card-interactive p-6"
              )}
            >
              <h3 className="text-lg font-medium text-[#172033]">
                {scenario.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[#667085]">
                {scenario.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
