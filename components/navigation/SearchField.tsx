"use client";

import {
  FormEvent,
  useState,
} from "react";

import { usePathname, useRouter } from "next/navigation";

import { Search, X } from "lucide-react";

import { cn } from "@/lib/design-system/cn";

type SearchFieldProps = {
  className?: string;
  compact?: boolean;
};

export default function SearchField({
  className,
  compact = false,
}: SearchFieldProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [search, setSearch] =
    useState("");

  function runSearch() {
    const query = search.trim();

    if (!query) {
      return;
    }

    router.push(
      `/devices?search=${encodeURIComponent(query)}`
    );
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
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
    <form
      onSubmit={handleSubmit}
      className={cn("w-full", className)}
    >
      <div className="relative">
        <Search
          size={18}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary"
        />

        <input
          type="search"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder={
            compact
              ? "Search devices..."
              : "Search devices..."
          }
          className="htv-focus-ring w-full rounded-[var(--radius-input)] border border-border-subtle bg-surface-sunken py-2.5 pl-10 pr-10 text-sm text-text-primary outline-none focus:border-interaction"
          aria-label="Search devices"
        />

        {search && (
          <button
            type="button"
            onClick={clearSearch}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-text-tertiary hover:bg-surface-card hover:text-text-primary"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </form>
  );
}
