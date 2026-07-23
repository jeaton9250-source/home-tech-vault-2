import {
  LANDING_HERO_DEVICES,
  LANDING_HERO_FLOATING,
} from "@/lib/marketing/landingPublicContent";
import { cn } from "@/lib/design-system/cn";

export default function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      {LANDING_HERO_FLOATING.map((item) => (
        <div
          key={item.label}
          className={cn(
            "htv-hero-float absolute z-10 rounded-2xl border border-[#E7E9EC] bg-white px-3 py-2 text-xs font-medium text-[#172033] shadow-[0_10px_30px_-16px_rgba(23,32,51,0.35)] motion-reduce:animate-none",
            item.position
          )}
        >
          {item.label}
        </div>
      ))}

      <div className="relative overflow-hidden rounded-[1.5rem] border border-[#E7E9EC] bg-white shadow-[0_24px_60px_-28px_rgba(23,32,51,0.35)]">
        <div className="flex items-center gap-2 border-b border-[#E7E9EC] bg-[#EDF3F7] px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#E7E9EC]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#E7E9EC]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#E7E9EC]" />
          <span className="ml-2 text-xs text-[#667085]">
            Home Tech Vault
          </span>
        </div>

        <div className="space-y-5 p-5 md:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#667085]">
              Home Overview
            </p>
            <h3 className="mt-1 text-lg font-medium text-[#172033]">
              Morgan Household
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Total Devices", value: "28" },
              { label: "Active Warranties", value: "12" },
              {
                label: "Upcoming Maintenance",
                value: "3",
              },
              { label: "Documents", value: "46" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-[#E7E9EC] bg-[#FAFAF8] px-4 py-3"
              >
                <p className="text-[0.625rem] font-semibold uppercase tracking-wider text-[#667085]">
                  {stat.label}
                </p>
                <p className="mt-1 text-xl font-medium tabular-nums text-[#172033]">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#E7E9EC]">
            <div className="border-b border-[#E7E9EC] bg-[#FAFAF8] px-4 py-2.5 text-xs font-medium text-[#667085]">
              Recent devices
            </div>
            <ul className="divide-y divide-[#E7E9EC]">
              {LANDING_HERO_DEVICES.map((device) => (
                <li
                  key={device.name}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#172033]">
                      {device.name}
                    </p>
                    <p className="truncate text-xs text-[#667085]">
                      {device.room}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#EAF8F0] px-2.5 py-1 text-[0.625rem] font-medium text-[#3BAF75]">
                    {device.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
