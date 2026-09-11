"use client";

import { Bell, ChevronDown, Search } from "lucide-react";

export default function DashboardTopbar() {
  return (
    <div className="flex items-center justify-between gap-5">
      <div className="relative hidden w-full max-w-[560px] md:block">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a96a1]" />

        <input
          placeholder="Search your home..."
          className="h-12 w-full rounded-[16px] border border-[#142437]/[0.07] bg-white pl-11 pr-4 text-sm text-[#142437] outline-none shadow-[0_8px_28px_rgba(20,36,55,0.04)] placeholder:text-[#9aa4ad] focus:border-[#829ba6]/40"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <button className="flex h-10 w-10 items-center justify-center rounded-full text-[#657483] transition hover:bg-white">
          <Bell className="h-[18px] w-[18px]" />
        </button>

        <button className="flex items-center gap-3 rounded-full bg-white px-2 py-1.5 shadow-[0_8px_24px_rgba(20,36,55,0.04)]">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dfe8e5] text-xs font-semibold text-[#142437]">
            J
          </div>

          <span className="hidden text-sm font-medium text-[#142437] sm:block">
            Jason
          </span>

          <ChevronDown className="mr-1 h-4 w-4 text-[#84909a]" />
        </button>
      </div>
    </div>
  );
}
