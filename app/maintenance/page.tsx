"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ComponentType,
} from "react";

import Link from "next/link";

import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock,
  Loader2,
  Search,
  Trash2,
  Wrench,
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { createDeviceEvent } from "@/lib/deviceEvents";

import {
  demoDevices,
  demoMaintenance,
} from "@/lib/demoData";

import { usePermissions } from "@/hooks/usePermissions";

import PageShell from "@/components/ui/PageShell";
import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";

import {
  PageAction,
  PermissionEmptyState,
  ViewerBanner,
} from "@/components/ui/PermissionUI";

type MaintenanceTask = {
  id: string;
  user_id: string;
  household_id?: string | null;
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

type MaintenanceFilter =
  | "all"
  | "open"
  | "due-soon"
  | "overdue"
  | "completed"
  | "unscheduled";

type MaintenanceIcon = ComponentType<{
  size?: number;
  className?: string;
}>;

type DemoRecord = Record<string, unknown>;

export default function MaintenancePage() {
  const {
    user,
    isDemo,
    isViewer,
    canCreate,
    canEdit,
    canDelete,
    loading: permissionsLoading,
  } = usePermissions();

  const [tasks, setTasks] =
    useState<MaintenanceTask[]>([]);

  const [
    loadingTasks,
    setLoadingTasks,
  ] = useState(true);

  const [updatingId, setUpdatingId] =
    useState<string | null>(null);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [
    selectedFilter,
    setSelectedFilter,
  ] =
    useState<MaintenanceFilter>(
      "all"
    );

  useEffect(() => {
    let mounted = true;

    async function loadTasks() {
      if (permissionsLoading) {
        return;
      }

      try {
        setLoadingTasks(true);
        setErrorMessage("");

        if (isDemo || !user) {
          const sampleTasks =
            demoMaintenance.map(
              (item, index) =>
                normalizeDemoTask(
                  item,
                  index
                )
            );

          if (!mounted) {
            return;
          }

          setTasks(sampleTasks);
          return;
        }

        const {
          data,
          error,
        } = await supabase
          .from("maintenance_tasks")
          .select(
            `
              *,
              devices (
                device_name
              )
            `
          )
          .order("completed", {
            ascending: true,
          })
          .order("due_date", {
            ascending: true,
            nullsFirst: false,
          });

        if (error) {
          throw error;
        }

        if (!mounted) {
          return;
        }

        setTasks(
          (data ??
            []) as MaintenanceTask[]
        );
      } catch (error: unknown) {
        console.error(
          "Maintenance loading error:",
          error
        );

        if (!mounted) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load maintenance tasks."
        );
      } finally {
        if (mounted) {
          setLoadingTasks(false);
        }
      }
    }

    void loadTasks();

    return () => {
      mounted = false;
    };
  }, [
    user,
    isDemo,
    permissionsLoading,
  ]);

  async function reloadTasks() {
    if (!user || isDemo) {
      return;
    }

    try {
      const {
        data,
        error,
      } = await supabase
        .from("maintenance_tasks")
        .select(
          `
            *,
            devices (
              device_name
            )
          `
        )
        .order("completed", {
          ascending: true,
        })
        .order("due_date", {
          ascending: true,
          nullsFirst: false,
        });

      if (error) {
        throw error;
      }

      setTasks(
        (data ??
          []) as MaintenanceTask[]
      );
    } catch (error: unknown) {
      console.error(
        "Maintenance reload error:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to reload maintenance tasks."
      );
    }
  }

  async function toggleComplete(
    task: MaintenanceTask
  ) {
    if (
      !canEdit ||
      !user ||
      isDemo
    ) {
      return;
    }

    try {
      setUpdatingId(task.id);

      const nextCompleted =
        !task.completed;

      const {
        error,
      } = await supabase
        .from("maintenance_tasks")
        .update({
          completed:
            nextCompleted,

          completed_at:
            nextCompleted
              ? new Date().toISOString()
              : null,
        })
        .eq("id", task.id);

      if (error) {
        throw error;
      }

      if (
        nextCompleted &&
        task.device_id
      ) {
        await createDeviceEvent({
          deviceId:
            task.device_id,

          userId:
            user.id,

          eventType:
            task.task_type ??
            "Maintenance",

          title:
            task.title,

          description:
            task.description ??
            "Maintenance task completed through the Maintenance Center.",
        });
      }

      await reloadTasks();
    } catch (error: unknown) {
      console.error(
        "Maintenance update error:",
        error
      );

      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to update the task."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function deleteTask(
    taskId: string
  ) {
    if (
      !canDelete ||
      !user ||
      isDemo
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        "Delete this maintenance task?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(taskId);

      const {
        error,
      } = await supabase
        .from("maintenance_tasks")
        .delete()
        .eq("id", taskId);

      if (error) {
        throw error;
      }

      setTasks((current) =>
        current.filter(
          (task) =>
            task.id !== taskId
        )
      );
    } catch (error: unknown) {
      console.error(
        "Maintenance delete error:",
        error
      );

      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to delete the task."
      );
    } finally {
      setDeletingId(null);
    }
  }

  const today = useMemo(() => {
    const date = new Date();

    date.setHours(
      0,
      0,
      0,
      0
    );

    return date;
  }, []);

  const openTasks = useMemo(
    () =>
      tasks.filter(
        (task) =>
          !task.completed
      ),
    [tasks]
  );

  const completedTasks = useMemo(
    () =>
      tasks.filter(
        (task) =>
          task.completed
      ),
    [tasks]
  );

  const overdueTasks = useMemo(
    () =>
      openTasks.filter(
        (task) =>
          getTaskStatus(
            task,
            today
          ).group === "overdue"
      ),
    [openTasks, today]
  );

  const dueSoonTasks = useMemo(
    () =>
      openTasks.filter(
        (task) =>
          getTaskStatus(
            task,
            today
          ).group === "due-soon"
      ),
    [openTasks, today]
  );

  const unscheduledTasks =
    useMemo(
      () =>
        openTasks.filter(
          (task) =>
            !task.due_date
        ),
      [openTasks]
    );

  const filteredTasks =
    useMemo(() => {
      const query =
        searchTerm
          .trim()
          .toLowerCase();

      return tasks.filter(
        (task) => {
          const status =
            getTaskStatus(
              task,
              today
            );

          const matchesFilter =
            selectedFilter ===
              "all" ||
            (selectedFilter ===
              "open" &&
              !task.completed) ||
            status.group ===
              selectedFilter;

          const searchableText = [
            task.title,
            task.description,
            task.task_type,
            task.devices
              ?.device_name,
            task.recurring_interval,
            status.label,
          ]
            .map((value) =>
              String(
                value ?? ""
              ).toLowerCase()
            )
            .join(" ");

          const matchesSearch =
            query === "" ||
            searchableText.includes(
              query
            );

          return (
            matchesFilter &&
            matchesSearch
          );
        }
      );
    }, [
      tasks,
      searchTerm,
      selectedFilter,
      today,
    ]);

  const filtersActive =
    searchTerm.trim() !== "" ||
    selectedFilter !== "all";

  const completionScore =
    tasks.length === 0
      ? 0
      : Math.round(
          (completedTasks.length /
            tasks.length) *
            100
        );

  const pageLoading =
    permissionsLoading ||
    loadingTasks;

  function clearFilters() {
    setSearchTerm("");
    setSelectedFilter("all");
  }

  if (pageLoading) {
    return (
      <PageShell>
        <PageCard className="flex min-h-72 items-center justify-center">
          <div className="flex items-center gap-3 text-neutral-500">
            <Loader2
              className="animate-spin"
              size={22}
            />

            Loading maintenance...
          </div>
        </PageCard>
      </PageShell>
    );
  }

  if (errorMessage) {
    return (
      <PageShell>
        <PageCard className="border-red-200 bg-red-50 p-6 text-red-700">
          <h1 className="text-xl font-semibold">
            Unable to load maintenance
          </h1>

          <p className="mt-2 text-sm">
            {errorMessage}
          </p>
        </PageCard>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="rounded-[32px] bg-[#111827] px-6 py-9 text-white shadow-sm md:px-10 md:py-11">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C8A96A]">
              Technology Care
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] md:text-5xl">
              Maintenance.
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-white/60 md:text-base">
              Keep updates, cleaning,
              repairs, and routine care
              organized across your
              devices.
            </p>
          </div>

          <PageAction
            canCreate={canCreate}
            href="/maintenance/new"
            label="Add Task"
            variant="light"
          />
        </div>
      </section>

      <ViewerBanner
        show={isViewer}
        description={
          user
            ? "You can view shared maintenance tasks and their status. Viewer access cannot add, complete, reopen, edit, or delete tasks."
            : "Explore sample maintenance tasks. Create an account to track updates, cleaning, repairs, and routine device care."
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={Wrench}
          label="Open Tasks"
          value={openTasks.length}
          description="Waiting to be completed"
          tone="neutral"
        />

        <SummaryCard
          icon={Clock}
          label="Due Soon"
          value={dueSoonTasks.length}
          description="Due within seven days"
          tone="gold"
        />

        <SummaryCard
          icon={CalendarDays}
          label="Overdue"
          value={overdueTasks.length}
          description="Requires attention"
          tone="red"
        />

        <SummaryCard
          icon={CheckCircle2}
          label="Completed"
          value={completedTasks.length}
          description="Recorded maintenance"
          tone="green"
        />
      </section>

      {tasks.length > 0 && (
        <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <PageCard className="flex min-h-[350px] flex-col items-center justify-center p-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
              Completion
            </p>

            <div className="mt-7">
              <CompletionRing
                score={completionScore}
              />
            </div>

            <p className="mt-7 max-w-sm text-sm leading-6 text-neutral-500">
              {completedTasks.length} of{" "}
              {tasks.length} maintenance
              tasks have been completed.
            </p>
          </PageCard>

          <PageCard className="p-7 md:p-9">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">
              Maintenance Overview
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#111827]">
              What needs attention
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
              Review overdue, upcoming,
              and unscheduled maintenance.
            </p>

            <div className="mt-7 space-y-3">
              <AttentionRow
                icon={CalendarDays}
                label="Overdue tasks"
                value={
                  overdueTasks.length
                }
                tone="red"
              />

              <AttentionRow
                icon={Clock}
                label="Due within seven days"
                value={
                  dueSoonTasks.length
                }
                tone="gold"
              />

              <AttentionRow
                icon={Circle}
                label="No due date"
                value={
                  unscheduledTasks.length
                }
                tone="neutral"
              />
            </div>
          </PageCard>
        </section>
      )}

      {tasks.length > 0 && (
        <PageCard className="p-5 md:p-6">
          <div className="flex flex-col gap-5">
            <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
              />

              <input
                type="search"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
                placeholder="Search tasks or devices..."
                className="w-full rounded-2xl border border-[#E8E2D6] bg-[#FAFAF8] py-3.5 pl-11 pr-11 text-sm text-[#111827] outline-none transition placeholder:text-neutral-400 focus:border-[#C8A96A] focus:bg-white focus:ring-4 focus:ring-[#C8A96A]/10"
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() =>
                    setSearchTerm("")
                  }
                  aria-label="Clear search"
                  className="absolute right-4 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 transition hover:bg-white hover:text-[#111827]"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {maintenanceFilters.map(
                (filter) => {
                  const active =
                    selectedFilter ===
                    filter.value;

                  return (
                    <button
                      key={
                        filter.value
                      }
                      type="button"
                      onClick={() =>
                        setSelectedFilter(
                          filter.value
                        )
                      }
                      className={
                        "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition " +
                        (active
                          ? "bg-[#111827] text-white"
                          : "border border-[#E8E2D6] bg-white text-neutral-500 hover:border-[#C8A96A] hover:text-[#111827]")
                      }
                    >
                      {filter.label}
                    </button>
                  );
                }
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E8E2D6] pt-4">
              <p className="text-sm text-neutral-500">
                {filteredTasks.length}{" "}
                {filteredTasks.length ===
                1
                  ? "task"
                  : "tasks"}
              </p>

              {filtersActive && (
                <button
                  type="button"
                  onClick={
                    clearFilters
                  }
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#111827] transition hover:text-[#8A6A2F]"
                >
                  <X size={15} />
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </PageCard>
      )}

      {tasks.length === 0 ? (
        <PermissionEmptyState
          icon={Wrench}
          title="Nothing scheduled"
          description="Add your first maintenance task to begin tracking updates, cleaning, repairs, and routine care."
          canCreate={canCreate}
          href="/maintenance/new"
          buttonLabel="Add Maintenance Task"
        />
      ) : filteredTasks.length > 0 ? (
        <section className="grid gap-6 lg:grid-cols-2">
          {filteredTasks.map(
            (task) => (
              <TaskCard
                key={task.id}
                task={task}
                today={today}
                canEdit={
                  canEdit
                }
                canDelete={
                  canDelete
                }
                updating={
                  updatingId ===
                  task.id
                }
                deleting={
                  deletingId ===
                  task.id
                }
                onToggle={() =>
                  void toggleComplete(
                    task
                  )
                }
                onDelete={() =>
                  void deleteTask(
                    task.id
                  )
                }
              />
            )
          )}
        </section>
      ) : (
        <PageCard className="py-14 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
            <Search size={28} />
          </div>

          <h2 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-[#111827]">
            No matching tasks
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-neutral-500">
            Try changing your search
            or maintenance status.
          </p>

          <Button
            type="button"
            variant="secondary"
            className="mt-6"
            onClick={clearFilters}
          >
            Clear Filters
          </Button>
        </PageCard>
      )}
    </PageShell>
  );
}

const maintenanceFilters:
  Array<{
    value: MaintenanceFilter;
    label: string;
  }> = [
    {
      value: "all",
      label: "All Tasks",
    },
    {
      value: "open",
      label: "Open",
    },
    {
      value: "due-soon",
      label: "Due Soon",
    },
    {
      value: "overdue",
      label: "Overdue",
    },
    {
      value: "unscheduled",
      label: "No Due Date",
    },
    {
      value: "completed",
      label: "Completed",
    },
  ];

function normalizeDemoTask(
  item: unknown,
  index: number
): MaintenanceTask {
  const record =
    typeof item === "object" &&
    item !== null
      ? (item as DemoRecord)
      : {};

  const id =
    getString(
      record,
      "id"
    ) ??
    "demo-maintenance-" +
      String(index + 1);

  const deviceId =
    getString(
      record,
      "device_id"
    );

  const connectedDevice =
    demoDevices.find(
      (device) =>
        device.id === deviceId
    );

  const status =
    getString(
      record,
      "status"
    ) ?? "";

  const completed =
    status
      .toLowerCase()
      .includes("complete");

  return {
    id,
    user_id:
      "demo-user",
    household_id:
      null,
    device_id:
      deviceId,

    title:
      getString(
        record,
        "title"
      ) ??
      "Maintenance Task",

    description:
      getString(
        record,
        "notes"
      ),

    task_type:
      getString(
        record,
        "category"
      ) ??
      "Maintenance",

    due_date:
      getString(
        record,
        "due_date"
      ),

    completed,

    completed_at:
      completed
        ? new Date().toISOString()
        : null,

    recurring_interval:
      getString(
        record,
        "frequency"
      ),

    created_at:
      new Date().toISOString(),

    devices:
      connectedDevice
        ? {
            device_name:
              connectedDevice.device_name,
          }
        : null,
  };
}

function getString(
  record: DemoRecord,
  key: string
): string | null {
  const value =
    record[key];

  return typeof value === "string"
    ? value
    : null;
}

function TaskCard({
  task,
  today,
  canEdit,
  canDelete,
  updating,
  deleting,
  onToggle,
  onDelete,
}: {
  task: MaintenanceTask;
  today: Date;
  canEdit: boolean;
  canDelete: boolean;
  updating: boolean;
  deleting: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const status =
    getTaskStatus(
      task,
      today
    );

  return (
    <article className="group overflow-hidden rounded-[28px] border border-[#E8E2D6] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#D8C69D] hover:shadow-lg">
      <div className="bg-[#F7F5EF] px-6 py-6">
        <div className="flex items-start justify-between gap-4">
          {canEdit ? (
            <button
              type="button"
              onClick={onToggle}
              disabled={updating}
              aria-label={
                task.completed
                  ? "Mark task incomplete"
                  : "Mark task complete"
              }
              className={
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-[20px] bg-white shadow-sm transition disabled:opacity-50 " +
                (task.completed
                  ? "text-emerald-700"
                  : "text-[#C8A96A]")
              }
            >
              {updating ? (
                <Loader2
                  size={22}
                  className="animate-spin"
                />
              ) : task.completed ? (
                <CheckCircle2
                  size={23}
                />
              ) : (
                <Circle
                  size={23}
                />
              )}
            </button>
          ) : (
            <div
              className={
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-[20px] bg-white shadow-sm " +
                (task.completed
                  ? "text-emerald-700"
                  : "text-[#C8A96A]")
              }
            >
              {task.completed ? (
                <CheckCircle2
                  size={23}
                />
              ) : (
                <Circle
                  size={23}
                />
              )}
            </div>
          )}

          <span
            className={
              "rounded-full px-3 py-1.5 text-xs font-semibold " +
              status.badgeClass
            }
          >
            {status.label}
          </span>
        </div>

        <h2
          className={
            "mt-6 text-2xl font-semibold tracking-[-0.04em] " +
            (task.completed
              ? "text-neutral-400 line-through"
              : "text-[#111827]")
          }
        >
          {task.title}
        </h2>

        <p className="mt-2 text-sm text-neutral-500">
          {task.devices
            ?.device_name ||
            "General home task"}
        </p>
      </div>

      <div className="p-6">
        {task.description && (
          <p className="text-sm leading-6 text-neutral-500">
            {task.description}
          </p>
        )}

        <div className="mt-5 grid grid-cols-2 gap-3">
          <TaskMetric
            label="Task Type"
            value={
              task.task_type ||
              "Maintenance"
            }
          />

          <TaskMetric
            label="Due Date"
            value={
              task.due_date
                ? formatDate(
                    task.due_date
                  )
                : "Not scheduled"
            }
          />
        </div>

        {task.recurring_interval && (
          <div className="mt-3 rounded-2xl bg-[#F7F5EF] p-4">
            <p className="text-xs text-neutral-400">
              Recurring
            </p>

            <p className="mt-1 font-semibold text-[#111827]">
              Repeats{" "}
              {
                task.recurring_interval
              }
            </p>
          </div>
        )}

        <div className="mt-5 flex items-center gap-3 border-t border-[#E8E2D6] pt-5">
          {task.device_id ? (
            <Link
              href={
                "/devices/" +
                task.device_id
              }
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-2xl border border-[#E8E2D6] bg-white px-4 text-sm font-semibold text-[#111827] transition hover:border-[#C8A96A] hover:bg-[#F7F5EF]"
            >
              View Device
            </Link>
          ) : (
            <div className="flex-1" />
          )}

          {canDelete && (
            <button
              type="button"
              onClick={onDelete}
              disabled={deleting}
              aria-label="Delete maintenance task"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-700 transition hover:bg-red-600 hover:text-white disabled:opacity-50"
            >
              {deleting ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <Trash2
                  size={17}
                />
              )}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  description,
  tone,
}: {
  icon: MaintenanceIcon;
  label: string;
  value: number;
  description: string;
  tone:
    | "neutral"
    | "gold"
    | "red"
    | "green";
}) {
  const toneClasses = {
    neutral:
      "bg-[#F7F5EF] text-[#C8A96A]",

    gold:
      "bg-amber-50 text-amber-700",

    red:
      "bg-red-50 text-red-700",

    green:
      "bg-emerald-50 text-emerald-700",
  };

  return (
    <PageCard className="p-5 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-neutral-500">
            {label}
          </p>

          <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[#111827]">
            {value}
          </p>

          <p className="mt-2 text-xs text-neutral-400">
            {description}
          </p>
        </div>

        <div
          className={
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl " +
            toneClasses[tone]
          }
        >
          <Icon size={20} />
        </div>
      </div>
    </PageCard>
  );
}

function AttentionRow({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: MaintenanceIcon;
  label: string;
  value: number;
  tone:
    | "red"
    | "gold"
    | "neutral";
}) {
  const toneClasses = {
    red:
      "bg-red-50 text-red-700",

    gold:
      "bg-amber-50 text-amber-700",

    neutral:
      "bg-neutral-100 text-neutral-600",
  };

  return (
    <div className="flex items-center gap-4 rounded-[22px] bg-[#F7F5EF] p-4">
      <div
        className={
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl " +
          toneClasses[tone]
        }
      >
        <Icon size={18} />
      </div>

      <p className="min-w-0 flex-1 text-sm font-semibold text-[#111827]">
        {label}
      </p>

      <span className="text-xl font-semibold text-[#111827]">
        {value}
      </span>
    </div>
  );
}

function TaskMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-[#F7F5EF] p-4">
      <p className="text-xs text-neutral-400">
        {label}
      </p>

      <p className="mt-2 truncate font-semibold text-[#111827]">
        {value}
      </p>
    </div>
  );
}

function CompletionRing({
  score,
}: {
  score: number;
}) {
  const normalizedScore =
    Math.max(
      0,
      Math.min(
        score,
        100
      )
    );

  const radius = 72;

  const circumference =
    2 *
    Math.PI *
    radius;

  const offset =
    circumference -
    (normalizedScore / 100) *
      circumference;

  return (
    <div className="relative h-44 w-44 md:h-48 md:w-48">
      <svg
        viewBox="0 0 176 176"
        className="h-full w-full -rotate-90"
        role="img"
        aria-label={
          "Maintenance completion: " +
          String(
            normalizedScore
          ) +
          "%"
        }
      >
        <circle
          cx="88"
          cy="88"
          r={radius}
          fill="none"
          stroke="#E8E2D6"
          strokeWidth="12"
        />

        <circle
          cx="88"
          cy="88"
          r={radius}
          fill="none"
          stroke="#111827"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={
            circumference
          }
          strokeDashoffset={
            offset
          }
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-semibold tracking-[-0.05em] text-[#111827]">
          {normalizedScore}

          <span className="ml-0.5 text-2xl text-neutral-400">
            %
          </span>
        </span>

        <span className="mt-2 text-sm font-semibold text-[#8A6A2F]">
          Complete
        </span>
      </div>
    </div>
  );
}

function getTaskStatus(
  task: MaintenanceTask,
  today: Date
) {
  if (task.completed) {
    return {
      label: "Completed",

      group:
        "completed" as MaintenanceFilter,

      badgeClass:
        "bg-emerald-50 text-emerald-700",
    };
  }

  if (!task.due_date) {
    return {
      label:
        "No due date",

      group:
        "unscheduled" as MaintenanceFilter,

      badgeClass:
        "bg-neutral-100 text-neutral-600",
    };
  }

  const dueDate =
    new Date(
      task.due_date +
        "T00:00:00"
    );

  if (
    Number.isNaN(
      dueDate.getTime()
    )
  ) {
    return {
      label:
        "Date unknown",

      group:
        "unscheduled" as MaintenanceFilter,

      badgeClass:
        "bg-neutral-100 text-neutral-600",
    };
  }

  const difference =
    Math.ceil(
      (dueDate.getTime() -
        today.getTime()) /
        (1000 *
          60 *
          60 *
          24)
    );

  if (difference < 0) {
    return {
      label:
        String(
          Math.abs(
            difference
          )
        ) +
        " days overdue",

      group:
        "overdue" as MaintenanceFilter,

      badgeClass:
        "bg-red-50 text-red-700",
    };
  }

  if (difference === 0) {
    return {
      label:
        "Due today",

      group:
        "due-soon" as MaintenanceFilter,

      badgeClass:
        "bg-amber-50 text-amber-700",
    };
  }

  if (difference <= 7) {
    return {
      label:
        "Due in " +
        String(
          difference
        ) +
        " days",

      group:
        "due-soon" as MaintenanceFilter,

      badgeClass:
        "bg-amber-50 text-amber-700",
    };
  }

  return {
    label:
      "Due " +
      formatDate(
        task.due_date
      ),

    group:
      "open" as MaintenanceFilter,

    badgeClass:
      "bg-[#FFF8E8] text-[#8A6A2F]",
  };
}

function formatDate(
  value: string
) {
  const date =
    new Date(
      value +
        "T00:00:00"
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    undefined,
    {
      month:
        "short",

      day:
        "numeric",

      year:
        "numeric",
    }
  );
}