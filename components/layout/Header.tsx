"use client";

import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  Bell,
  Search,
  X,
} from "lucide-react";

const pageTitles: Record<
  string,
  {
    title: string;
    description: string;
  }
> = {
  "/dashboard": {
    title: "Home",
    description:
      "A simple view of your home technology.",
  },

  "/devices": {
    title: "Devices",
    description:
      "Browse and manage everything in your vault.",
  },

  "/home": {
    title: "Rooms",
    description:
      "See your technology organized by location.",
  },

  "/network": {
    title: "Network",
    description:
      "View connected devices and network details.",
  },

  "/documents": {
    title: "Documents",
    description:
      "Keep receipts, manuals, and important files together.",
  },

  "/warranties": {
    title: "Warranties",
    description:
      "Track coverage and upcoming expiration dates.",
  },

  "/maintenance": {
    title: "Maintenance",
    description:
      "Stay ahead of updates, cleaning, and repairs.",
  },

  "/subscriptions": {
    title: "Subscriptions",
    description:
      "Understand your recurring technology costs.",
  },

  "/reports": {
    title: "Reports",
    description:
      "Create clear records for insurance and planning.",
  },

  "/insights": {
    title: "Insights",
    description:
      "See what needs your attention.",
  },

  "/settings": {
    title: "Account & Settings",
    description:
      "Manage your profile, preferences, security, and subscription.",
  },

  "/contact": {
    title: "Contact",
    description:
      "Get help or send us a message.",
  },
};

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams =
    useSearchParams();

  const [search, setSearch] =
    useState("");

  useEffect(() => {
    if (
      pathname === "/devices"
    ) {
      setSearch(
        searchParams.get(
          "search"
        ) || ""
      );
    }
  }, [
    pathname,
    searchParams,
  ]);

  const pageInfo = useMemo(
    () =>
      getPageInfo(pathname),
    [pathname]
  );

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const query =
      search.trim();

    if (!query) {
      router.push(
        "/devices"
      );

      return;
    }

    router.push(
      `/devices?search=${encodeURIComponent(
        query
      )}`
    );
  }

  function clearSearch() {
    setSearch("");

    if (
      pathname === "/devices"
    ) {
      router.push(
        "/devices"
      );
    }
  }

  return (
    <header className="flex flex-col gap-5 border-b border-border-subtle bg-[#FAFAF8]/95 px-5 py-5 backdrop-blur md:px-8 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-semibold tracking-[-0.03em] text-text-primary">
          {pageInfo.title}
        </h1>

        <p className="mt-1 max-w-xl text-sm leading-6 text-text-secondary">
          {
            pageInfo.description
          }
        </p>
      </div>

      <div className="flex w-full items-center gap-3 lg:w-auto">
        <form
          onSubmit={
            handleSubmit
          }
          className="relative flex-1 lg:w-[360px] lg:flex-none"
        >
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary"
          />

          <input
            type="search"
            value={search}
            onChange={(
              event
            ) =>
              setSearch(
                event.target
                  .value
              )
            }
            placeholder="Search devices..."
            aria-label="Search devices"
            className="w-full rounded-2xl border border-border-subtle bg-white py-3 pl-11 pr-11 text-sm text-text-primary shadow-sm outline-none transition placeholder:text-text-tertiary focus:border-interaction focus:ring-4 focus:ring-interaction/10"
          />

          {search && (
            <button
              type="button"
              onClick={
                clearSearch
              }
              aria-label="Clear search"
              className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-text-tertiary transition hover:bg-surface-sunken hover:text-text-primary"
            >
              <X
                size={15}
              />
            </button>
          )}
        </form>

        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border-subtle bg-white text-text-secondary shadow-sm transition hover:border-warning/40 hover:text-text-primary"
        >
          <Bell size={18} />

          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-2 border-surface-card bg-home-health" />
        </button>
      </div>
    </header>
  );
}

function getPageInfo(
  pathname: string
) {
  const exactMatch =
    pageTitles[pathname];

  if (exactMatch) {
    return exactMatch;
  }

  if (
    pathname.startsWith(
      "/devices/"
    )
  ) {
    return {
      title:
        "Device Details",
      description:
        "Everything important about this device.",
    };
  }

  return {
    title:
      "Home Tech Vault",
    description:
      "Organize, protect, and simplify your home technology.",
  };
}