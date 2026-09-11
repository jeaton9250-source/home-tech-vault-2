import type { ReactNode } from "react";

import AppShell from "@/components/navigation/AppShell";

export default function ImportsLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
