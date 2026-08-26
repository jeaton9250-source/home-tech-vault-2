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
    <div className="min-h-screen bg-[#f7f3ec]">
      <AdminMobileNav />

      {/* DESKTOP SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[272px] flex-col border-r border-white/[0.06] bg-[#142b40] shadow-[18px_0_60px_-48px_rgba(5,15,25,0.85)] lg:flex">
        <div className="border-b border-white/[0.06] px-6 py-6">
          <Link
            href="/admin"
            className="block"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-[#8da66e]/25 bg-[#8da66e]/10 text-[#b9caa4] shadow-inner">
                <ShieldCheck size={17} />
              </div>

              <div className="min-w-0">
                <p className="truncate font-serif text-[15px] font-semibold tracking-[-0.02em] text-[#f7f3ec]">
                  Home Tech Vault
                </p>

                <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/35">
                  Founder Control Center
                </p>
              </div>
            </div>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-7">
          <AdminNav />
        </div>

        <div className="border-t border-white/[0.06] p-4">
          <div className="rounded-[18px] border border-white/[0.07] bg-white/[0.035] p-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#8da66e] shadow-[0_0_0_4px_rgba(141,166,110,0.10)]" />

              <p className="text-xs font-medium text-white/65">
                Platform operational
              </p>
            </div>

            <p className="mt-1.5 text-[11px] leading-5 text-white/30">
              Production systems are live
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
      <div className="min-h-screen lg:pl-[272px]">
        <AdminControlCenterHeader />

        <main className="mx-auto w-full max-w-[1720px] px-4 py-6 sm:px-6 lg:px-8 lg:py-9 xl:px-10">
          <div className="space-y-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
