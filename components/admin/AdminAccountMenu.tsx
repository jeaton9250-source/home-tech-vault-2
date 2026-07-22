"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Settings,
  User,
} from "lucide-react";

import {
  ADMIN_APP_HOME_HREF,
} from "@/lib/admin/navigation";
import { supabase } from "@/lib/supabase";

type AdminAccountMenuProps = {
  compact?: boolean;
};

export default function AdminAccountMenu({
  compact = false,
}: AdminAccountMenuProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] =
    useState("Administrator");
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setDisplayName("Administrator");
        setEmail("");
        return;
      }

      setEmail(user.email || "");

      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      setDisplayName(
        data?.full_name?.trim() ||
          user.email?.split("@")[0] ||
          "Administrator"
      );
    }

    void loadProfile();
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

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

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handlePointerDown
    );
    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handlePointerDown
      );
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [open]);

  async function signOut() {
    setOpen(false);
    await supabase.auth.signOut();
    router.push("/login");
  }

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((current) => !current);
        }}
        className="htv-focus-ring flex items-center gap-2 rounded-[var(--radius-button)] border border-border-subtle bg-surface-card px-2 py-1.5 text-sm hover:bg-surface-sunken"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Open administrator menu"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border-subtle bg-surface-sunken text-xs font-semibold text-charcoal shadow-[var(--shadow-inset)]">
          {initials || "AD"}
        </span>

        {!compact ? (
          <>
            <span className="hidden max-w-[120px] truncate font-medium text-text-primary md:inline">
              {displayName}
            </span>
            <ChevronDown
              size={16}
              className="hidden text-text-tertiary md:block"
            />
          </>
        ) : null}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-[20px] border border-border-subtle bg-surface-card shadow-[var(--shadow-md)]"
        >
          <div className="border-b border-border-subtle px-4 py-4">
            <p className="truncate text-sm font-medium text-text-primary">
              {displayName}
            </p>
            {email ? (
              <p className="truncate text-xs text-text-secondary">
                {email}
              </p>
            ) : null}
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">
              Platform administrator
            </p>
          </div>

          <div className="p-2">
            <AdminMenuLink
              href="/settings"
              icon={User}
              label="Account & Settings"
              onSelect={() => {
                setOpen(false);
              }}
            />
            <AdminMenuLink
              href={ADMIN_APP_HOME_HREF}
              icon={LayoutDashboard}
              label="View App"
              onSelect={() => {
                setOpen(false);
              }}
            />
            <AdminMenuLink
              href="/admin/platform"
              icon={Settings}
              label="Admin Settings"
              onSelect={() => {
                setOpen(false);
              }}
            />
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                void signOut();
              }}
              className="flex w-full items-center gap-2 rounded-[var(--radius-button)] px-3 py-2.5 text-sm text-text-secondary hover:bg-surface-sunken hover:text-text-primary focus-visible:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AdminMenuLink({
  href,
  icon: Icon,
  label,
  onSelect,
}: {
  href: string;
  icon: typeof User;
  label: string;
  onSelect: () => void;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onSelect}
      className="flex items-center gap-2 rounded-[var(--radius-button)] px-3 py-2.5 text-sm text-text-secondary hover:bg-surface-sunken hover:text-text-primary focus-visible:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25"
    >
      <Icon size={16} />
      {label}
    </Link>
  );
}
