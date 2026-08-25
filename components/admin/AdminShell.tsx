import Link from "next/link";
import {
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";

import AdminControlCenterHeader from "@/components/admin/AdminControlCenterHeader";
import AdminMobileNav from "@/components/admin/AdminMobileNav";
import AdminNav from "@/components/admin/AdminNav";

import {
  ADMIN_APP_HOME_HREF,
} from "@/lib/admin/navigation";

type AdminShellProps = {
  children: React.ReactNode;
};

export default function AdminShell({
  children,
}: AdminShellProps) {
  return (
    <div className="min-h-screen bg-[#f6f2ea]">
      <AdminMobileNav />

      {/* DESKTOP SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] flex-col border-r border-white/8 bg-[#183047] lg:flex">
        <div className="border-b border-white/8 px-5 py-5">
          <Link
            href="/admin"
            className="block"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#718d4f]/30 bg-[#718d4f]/15 text-[#b8c9a4]">
                <ShieldCheck size={17} />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold tracking-[-0.01em] text-[#f5f1e8]">
                  Home Tech Vault
                </p>

                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.17em] text-white/32">
                  Founder Admin
                </p>
              </div>
            </div>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-6">
          <AdminNav />
        </div>

        <div className="border-t border-white/8 p-3">
          <div className="rounded-xl border border-white/8 bg-white/[0.035] p-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#718d4f]" />

              <p className="text-xs font-medium text-white/65">
                Production
              </p>
            </div>

            <p className="mt-1.5 text-[11px] leading-5 text-white/30">
              Live Home Tech Vault environment
            </p>
          </div>

          <Link
            href={ADMIN_APP_HOME_HREF}
            className="mt-2 flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-white/50 transition hover:bg-white/[0.05] hover:text-white"
          >
            View Customer App
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </aside>

      {/* WORKSPACE */}
      <div className="min-h-screen lg:pl-[264px]">
        <AdminControlCenterHeader />

        <main className="mx-auto w-full max-w-[1680px] px-4 py-5 sm:px-6 lg:px-7 lg:py-7 xl:px-9">
          <div className="space-y-7">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
