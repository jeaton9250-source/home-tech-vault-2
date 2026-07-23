"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/lib/design-system/cn";
import {
  NETWORK_TABS,
  networkTabHref,
  type NetworkTabId,
} from "@/lib/network/tabs";

type NetworkTabsProps = {
  activeTab: NetworkTabId;
};

export default function NetworkTabs({ activeTab }: NetworkTabsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <div className="border-b border-border-subtle">
      <div
        className="-mb-px flex gap-1 overflow-x-auto pb-px"
        role="tablist"
        aria-label="Network sections"
      >
        {NETWORK_TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          const href = networkTabHref(tab.id);

          return (
            <Link
              key={tab.id}
              href={href}
              scroll={false}
              role="tab"
              aria-selected={isActive}
              aria-controls={`network-panel-${tab.id}`}
              className={cn(
                "shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition",
                isActive
                  ? "border-charcoal text-text-primary"
                  : "border-transparent text-text-secondary hover:border-border-subtle hover:text-text-primary"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <span className="sr-only">
        Viewing {activeTab} on {pathname}
        {searchParams.toString()
          ? `?${searchParams.toString()}`
          : ""}
      </span>
    </div>
  );
}
