"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, Wrench } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { recordActivity } from "@/lib/activity";
import {
  applyHouseholdScope,
  withHouseholdInsertFields,
} from "@/lib/data/householdScope";
import { usePermissions } from "@/hooks/usePermissions";
import DemoWriteGate from "@/components/demo/DemoWriteGate";

import PageShell from "@/components/ui/PageShell";
import PageTitle from "@/components/ui/PageTitle";
import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";
import { ViewerBanner } from "@/components/ui/PermissionUI";

type DeviceOption = {
  id: string;
  device_name: string | null;
};

export default function NewMaintenanceTaskPage() {
  const router = useRouter();

  const {
    user,
    isDemo,
    canCreate,
    householdId,
    loading: permissionsLoading,
  } = usePermissions();

  const [devices, setDevices] = useState<DeviceOption[]>([]);
  const [deviceId, setDeviceId] = useState("");
  const [title, setTitle] = useState("");
  const [taskType, setTaskType] = useState("Maintenance");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [recurringInterval, setRecurringInterval] = useState("None");

  const [loadingDevices, setLoadingDevices] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadDevices() {
      if (permissionsLoading) {
        return;
      }

      try {
        setLoadingDevices(true);
        setErrorMessage("");

        if (isDemo || !user) {
          setDevices([]);
          return;
        }

        const { data, error } =
          await applyHouseholdScope(
            supabase
              .from("devices")
              .select("id, device_name")
              .order("device_name"),
            householdId,
            user.id
          );

        if (error) {
          throw error;
        }

        setDevices((data || []) as DeviceOption[]);
      } catch (error) {
        console.error("Device loading error:", error);

        setErrorMessage(
          "Unable to load devices for this task."
        );
      } finally {
        setLoadingDevices(false);
      }
    }

    void loadDevices();
  }, [
    user,
    isDemo,
    householdId,
    permissionsLoading,
  ]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (isDemo) {
      router.push("/signup");
      return;
    }

    if (!user) {
      router.push("/login");
      return;
    }

    if (!canCreate) {
      setErrorMessage(
        "Viewer access is read-only. You cannot add maintenance tasks."
      );
      return;
    }

    if (!title.trim()) {
      setErrorMessage("Please enter a task title.");
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase
        .from("maintenance_tasks")
        .insert(
          withHouseholdInsertFields(
            {
              device_id: deviceId || null,
              title: title.trim(),
              description: description.trim() || null,
              task_type: taskType,
              due_date: dueDate || null,
              completed: false,
              recurring_interval:
                recurringInterval === "None"
                  ? null
                  : recurringInterval,
            },
            householdId,
            user.id
          )
        );

      if (error) {
        throw error;
      }

      if (deviceId) {
        await recordActivity({
          activityType: "maintenance.scheduled",
          title: "Maintenance scheduled",
          description: dueDate
            ? `${title.trim()} scheduled for ${dueDate}.`
            : `${title.trim()} was added as a maintenance task.`,
          userId: user.id,
          householdId,
          deviceId,
        });
      }

      router.push("/maintenance");
      router.refresh();
    } catch (error) {
      console.error("Maintenance task error:", error);

      setErrorMessage(
        "Unable to create this maintenance task. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  if (permissionsLoading) {
    return (
      <PageShell>
        <PageCard className="flex min-h-64 items-center justify-center">
          <div className="flex items-center gap-3 text-text-secondary">
            <Loader2 size={22} className="animate-spin" />
            Loading...
          </div>
        </PageCard>
      </PageShell>
    );
  }

  if (isDemo) {
    return (
      <DemoWriteGate
        backHref="/maintenance"
        backLabel="Back to Maintenance"
      />
    );
  }

  if (!user) {
    return (
      <PageShell>
        <PageCard className="text-center">
          <Button href="/login" className="mt-6">
            Sign In
          </Button>
        </PageCard>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <ViewerBanner />

      <PageTitle
        eyebrow="Technology Care"
        title="Add Maintenance Task"
        description="Schedule cleaning, backups, updates, inspections, or repairs."
        action={
          <Button
            variant="secondary"
            onClick={() => router.push("/maintenance")}
          >
            <ArrowLeft size={17} />
            Cancel
          </Button>
        }
      />

      {errorMessage && (
        <PageCard className="border-red-200 bg-red-50 text-red-700">
          {errorMessage}
        </PageCard>
      )}

      <PageCard>
        <form
          onSubmit={handleSubmit}
          className="grid gap-6 md:grid-cols-2"
        >
          <FormField label="Task Title">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Clean laptop vents"
              required
              disabled={!canCreate}
              className={inputClasses}
            />
          </FormField>

          <FormField label="Device">
            <select
              value={deviceId}
              onChange={(event) => setDeviceId(event.target.value)}
              disabled={loadingDevices || !canCreate}
              className={inputClasses}
            >
              <option value="">General home task</option>

              {devices.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.device_name || "Unnamed Device"}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Task Type">
            <select
              value={taskType}
              onChange={(event) => setTaskType(event.target.value)}
              disabled={!canCreate}
              className={inputClasses}
            >
              <option>Maintenance</option>
              <option>Cleaning</option>
              <option>Software Update</option>
              <option>Backup</option>
              <option>Inspection</option>
              <option>Repair</option>
              <option>Battery Replacement</option>
            </select>
          </FormField>

          <FormField label="Due Date">
            <input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              disabled={!canCreate}
              className={inputClasses}
            />
          </FormField>

          <FormField label="Repeat">
            <select
              value={recurringInterval}
              onChange={(event) =>
                setRecurringInterval(event.target.value)
              }
              disabled={!canCreate}
              className={inputClasses}
            >
              <option>None</option>
              <option>Weekly</option>
              <option>Monthly</option>
              <option>Every 3 Months</option>
              <option>Every 6 Months</option>
              <option>Yearly</option>
            </select>
          </FormField>

          <div className="md:col-span-2">
            <FormField label="Description">
              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Add instructions or important notes..."
                disabled={!canCreate}
                className={`${inputClasses} min-h-32 resize-y`}
              />
            </FormField>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-border-subtle pt-6 md:col-span-2">
            <Button type="submit" disabled={saving || !canCreate}>
              {saving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}

              {saving ? "Saving..." : "Schedule Task"}
            </Button>

            <Button
              variant="secondary"
              onClick={() => router.push("/maintenance")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </PageCard>
    </PageShell>
  );
}

const inputClasses =
  "w-full rounded-xl border border-border-subtle bg-white px-4 py-3 text-text-primary outline-none focus:border-interaction focus:ring-2 focus:ring-interaction/20 disabled:cursor-not-allowed disabled:bg-surface-sunken";

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-text-primary">
        {label}
      </span>

      {children}
    </label>
  );
}
