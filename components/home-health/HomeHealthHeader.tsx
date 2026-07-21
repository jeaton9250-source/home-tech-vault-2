"use client";

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
      <h1 className="text-3xl font-medium tracking-[-0.03em] text-text-primary md:text-4xl">
        {getTimeGreeting(firstName)}
      </h1>

      <p className="text-base text-text-muted">
        Here&apos;s the current health of your home.
      </p>

      <p className="text-sm text-text-secondary">
        {formatDisplayDate()}
      </p>
    </header>
  );
}
