"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  Plus,
  RotateCcw,
  Wrench,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { applyHouseholdScope } from "@/lib/data/householdScope";
import { demoMaintenance } from "@/lib/demoData";
import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/lib/design-system/cn";
import { formatProfileDate } from "@/lib/devices/deviceProfileUtils";
import Button from "@/components/ui/Button";
import PageCard from "@/components/ui/PageCard";

type MaintenanceRow = {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  completed: boolean;
  completed_at: string | null;
  task_type: string | null;
  recurring_interval?: string | null;
};

type MaintenanceStatus = "completed" | "upcoming" | "overdue";

function classifyTask(task: MaintenanceRow): MaintenanceStatus {
  if (task.completed) {
    return "completed";
  }

  if (!task.due_date) {
    return "upcoming";
  }

  const due = new Date(`${task.due_date.slice(0, 10)}T23:59:59`);

  if (due.getTime() < Date.now()) {
    return "overdue";
  }

  return "upcoming";
}

function normalizeDemoTask(
  item: (typeof demoMaintenance)[number],
  index: number
): MaintenanceRow {
  const completed = item.status === "Completed";

  return {
    id: item.id || `demo-maint-${index}`,
    title: item.title,
    description: item.notes || null,
    due_date: item.due_date || null,
    completed,
    completed_at: completed ? item.due_date : null,
    task_type: item.category || null,
    recurring_interval: null,
  };
}

type DeviceProfileMaintenanceProps = {
  deviceId: string;
  onReadOnlyAction?: () => void;
  embedded?: boolean;
};

export default function DeviceProfileMaintenance({
  deviceId,
  onReadOnlyAction,
  embedded = false,
}: DeviceProfileMaintenanceProps) {
  const {
    user,
    isDemo,
    householdId,
    canCreate,
    role,
    loading: permissionsLoading,
  } = usePermissions();

  const [tasks, setTasks] = useState<MaintenanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const isGuestDemo = isDemo || !user;
  const isViewer =
    !permissionsLoading &&
    !isGuestDemo &&
    Boolean(user) &&
    role === "viewer";

  const canAddMaintenance =
    !permissionsLoading && canCreate && !isGuestDemo;

  const quickAddHref = `/maintenance/new?deviceId=${encodeURIComponent(deviceId)}&returnTo=${encodeURIComponent(`/devices/${deviceId}?tab=maintenance`)}`;

  const loadTasks = useCallback(async () => {
    if (permissionsLoading) {
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      if (isDemo || !user) {
        const sample = demoMaintenance
          .filter((item) => item.device_id === deviceId)
          .map(normalizeDemoTask);

        setTasks(sample);
        return;
      }

      const query = applyHouseholdScope(
        supabase
          .from("maintenance_tasks")
          .select(
            "id, title, description, due_date, completed, completed_at, task_type, recurring_interval"
          )
          .eq("device_id", deviceId)
          .order("due_date", { ascending: true }),
        householdId,
        user.id
      );

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setTasks((data ?? []) as MaintenanceRow[]);
    } catch (error) {
      console.error("Unable to load device maintenance:", error);
      setTasks([]);
      setErrorMessage(
        "Unable to load maintenance tasks for this device."
      );
    } finally {
      setLoading(false);
    }
  }, [deviceId, householdId, isDemo, permissionsLoading, user]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const grouped = useMemo(() => {
    const completed: MaintenanceRow[] = [];
    const upcoming: MaintenanceRow[] = [];
    const overdue: MaintenanceRow[] = [];

    for (const task of tasks) {
      const status = classifyTask(task);

      if (status === "completed") {
        completed.push(task);
      } else if (status === "overdue") {
        overdue.push(task);
      } else {
        upcoming.push(task);
      }
    }

    return { completed, upcoming, overdue };
  }, [tasks]);

  function renderAddButton(className?: string) {
    if (canAddMaintenance) {
      return (
        <Button href={quickAddHref} variant="secondary" className={className}>
          <Plus size={16} />
          Add Maintenance Task
        </Button>
      );
    }

    if (isGuestDemo) {
      return (
        <Button
          type="button"
          variant="secondary"
          className={className}
          onClick={onReadOnlyAction}
        >
          <Plus size={16} />
          Add Maintenance Task
        </Button>
      );
    }

    return null;
  }

  const content = (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-overline text-section-technology">Maintenance</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-text-primary">
            Care & service tasks
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-text-secondary">
            Track cleaning, firmware updates, filter changes, inspections, and
            other routine care for this device.
          </p>
        </div>

        {renderAddButton()}
      </div>

      {isViewer ? (
        <p className="mt-4 rounded-[20px] border border-border-subtle bg-surface-sunken/60 px-4 py-3 text-sm text-text-secondary">
          Viewer access can review maintenance tasks but cannot create or update
          them.
        </p>
      ) : null}

      {errorMessage ? (
        <div className="mt-6 flex flex-col gap-4 rounded-[24px] border border-danger/30 bg-danger-soft/70 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="mt-0.5 text-danger" />
            <div>
              <p className="text-sm font-semibold text-text-primary">
                Unable to load maintenance
              </p>
              <p className="mt-1 text-sm text-text-secondary">{errorMessage}</p>
            </div>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              void loadTasks();
            }}
          >
            <RotateCcw size={16} />
            Retry
          </Button>
        </div>
      ) : null}

      {loading || permissionsLoading ? (
        <div className="mt-6 flex items-center gap-3 rounded-[24px] border border-border-subtle bg-surface-sunken p-5 text-sm text-text-secondary">
          <Loader2 size={18} className="animate-spin" />
          Loading maintenance tasks...
        </div>
      ) : !errorMessage && tasks.length === 0 ? (
        <div className="mt-6 rounded-[24px] border border-dashed border-border-subtle bg-surface-sunken/60 p-8 text-center">
          <Wrench size={28} className="mx-auto text-text-tertiary" />
          <p className="mt-4 text-sm font-medium text-text-primary">
            No maintenance tasks have been added for this device.
          </p>
          <p className="mt-2 text-sm text-text-secondary">
            Create reminders for cleaning, software updates, filter changes,
            inspections, and other routine care.
          </p>

          {canAddMaintenance || isGuestDemo ? (
            <div className="mt-6 flex justify-center">
              {renderAddButton()}
            </div>
          ) : null}
        </div>
      ) : !errorMessage ? (
        <div className="mt-6 space-y-6">
          <MaintenanceGroup
            title="Overdue"
            tone="expired"
            icon={AlertCircle}
            tasks={grouped.overdue}
          />
          <MaintenanceGroup
            title="Upcoming"
            tone="warning"
            icon={Clock}
            tasks={grouped.upcoming}
          />
          <MaintenanceGroup
            title="Completed"
            tone="protected"
            icon={CheckCircle2}
            tasks={grouped.completed}
          />
        </div>
      ) : null}
    </>
  );

  if (embedded) {
    return <PageCard className="p-6 md:p-8">{content}</PageCard>;
  }

  return <PageCard className="p-6 md:p-8">{content}</PageCard>;
}

function MaintenanceGroup({
  title,
  tone,
  icon: Icon,
  tasks,
}: {
  title: string;
  tone: "protected" | "warning" | "expired";
  icon: typeof Wrench;
  tasks: MaintenanceRow[];
}) {
  if (tasks.length === 0) {
    return null;
  }

  const toneClass =
    tone === "protected"
      ? "bg-home-health-soft text-home-health"
      : tone === "warning"
        ? "bg-warning-soft text-warning"
        : "bg-danger-soft text-danger";

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
            toneClass
          )}
        >
          <Icon size={13} />
          {title}
        </span>
        <span className="text-xs text-text-tertiary">
          {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
        </span>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <article
            key={task.id}
            className="rounded-[24px] border border-border-subtle bg-surface-card p-5 shadow-[var(--shadow-sm)]"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-text-primary">
                    {task.title}
                  </h3>
                  {task.task_type ? (
                    <span className="rounded-full bg-surface-sunken px-2.5 py-1 text-xs font-medium text-text-secondary">
                      {task.task_type}
                    </span>
                  ) : null}
                </div>

                {task.description ? (
                  <p className="mt-2 text-sm leading-6 text-text-secondary">
                    {task.description}
                  </p>
                ) : null}

                {task.recurring_interval ? (
                  <p className="mt-2 text-xs text-text-tertiary">
                    Repeats {task.recurring_interval}
                  </p>
                ) : null}
              </div>

              <div className="flex shrink-0 items-center gap-2 text-xs text-text-tertiary">
                <CalendarDays size={14} />
                {task.completed
                  ? `Completed ${formatProfileDate(task.completed_at?.slice(0, 10)) ?? ""}`
                  : task.due_date
                    ? `Due ${formatProfileDate(task.due_date)}`
                    : "No due date"}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
