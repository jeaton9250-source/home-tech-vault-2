import { landingTheme } from "@/components/landing/public/landingTheme";
import {
  LANDING_PUBLIC_SECTION_IDS,
  LANDING_WORKFLOW_STEPS,
} from "@/lib/marketing/landingPublicContent";
import { cn } from "@/lib/design-system/cn";

export default function HowItWorksSection() {
  return (
    <section
      id={LANDING_PUBLIC_SECTION_IDS.howItWorks}
      className={cn(
        "bg-[#EDF3F7]/45 px-5 py-16 md:px-8 md:py-24 lg:px-10",
        landingTheme.scrollAnchor
      )}
    >
      <div className={landingTheme.sectionNarrow}>
        <div className="max-w-2xl">
          <p className={landingTheme.eyebrow}>
            How it works
          </p>
          <h2 className={cn(landingTheme.headline, "mt-3")}>
            Organizing your home takes minutes.
          </h2>
        </div>

        <div className="relative mt-12 hidden lg:block">
          <div
            className="absolute left-[12%] right-[12%] top-8 h-px bg-[#E7E9EC]"
            aria-hidden
          />
          <ol className="grid grid-cols-4 gap-6">
            {LANDING_WORKFLOW_STEPS.map((step) => (
              <li
                key={step.step}
                className="relative pt-2"
              >
                <span className="relative z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#183B56] text-sm font-medium text-white">
                  {step.step}
                </span>
                <h3 className="mt-5 text-lg font-medium text-[#172033]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-[#667085]">
                  {step.text}
                </p>
              </li>
            ))}
          </ol>
        </div>

        <ol className="mt-10 space-y-5 lg:hidden">
          {LANDING_WORKFLOW_STEPS.map((step) => (
            <li
              key={step.step}
              className={cn(
                landingTheme.cardSoft,
                "flex gap-4 p-5"
              )}
            >
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#183B56] text-sm font-medium text-white">
                {step.step}
              </span>
              <div>
                <h3 className="text-lg font-medium text-[#172033]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-[#667085]">
                  {step.text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
