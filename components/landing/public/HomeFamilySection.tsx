import { Users } from "lucide-react";

import { landingTheme } from "@/components/landing/public/landingTheme";
import {
  LANDING_FAMILY,
  LANDING_PUBLIC_SECTION_IDS,
} from "@/lib/marketing/landingPublicContent";
import { cn } from "@/lib/design-system/cn";

export default function HomeFamilySection() {
  return (
    <section
      id={LANDING_PUBLIC_SECTION_IDS.family}
      className={cn(landingTheme.section, landingTheme.scrollAnchor)}
    >
      <div className={landingTheme.sectionNarrow}>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className={cn(landingTheme.card, "order-2 p-6 md:order-1 md:p-7")}>
            <div className="mb-5 flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EAF8F0] text-[#3BAF75]">
                <Users size={18} aria-hidden />
              </span>
              <div>
                <p className="text-sm font-medium text-[#172033]">
                  Household access
                </p>
                <p className="text-xs text-[#667085]">
                  Same home view for everyone
                </p>
              </div>
            </div>

            <ul className="space-y-3">
              {LANDING_FAMILY.members.map((member) => (
                <li
                  key={member.name}
                  className="flex items-center justify-between rounded-2xl border border-[#E7E9EC] bg-[#FAFAF8] px-4 py-3.5"
                >
                  <span className="text-sm font-medium text-[#172033]">
                    {member.name}
                  </span>
                  <span className="text-xs text-[#667085]">
                    {member.role}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="order-1 md:order-2">
            <p className={landingTheme.eyebrow}>
              {LANDING_FAMILY.eyebrow}
            </p>
            <h2 className={cn(landingTheme.headline, "mt-3")}>
              {LANDING_FAMILY.title}
            </h2>
            <p className={cn(landingTheme.body, "mt-4 max-w-xl")}>
              {LANDING_FAMILY.text}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
