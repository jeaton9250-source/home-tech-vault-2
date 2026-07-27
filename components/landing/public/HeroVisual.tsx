import {
  LANDING_HERO_DEVICES,
  LANDING_HERO_FLOATING,
  LANDING_HOME_HEALTH,
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
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#667085]">
                Home Health
              </p>
              <p className="mt-2 text-[2.75rem] font-medium leading-none tracking-[-0.05em] text-[#172033]">
                {LANDING_HOME_HEALTH.score}
                <span className="ml-1 text-base font-medium text-[#667085]">
                  %
                </span>
              </p>
              <p className="mt-2 text-sm font-medium text-[#3BAF75]">
                {LANDING_HOME_HEALTH.status}
              </p>
            </div>
            <div className="max-w-[11rem] rounded-2xl bg-[#EAF8F0] px-3 py-3 text-xs leading-5 text-[#172033]">
              {LANDING_HOME_HEALTH.summary}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#E7E9EC]">
            <div className="border-b border-[#E7E9EC] bg-[#FAFAF8] px-4 py-2.5 text-xs font-medium text-[#667085]">
              Needs attention
            </div>
            <ul className="divide-y divide-[#E7E9EC]">
              {LANDING_HOME_HEALTH.insights.map((insight) => (
                <li
                  key={insight.title}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#172033]">
                      {insight.title}
                    </p>
                    <p className="truncate text-xs text-[#667085]">
                      {insight.detail}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 text-[0.625rem] font-medium",
                      insight.tone === "attention"
                        ? "bg-[#FFF4E5] text-[#B54708]"
                        : "bg-[#EAF8F0] text-[#3BAF75]"
                    )}
                  >
                    {insight.tone === "attention"
                      ? "Attention"
                      : "Suggestion"}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {LANDING_HERO_DEVICES.slice(0, 4).map((device) => (
              <div
                key={device.name}
                className="rounded-2xl border border-[#E7E9EC] bg-[#FAFAF8] px-3 py-3"
              >
                <p className="truncate text-xs font-medium text-[#172033]">
                  {device.name}
                </p>
                <p className="mt-1 truncate text-[0.625rem] text-[#667085]">
                  {device.status}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
