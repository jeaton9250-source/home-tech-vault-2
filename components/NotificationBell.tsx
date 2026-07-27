"use client";

import { useRouter } from "next/navigation";

import {
  Bell,
  CheckCheck,
  Loader2,
} from "lucide-react";

import DropdownMenu from "@/components/navigation/DropdownMenu";

import { useNavMenu } from "@/hooks/useNavMenu";
import {
  useNotifications,
  type VaultNotification,
} from "@/hooks/useNotifications";

import { NOTIFICATIONS_LOCAL_STATE_NOTE } from "@/lib/notifications";

import { NAV_MENU_IDS } from "@/lib/navigation/menuIds";
import { cn } from "@/lib/design-system/cn";

type NotificationBellProps = {
  compact?: boolean;
};

export default function NotificationBell({
  compact = false,
}: NotificationBellProps) {
  const router = useRouter();
  const { closeMenu } = useNavMenu();

  const {
    notifications,
    unreadCount,
    readIds,
    loading,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const displayUnreadCount =
    unreadCount > 99 ? "99+" : String(unreadCount);

  function openNotification(
    notification: VaultNotification
  ) {
    markAsRead(notification.id);
    closeMenu();
    router.push(notification.href);
  }

  return (
    <DropdownMenu
      menuId={NAV_MENU_IDS.notifications}
      align="end"
      widthClass="w-[min(420px,calc(100vw-24px))]"
      role="dialog"
      ariaLabel="Notifications"
      trigger={(triggerProps) => (
        <button
          type="button"
          {...triggerProps}
          className={cn(
            "relative flex shrink-0 items-center justify-center transition",
            compact
              ? "h-9 w-9 rounded-full text-text-secondary hover:bg-surface-sunken hover:text-text-primary"
              : "h-10 w-10 rounded-[var(--radius-button)] border border-border-subtle bg-surface-card text-text-primary hover:bg-surface-sunken"
          )}
          aria-label={
            unreadCount > 0
              ? `Notifications, ${displayUnreadCount} unread`
              : "Notifications"
          }
        >
          <Bell size={compact ? 18 : 20} aria-hidden />

          {unreadCount > 0 ? (
            <span
              className={cn(
                "absolute flex min-w-5 items-center justify-center rounded-full bg-home-health px-1 text-[10px] font-bold text-surface-card",
                compact ? "-right-1 -top-1 h-[18px]" : "-right-1 -top-1 h-5"
              )}
              aria-hidden
            >
              {displayUnreadCount}
            </span>
          ) : null}
        </button>
      )}
    >
      <div className="flex max-h-[min(600px,calc(100vh-96px))] flex-col">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border-subtle p-5">
          <div>
            <p className="text-overline">Activity Center</p>

            <h2 className="mt-1 text-xl font-semibold text-text-primary">
              Notifications
            </h2>

            <p className="mt-1 text-xs text-text-secondary">
              {unreadCount === 0
                ? "You’re all caught up."
                : `${unreadCount} unread notification${
                    unreadCount === 1 ? "" : "s"
                  }`}
            </p>
          </div>

          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={markAllAsRead}
              className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-button)] bg-surface-sunken text-text-primary transition hover:bg-surface-hover"
              aria-label="Mark all notifications as read"
              title="Mark all as read"
            >
              <CheckCheck size={18} />
            </button>
          ) : null}
        </div>

        {loading ? (
          <div className="flex min-h-48 items-center justify-center gap-3 text-sm text-text-secondary">
            <Loader2 size={19} className="animate-spin" />
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-sunken text-emerald-700">
              <CheckCheck size={22} />
            </div>

            <p className="mt-4 font-semibold text-text-primary">
              Everything looks good
            </p>

            <p className="mt-2 text-sm text-text-secondary">
              No active vault alerts were found.
            </p>
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto">
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

        <p className="shrink-0 border-t border-border-subtle px-5 py-3 text-xs leading-5 text-text-tertiary">
          {NOTIFICATIONS_LOCAL_STATE_NOTE}
        </p>

        <button
          type="button"
          role="menuitem"
          tabIndex={-1}
          onClick={() => {
            closeMenu();
            router.push("/notifications");
          }}
          className="flex w-full shrink-0 items-center justify-center border-t border-border-subtle px-5 py-4 text-sm font-semibold text-text-primary transition hover:bg-surface-sunken focus-visible:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25"
        >
          View All Notifications →
        </button>
      </div>
    </DropdownMenu>
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
      role="menuitem"
      tabIndex={-1}
      onClick={onClick}
      className={`flex w-full items-start gap-3 border-b border-border-subtle px-5 py-4 text-left transition last:border-b-0 hover:bg-surface-sunken focus-visible:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25 ${
        isRead
          ? "bg-surface-card"
          : "bg-interaction-soft/50"
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
                : "bg-interaction-soft text-interaction"
        }`}
      >
        <Icon size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <p className="line-clamp-2 text-sm font-semibold text-text-primary">
            {notification.title}
          </p>

          {!isRead ? (
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-home-health" />
          ) : null}
        </div>

        <p className="mt-1 line-clamp-2 text-xs leading-5 text-text-secondary">
          {notification.description}
        </p>
      </div>
    </button>
  );
}
