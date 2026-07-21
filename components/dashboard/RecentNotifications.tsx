"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowRight,
  Bell,
  X,
} from "lucide-react";

import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";

import {
  useNotifications,
  type VaultNotification,
} from "@/hooks/useNotifications";

import { NOTIFICATIONS_LOCAL_STATE_NOTE } from "@/lib/notifications";

type RecentNotificationsProps = {
  limit?: number;
};

export default function RecentNotifications({
  limit = 4,
}: RecentNotificationsProps) {
  const router = useRouter();

  const {
    notifications,
    readIds,
    loading,
    markAsRead,
    dismissNotification,
  } = useNotifications();

  const visible = notifications.slice(
    0,
    limit
  );

  function openNotification(
    notification: VaultNotification
  ) {
    markAsRead(notification.id);
    router.push(notification.href);
  }

  return (
    <PageCard interactive>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-overline">
            Smart Notifications
          </p>

          <h2 className="text-section-title mt-2 text-text-primary">
            Notifications
          </h2>
        </div>

        <Link
          href="/notifications"
          className="inline-flex items-center gap-1 text-sm font-medium text-interaction hover:text-interaction-hover"
        >
          View all
          <ArrowRight size={16} />
        </Link>
      </div>

      {loading ? (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 3 }).map(
            (_, index) => (
              <div
                key={index}
                className="h-24 animate-pulse rounded-[var(--radius-card)] bg-surface-sunken"
              />
            )
          )}
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-6 rounded-[var(--radius-card)] border border-border-subtle bg-surface-sunken/60 p-8 text-center">
          <Bell
            size={28}
            className="mx-auto text-charcoal-soft"
          />

          <p className="mt-4 font-medium text-text-primary">
            You&apos;re all caught up
          </p>

          <p className="mt-2 text-sm text-text-secondary">
            New alerts about warranties,
            maintenance, and household changes
            will appear here.
          </p>

          <p className="mt-3 text-xs text-text-tertiary">
            {NOTIFICATIONS_LOCAL_STATE_NOTE}
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {visible.map((notification) => {
            const Icon = notification.icon;

            const unread = !readIds.has(
              notification.id
            );

            return (
              <div
                key={notification.id}
                className={`rounded-[var(--radius-card)] border p-4 transition ${
                  unread
                    ? "border-interaction/20 bg-interaction-soft/50"
                    : "border-border-subtle bg-surface-card"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-button)] bg-interaction-soft text-interaction">
                    <Icon size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
                          {notification.category}
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            openNotification(
                              notification
                            )
                          }
                          className="mt-1 text-left text-sm font-medium text-text-primary hover:text-interaction"
                        >
                          {
                            notification.title
                          }
                        </button>

                        <p className="mt-1 text-sm text-text-secondary">
                          {
                            notification.description
                          }
                        </p>
                      </div>

                      {notification.dismissible && (
                        <button
                          type="button"
                          onClick={() =>
                            dismissNotification(
                              notification.id
                            )
                          }
                          className="rounded-md p-1 text-text-tertiary hover:bg-surface-sunken hover:text-text-primary"
                          aria-label="Dismiss notification"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>

                    {notification.actionLabel && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="mt-3"
                        onClick={() =>
                          openNotification(
                            notification
                          )
                        }
                      >
                        {
                          notification.actionLabel
                        }
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageCard>
  );
}
