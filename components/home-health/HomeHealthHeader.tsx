"use client";

import { brand } from "@/lib/design-system/tokens";
import {
  formatDisplayDate,
  getTimeGreeting,
} from "@/lib/home-health/greeting";
import { usePermissions } from "@/hooks/usePermissions";
import { MORGAN_HOUSEHOLD } from "@/lib/demo/morganHousehold";

type HomeHealthHeaderProps = {
  firstName: string;
};

export default function HomeHealthHeader({
  firstName,
}: HomeHealthHeaderProps) {
  const { isDemo } = usePermissions();

  return (
    <header className="space-y-2" data-tour="home-pulse">
      <p className="text-overline text-home-health">
        {brand.homePulse}
      </p>

      {isDemo ? (
        <>
          <h1 className="text-[clamp(1.875rem,4vw,2.75rem)] font-medium tracking-[-0.03em] text-text-primary">
            Welcome to the {MORGAN_HOUSEHOLD.name}.
          </h1>
          <p className="text-[0.9375rem] leading-7 text-text-muted md:text-base">
            Everything is running smoothly today.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-[clamp(1.875rem,4vw,2.75rem)] font-medium tracking-[-0.03em] text-text-primary">
            {getTimeGreeting(firstName)}
          </h1>
          <p className="text-[0.9375rem] leading-7 text-text-muted md:text-base">
            How is your home, what needs attention, and what to do next.
          </p>
        </>
      )}

      <p className="text-sm text-text-secondary">
        {formatDisplayDate()}
      </p>
    </header>
  );
}
