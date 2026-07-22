"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Loader2, Search } from "lucide-react";

import { cn } from "@/lib/design-system/cn";
import type { AdminUserSummary } from "@/lib/admin/types";

type SearchHousehold = {
  id: string;
  name: string;
  ownerEmail: string | null;
  deviceCount: number;
};

type SearchResult =
  | {
      kind: "user";
      id: string;
      label: string;
      meta: string;
      href: string;
    }
  | {
      kind: "household";
      id: string;
      label: string;
      meta: string;
      href: string;
    };

type UsersResponse = {
  users?: AdminUserSummary[];
};

type HouseholdsResponse = {
  households?: SearchHousehold[];
};

export default function AdminGlobalSearch() {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      setOpen(true);

      try {
        const params = new URLSearchParams({
          q: trimmed,
          page: "1",
          limit: "5",
        });

        const [usersResponse, householdsResponse] =
          await Promise.all([
            fetch(
              `/api/admin/users?${params.toString()}`,
              { signal: controller.signal }
            ),
            fetch(
              `/api/admin/households?${params.toString()}`,
              { signal: controller.signal }
            ),
          ]);

        const usersPayload =
          (await usersResponse.json()) as UsersResponse;
        const householdsPayload =
          (await householdsResponse.json()) as HouseholdsResponse;

        const nextResults: SearchResult[] = [
          ...(usersPayload.users ?? []).map(
            (user) => ({
              kind: "user" as const,
              id: user.id,
              label:
                user.fullName ||
                user.email ||
                user.id,
              meta: `${user.deviceCount} device${user.deviceCount === 1 ? "" : "s"}`,
              href: `/admin/users?selected=${user.id}`,
            })
          ),
          ...(householdsPayload.households ?? []).map(
            (household) => ({
              kind: "household" as const,
              id: household.id,
              label: household.name,
              meta: `${household.deviceCount} device${household.deviceCount === 1 ? "" : "s"}`,
              href: `/admin/households`,
            })
          ),
        ];

        setResults(nextResults.slice(0, 8));
        setActiveIndex(-1);
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    function handlePointerDown(
      event: MouseEvent
    ) {
      if (
        !containerRef.current?.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handlePointerDown
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handlePointerDown
      );
    };
  }, []);

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (!open || results.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) =>
        current >= results.length - 1
          ? 0
          : current + 1
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) =>
        current <= 0
          ? results.length - 1
          : current - 1
      );
    }

    if (
      event.key === "Enter" &&
      activeIndex >= 0
    ) {
      event.preventDefault();
      window.location.href =
        results[activeIndex]?.href ?? "#";
    }

    if (event.key === "Escape") {
      setOpen(false);
    }
  }

  const showPanel =
    open &&
    query.trim().length >= 2 &&
    (loading || results.length > 0);

  return (
    <div ref={containerRef} className="relative">
      <label
        htmlFor={`${listboxId}-input`}
        className="sr-only"
      >
        Search users, households, and devices
      </label>

      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary"
        />

        <input
          id={`${listboxId}-input`}
          type="search"
          value={query}
          onChange={(event) => {
            const value = event.target.value;
            setQuery(value);

            if (value.trim().length < 2) {
              setResults([]);
              setLoading(false);
              setOpen(false);
              setActiveIndex(-1);
            }
          }}
          onFocus={() => {
            if (query.trim().length >= 2) {
              setOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search users, households, devices..."
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={`${listboxId}-listbox`}
          aria-autocomplete="list"
          className="w-full rounded-[20px] border border-border-subtle bg-surface-card py-3.5 pl-11 pr-4 text-sm text-text-primary shadow-[var(--shadow-sm)] outline-none transition placeholder:text-text-tertiary focus-visible:border-interaction/40 focus-visible:ring-2 focus-visible:ring-interaction/15"
        />

        {loading ? (
          <Loader2
            aria-hidden="true"
            className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-text-tertiary"
          />
        ) : null}
      </div>

      {showPanel ? (
        <div
          id={`${listboxId}-listbox`}
          role="listbox"
          className="absolute z-20 mt-2 w-full overflow-hidden rounded-[20px] border border-border-subtle bg-surface-card shadow-[var(--shadow-md)]"
        >
          {loading && results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-text-secondary">
              Searching…
            </p>
          ) : null}

          {!loading && results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-text-secondary">
              No users or households matched this
              search.
            </p>
          ) : null}

          {results.map((result, index) => (
            <Link
              key={`${result.kind}-${result.id}`}
              href={result.href}
              role="option"
              aria-selected={
                index === activeIndex
              }
              className={cn(
                "block border-t border-border-subtle px-4 py-3 first:border-t-0 transition",
                index === activeIndex
                  ? "bg-surface-sunken"
                  : "hover:bg-surface-sunken"
              )}
              onMouseEnter={() => {
                setActiveIndex(index);
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {result.label}
                  </p>
                  <p className="mt-1 text-xs text-text-secondary">
                    {result.meta}
                  </p>
                </div>
                <span className="rounded-full border border-border-subtle px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">
                  {result.kind}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
