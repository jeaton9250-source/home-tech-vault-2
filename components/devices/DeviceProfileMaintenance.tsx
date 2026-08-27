"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  AlertCircle,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  Loader2,
  Plus,
  Sparkles,
  RotateCcw,
  Wrench,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { applyHouseholdScope } from "@/lib/data/householdScope";
import { demoMaintenance } from "@/lib/demoData";
import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/lib/design-system/cn";
import { formatProfileDate } from "@/lib/devices/deviceProfileUtils";
import {
  buildDeviceMaintenanceRecommendations,
  MAINTENANCE_RECOMMENDATIONS_QUERY_PARAM,
  type DeviceMaintenanceRecommendation,
  type DeviceMaintenanceSource,
} from "@/lib/devices/maintenanceRecommendations";
import Button from "@/components/ui/Button";
import PageCard from "@/components/ui/PageCard";
import {
  createMaintenanceTasksForDevice,
  generateDeviceMaintenanceRecommendations,
} from "@/app/maintenance/actions";

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
  device: DeviceMaintenanceSource;
  onReadOnlyAction?: () => void;
  embedded?: boolean;
};

export default function DeviceProfileMaintenance({
  deviceId,
  device,
  onReadOnlyAction,
  embedded = false,
}: DeviceProfileMaintenanceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasRecommendationQuery =
    searchParams.get(MAINTENANCE_RECOMMENDATIONS_QUERY_PARAM) === "1";
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
  const [recommendationsOpen, setRecommendationsOpen] = useState(
    hasRecommendationQuery
  );
  const [choosingTasks, setChoosingTasks] = useState(false);
  const [selectedRecommendationIds, setSelectedRecommendationIds] = useState<Set<string>>(new Set());
  const [savingRecommendations, setSavingRecommendations] = useState(false);
  const [recommendationMessage, setRecommendationMessage] = useState("");
  const [recommendationLaunchReason, setRecommendationLaunchReason] = useState<
    "new-device" | "manual" | null
  >(hasRecommendationQuery ? "new-device" : null);

  const isGuestDemo = isDemo || !user;
  const isViewer =
    !permissionsLoading &&
    !isGuestDemo &&
    Boolean(user) &&
    role === "viewer";

  const canAddMaintenance =
    !permissionsLoading && canCreate && !isGuestDemo;

  const quickAddHref = `/maintenance/new?deviceId=${encodeURIComponent(deviceId)}&returnTo=${encodeURIComponent(`/devices/${deviceId}?tab=maintenance`)}`;

  const fallbackRecommendations = useMemo(
    () => buildDeviceMaintenanceRecommendations(device, tasks),
    [device, tasks]
  );

  const [
    recommendations,
    setRecommendations,
  ] = useState<DeviceMaintenanceRecommendation[]>(
    fallbackRecommendations
  );

  const [
    loadingRecommendations,
    setLoadingRecommendations,
  ] = useState(false);

  useEffect(() => {
    if (
      recommendationsOpen ||
      loadingRecommendations
    ) {
      return;
    }

    setRecommendations(
      fallbackRecommendations
    );
  }, [
    fallbackRecommendations,
    recommendationsOpen,
    loadingRecommendations,
  ]);

  const recommendationDismissedKey =
    `device-maintenance-recommendations-dismissed:${deviceId}`;

  useEffect(() => {
    if (!hasRecommendationQuery) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete(MAINTENANCE_RECOMMENDATIONS_QUERY_PARAM);

    const nextUrl = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;

    router.replace(nextUrl, { scroll: false });
  }, [hasRecommendationQuery, pathname, router, searchParams]);

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  function hideRecommendations() {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(recommendationDismissedKey, "1");
    }

    setRecommendationsOpen(false);
    setChoosingTasks(false);
    setSelectedRecommendationIds(new Set());
    setRecommendationMessage("");
    setRecommendationLaunchReason(null);
  }

  async function openRecommendations() {
    setRecommendationsOpen(true);
    setRecommendationLaunchReason("manual");
    setRecommendationMessage("");

    if (
      isDemo ||
      !user
    ) {
      setRecommendations(
        fallbackRecommendations
      );
      return;
    }

    try {
      setLoadingRecommendations(
        true
      );

      const result =
        await generateDeviceMaintenanceRecommendations(
          deviceId
        );

      if (
        result.success &&
        result.recommendations.length > 0
      ) {
        setRecommendations(
          result.recommendations
        );

        return;
      }

      setRecommendations(
        fallbackRecommendations
      );

      setRecommendationMessage(
        "Smart recommendations were unavailable, so Home Tech Vault is showing safe category-based suggestions instead."
      );
    } catch (error) {
      console.error(
        "Unable to load smart maintenance recommendations:",
        error
      );

      setRecommendations(
        fallbackRecommendations
      );

      setRecommendationMessage(
        "Smart recommendations were unavailable, so Home Tech Vault is showing safe category-based suggestions instead."
      );
    } finally {
      setLoadingRecommendations(
        false
      );
    }
  }

  function showRecommendationChoices() {
    setRecommendationsOpen(true);
    setChoosingTasks(true);
    setSelectedRecommendationIds(
      new Set(recommendations.map((item) => item.id))
    );
    setRecommendationMessage("");
  }

  async function addRecommendations(
    selected: DeviceMaintenanceRecommendation[]
  ) {
    if (isDemo) {
      onReadOnlyAction?.();
      return;
    }

    if (!canAddMaintenance || !user) {
      return;
    }

    if (selected.length === 0) {
      setRecommendationMessage("Choose at least one task.");
      return;
    }

    try {
      setSavingRecommendations(true);
      setRecommendationMessage("");

      const result = await createMaintenanceTasksForDevice({
        deviceId,
        tasks: selected.map((item) => ({
          title: item.title,
          description: item.description,
          taskType: item.taskType,
          dueDate: new Date(
            Date.now() + item.dueInDays * 24 * 60 * 60 * 1000
          )
            .toISOString()
            .slice(0, 10),
          recurringInterval: item.recurringInterval,
        })),
      });

      if (!result.success) {
        setRecommendationMessage(result.error);
        return;
      }

      hideRecommendations();
      await loadTasks();
    } catch (error) {
      console.error("Unable to add recommended maintenance:", error);
      setRecommendationMessage(
        "Unable to add the recommended tasks right now. Please try again."
      );
    } finally {
      setSavingRecommendations(false);
    }
  }

  async function handleAddAllRecommendations() {
    await addRecommendations(recommendations);
  }

  async function handleAddSelectedRecommendations() {
    await addRecommendations(
      recommendations.filter((item) =>
        selectedRecommendationIds.has(item.id)
      )
    );
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

          {!recommendationsOpen && recommendations.length > 0 ? (
            <button
              type="button"
              onClick={openRecommendations}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-sunken/70 px-4 py-2 text-sm font-medium text-text-primary transition hover:border-interaction/40 hover:text-interaction"
            >
              <Sparkles size={16} />
              Show Recommended Maintenance
            </button>
          ) : null}
        </div>

        {renderAddButton()}
      </div>

      {recommendationsOpen ? (
        <div className="mt-6 rounded-[24px] border border-amber-200 bg-amber-50/70 p-5 shadow-[var(--shadow-sm)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-overline text-warning">
                {recommendationLaunchReason === "new-device"
                  ? "Recommended maintenance for your new device"
                  : "Recommended Maintenance"}
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-text-primary">
                Suggested tasks for {device.device_name?.trim() || "this device"}
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
                These suggestions are based on the device category, manufacturer,
                and model. They will only be created if you choose them.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={() => void handleAddAllRecommendations()}
                disabled={savingRecommendations || recommendations.length === 0}
              >
                {savingRecommendations ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <CheckCircle2 size={16} />
                )}
                Add All
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={showRecommendationChoices}
                disabled={savingRecommendations || recommendations.length === 0}
              >
                Choose Tasks
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={hideRecommendations}
                disabled={savingRecommendations}
              >
                Skip
              </Button>
            </div>
          </div>

          {recommendationMessage ? (
            <p className="mt-4 rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm text-red-700">
              {recommendationMessage}
            </p>
          ) : null}

          {choosingTasks ? (
            <div className="mt-5 space-y-3">
              {recommendations.map((recommendation) => {
                const checked = selectedRecommendationIds.has(
                  recommendation.id
                );

                return (
                  <label
                    key={recommendation.id}
                    className="flex cursor-pointer gap-4 rounded-[20px] border border-border-subtle bg-white px-4 py-4 transition hover:border-interaction/30"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) => {
                        setSelectedRecommendationIds((current) => {
                          const next = new Set(current);

                          if (event.target.checked) {
                            next.add(recommendation.id);
                          } else {
                            next.delete(recommendation.id);
                          }

                          return next;
                        });
                      }}
                      className="mt-1 h-4 w-4 rounded border-border-subtle text-interaction focus:ring-interaction"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-semibold text-text-primary">
                          {recommendation.title}
                        </h4>
                        <span className="rounded-full bg-surface-sunken px-2.5 py-1 text-xs font-medium text-text-secondary">
                          {recommendation.taskType}
                        </span>
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-900">
                          {recommendation.reason}
                        </span>
                      </div>

                      <p className="mt-2 text-sm leading-6 text-text-secondary">
                        {recommendation.description}
                      </p>

                      <p className="mt-2 text-xs text-text-tertiary">
                        Suggested cadence: {recommendation.recurringInterval || "As needed"}
                        {recommendation.dueInDays > 0
                          ? ` · Due in about ${recommendation.dueInDays} days`
                          : ""}
                      </p>
                    </div>
                  </label>
                );
              })}

              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  type="button"
                  onClick={() => void handleAddSelectedRecommendations()}
                  disabled={savingRecommendations}
                >
                  {savingRecommendations ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Check size={16} />
                  )}
                  Add Selected Tasks
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setChoosingTasks(false)}
                  disabled={savingRecommendations}
                >
                  Back
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

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
