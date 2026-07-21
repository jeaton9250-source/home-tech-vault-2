import type { ReactNode } from "react";

import { cn } from "@/lib/design-system/cn";

type PageLayoutProps = {
  children: ReactNode;
  className?: string;
};

export default function PageLayout({
  children,
  className,
}: PageLayoutProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[var(--content-max)] space-y-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8",
        className
      )}
    >
      {children}
    </div>
  );
}

type PageSectionProps = {
  children: ReactNode;
  className?: string;
};

export function PageSection({
  children,
  className,
}: PageSectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      {children}
    </section>
  );
}
