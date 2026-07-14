"use client";

import { useMemo, useState } from "react";
import {
  Bell,
  CheckCircle2,
  CircleAlert,
  Clock3,
  FileText,
  Laptop,
  Loader2,
  Radar,
  ShieldCheck,
} from "lucide-react";

import { useDemoMode } from "@/hooks/useDemoMode";
import { useRouter } from "next/navigation";

import PageShell from "@/components/ui/PageShell";
import PageTitle from "@/components/ui/PageTitle";
import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";

import {
  useNotifications,
  type VaultNotification,
} from "@/hooks/useNotifications";

type DeviceRow = {
  id: string;
  device_name: string | null;
  warranty_date: string | null;
  serial_number: string | null;
  purchase_price: number | null;
};

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
          <Button href="/settings" variant="secondary">
            Notification Settings
          </Button>
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

      <section className="grid gap-4 sm:grid-cols-3">
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
}: {
  notification: VaultNotification;
}) {
  const Icon = notification.icon;

  return (
    <a
      href={notification.href}
      className="flex items-start gap-4 py-5 first:pt-0 last:pb-0"
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
          notification.type === "warning"
            ? "bg-amber-100 text-amber-700"
            : notification.type === "success"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-[#F7F5EF] text-[#C8A96A]"
        }`}
      >
        <Icon size={20} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-semibold text-[#111827]">{notification.title}</p>

        <p className="mt-1 text-sm leading-6 text-neutral-500">
          {notification.description}
        </p>
      </div>

      <span className="shrink-0 text-neutral-300">→</span>
    </a>
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
  children: React.ReactNode;
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
