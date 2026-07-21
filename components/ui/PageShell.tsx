import { ReactNode } from "react";

import PageLayout from "@/components/ui/PageLayout";
import { cn } from "@/lib/design-system/cn";

type PageShellProps = {
  children: ReactNode;
  className?: string;
};

export default function PageShell({
  children,
  className = "",
}: PageShellProps) {
  return (
    <PageLayout
      className={cn(
        "min-h-[calc(100vh-var(--topbar-height))] bg-surface-base text-text-primary",
        className
      )}
    >
      {children}
    </PageLayout>
  );
}
