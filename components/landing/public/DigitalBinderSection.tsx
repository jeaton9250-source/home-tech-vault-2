import {
  FileText,
  ImageIcon,
  Laptop,
  ShieldCheck,
  Wifi,
  Wrench,
} from "lucide-react";

import { landingTheme } from "@/components/landing/public/landingTheme";
import {
  LANDING_BINDER_CATEGORIES,
  LANDING_PUBLIC_SECTION_IDS,
} from "@/lib/marketing/landingPublicContent";
import { cn } from "@/lib/design-system/cn";

const iconMap = {
  laptop: Laptop,
  file: FileText,
  shield: ShieldCheck,
  wrench: Wrench,
  wifi: Wifi,
  image: ImageIcon,
} as const;

export default function DigitalBinderSection() {
  return (
    <section
      id={LANDING_PUBLIC_SECTION_IDS.digitalBinder}
      className={cn(
        landingTheme.section,
        landingTheme.scrollAnchor
      )}
    >
      <div className={landingTheme.sectionNarrow}>
        <div className="mx-auto max-w-2xl text-center">
          <p className={landingTheme.eyebrow}>
            One place for everything
          </p>
          <h2 className={cn(landingTheme.headline, "mt-3")}>
            Meet your digital home binder.
          </h2>
          <p className={cn(landingTheme.body, "mt-4")}>
            Home Tech Vault connects the information that
            normally ends up scattered across drawers,
            inboxes, folders, and notes.
          </p>
        </div>

        <div className="relative mx-auto mt-14 max-w-4xl">
          <div
            className={cn(
              landingTheme.card,
              "relative z-10 overflow-hidden p-6 md:p-8"
            )}
          >
            <div className="mb-6 flex items-center justify-between gap-4 border-b border-[#E7E9EC] pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#667085]">
                  Home Tech Vault
                </p>
                <p className="mt-1 text-lg font-medium text-[#172033]">
                  Everything connected
                </p>
              </div>
              <span className="rounded-full bg-[#EAF8F0] px-3 py-1 text-xs font-medium text-[#3BAF75]">
                Organized
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {LANDING_BINDER_CATEGORIES.map((category) => {
                const Icon = iconMap[category.icon];

                return (
                  <article
                    key={category.label}
                    className="rounded-2xl border border-[#E7E9EC] bg-[#FAFAF8] p-4"
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#183B56] shadow-sm">
                      <Icon size={18} aria-hidden />
                    </span>
                    <h3 className="mt-4 text-sm font-medium text-[#172033]">
                      {category.label}
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-[#667085]">
                      {category.detail}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>

          <div
            className="absolute -bottom-8 right-4 z-20 w-[42%] max-w-[220px] rounded-[1.15rem] border border-[#E7E9EC] bg-white p-4 shadow-[0_20px_50px_-24px_rgba(23,32,51,0.35)] md:right-8"
            aria-hidden
          >
            <p className="text-[0.625rem] font-semibold uppercase tracking-wider text-[#667085]">
              On your phone
            </p>
            <p className="mt-2 text-sm font-medium text-[#172033]">
              Living Room TV
            </p>
            <p className="mt-1 text-xs text-[#667085]">
              Warranty · Receipt · Manual
            </p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#EDF3F7]">
              <div className="h-full w-4/5 rounded-full bg-[#3BAF75]" />
            </div>
          </div>

          <div
            className="pointer-events-none absolute left-1/2 top-1/2 -z-0 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#EAF8F0]/70 blur-3xl"
            aria-hidden
          />
        </div>
      </div>
    </section>
  );
}
