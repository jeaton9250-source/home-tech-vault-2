"use client";

import { Bell, Search, UserCircle2 } from "lucide-react";

export default function TopBar() {
  const hour = new Date().getHours();

  const greeting =
    hour < 12
      ? "Good Morning"
      : hour < 18
      ? "Good Afternoon"
      : "Good Evening";

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 items-center justify-between px-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">
            {greeting}
          </h1>

          <p className="mt-1 text-sm text-neutral-500">
            {today}
          </p>
        </div>

        <div className="hidden w-[420px] items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 lg:flex">
          <Search size={18} className="text-neutral-400" />

          <input
            placeholder="Search your vault..."
            className="w-full bg-transparent outline-none placeholder:text-neutral-400"
          />
        </div>

        <div className="flex items-center gap-3">
          <button className="rounded-2xl border border-neutral-200 p-3 transition hover:bg-neutral-100">
            <Bell size={20} />
          </button>

          <button className="rounded-2xl border border-neutral-200 p-3 transition hover:bg-neutral-100">
            <UserCircle2 size={22} />
          </button>
        </div>
      </div>
    </header>
  );
}