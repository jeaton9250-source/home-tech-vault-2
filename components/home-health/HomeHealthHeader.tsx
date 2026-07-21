"use client";

import { brand } from "@/lib/design-system/tokens";
import {
  formatDisplayDate,
  getTimeGreeting,
} from "@/lib/home-health/greeting";

type HomeHealthHeaderProps = {
  firstName: string;
};

export default function HomeHealthHeader({
  firstName,
}: HomeHealthHeaderProps) {
  return (
    <header className="space-y-2">
      <p className="text-overline text-home-health">
        {brand.homePulse}
      </p>

      <h1 className="text-[clamp(1.875rem,4vw,2.75rem)] font-medium tracking-[-0.03em] text-text-primary">
        {getTimeGreeting(firstName)}
      </h1>

      <p className="text-[0.9375rem] leading-7 text-text-muted md:text-base">
        Your overall home health, recent activity, and what
        to do next — all in one calm view.
      </p>

      <p className="text-sm text-text-secondary">
        {formatDisplayDate()}
      </p>
    </header>
  );
}
