import {
  Radar,
  ShieldCheck,
  Sparkles,
  Users,
  Wifi,
  Activity,
} from "lucide-react";

import { landingTheme } from "@/components/landing/public/landingTheme";
import {
  LANDING_PROBLEM_CARDS,
  LANDING_PUBLIC_SECTION_IDS,
} from "@/lib/marketing/landingPublicContent";
import { cn } from "@/lib/design-system/cn";

const iconMap = {
  wifi: Wifi,
  pulse: Activity,
  radar: Radar,
  sparkles: Sparkles,
  shield: ShieldCheck,
  users: Users,
} as const;

export default function ProblemSection() {
  return (
    <section
      id={LANDING_PUBLIC_SECTION_IDS.problems}
      className={cn(
        "bg-[#EDF3F7]/50 px-5 py-16 md:px-8 md:py-24 lg:px-10",
        landingTheme.scrollAnchor
      )}
    >
      <div className={landingTheme.sectionNarrow}>
        <div className="max-w-2xl">
          <p className={landingTheme.eyebrow}>
            Everyday home problems
          </p>
          <h2 className={cn(landingTheme.headline, "mt-3")}>
            Built for the moments homeowners actually face.
          </h2>
          <p className={cn(landingTheme.body, "mt-4 max-w-xl")}>
            Not another place to upload paperwork. A clearer way
            to understand what is happening with the technology
            that runs your home.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {LANDING_PROBLEM_CARDS.map((card) => {
            const Icon = iconMap[card.icon];

            return (
              <article
                key={card.title}
                className={cn(
                  landingTheme.cardSoft,
                  "htv-card-interactive p-6 md:p-7"
                )}
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF8F0] text-[#3BAF75]">
                  <Icon size={20} aria-hidden />
                </span>
                <h3 className="mt-5 text-lg font-medium text-[#172033]">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-[#667085]">
                  {card.text}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
