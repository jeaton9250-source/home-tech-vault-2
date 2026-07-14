"use client";

import { type FormEvent, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Search, X } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const [search, setSearch] = useState("");

  function runSearch() {
    const query = search.trim();

    if (!query) {
      return;
    }

    router.push(`/devices?search=${encodeURIComponent(query)}`);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runSearch();
  }

  function clearSearch() {
    setSearch("");

    if (pathname === "/devices") {
      router.push("/devices");
    }
  }

  return (
    <header className="flex flex-col gap-5 rounded-[32px] border border-[#E8E2D6] bg-white px-6 py-5 shadow-sm lg:flex-row lg:items-center lg:justify-between lg:px-8">
      <div>
        <h1 className="text-2xl font-bold text-[#111827]">Home Tech Vault</h1>

        <p className="text-sm text-neutral-500">Protect. Organize. Simplify.</p>
      </div>

      <div className="flex w-full items-center gap-3 lg:w-auto">
        <form
          onSubmit={handleSubmit}
          className="flex w-full items-center gap-2 lg:w-[420px]"
        >
          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search devices, brands, models, or rooms..."
              className="w-full rounded-2xl border border-[#E8E2D6] bg-[#F7F5EF] py-3 pl-11 pr-11 text-[#111827] outline-none focus:border-[#C8A96A] focus:ring-2 focus:ring-[#C8A96A]/20"
            />

            {search && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-neutral-400 hover:bg-white hover:text-[#111827]"
              >
                <X size={17} />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="rounded-xl bg-[#111827] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#263044]"
          >
            Search
          </button>
        </form>

    
      </div>
    </header>
  );
}
