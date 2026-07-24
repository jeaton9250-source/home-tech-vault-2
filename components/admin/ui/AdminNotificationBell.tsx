"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

import type { AdminNotificationItem } from "@/lib/admin/controlCenterTypes";
import { cn } from "@/lib/design-system/cn";

export default function AdminNotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<
    AdminNotificationItem[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadNotifications() {
      try {
        const response = await fetch(
          "/api/admin/notifications",
          { cache: "no-store" }
        );

        const payload = (await response.json()) as {
          notifications?: AdminNotificationItem[];
        };

        if (!cancelled) {
          setNotifications(
            payload.notifications ?? []
          );
        }
      } catch {
        if (!cancelled) {
          setNotifications([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadNotifications();

    return () => {
      cancelled = true;
    };
  }, []);

  const unreadCount = notifications.length;

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Admin notifications"
        onClick={() => setOpen((current) => !current)}
        className="relative rounded-full border border-border-subtle p-2 text-text-secondary transition hover:bg-surface-sunken hover:text-text-primary"
      >
        <Bell size={16} />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-charcoal px-1 text-[10px] font-semibold text-white">
            {unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-30 mt-2 w-80 overflow-hidden rounded-[20px] border border-border-subtle bg-surface-card shadow-[var(--shadow-lg)]">
          <div className="border-b border-border-subtle px-4 py-3">
            <p className="text-sm font-semibold text-text-primary">
              Notifications
            </p>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <p className="px-4 py-6 text-sm text-text-secondary">
                Loading notifications…
              </p>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-6 text-sm text-text-secondary">
                You&apos;re all caught up.
              </p>
            ) : (
              notifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={notification.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block border-b border-border-subtle px-4 py-3 transition hover:bg-surface-sunken/70"
                  )}
                >
                  <p className="text-sm font-medium text-text-primary">
                    {notification.title}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-text-secondary">
                    {notification.description}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
