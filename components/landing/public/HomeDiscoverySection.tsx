import { Radar } from "lucide-react";

import { landingTheme } from "@/components/landing/public/landingTheme";
import {
  LANDING_DISCOVERY,
  LANDING_PUBLIC_SECTION_IDS,
} from "@/lib/marketing/landingPublicContent";
import { cn } from "@/lib/design-system/cn";

export default function HomeDiscoverySection() {
  return (
    <section
      id={LANDING_PUBLIC_SECTION_IDS.discovery}
      className={cn(
        "bg-[#EDF3F7]/50 px-5 py-16 md:px-8 md:py-24 lg:px-10",
        landingTheme.scrollAnchor
      )}
    >
      <div className={landingTheme.sectionNarrow}>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className={cn(landingTheme.card, "order-2 p-6 md:order-1 md:p-7")}>
            <div className="mb-5 flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EAF8F0] text-[#3BAF75]">
                <Radar size={18} aria-hidden />
              </span>
              <div>
                <p className="text-sm font-medium text-[#172033]">
                  Discovered on your network
                </p>
                <p className="text-xs text-[#667085]">
                  Review and bring devices into your home
                </p>
              </div>
            </div>

            <ul className="divide-y divide-[#E7E9EC] overflow-hidden rounded-2xl border border-[#E7E9EC] bg-white">
              {LANDING_DISCOVERY.devices.map((device) => (
                <li
                  key={device.name}
                  className="flex items-center justify-between gap-3 px-4 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#172033]">
                      {device.name}
                    </p>
                    <p className="truncate text-xs text-[#667085]">
                      {device.room}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#EDF3F7] px-2.5 py-1 text-[0.625rem] font-medium text-[#183B56]">
                    {device.state}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="order-1 md:order-2">
            <p className={landingTheme.eyebrow}>
              {LANDING_DISCOVERY.eyebrow}
            </p>
            <h2 className={cn(landingTheme.headline, "mt-3")}>
              {LANDING_DISCOVERY.title}
            </h2>
            <p className={cn(landingTheme.body, "mt-4 max-w-xl")}>
              {LANDING_DISCOVERY.text}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
