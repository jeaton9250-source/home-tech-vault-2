"use client";

import Link from "next/link";

import { cn } from "@/lib/design-system/cn";
import {
  NETWORK_TABS,
  networkTabHref,
  type NetworkTabId,
} from "@/lib/network/tabs";

type NetworkTabsProps = {
  activeTab: NetworkTabId;
};

export default function NetworkTabs({
  activeTab,
}: NetworkTabsProps) {
  return (
    <nav
      className="mt-6 flex gap-2 overflow-x-auto rounded-[18px] border border-[#182533]/10 bg-[#e5dfd4] p-1.5"
      aria-label="Network sections"
    >
      {NETWORK_TABS.map((tab) => {
        const isActive =
          tab.id === activeTab;

        return (
          <Link
            key={tab.id}
            href={networkTabHref(
              tab.id
            )}
            scroll={false}
            aria-current={
              isActive
                ? "page"
                : undefined
            }
            className={cn(
              "shrink-0 rounded-[14px] px-4 py-2.5 text-sm font-medium transition",
              isActive
                ? "bg-surface-card text-[#17212a] shadow-[var(--shadow-sm)]"
                : "text-[#68737b] hover:bg-surface-card/60 hover:text-[#17212a]"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
