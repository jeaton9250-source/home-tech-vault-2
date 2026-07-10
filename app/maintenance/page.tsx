"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock,
  Loader2,
  Plus,
  Trash2,
  Wrench,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { createDeviceEvent } from "@/lib/deviceEvents";
import PageShell from "@/components/ui/PageShell";
import PageTitle from "@/components/ui/PageTitle";
import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";

type MaintenanceTask = {
  id: string;
  user_id: string;
  device_id: string | null;
  title: string;
  description: string | null;
  task_type: string | null;
  due_date: string | null;
  completed: boolean;
  completed_at: string | null;
  recurring_interval: string | null;
  created_at: string;
  devices:
    | {
        device_name: string | null;
      }
    | null;
};

export default function MaintenancePage() {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      setLoading(true);
      setErrorMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        throw new Error("Please sign in to view maintenance tasks.");
      }

      const { data, error } = await supabase
        .from("maintenance_tasks")
        .select(
          `
            *,
            devices (
              device_name
            )
          `
        )
        .eq("user_id", user.id)
        .order("completed", { ascending: true })
        .order("due_date", { ascending: true });

      if (error) throw error;

      setTasks((data || []) as MaintenanceTask[]);
    } catch (error) {
      console.error("Maintenance loading error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load maintenance tasks."
      );
    } finally {
      setLoading(false);
    }
  }

  async function toggleComplete(task: MaintenanceTask) {
    try {
      setUpdatingId(task.id);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error("Please sign in.");

      const nextCompleted = !task.completed;

      const { error } = await supabase
        .from("maintenance_tasks")
        .update({
          completed: nextCompleted,
          completed_at: nextCompleted
            ? new Date().toISOString()
            : null,
        })
        .eq("id", task.id)
        .eq("user_id", user.id);

      if (error) throw error;

      if (nextCompleted && task.device_id) {
        await createDeviceEvent({
          deviceId: task.device_id,
          userId: user.id,
          eventType: task.task_type || "Maintenance",
          title: task.title,
          description:
            task.description ||
            "Maintenance task completed through the Maintenance Center.",
        });
      }

      await loadTasks();
    } catch (error) {
      console.error("Maintenance update error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to update the task."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function deleteTask(taskId: string) {
    if (!window.confirm("Delete this maintenance task?")) {
      return;
    }

    try {
      setDeletingId(taskId);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Please sign in.");

      const { error } = await supabase
        .from("maintenance_tasks")
        .delete()
        .eq("id", taskId)
        .eq("user_id", user.id);

      if (error) throw error;

      setTasks((current) =>
        current.filter((task) => task.id !== taskId)
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to delete the task."
      );
    } finally {
      setDeletingId(null);
    }
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingTasks = useMemo(
    () => tasks.filter((task) => !task.completed),
    [tasks]
  );

  const completedTasks = useMemo(
    () => tasks.filter((task) => task.completed),
    [tasks]
  );

  const overdueTasks = useMemo(
    () =>
      tasks.filter((task) => {
        if (task.completed || !task.due_date) return false;

        return new Date(`${task.due_date}T00:00:00`) < today;
      }),
    [tasks]
  );

  const dueSoonTasks = useMemo(
    () =>
      upcomingTasks.filter((task) => {
        if (!task.due_date) return false;

        const dueDate = new Date(`${task.due_date}T00:00:00`);
        const difference =
          (dueDate.getTime() - today.getTime()) /
          (1000 * 60 * 60 * 24);

        return difference >= 0 && difference <= 7;
      }),
    [upcomingTasks]
  );

  return (
    <PageShell>
      <PageTitle
        eyebrow="Technology Care"
        title="Maintenance Center"
        description="Schedule, complete, and track maintenance across your entire technology vault."
        action={
          <Button href="/maintenance/new">
            <Plus size={18} />
            Add Task
          </Button>
        }
      />

      {loading ? (
        <PageCard className="flex min-h-64 items-center justify-center">
          <div className="flex items-center gap-3 text-neutral-500">
            <Loader2 className="animate-spin" size={22} />
            Loading maintenance tasks...
          </div>
        </PageCard>
      ) : errorMessage ? (
        <PageCard className="border-red-200 bg-red-50 text-red-700">
          {errorMessage}
        </PageCard>
      ) : (
        <>
          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <MaintenanceStat
              label="Open Tasks"
              value={upcomingTasks.length}
              description="Waiting to be completed"
              icon={Wrench}
            />

            <MaintenanceStat
              label="Due Soon"
              value={dueSoonTasks.length}
              description="Due within seven days"
              icon={Clock}
            />

            <MaintenanceStat
              label="Overdue"
              value={overdueTasks.length}
              description="Requires attention"
              icon={CalendarDays}
            />

            <MaintenanceStat
              label="Completed"
              value={completedTasks.length}
              description="Recorded maintenance"
              icon={CheckCircle2}
            />
          </section>

          <PageCard>
            <h2 className="text-2xl font-bold text-[#111827]">
              Upcoming Maintenance
            </h2>

            <p className="mt-2 text-neutral-500">
              Complete a task to automatically add it to the device timeline.
            </p>

            {upcomingTasks.length === 0 ? (
              <EmptyState
                title="Nothing scheduled"
                description="Your devices currently have no open maintenance tasks."
              />
            ) : (
              <div className="mt-6 space-y-4">
                {upcomingTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    updating={updatingId === task.id}
                    deleting={deletingId === task.id}
                    onToggle={() => toggleComplete(task)}
                    onDelete={() => deleteTask(task.id)}
                  />
                ))}
              </div>
            )}
          </PageCard>

          <PageCard>
            <h2 className="text-2xl font-bold text-[#111827]">
              Maintenance History
            </h2>

            <p className="mt-2 text-neutral-500">
              Completed tasks and device service history.
            </p>

            {completedTasks.length === 0 ? (
              <EmptyState
                title="No completed maintenance"
                description="Completed tasks will appear here automatically."
              />
            ) : (
              <div className="mt-6 space-y-4">
                {completedTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    updating={updatingId === task.id}
                    deleting={deletingId === task.id}
                    onToggle={() => toggleComplete(task)}
                    onDelete={() => deleteTask(task.id)}
                  />
                ))}
              </div>
            )}
          </PageCard>
        </>
      )}
    </PageShell>
  );
}

function MaintenanceStat({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string;
  value: number;
  description: string;
  icon: typeof Wrench;
}) {
  return (
    <PageCard className="p-6 md:p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
        <Icon size={24} />
      </div>

      <p className="mt-5 text-sm text-neutral-500">{label}</p>

      <p className="mt-2 text-4xl font-bold text-[#111827]">
        {value}
      </p>

      <p className="mt-2 text-sm text-neutral-400">
        {description}
      </p>
    </PageCard>
  );
}

function TaskRow({
  task,
  updating,
  deleting,
  onToggle,
  onDelete,
}: {
  task: MaintenanceTask;
  updating: boolean;
  deleting: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[#E8E2D6] bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        <button
          type="button"
          onClick={onToggle}
          disabled={updating}
          className="mt-0.5 text-[#C8A96A] disabled:opacity-50"
        >
          {updating ? (
            <Loader2 size={23} className="animate-spin" />
          ) : task.completed ? (
            <CheckCircle2 size={23} />
          ) : (
            <Circle size={23} />
          )}
        </button>

        <div className="min-w-0">
          <p
            className={`font-bold ${
              task.completed
                ? "text-neutral-400 line-through"
                : "text-[#111827]"
            }`}
          >
            {task.title}
          </p>

          <p className="mt-1 text-sm text-neutral-500">
            {task.devices?.device_name || "General home task"}
            {" · "}
            {task.task_type || "Maintenance"}
          </p>

          {task.description && (
            <p className="mt-2 text-sm text-neutral-500">
              {task.description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            {task.due_date && (
              <span className="rounded-full bg-[#F3EAD7] px-3 py-1 text-xs font-semibold text-[#8A6A2F]">
                Due {formatDate(task.due_date)}
              </span>
            )}

            {task.recurring_interval && (
              <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">
                Repeats {task.recurring_interval}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {task.device_id && (
          <Link
            href={`/devices/${task.device_id}`}
            className="rounded-xl bg-[#F7F5EF] px-4 py-2 text-sm font-semibold text-[#111827]"
          >
            View Device
          </Link>
        )}

        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className="rounded-xl bg-red-50 p-2.5 text-red-700 hover:bg-red-100 disabled:opacity-50"
        >
          {deleting ? (
            <Loader2 size={17} className="animate-spin" />
          ) : (
            <Trash2 size={17} />
          )}
        </button>
      </div>
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mt-6 rounded-3xl border-2 border-dashed border-[#D8D1C3] bg-[#FBFAF7] p-10 text-center">
      <Wrench size={36} className="mx-auto text-[#C8A96A]" />

      <h3 className="mt-4 font-bold text-[#111827]">
        {title}
      </h3>

      <p className="mt-2 text-sm text-neutral-500">
        {description}
      </p>

      <Button href="/maintenance/new" className="mt-5">
        Add Maintenance Task
      </Button>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}