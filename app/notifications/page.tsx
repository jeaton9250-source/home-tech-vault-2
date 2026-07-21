"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";

import { usePermissions } from "@/hooks/usePermissions";
import {
  useNotifications,
  type VaultNotification,
} from "@/hooks/useNotifications";

import { NOTIFICATIONS_LOCAL_STATE_NOTE } from "@/lib/notifications";

import PageShell from "@/components/ui/PageShell";
import PageTitle from "@/components/ui/PageTitle";
import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";

export default function NotificationsPage() {
  const router = useRouter();

  const { isDemo } = usePermissions();

  const {
    notifications,
    readIds,
    loading,
    errorMessage,
    markAsRead,
    markAllAsRead,
    dismissNotification,
  } = useNotifications();

  const [filter, setFilter] = useState<
    "all" | "warning" | "info" | "success" | "insight"
  >("all");

  function openNotification(notification: VaultNotification) {
    markAsRead(notification.id);
    router.push(notification.href);
  }

  const filteredNotifications = useMemo(() => {
    if (filter === "all") {
      return notifications;
    }

    return notifications.filter((notification) => notification.type === filter);
  }, [notifications, filter]);

  const warningCount = notifications.filter(
    (notification) => notification.type === "warning",
  ).length;

  const infoCount = notifications.filter(
    (notification) => notification.type === "info",
  ).length;

  const insightCount = notifications.filter(
    (notification) => notification.type === "insight",
  ).length;

  return (
    <PageShell>
      <PageTitle
        section="insights"
        eyebrow="Activity Center"
        title="Notifications"
        description="Stay ahead of warranty expirations, missing information, and important vault updates."
        action={
          <div className="flex flex-wrap gap-3">
            {notifications.length > 0 && (
              <Button variant="secondary" onClick={markAllAsRead}>
                Mark All as Read
              </Button>
            )}

            <Button href="/activity" variant="secondary">
              Household Activity
            </Button>

            <Button href="/settings" variant="secondary">
              Notification Settings
            </Button>
          </div>
        }
      />

      {isDemo && !loading && (
        <PageCard className="border-warning/40 bg-warning-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-achievement">
            Demo Notifications
          </p>

          <p className="mt-2 text-sm text-text-secondary">
            These sample alerts show how Home Tech Vault helps users keep their
            technology records complete.
          </p>
        </PageCard>
      )}

      {!isDemo && !loading && (
        <PageCard className="border-border-subtle bg-surface-sunken/60">
          <p className="text-sm text-text-secondary">
            {NOTIFICATIONS_LOCAL_STATE_NOTE}
          </p>
        </PageCard>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <NotificationStat
          label="Total"
          value={notifications.length}
          icon={Bell}
        />

        <NotificationStat
          label="Needs Attention"
          value={warningCount}
          icon={CircleAlert}
        />

        <NotificationStat label="Suggestions" value={infoCount} icon={Clock3} />

        <NotificationStat
          label="Insights"
          value={insightCount}
          icon={Sparkles}
        />
      </section>

      <PageCard>
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-overline text-charcoal-soft">
              Inbox
            </p>

            <h2 className="mt-2 text-2xl font-semibold text-text-primary">
              Recent alerts
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterButton
              active={filter === "all"}
              onClick={() => setFilter("all")}
            >
              All
            </FilterButton>

            <FilterButton
              active={filter === "warning"}
              onClick={() => setFilter("warning")}
            >
              Important
            </FilterButton>

            <FilterButton
              active={filter === "info"}
              onClick={() => setFilter("info")}
            >
              Suggestions
            </FilterButton>

            <FilterButton
              active={filter === "insight"}
              onClick={() => setFilter("insight")}
            >
              Insights
            </FilterButton>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <div className="flex items-center gap-3 text-text-secondary">
              <Loader2 size={21} className="animate-spin" />
              Loading notifications...
            </div>
          </div>
        ) : errorMessage ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            {errorMessage}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="mt-7 rounded-3xl bg-surface-sunken p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-emerald-700">
              <CheckCircle2 size={25} />
            </div>

            <h3 className="mt-5 text-xl font-semibold text-text-primary">
              You’re all caught up
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-secondary">
              There are no notifications in this category right now.
            </p>
          </div>
        ) : (
          <div className="mt-7 divide-y divide-border-subtle">
            {filteredNotifications.map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                isRead={readIds.has(notification.id)}
                onClick={() => openNotification(notification)}
                onDismiss={() =>
                  dismissNotification(notification.id)
                }
              />
            ))}
          </div>
        )}
      </PageCard>
    </PageShell>
  );
}

function NotificationRow({
  notification,
  isRead,
  onClick,
  onDismiss,
}: {
  notification: VaultNotification;
  isRead: boolean;
  onClick: () => void;
  onDismiss: () => void;
}) {
  const Icon = notification.icon;

  return (
    <div
      className={`flex w-full items-start gap-4 py-5 transition first:pt-0 last:pb-0 ${
        isRead ? "opacity-70" : ""
      }`}
    >
      <button
        type="button"
        onClick={onClick}
        className="flex min-w-0 flex-1 items-start gap-4 text-left hover:bg-surface-base"
      >
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
            notification.type === "warning"
              ? "bg-amber-100 text-amber-700"
              : notification.type === "success"
                ? "bg-emerald-100 text-emerald-700"
                : notification.type === "insight"
                  ? "bg-violet-100 text-violet-700"
                  : "border border-border-subtle bg-surface-sunken text-charcoal"
          }`}
        >
          <Icon size={20} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-text-primary">
              {notification.title}
            </p>

            {!isRead && (
              <span className="h-2 w-2 shrink-0 rounded-full bg-home-health" />
            )}
          </div>

          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">
            {notification.category} • {notification.priority}
          </p>

          <p className="mt-1 text-sm leading-6 text-text-secondary">
            {notification.description}
          </p>

          {notification.actionLabel && (
            <span className="mt-2 inline-flex text-sm font-semibold text-achievement">
              {notification.actionLabel}
            </span>
          )}
        </div>
      </button>

      {notification.dismissible && (
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-lg p-2 text-text-tertiary hover:bg-surface-sunken hover:text-text-secondary"
          aria-label="Dismiss notification"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

function NotificationStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Bell;
}) {
  return (
    <PageCard className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-text-secondary">{label}</p>

          <p className="mt-3 text-3xl font-semibold text-text-primary">{value}</p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-subtle bg-surface-sunken text-charcoal shadow-[var(--shadow-inset)]">
          <Icon size={19} />
        </div>
      </div>
    </PageCard>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-charcoal text-surface-card"
          : "bg-surface-sunken text-text-secondary hover:text-text-primary"
      }`}
    >
      {children}
    </button>
  );
}
