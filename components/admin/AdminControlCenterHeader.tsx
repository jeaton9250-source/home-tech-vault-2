"use client";

import { usePathname } from "next/navigation";
import {
  ExternalLink,
} from "lucide-react";

import AdminAccountMenu from "@/components/admin/AdminAccountMenu";
import AdminGlobalSearch from "@/components/admin/founder-control-center/AdminGlobalSearch";
import AdminNotificationBell from "@/components/admin/ui/AdminNotificationBell";

import {
  ADMIN_APP_HOME_HREF,
  ADMIN_NAV_GROUPS,
  isAdminNavItemActive,
} from "@/lib/admin/navigation";

export default function AdminControlCenterHeader() {
  const pathname = usePathname();

  const currentItem =
    ADMIN_NAV_GROUPS
      .flatMap((group) => group.items)
      .find((item) =>
        isAdminNavItemActive(
          pathname,
          item
        )
      );

  return (
    <header className="sticky top-0 z-30 hidden border-b border-white/[0.06] bg-[#142b40]/[0.97] text-[#f7f3ec] shadow-[0_18px_50px_-46px_rgba(5,15,25,0.8)] backdrop-blur-xl lg:block">
      <div className="flex min-h-[76px] items-center justify-between gap-6 px-8 xl:px-10">
        <div className="min-w-0">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#aab79e]">
            Founder Control Center
          </p>

          <h2 className="mt-1.5 truncate font-serif text-[19px] font-semibold tracking-[-0.025em] text-[#f7f3ec]">
            {currentItem?.label ??
              "Overview"}
          </h2>
        </div>

        <div className="flex flex-1 items-center justify-end gap-3">
          <div className="w-full max-w-[420px]">
            <AdminGlobalSearch />
          </div>

          <a
            href={ADMIN_APP_HOME_HREF}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3.5 text-sm font-medium text-white/70 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
          >
            View App
            <ExternalLink size={14} />
          </a>

          <AdminNotificationBell />
          <AdminAccountMenu />
        </div>
      </div>
    </header>
  );
}
