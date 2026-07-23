import { landingTheme } from "@/components/landing/public/landingTheme";
import {
  LANDING_PRODUCT_FEATURES,
  LANDING_PUBLIC_SECTION_IDS,
} from "@/lib/marketing/landingPublicContent";
import { cn } from "@/lib/design-system/cn";

function FeatureMock({
  variant,
}: {
  variant: (typeof LANDING_PRODUCT_FEATURES)[number]["mock"];
}) {
  if (variant === "device") {
    return (
      <div className="space-y-3 rounded-[1.25rem] border border-[#E7E9EC] bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-[#172033]">
              Living Room TV
            </p>
            <p className="text-xs text-[#667085]">
              Samsung · 65&quot; OLED
            </p>
          </div>
          <span className="rounded-full bg-[#EAF8F0] px-2.5 py-1 text-[0.625rem] font-medium text-[#3BAF75]">
            Active
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          {["Receipt", "Manual", "Photo"].map((item) => (
            <div
              key={item}
              className="rounded-xl border border-[#E7E9EC] bg-[#FAFAF8] px-2 py-3 text-[#667085]"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "warranty") {
    return (
      <div className="space-y-3 rounded-[1.25rem] border border-[#E7E9EC] bg-white p-5">
        <p className="text-sm font-medium text-[#172033]">
          Warranty &amp; receipt
        </p>
        <div className="rounded-xl border border-[#E7E9EC] bg-[#FAFAF8] px-4 py-3 text-sm text-[#667085]">
          Purchase receipt · Added Jan 12, 2025
        </div>
        <div className="rounded-xl border border-[#E7E9EC] bg-[#EAF8F0]/50 px-4 py-3 text-sm text-[#172033]">
          Warranty expires Aug 2027
        </div>
      </div>
    );
  }

  if (variant === "maintenance") {
    return (
      <div className="space-y-3 rounded-[1.25rem] border border-[#E7E9EC] bg-white p-5">
        {[
          "Replace HVAC filter",
          "Router firmware check",
          "Vacuum dock cleaning",
        ].map((item) => (
          <div
            key={item}
            className="flex items-center justify-between rounded-xl border border-[#E7E9EC] bg-[#FAFAF8] px-4 py-3 text-sm"
          >
            <span className="text-[#172033]">{item}</span>
            <span className="text-xs text-[#667085]">
              Upcoming
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-[1.25rem] border border-[#E7E9EC] bg-white p-5">
      <p className="text-sm font-medium text-[#172033]">
        Household access
      </p>
      {[
        { name: "Alex", role: "Admin" },
        { name: "Jordan", role: "Member" },
        { name: "Sam", role: "Viewer" },
      ].map((member) => (
        <div
          key={member.name}
          className="flex items-center justify-between rounded-xl border border-[#E7E9EC] bg-[#FAFAF8] px-4 py-3 text-sm"
        >
          <span className="text-[#172033]">
            {member.name}
          </span>
          <span className="text-xs text-[#667085]">
            {member.role}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function ProductShowcase() {
  return (
    <section
      id={LANDING_PUBLIC_SECTION_IDS.features}
      className={cn(
        landingTheme.section,
        landingTheme.scrollAnchor
      )}
    >
      <div className={landingTheme.sectionNarrow}>
        <div className="max-w-2xl">
          <p className={landingTheme.eyebrow}>
            Features
          </p>
          <h2 className={cn(landingTheme.headline, "mt-3")}>
            Everything your home remembers, organized
            beautifully.
          </h2>
        </div>

        <div className="mt-14 space-y-16">
          {LANDING_PRODUCT_FEATURES.map((feature, index) => {
            const reversed = index % 2 === 1;

            return (
              <div
                key={feature.headline}
                className={cn(
                  "grid items-center gap-10 lg:grid-cols-2 lg:gap-16",
                  reversed && "lg:[&>div:first-child]:order-2"
                )}
              >
                <div>
                  <h3 className="text-2xl font-medium tracking-[-0.03em] text-[#172033] md:text-3xl">
                    {feature.headline}
                  </h3>
                  <p className="mt-4 text-base leading-7 text-[#667085]">
                    {feature.text}
                  </p>
                </div>

                <div
                  className={cn(
                    landingTheme.card,
                    "bg-[linear-gradient(180deg,#FFFFFF_0%,#FAFAF8_100%)] p-5 md:p-6"
                  )}
                >
                  <FeatureMock variant={feature.mock} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
