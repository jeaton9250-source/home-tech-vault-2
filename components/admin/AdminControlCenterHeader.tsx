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
    <header className="sticky top-0 z-30 hidden border-b border-[#e4ded3] bg-[#f8f5ef]/95 backdrop-blur-xl lg:block">
      <div className="flex min-h-[70px] items-center justify-between gap-5 px-7 xl:px-9">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6f6a62]">
            Founder Control Center
          </p>

          <h2 className="mt-1 truncate text-lg font-semibold tracking-[-0.02em] text-[#18202b]">
            {currentItem?.label ??
              "Administration"}
          </h2>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2.5">
          <div className="w-full max-w-[390px]">
            <AdminGlobalSearch />
          </div>

          <a
            href={ADMIN_APP_HOME_HREF}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#ded8ce] bg-white px-3.5 text-sm font-medium text-[#51565d] shadow-sm transition hover:border-[#cfc8bd] hover:text-[#18202b]"
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
