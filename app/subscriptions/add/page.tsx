"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Save,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import {
  getDefaultActivityTitle,
  recordActivity,
} from "@/lib/activity";
import {
  withHouseholdInsertFields,
} from "@/lib/data/householdScope";
import { usePermissions } from "@/hooks/usePermissions";

import PageShell from "@/components/ui/PageShell";
import PageTitle from "@/components/ui/PageTitle";
import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";
import { ViewerBanner } from "@/components/ui/PermissionUI";

export default function AddSubscriptionPage() {
  const router = useRouter();

  const {
    user,
    isDemo,
    canCreate,
    householdId,
    loading: permissionsLoading,
  } = usePermissions();

  const [serviceName, setServiceName] = useState("");
  const [category, setCategory] = useState("");
  const [monthlyCost, setMonthlyCost] = useState("");
  const [renewalDate, setRenewalDate] = useState("");
  const [billingCycle, setBillingCycle] = useState("Monthly");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
        "Viewer access is read-only. You cannot add subscriptions."
      );
      return;
    }

    if (!serviceName.trim()) {
      setErrorMessage("Enter a service name.");
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase
        .from("subscriptions")
        .insert(
          withHouseholdInsertFields(
            {
              service_name: serviceName.trim(),
              category: category.trim() || null,
              monthly_cost: monthlyCost
                ? Number(monthlyCost)
                : 0,
              renewal_date: renewalDate || null,
              billing_cycle: billingCycle,
              notes: notes.trim() || null,
            },
            householdId,
            user.id
          )
        );

      if (error) {
        throw error;
      }

      await recordActivity({
        activityType: "subscription.added",
        title: getDefaultActivityTitle(
          "subscription.added",
          serviceName.trim()
        ),
        description:
          "Subscription service recorded in the vault.",
        userId: user.id,
        householdId,
      });

      router.push("/subscriptions");
      router.refresh();
    } catch (error) {
      console.error(
        "Unable to save subscription:",
        error
      );

      setErrorMessage(
        "Unable to save this subscription. Please try again."
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
            <Loader2
              size={22}
              className="animate-spin"
            />
            Loading...
          </div>
        </PageCard>
      </PageShell>
    );
  }

  if (isDemo) {
    return (
      <PageShell>
        <PageTitle
          eyebrow="Interactive Demo"
          title="Create your vault to track subscriptions"
          description="Demo Mode shows sample subscriptions only."
        />

        <PageCard className="text-center">
          <Button href="/signup" className="mt-4">
            Create Your Vault
          </Button>
        </PageCard>
      </PageShell>
    );
  }

  if (!user) {
    return (
      <PageShell>
        <PageCard className="text-center">
          <h1 className="text-2xl font-semibold text-text-primary">
            Sign in to add a subscription
          </h1>
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
        eyebrow="Subscription Tracker"
        title="Add Subscription"
        description="Track recurring services, renewal dates, and monthly costs."
        action={
          <Button
            variant="secondary"
            onClick={() =>
              router.push("/subscriptions")
            }
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
          <FormField label="Service Name">
            <input
              value={serviceName}
              onChange={(event) =>
                setServiceName(event.target.value)
              }
              placeholder="Netflix"
              required
              disabled={!canCreate}
              className={inputClasses}
            />
          </FormField>

          <FormField label="Category">
            <input
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
              placeholder="Streaming"
              disabled={!canCreate}
              className={inputClasses}
            />
          </FormField>

          <FormField label="Monthly Cost">
            <input
              type="number"
              value={monthlyCost}
              onChange={(event) =>
                setMonthlyCost(event.target.value)
              }
              placeholder="15.99"
              disabled={!canCreate}
              className={inputClasses}
            />
          </FormField>

          <FormField label="Renewal Date">
            <input
              type="date"
              value={renewalDate}
              onChange={(event) =>
                setRenewalDate(event.target.value)
              }
              disabled={!canCreate}
              className={inputClasses}
            />
          </FormField>

          <FormField label="Billing Cycle">
            <select
              value={billingCycle}
              onChange={(event) =>
                setBillingCycle(event.target.value)
              }
              disabled={!canCreate}
              className={inputClasses}
            >
              <option>Monthly</option>
              <option>Yearly</option>
              <option>Quarterly</option>
              <option>Weekly</option>
            </select>
          </FormField>

          <div className="md:col-span-2">
            <FormField label="Notes">
              <textarea
                value={notes}
                onChange={(event) =>
                  setNotes(event.target.value)
                }
                placeholder="Optional notes..."
                disabled={!canCreate}
                className={`${inputClasses} min-h-28 resize-y`}
              />
            </FormField>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-border-subtle pt-6 md:col-span-2">
            <Button
              type="submit"
              disabled={saving || !canCreate}
            >
              {saving ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <Save size={18} />
              )}
              {saving ? "Saving..." : "Save Subscription"}
            </Button>

            <Button
              variant="secondary"
              onClick={() =>
                router.push("/subscriptions")
              }
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
