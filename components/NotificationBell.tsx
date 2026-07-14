"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, Loader2 } from "lucide-react";

import {
  useNotifications,
  type VaultNotification,
} from "@/hooks/useNotifications";

export default function NotificationBell() {
  const router = useRouter();

  const containerRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);

  const {
    notifications,
    unreadCount,
    readIds,
    loading,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  function openNotification(notification: VaultNotification) {
    markAsRead(notification.id);
    setOpen(false);
    router.push(notification.href);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#E8E2D6] bg-white text-[#111827] transition hover:bg-[#F7F5EF]"
        aria-label="Open notifications"
        aria-expanded={open}
      >
        <Bell size={20} />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#C8A96A] px-1 text-[10px] font-bold text-[#111827]">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-14 z-[100] w-[min(390px,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-[#E8E2D6] bg-white shadow-2xl">
          <div className="flex items-start justify-between gap-4 border-b border-[#E8E2D6] p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C8A96A]">
                Activity Center
              </p>

              <h2 className="mt-1 text-xl font-semibold text-[#111827]">
                Notifications
              </h2>

              <p className="mt-1 text-xs text-neutral-500">
                {unreadCount === 0
                  ? "You’re all caught up."
                  : `${unreadCount} unread notification${
                      unreadCount === 1 ? "" : "s"
                    }`}
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F7F5EF] text-[#111827] transition hover:bg-[#EEEAE1]"
                aria-label="Mark all notifications as read"
                title="Mark all as read"
              >
                <CheckCheck size={18} />
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex min-h-48 items-center justify-center gap-3 text-sm text-neutral-500">
              <Loader2 size={19} className="animate-spin" />
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F7F5EF] text-emerald-700">
                <CheckCheck size={22} />
              </div>

              <p className="mt-4 font-semibold text-[#111827]">
                Everything looks good
              </p>

              <p className="mt-2 text-sm text-neutral-500">
                No active vault alerts were found.
              </p>
            </div>
          ) : (
            <div className="max-h-[430px] overflow-y-auto">
              {notifications.slice(0, 6).map((notification) => (
                <DropdownNotification
                  key={notification.id}
                  notification={notification}
                  isRead={readIds.has(notification.id)}
                  onClick={() => openNotification(notification)}
                />
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              router.push("/notifications");
            }}
            className="flex w-full items-center justify-center border-t border-[#E8E2D6] px-5 py-4 text-sm font-semibold text-[#111827] transition hover:bg-[#F7F5EF]"
          >
            View All Notifications →
          </button>
        </div>
      )}
    </div>
  );
}

function DropdownNotification({
  notification,
  isRead,
  onClick,
}: {
  notification: VaultNotification;
  isRead: boolean;
  onClick: () => void;
}) {
  const Icon = notification.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start gap-3 border-b border-[#E8E2D6] px-5 py-4 text-left transition last:border-b-0 hover:bg-[#F7F5EF] ${
        isRead ? "bg-white" : "bg-[#FFFDF8]"
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          notification.type === "warning"
            ? "bg-amber-100 text-amber-700"
            : notification.type === "success"
              ? "bg-emerald-100 text-emerald-700"
              : notification.type === "insight"
                ? "bg-violet-100 text-violet-700"
                : "bg-[#F7F5EF] text-[#C8A96A]"
        }`}
      >
        <Icon size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <p className="line-clamp-2 text-sm font-semibold text-[#111827]">
            {notification.title}
          </p>

          {!isRead && (
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#C8A96A]" />
          )}
        </div>

        <p className="mt-1 line-clamp-2 text-xs leading-5 text-neutral-500">
          {notification.description}
        </p>
      </div>
    </button>
  );
}
