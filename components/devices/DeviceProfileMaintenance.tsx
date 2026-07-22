"use client";

import { useEffect, useMemo, useState } from "react";

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  Plus,
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
  };
}

type DeviceProfileMaintenanceProps = {
  deviceId: string;
  onReadOnlyAction?: () => void;
};

export default function DeviceProfileMaintenance({
  deviceId,
  onReadOnlyAction,
}: DeviceProfileMaintenanceProps) {
  const {
    user,
    isDemo,
    householdId,
    canCreate,
    loading: permissionsLoading,
  } = usePermissions();

  const [tasks, setTasks] = useState<MaintenanceRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadTasks() {
      if (permissionsLoading) {
        return;
      }

      try {
        setLoading(true);

        if (isDemo || !user) {
          const sample = demoMaintenance
            .filter((item) => item.device_id === deviceId)
            .map(normalizeDemoTask);

          if (mounted) {
            setTasks(sample);
          }

          return;
        }

        const query = applyHouseholdScope(
          supabase
            .from("maintenance_tasks")
            .select(
              "id, title, description, due_date, completed, completed_at, task_type"
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

        if (mounted) {
          setTasks((data ?? []) as MaintenanceRow[]);
        }
      } catch (error) {
        console.error("Unable to load device maintenance:", error);

        if (mounted) {
          setTasks([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadTasks();

    return () => {
      mounted = false;
    };
  }, [deviceId, householdId, isDemo, permissionsLoading, user]);

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

  const quickAddHref = `/maintenance/new?deviceId=${encodeURIComponent(deviceId)}`;

  return (
    <PageCard className="p-6 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-overline text-section-technology">Maintenance</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-text-primary">
            Service history & upcoming care
          </h2>
        </div>

        {canCreate ? (
          <Button href={quickAddHref} variant="secondary">
            <Plus size={16} />
            Quick Add
          </Button>
        ) : isDemo || !user ? (
          <Button type="button" variant="secondary" onClick={onReadOnlyAction}>
            <Plus size={16} />
            Quick Add
          </Button>
        ) : null}
      </div>

      {loading ? (
        <div className="mt-6 flex items-center gap-3 rounded-[24px] border border-border-subtle bg-surface-sunken p-5 text-sm text-text-secondary">
          <Loader2 size={18} className="animate-spin" />
          Loading maintenance tasks...
        </div>
      ) : tasks.length === 0 ? (
        <div className="mt-6 rounded-[24px] border border-dashed border-border-subtle bg-surface-sunken/60 p-8 text-center">
          <Wrench size={28} className="mx-auto text-text-tertiary" />
          <p className="mt-4 text-sm font-medium text-text-primary">
            No maintenance has been scheduled for this device yet.
          </p>
          <p className="mt-2 text-sm text-text-secondary">
            Add cleaning, updates, or service reminders to keep it running smoothly.
          </p>
        </div>
      ) : (
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
      )}
    </PageCard>
  );
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
              <div>
                <h3 className="font-semibold text-text-primary">{task.title}</h3>
                {task.description ? (
                  <p className="mt-2 text-sm leading-6 text-text-secondary">
                    {task.description}
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
