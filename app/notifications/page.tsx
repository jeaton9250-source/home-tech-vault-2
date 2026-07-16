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
} from "lucide-react";

import { useDemoMode } from "@/hooks/useDemoMode";
import {
  useNotifications,
  type VaultNotification,
} from "@/hooks/useNotifications";

import PageShell from "@/components/ui/PageShell";
import PageTitle from "@/components/ui/PageTitle";
import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";

export default function NotificationsPage() {
  const router = useRouter();

  const { isDemo } = useDemoMode();

  const {
    notifications,
    readIds,
    loading,
    errorMessage,
    markAsRead,
    markAllAsRead,
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

            <Button href="/settings" variant="secondary">
              Notification Settings
            </Button>
          </div>
        }
      />

      {isDemo && !loading && (
        <PageCard className="border-[#D8C69D] bg-[#FFF8E8]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A6A2F]">
            Demo Notifications
          </p>

          <p className="mt-2 text-sm text-neutral-600">
            These sample alerts show how Home Tech Vault helps users keep their
            technology records complete.
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
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">
              Inbox
            </p>

            <h2 className="mt-2 text-2xl font-semibold text-[#111827]">
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
            <div className="flex items-center gap-3 text-neutral-500">
              <Loader2 size={21} className="animate-spin" />
              Loading notifications...
            </div>
          </div>
        ) : errorMessage ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            {errorMessage}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="mt-7 rounded-3xl bg-[#F7F5EF] p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-emerald-700">
              <CheckCircle2 size={25} />
            </div>

            <h3 className="mt-5 text-xl font-semibold text-[#111827]">
              You’re all caught up
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
              There are no notifications in this category right now.
            </p>
          </div>
        ) : (
          <div className="mt-7 divide-y divide-[#E8E2D6]">
            {filteredNotifications.map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                isRead={readIds.has(notification.id)}
                onClick={() => openNotification(notification)}
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
      className={`flex w-full items-start gap-4 py-5 text-left transition first:pt-0 last:pb-0 hover:bg-[#FBFAF7] ${
        isRead ? "opacity-70" : ""
      }`}
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
          notification.type === "warning"
            ? "bg-amber-100 text-amber-700"
            : notification.type === "success"
              ? "bg-emerald-100 text-emerald-700"
              : notification.type === "insight"
                ? "bg-violet-100 text-violet-700"
                : "bg-[#F7F5EF] text-[#C8A96A]"
        }`}
      >
        <Icon size={20} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <p className="font-semibold text-[#111827]">{notification.title}</p>

          {!isRead && (
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#C8A96A]" />
          )}
        </div>

        <p className="mt-1 text-sm leading-6 text-neutral-500">
          {notification.description}
        </p>
      </div>

      <span className="shrink-0 text-neutral-300">→</span>
    </button>
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
          <p className="text-sm text-neutral-500">{label}</p>

          <p className="mt-3 text-3xl font-semibold text-[#111827]">{value}</p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F7F5EF] text-[#C8A96A]">
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
          ? "bg-[#111827] text-white"
          : "bg-[#F7F5EF] text-neutral-600 hover:text-[#111827]"
      }`}
    >
      {children}
    </button>
  );
}
