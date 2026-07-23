"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from "react";

import Link from "next/link";

import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Circle,
  CircleAlert,
  Clock3,
  Laptop,
  Loader2,
  MoreHorizontal,
  Plus,
  Repeat2,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Trash2,
  Wrench,
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import {
  applyHouseholdMutationScope,
  applyHouseholdScope,
} from "@/lib/data/householdScope";
import { recordActivity } from "@/lib/activity";

import {
  demoDevices,
  demoMaintenance,
} from "@/lib/demoData";

import { usePermissions } from "@/hooks/usePermissions";
import { useDemoReadOnlyAction } from "@/components/demo/DemoExperienceProvider";
import { cn } from "@/lib/design-system/cn";

import PageShell from "@/components/ui/PageShell";
import PageCard from "@/components/ui/PageCard";
import PageHero from "@/components/ui/PageHero";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import {
  PageAction,
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
  | "overdue"
  | "due-soon"
  | "upcoming"
  | "completed";

type MaintenanceSort =
  | "due-soonest"
  | "due-latest"
  | "name-asc"
  | "device-asc"
  | "recently-completed";

type MaintenanceViewMode = "all" | "grouped";

type MaintenanceIcon = ComponentType<{
  size?: number;
  className?: string;
}>;

type DemoRecord = Record<string, unknown>;

type TaskStatusInfo = {
  label: string;
  group: MaintenanceFilter | "unscheduled";
  badgeClass: string;
  Icon: MaintenanceIcon;
  dueMessage: string;
};

export default function MaintenancePage() {
  const {
    user,
    isDemo,
    householdId,
    role,
    canCreate,
    canEdit,
    canDelete,
    loading: permissionsLoading,
  } = usePermissions();

  const showReadOnlyModal = useDemoReadOnlyAction();

  const showViewerAccess =
    !permissionsLoading &&
    !isDemo &&
    Boolean(user) &&
    role === "viewer";

  const canAddTasks =
    !permissionsLoading && canCreate && !isDemo && Boolean(user);

  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] =
    useState<MaintenanceFilter>("all");
  const [selectedDeviceId, setSelectedDeviceId] = useState("all");
  const [sortOption, setSortOption] =
    useState<MaintenanceSort>("due-soonest");
  const [viewMode, setViewMode] =
    useState<MaintenanceViewMode>("all");

  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const loadTasks = useCallback(async () => {
    if (permissionsLoading) {
      return;
    }

    try {
      setLoadingTasks(true);
      setErrorMessage("");

      if (isDemo || !user) {
        const sampleTasks = demoMaintenance.map((item, index) =>
          normalizeDemoTask(item, index)
        );
        setTasks(sampleTasks);
        return;
      }

      const { data, error } = await applyHouseholdScope(
        supabase
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
          }),
        householdId,
        user.id
      );

      if (error) {
        throw error;
      }

      setTasks((data ?? []) as MaintenanceTask[]);
    } catch (error: unknown) {
      console.error("Maintenance loading error:", error);

      setErrorMessage(
        "Unable to load maintenance tasks. Please try again."
      );
    } finally {
      setLoadingTasks(false);
    }
  }, [user, isDemo, householdId, permissionsLoading]);

  useEffect(() => {
    let mounted = true;

    async function runLoad() {
      if (permissionsLoading) {
        return;
      }

      try {
        setLoadingTasks(true);
        setErrorMessage("");

        if (isDemo || !user) {
          const sampleTasks = demoMaintenance.map((item, index) =>
            normalizeDemoTask(item, index)
          );

          if (!mounted) {
            return;
          }

          setTasks(sampleTasks);
          return;
        }

        const { data, error } = await applyHouseholdScope(
          supabase
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
            }),
          householdId,
          user.id
        );

        if (error) {
          throw error;
        }

        if (!mounted) {
          return;
        }

        setTasks((data ?? []) as MaintenanceTask[]);
      } catch (error: unknown) {
        console.error("Maintenance loading error:", error);

        if (!mounted) {
          return;
        }

        setErrorMessage(
          "Unable to load maintenance tasks. Please try again."
        );
      } finally {
        if (mounted) {
          setLoadingTasks(false);
        }
      }
    }

    void runLoad();

    return () => {
      mounted = false;
    };
  }, [user, isDemo, householdId, permissionsLoading]);

  async function reloadTasks() {
    if (!user || isDemo) {
      return;
    }

    try {
      const { data, error } = await applyHouseholdScope(
        supabase
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
          }),
        householdId,
        user.id
      );

      if (error) {
        throw error;
      }

      setTasks((data ?? []) as MaintenanceTask[]);
    } catch (error: unknown) {
      console.error("Maintenance reload error:", error);

      setErrorMessage(
        "Unable to reload maintenance tasks. Please try again."
      );
    }
  }

  async function toggleComplete(task: MaintenanceTask) {
    if (isDemo) {
      showReadOnlyModal();
      return;
    }

    if (!canEdit || !user) {
      return;
    }

    try {
      setUpdatingId(task.id);

      const nextCompleted = !task.completed;

      const { error } = await applyHouseholdMutationScope(
        supabase
          .from("maintenance_tasks")
          .update({
            completed: nextCompleted,
            completed_at: nextCompleted
              ? new Date().toISOString()
              : null,
          })
          .eq("id", task.id),
        householdId,
        user.id
      );

      if (error) {
        throw error;
      }

      if (nextCompleted && task.device_id) {
        await recordActivity({
          activityType: "maintenance.completed",
          title: task.title,
          description:
            task.description ??
            "Maintenance task completed through the Maintenance Center.",
          userId: user.id,
          householdId,
          deviceId: task.device_id,
        });
      }

      await reloadTasks();
    } catch (error: unknown) {
      console.error("Maintenance update error:", error);

      window.alert("Unable to update the task. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function deleteTask(taskId: string) {
    if (isDemo) {
      showReadOnlyModal();
      return;
    }

    if (!canDelete || !user) {
      return;
    }

    const confirmed = window.confirm(
      "Delete this maintenance task?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(taskId);

      const { error } = await applyHouseholdMutationScope(
        supabase
          .from("maintenance_tasks")
          .delete()
          .eq("id", taskId),
        householdId,
        user.id
      );

      if (error) {
        throw error;
      }

      setTasks((current) =>
        current.filter((task) => task.id !== taskId)
      );
    } catch (error: unknown) {
      console.error("Maintenance delete error:", error);

      window.alert("Unable to delete the task. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  const openTasks = useMemo(
    () => tasks.filter((task) => !task.completed),
    [tasks]
  );

  const completedTasks = useMemo(
    () => tasks.filter((task) => task.completed),
    [tasks]
  );

  const overdueTasks = useMemo(
    () =>
      openTasks.filter(
        (task) => getTaskStatus(task, today).group === "overdue"
      ),
    [openTasks, today]
  );

  const dueSoonTasks = useMemo(
    () =>
      openTasks.filter(
        (task) => getTaskStatus(task, today).group === "due-soon"
      ),
    [openTasks, today]
  );

  const upcomingTasks = useMemo(
    () =>
      openTasks.filter((task) => {
        const group = getTaskStatus(task, today).group;
        return group === "upcoming" || group === "unscheduled";
      }),
    [openTasks, today]
  );

  const deviceOptions = useMemo(() => {
    const map = new Map<string, string>();

    for (const task of tasks) {
      if (!task.device_id) {
        continue;
      }

      map.set(
        task.device_id,
        task.devices?.device_name?.trim() || "Unnamed Device"
      );
    }

    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    const filtered = tasks.filter((task) => {
      const status = getTaskStatus(task, today);

      const matchesFilter =
        selectedFilter === "all" ||
        (selectedFilter === "upcoming" &&
          (status.group === "upcoming" ||
            status.group === "unscheduled")) ||
        status.group === selectedFilter;

      const matchesDevice =
        selectedDeviceId === "all" ||
        (selectedDeviceId === "none"
          ? !task.device_id
          : task.device_id === selectedDeviceId);

      const searchableText = [
        task.title,
        task.description,
        task.task_type,
        task.devices?.device_name,
        task.recurring_interval,
        status.label,
      ]
        .map((value) => String(value ?? "").toLowerCase())
        .join(" ");

      const matchesSearch =
        query === "" || searchableText.includes(query);

      return matchesFilter && matchesDevice && matchesSearch;
    });

    return [...filtered].sort((first, second) => {
      if (sortOption === "name-asc") {
        return first.title.localeCompare(second.title);
      }

      if (sortOption === "device-asc") {
        const firstDevice =
          first.devices?.device_name ?? "No Device Assigned";
        const secondDevice =
          second.devices?.device_name ?? "No Device Assigned";
        return firstDevice.localeCompare(secondDevice);
      }

      if (sortOption === "recently-completed") {
        const firstCompleted = first.completed_at
          ? new Date(first.completed_at).getTime()
          : 0;
        const secondCompleted = second.completed_at
          ? new Date(second.completed_at).getTime()
          : 0;

        if (firstCompleted === secondCompleted) {
          return first.title.localeCompare(second.title);
        }

        return secondCompleted - firstCompleted;
      }

      const firstDue = getDueSortValue(first.due_date);
      const secondDue = getDueSortValue(second.due_date);
      const firstMissing = firstDue === null;
      const secondMissing = secondDue === null;

      if (firstMissing && secondMissing) {
        return first.title.localeCompare(second.title);
      }

      if (firstMissing) {
        return 1;
      }

      if (secondMissing) {
        return -1;
      }

      if (sortOption === "due-latest") {
        return (secondDue ?? 0) - (firstDue ?? 0);
      }

      return (firstDue ?? 0) - (secondDue ?? 0);
    });
  }, [
    tasks,
    searchTerm,
    selectedFilter,
    selectedDeviceId,
    sortOption,
    today,
  ]);

  const groupedTasks = useMemo(() => {
    if (viewMode !== "grouped") {
      return null;
    }

    const groups = new Map<
      string,
      {
        key: string;
        label: string;
        deviceId: string | null;
        tasks: MaintenanceTask[];
      }
    >();

    for (const task of filteredTasks) {
      const key = task.device_id ?? "none";
      const label = task.device_id
        ? task.devices?.device_name?.trim() || "Unnamed Device"
        : "No Device Assigned";

      const existing = groups.get(key);

      if (existing) {
        existing.tasks.push(task);
      } else {
        groups.set(key, {
          key,
          label,
          deviceId: task.device_id,
          tasks: [task],
        });
      }
    }

    return Array.from(groups.values()).sort((a, b) => {
      if (a.key === "none") {
        return 1;
      }

      if (b.key === "none") {
        return -1;
      }

      return a.label.localeCompare(b.label);
    });
  }, [filteredTasks, viewMode]);

  const filtersActive =
    searchTerm.trim() !== "" ||
    selectedFilter !== "all" ||
    selectedDeviceId !== "all" ||
    sortOption !== "due-soonest" ||
    viewMode !== "all";

  const pageLoading = permissionsLoading || loadingTasks;

  const summaryCards: Array<{
    id: MaintenanceFilter;
    title: string;
    value: number;
    description: string;
    icon: MaintenanceIcon;
    iconClassName: string;
  }> = [
    {
      id: "overdue",
      title: "Overdue",
      value: overdueTasks.length,
      description: "Needs attention",
      icon: CircleAlert,
      iconClassName: "bg-danger-soft text-danger",
    },
    {
      id: "due-soon",
      title: "Due Soon",
      value: dueSoonTasks.length,
      description: "Due within 7 days",
      icon: Clock3,
      iconClassName: "bg-warning-soft text-warning",
    },
    {
      id: "upcoming",
      title: "Upcoming",
      value: upcomingTasks.length,
      description: "Planned maintenance",
      icon: CalendarDays,
      iconClassName: "bg-surface-sunken text-charcoal",
    },
    {
      id: "completed",
      title: "Completed",
      value: completedTasks.length,
      description: "Finished tasks",
      icon: CheckCircle2,
      iconClassName: "bg-home-health-soft text-home-health",
    },
  ];

  function clearFilters() {
    setSearchTerm("");
    setSelectedFilter("all");
    setSelectedDeviceId("all");
    setSortOption("due-soonest");
    setViewMode("all");
  }

  const resultsHeader = useMemo(() => {
    const count = filteredTasks.length;
    const search = searchTerm.trim();

    if (search) {
      return (
        "Showing " +
        String(count) +
        " result" +
        (count === 1 ? "" : "s") +
        " for “" +
        search +
        "”"
      );
    }

    if (selectedFilter === "overdue") {
      return String(count) + " overdue task" + (count === 1 ? "" : "s");
    }

    if (selectedFilter === "due-soon") {
      return (
        String(count) + " task" + (count === 1 ? "" : "s") + " due soon"
      );
    }

    if (selectedFilter === "upcoming") {
      return (
        String(count) + " upcoming task" + (count === 1 ? "" : "s")
      );
    }

    if (selectedFilter === "completed") {
      return (
        String(count) + " completed task" + (count === 1 ? "" : "s")
      );
    }

    return String(count) + " maintenance task" + (count === 1 ? "" : "s");
  }, [filteredTasks.length, searchTerm, selectedFilter]);

  return (
    <PageShell>
      <PageHero
        section="homeHealth"
        title="Maintenance"
        description="Track routine care, upcoming tasks, overdue maintenance, and completed work across your household devices."
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {!permissionsLoading && canAddTasks ? (
            <PageAction
              canCreate={canCreate}
              href="/maintenance/new"
              label="Add Maintenance Task"
              icon={Plus}
            />
          ) : !permissionsLoading && (isDemo || !user) ? (
            <PageAction
              canCreate={false}
              href="/maintenance/new"
              label="Add Maintenance Task"
              icon={Plus}
            />
          ) : showViewerAccess ? (
            <div className="rounded-[var(--radius-button)] border border-border-subtle bg-surface-card/80 px-4 py-3 text-sm font-medium text-text-secondary shadow-[var(--shadow-sm)]">
              Viewer Access · Read Only
            </div>
          ) : null}
        </div>
      </PageHero>

      {showViewerAccess ? (
        <ViewerBanner description="You can view shared maintenance tasks and their status. Viewer access cannot add, complete, reopen, or delete tasks." />
      ) : null}

      {(isDemo || !user) && !pageLoading ? (
        <PageCard className="border-warning/30 bg-warning-soft/60 p-4 md:p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-button)] border border-charcoal/15 bg-charcoal text-surface-card">
              <Wrench size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">
                Demo Mode
              </p>
              <p className="mt-1 text-sm leading-6 text-text-secondary">
                You are viewing sample maintenance tasks. Creating or updating
                tasks requires your own Home Tech Vault.
              </p>
            </div>
          </div>
        </PageCard>
      ) : null}

      {errorMessage ? (
        <PageCard className="border-danger/30 bg-danger-soft/70 p-5 md:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-button)] bg-danger-soft text-danger">
                <CircleAlert size={18} />
              </div>
              <div>
                <p className="font-semibold text-text-primary">
                  Unable to load maintenance
                </p>
                <p className="mt-1 text-sm leading-6 text-text-secondary">
                  {errorMessage}
                </p>
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
        </PageCard>
      ) : null}

      {pageLoading ? (
        <MaintenanceSkeleton />
      ) : errorMessage && tasks.length === 0 ? null : (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => {
              const selected = selectedFilter === card.id;
              const Icon = card.icon;

              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() =>
                    setSelectedFilter(selected ? "all" : card.id)
                  }
                  aria-pressed={selected}
                  className={cn(
                    "htv-focus-ring rounded-[var(--radius-card)] border p-4 text-left shadow-[var(--shadow-sm)] transition md:p-5",
                    selected
                      ? "border-charcoal bg-surface-card ring-2 ring-charcoal/15"
                      : "border-border-subtle bg-surface-card hover:border-border-strong hover:bg-surface-hover"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">
                        {card.title}
                      </p>
                      <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-text-primary">
                        {card.value}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-text-secondary">
                        {card.description}
                      </p>
                    </div>

                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                        card.iconClassName
                      )}
                    >
                      <Icon size={16} aria-hidden />
                    </div>
                  </div>
                </button>
              );
            })}
          </section>

          <PageCard className="p-5 md:p-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                  <Search
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary"
                  />
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(event.target.value)
                    }
                    placeholder="Search tasks, devices, notes, or categories..."
                    className="htv-focus-ring w-full rounded-2xl border border-border-subtle bg-surface-sunken py-3.5 pl-11 pr-11 text-sm text-text-primary outline-none transition placeholder:text-text-tertiary focus:border-interaction focus:bg-surface-card focus:ring-4 focus:ring-interaction/15"
                  />
                  {searchTerm ? (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      aria-label="Clear search"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary transition hover:text-text-primary"
                    >
                      <X size={16} />
                    </button>
                  ) : null}
                </div>

                <label className="flex min-w-[11rem] items-center gap-2">
                  <span className="sr-only">Filter by device</span>
                  <Laptop
                    size={16}
                    className="shrink-0 text-text-tertiary"
                    aria-hidden
                  />
                  <select
                    value={selectedDeviceId}
                    onChange={(event) =>
                      setSelectedDeviceId(event.target.value)
                    }
                    className="htv-focus-ring w-full rounded-2xl border border-border-subtle bg-surface-card px-4 py-3 text-sm text-text-primary outline-none transition focus:border-interaction"
                  >
                    <option value="all">All devices</option>
                    <option value="none">No device assigned</option>
                    {deviceOptions.map((device) => (
                      <option key={device.id} value={device.id}>
                        {device.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex min-w-[12rem] items-center gap-2">
                  <span className="sr-only">Sort maintenance tasks</span>
                  <SlidersHorizontal
                    size={16}
                    className="shrink-0 text-text-tertiary"
                    aria-hidden
                  />
                  <select
                    value={sortOption}
                    onChange={(event) =>
                      setSortOption(
                        event.target.value as MaintenanceSort
                      )
                    }
                    className="htv-focus-ring w-full rounded-2xl border border-border-subtle bg-surface-card px-4 py-3 text-sm text-text-primary outline-none transition focus:border-interaction"
                  >
                    <option value="due-soonest">Due Date Soonest</option>
                    <option value="due-latest">Due Date Latest</option>
                    <option value="name-asc">Task Name A–Z</option>
                    <option value="device-asc">Device Name A–Z</option>
                    <option value="recently-completed">
                      Recently Completed
                    </option>
                  </select>
                </label>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {(
                    [
                      { id: "all", label: "All" },
                      { id: "overdue", label: "Overdue" },
                      { id: "due-soon", label: "Due Soon" },
                      { id: "upcoming", label: "Upcoming" },
                      { id: "completed", label: "Completed" },
                    ] as const
                  ).map((filter) => {
                    const selected = selectedFilter === filter.id;

                    return (
                      <button
                        key={filter.id}
                        type="button"
                        onClick={() => setSelectedFilter(filter.id)}
                        className={cn(
                          "htv-focus-ring shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition",
                          selected
                            ? "bg-charcoal text-surface-card"
                            : "border border-border-subtle bg-surface-card text-text-secondary hover:border-border-strong hover:text-text-primary"
                        )}
                      >
                        {filter.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => setViewMode("all")}
                    className={cn(
                      "htv-focus-ring rounded-full px-3 py-1.5 text-xs font-semibold transition",
                      viewMode === "all"
                        ? "bg-charcoal text-surface-card"
                        : "border border-border-subtle text-text-secondary hover:text-text-primary"
                    )}
                  >
                    All Tasks
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("grouped")}
                    className={cn(
                      "htv-focus-ring rounded-full px-3 py-1.5 text-xs font-semibold transition",
                      viewMode === "grouped"
                        ? "bg-charcoal text-surface-card"
                        : "border border-border-subtle text-text-secondary hover:text-text-primary"
                    )}
                  >
                    Group by Device
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle pt-4">
                <p className="text-sm text-text-secondary">
                  {resultsHeader}
                </p>

                {filtersActive ? (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="htv-focus-ring inline-flex items-center gap-2 text-sm font-semibold text-text-primary transition hover:text-interaction"
                  >
                    <X size={15} />
                    Clear filters
                  </button>
                ) : null}
              </div>
            </div>
          </PageCard>

          {tasks.length === 0 ? (
            <EmptyState
              icon={Wrench}
              title="No maintenance tasks have been added yet."
              description="Create reminders for cleaning, updates, inspections, backups, filter changes, and routine device care."
              section="homeHealth"
            >
              {!permissionsLoading &&
              (canAddTasks || isDemo || !user) ? (
                <div className="mt-6">
                  <PageAction
                    canCreate={canCreate && !isDemo && Boolean(user)}
                    href="/maintenance/new"
                    label="Add Maintenance Task"
                    icon={Plus}
                  />
                </div>
              ) : null}
            </EmptyState>
          ) : filteredTasks.length === 0 ? (
            <MaintenanceEmptyFilterState
              selectedFilter={selectedFilter}
              searchTerm={searchTerm}
              onClear={clearFilters}
            />
          ) : viewMode === "grouped" && groupedTasks ? (
            <div className="space-y-8">
              {groupedTasks.map((group) => (
                <section key={group.key} className="space-y-3">
                  <div className="flex items-center justify-between gap-3 px-1">
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-semibold tracking-[-0.03em] text-text-primary">
                        {group.label}
                      </h2>
                      <p className="mt-1 text-sm text-text-secondary">
                        {group.tasks.length}{" "}
                        {group.tasks.length === 1 ? "task" : "tasks"}
                      </p>
                    </div>

                    {group.deviceId ? (
                      <Button
                        href={"/devices/" + group.deviceId}
                        variant="ghost"
                        size="sm"
                      >
                        View Device
                        <ChevronRight size={15} />
                      </Button>
                    ) : null}
                  </div>

                  <div className="space-y-3">
                    {group.tasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        today={today}
                        canEdit={canEdit && !isDemo}
                        canDelete={canDelete && !isDemo}
                        isDemo={isDemo || !user}
                        updating={updatingId === task.id}
                        deleting={deletingId === task.id}
                        onToggle={() => void toggleComplete(task)}
                        onDelete={() => void deleteTask(task.id)}
                        onReadOnlyAction={showReadOnlyModal}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <section className="space-y-3">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  today={today}
                  canEdit={canEdit && !isDemo}
                  canDelete={canDelete && !isDemo}
                  isDemo={isDemo || !user}
                  updating={updatingId === task.id}
                  deleting={deletingId === task.id}
                  onToggle={() => void toggleComplete(task)}
                  onDelete={() => void deleteTask(task.id)}
                  onReadOnlyAction={showReadOnlyModal}
                />
              ))}
            </section>
          )}
        </>
      )}
    </PageShell>
  );
}

function MaintenanceEmptyFilterState({
  selectedFilter,
  searchTerm,
  onClear,
}: {
  selectedFilter: MaintenanceFilter;
  searchTerm: string;
  onClear: () => void;
}) {
  if (searchTerm.trim()) {
    return (
      <EmptyState
        icon={Search}
        title="No maintenance tasks match your search."
        description="Try another task title, device name, note, or category."
        section="homeHealth"
      >
        <Button
          type="button"
          variant="secondary"
          className="mt-6"
          onClick={onClear}
        >
          Clear Filters
        </Button>
      </EmptyState>
    );
  }

  let title = "No maintenance tasks found.";
  let description =
    "Try another filter to review care across your household devices.";

  if (selectedFilter === "overdue") {
    title = "Nothing is overdue.";
    description = "Your maintenance schedule is currently on track.";
  } else if (selectedFilter === "due-soon") {
    title = "No tasks are due soon.";
    description = "Nothing is due within the next seven days.";
  } else if (selectedFilter === "upcoming") {
    title = "No upcoming maintenance tasks.";
    description = "Add planned care reminders to stay ahead of routine work.";
  } else if (selectedFilter === "completed") {
    title = "No completed maintenance tasks yet.";
    description = "Completed work will appear here after you finish a task.";
  }

  return (
    <EmptyState
      icon={CheckCircle2}
      title={title}
      description={description}
      section="homeHealth"
    >
      <Button
        type="button"
        variant="secondary"
        className="mt-6"
        onClick={onClear}
      >
        View All Tasks
      </Button>
    </EmptyState>
  );
}

function TaskCard({
  task,
  today,
  canEdit,
  canDelete,
  isDemo,
  updating,
  deleting,
  onToggle,
  onDelete,
  onReadOnlyAction,
}: {
  task: MaintenanceTask;
  today: Date;
  canEdit: boolean;
  canDelete: boolean;
  isDemo: boolean;
  updating: boolean;
  deleting: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onReadOnlyAction: () => void;
}) {
  const status = getTaskStatus(task, today);
  const StatusIcon = status.Icon;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (menuRef.current?.contains(event.target as Node)) {
        return;
      }

      setMenuOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  function handleToggleClick() {
    if (isDemo) {
      onReadOnlyAction();
      return;
    }

    if (!canEdit) {
      return;
    }

    onToggle();
  }

  return (
    <article className="rounded-[var(--radius-card)] border border-border-subtle bg-surface-card p-4 shadow-[var(--shadow-sm)] transition hover:border-border-strong md:p-5">
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[auto_minmax(0,1.4fr)_9rem_8rem_9rem_auto] lg:items-center lg:gap-4">
        <div className="flex items-start justify-between gap-3 lg:contents">
          {canEdit || isDemo ? (
            <button
              type="button"
              onClick={handleToggleClick}
              disabled={updating}
              aria-label={
                task.completed
                  ? "Mark task incomplete"
                  : "Mark task complete"
              }
              className={cn(
                "htv-focus-ring flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border-subtle bg-surface-sunken transition disabled:opacity-50",
                task.completed
                  ? "text-home-health"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              {updating ? (
                <Loader2 size={18} className="animate-spin" />
              ) : task.completed ? (
                <CheckCircle2 size={20} />
              ) : (
                <Circle size={20} />
              )}
            </button>
          ) : (
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border-subtle bg-surface-sunken",
                task.completed
                  ? "text-home-health"
                  : "text-text-tertiary"
              )}
            >
              {task.completed ? (
                <CheckCircle2 size={20} />
              ) : (
                <Circle size={20} />
              )}
            </div>
          )}

          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold lg:hidden",
              status.badgeClass
            )}
          >
            <StatusIcon size={13} aria-hidden />
            {status.label}
          </span>
        </div>

        <div className="min-w-0">
          <h2
            className={cn(
              "text-lg font-semibold tracking-[-0.03em]",
              task.completed
                ? "text-text-tertiary line-through"
                : "text-text-primary"
            )}
          >
            {task.title}
          </h2>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-text-secondary">
            {task.device_id ? (
              <Link
                href={"/devices/" + task.device_id}
                className="htv-focus-ring inline-flex items-center gap-1.5 rounded-md font-medium text-interaction hover:text-interaction-hover"
              >
                <Laptop size={14} aria-hidden />
                {task.devices?.device_name || "Unnamed Device"}
              </Link>
            ) : (
              <span>No Device Assigned</span>
            )}

            {task.task_type ? (
              <span className="rounded-full bg-surface-sunken px-2 py-0.5 text-xs font-medium text-text-secondary">
                {task.task_type}
              </span>
            ) : null}
          </div>

          {task.description ? (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-text-secondary">
              {task.description}
            </p>
          ) : null}
        </div>

        <div className="text-sm">
          <p className="font-medium text-text-primary">
            {status.dueMessage}
          </p>
          {task.completed && task.completed_at ? (
            <p className="mt-1 text-xs text-text-tertiary">
              Completed {formatDate(task.completed_at.slice(0, 10))}
            </p>
          ) : task.due_date ? (
            <p className="mt-1 text-xs text-text-tertiary">
              {formatDate(task.due_date)}
            </p>
          ) : null}
        </div>

        <div className="text-sm text-text-secondary">
          {task.recurring_interval ? (
            <span className="inline-flex items-center gap-1.5">
              <Repeat2 size={14} aria-hidden />
              {task.recurring_interval}
            </span>
          ) : (
            <span className="text-text-tertiary">One-time</span>
          )}
        </div>

        <span
          className={cn(
            "hidden w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold lg:inline-flex",
            status.badgeClass
          )}
        >
          <StatusIcon size={13} aria-hidden />
          {status.label}
        </span>

        <div className="relative flex items-center justify-between gap-2 lg:justify-end" ref={menuRef}>
          <div className="flex gap-2 lg:hidden">
            {task.device_id ? (
              <Button
                href={"/devices/" + task.device_id}
                variant="secondary"
                size="sm"
              >
                View Device
              </Button>
            ) : null}
          </div>

          {(canEdit || canDelete || isDemo || task.device_id) && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="px-3"
                aria-label="Task actions"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((open) => !open)}
              >
                <MoreHorizontal size={16} />
              </Button>

              {menuOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-[var(--radius-dialog)] border border-border-subtle bg-surface-card shadow-lg"
                >
                  {(canEdit || isDemo) && (
                    <button
                      type="button"
                      role="menuitem"
                      className="htv-focus-ring flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-text-primary transition hover:bg-surface-sunken"
                      onClick={() => {
                        setMenuOpen(false);
                        handleToggleClick();
                      }}
                    >
                      {task.completed ? (
                        <>
                          <Circle size={15} />
                          Mark Incomplete
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={15} />
                          Mark Complete
                        </>
                      )}
                    </button>
                  )}

                  {task.device_id ? (
                    <Link
                      href={"/devices/" + task.device_id}
                      role="menuitem"
                      className="htv-focus-ring flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-text-primary transition hover:bg-surface-sunken"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Laptop size={15} />
                      View Device
                    </Link>
                  ) : null}

                  {(canDelete || isDemo) && (
                    <button
                      type="button"
                      role="menuitem"
                      disabled={deleting}
                      className="htv-focus-ring flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-danger transition hover:bg-danger-soft"
                      onClick={() => {
                        setMenuOpen(false);

                        if (isDemo) {
                          onReadOnlyAction();
                          return;
                        }

                        onDelete();
                      }}
                    >
                      {deleting ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Trash2 size={15} />
                      )}
                      Delete Task
                    </button>
                  )}
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </article>
  );
}

function MaintenanceSkeleton() {
  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-28 animate-pulse rounded-[var(--radius-card)] border border-border-subtle bg-surface-card"
          />
        ))}
      </section>

      <div className="h-44 animate-pulse rounded-[var(--radius-card)] border border-border-subtle bg-surface-card" />

      <section className="space-y-3">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-28 animate-pulse rounded-[var(--radius-card)] border border-border-subtle bg-surface-card"
          />
        ))}
      </section>
    </div>
  );
}

function normalizeDemoTask(
  item: unknown,
  index: number
): MaintenanceTask {
  const record =
    typeof item === "object" && item !== null
      ? (item as DemoRecord)
      : {};

  const id =
    getString(record, "id") ??
    "demo-maintenance-" + String(index + 1);

  const deviceId = getString(record, "device_id");

  const connectedDevice = demoDevices.find(
    (device) => device.id === deviceId
  );

  const status = getString(record, "status") ?? "";

  const completed = status.toLowerCase().includes("complete");

  return {
    id,
    user_id: "demo-user",
    household_id: null,
    device_id: deviceId,
    title: getString(record, "title") ?? "Maintenance Task",
    description: getString(record, "notes"),
    task_type: getString(record, "category") ?? "Maintenance",
    due_date: getString(record, "due_date"),
    completed,
    completed_at: completed ? new Date().toISOString() : null,
    recurring_interval: getString(record, "frequency"),
    created_at: new Date().toISOString(),
    devices: connectedDevice
      ? {
          device_name: connectedDevice.device_name,
        }
      : null,
  };
}

function getString(
  record: DemoRecord,
  key: string
): string | null {
  const value = record[key];

  return typeof value === "string" ? value : null;
}

function getDueSortValue(dueDate: string | null): number | null {
  if (!dueDate) {
    return null;
  }

  const value = new Date(dueDate + "T00:00:00").getTime();

  return Number.isFinite(value) ? value : null;
}

function getTaskStatus(
  task: MaintenanceTask,
  today: Date
): TaskStatusInfo {
  if (task.completed) {
    return {
      label: "Completed",
      group: "completed",
      badgeClass: "bg-home-health-soft text-home-health",
      Icon: CheckCircle2,
      dueMessage: task.completed_at
        ? "Completed " + formatDate(task.completed_at.slice(0, 10))
        : "Completed",
    };
  }

  if (!task.due_date) {
    return {
      label: "No Due Date",
      group: "unscheduled",
      badgeClass: "bg-surface-sunken text-text-secondary",
      Icon: CalendarDays,
      dueMessage: "No due date",
    };
  }

  const dueDate = new Date(task.due_date + "T00:00:00");

  if (Number.isNaN(dueDate.getTime())) {
    return {
      label: "No Due Date",
      group: "unscheduled",
      badgeClass: "bg-surface-sunken text-text-secondary",
      Icon: CalendarDays,
      dueMessage: "No due date",
    };
  }

  const difference = Math.ceil(
    (dueDate.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  if (difference < 0) {
    const days = Math.abs(difference);

    return {
      label: "Overdue",
      group: "overdue",
      badgeClass: "bg-danger-soft text-danger",
      Icon: CircleAlert,
      dueMessage:
        days === 1
          ? "Overdue by 1 day"
          : "Overdue by " + String(days) + " days",
    };
  }

  if (difference === 0) {
    return {
      label: "Due Soon",
      group: "due-soon",
      badgeClass: "bg-warning-soft text-warning",
      Icon: Clock3,
      dueMessage: "Due today",
    };
  }

  if (difference === 1) {
    return {
      label: "Due Soon",
      group: "due-soon",
      badgeClass: "bg-warning-soft text-warning",
      Icon: Clock3,
      dueMessage: "Due tomorrow",
    };
  }

  if (difference <= 7) {
    return {
      label: "Due Soon",
      group: "due-soon",
      badgeClass: "bg-warning-soft text-warning",
      Icon: Clock3,
      dueMessage: "Due in " + String(difference) + " days",
    };
  }

  return {
    label: "Upcoming",
    group: "upcoming",
    badgeClass: "bg-surface-sunken text-text-secondary",
    Icon: CalendarDays,
    dueMessage: "Due " + formatDate(task.due_date),
  };
}

function formatDate(value: string) {
  const date = new Date(value + "T00:00:00");

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
