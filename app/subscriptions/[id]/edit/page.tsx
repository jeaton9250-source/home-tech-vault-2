"use client";

import {
  FormEvent,
  use,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Save,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import {
  applyHouseholdScope,
} from "@/lib/data/householdScope";
import {
  updateSubscription,
} from "@/app/subscriptions/actions";
import {
  MAX_SUBSCRIPTION_MONTHLY_COST,
  SUBSCRIPTION_FIELD_LIMITS,
  validateSubscriptionInput,
} from "@/lib/subscriptions/subscriptionInputValidation";
import { usePermissions } from "@/hooks/usePermissions";
import DemoWriteGate from "@/components/demo/DemoWriteGate";

import PageShell from "@/components/ui/PageShell";
import PageTitle from "@/components/ui/PageTitle";
import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";
import { ViewerBanner } from "@/components/ui/PermissionUI";

export default function EditSubscriptionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const {
    user,
    isDemo,
    canEdit,
    householdId,
    loading: permissionsLoading,
  } = usePermissions();

  const [serviceName, setServiceName] = useState("");
  const [category, setCategory] = useState("");
  const [monthlyCost, setMonthlyCost] = useState("");
  const [renewalDate, setRenewalDate] = useState("");
  const [billingCycle, setBillingCycle] = useState("Monthly");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadSubscription() {
      if (permissionsLoading) {
        return;
      }

      try {
        setLoading(true);
        setErrorMessage("");
        setNotFound(false);

        if (isDemo || !user) {
          return;
        }

        const { data, error } =
          await applyHouseholdScope(
            supabase
              .from("subscriptions")
              .select("*")
              .eq("id", id),
            householdId,
            user.id
          ).maybeSingle();

        if (error) {
          throw error;
        }

        if (!data) {
          setNotFound(true);
          return;
        }

        setServiceName(data.service_name || "");
        setCategory(data.category || "");
        setMonthlyCost(
          data.monthly_cost
            ? String(data.monthly_cost)
            : ""
        );
        setRenewalDate(data.renewal_date || "");
        setBillingCycle(
          data.billing_cycle || "Monthly"
        );
        setNotes(data.notes || "");
      } catch (error) {
        console.error(
          "Unable to load subscription:",
          error
        );

        setErrorMessage(
          "Unable to load this subscription."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadSubscription();
  }, [
    id,
    user,
    isDemo,
    householdId,
    permissionsLoading,
  ]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
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

    if (!canEdit) {
      setErrorMessage(
        "Viewer access is read-only. You cannot edit subscriptions."
      );
      return;
    }

    const validation =
      validateSubscriptionInput({
        serviceName,
        category,
        monthlyCost,
        renewalDate,
        billingCycle,
        notes,
      });

    if (!validation.success) {
      setErrorMessage(validation.error);
      return;
    }

    try {
      setSaving(true);

      const result =
        await updateSubscription({
          subscriptionId: id,
          serviceName,
          category,
          monthlyCost,
          renewalDate,
          billingCycle,
          notes,
        });

      if (!result.success) {
        if (
          result.code ===
          "UNAUTHENTICATED"
        ) {
          router.push("/login");
          return;
        }

        setErrorMessage(
          result.error ||
            "Unable to save changes."
        );
        return;
      }

      router.push("/subscriptions");
      router.refresh();
    } catch (error) {
      console.error(
        "Unable to update subscription:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to save changes. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  if (permissionsLoading || loading) {
    return (
      <PageShell>
        <PageCard className="flex min-h-64 items-center justify-center">
          <div className="flex items-center gap-3 text-text-secondary">
            <Loader2
              size={22}
              className="animate-spin"
            />
            Loading subscription...
          </div>
        </PageCard>
      </PageShell>
    );
  }

  if (isDemo) {
    return (
      <DemoWriteGate
        backHref="/subscriptions"
        backLabel="Back to Subscriptions"
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

  if (notFound) {
    return (
      <PageShell>
        <PageCard className="text-center">
          <h1 className="text-xl font-semibold text-text-primary">
            Subscription not found
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            This subscription may have been removed or you
            do not have access to it.
          </p>
          <Button
            href="/subscriptions"
            className="mt-6"
          >
            Back to Subscriptions
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
        title="Edit Subscription"
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
              maxLength={SUBSCRIPTION_FIELD_LIMITS.serviceName}
              onChange={(event) =>
                setServiceName(event.target.value)
              }
              required
              disabled={!canEdit}
              className={inputClasses}
            />
          </FormField>

          <FormField label="Category">
            <input
              value={category}
              maxLength={SUBSCRIPTION_FIELD_LIMITS.category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
              disabled={!canEdit}
              className={inputClasses}
            />
          </FormField>

          <FormField label="Monthly Cost">
            <input
              type="number"
              min="0"
              max={MAX_SUBSCRIPTION_MONTHLY_COST}
              step="0.01"
              value={monthlyCost}
              onChange={(event) =>
                setMonthlyCost(event.target.value)
              }
              disabled={!canEdit}
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
              disabled={!canEdit}
              className={inputClasses}
            />
          </FormField>

          <FormField label="Billing Cycle">
            <select
              value={billingCycle}
              onChange={(event) =>
                setBillingCycle(event.target.value)
              }
              disabled={!canEdit}
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
                maxLength={SUBSCRIPTION_FIELD_LIMITS.notes}
                onChange={(event) =>
                  setNotes(event.target.value)
                }
                disabled={!canEdit}
                className={`${inputClasses} min-h-28 resize-y`}
              />
            </FormField>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-border-subtle pt-6 md:col-span-2">
            <Button
              type="submit"
              disabled={saving || !canEdit}
            >
              {saving ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <Save size={18} />
              )}
              {saving ? "Saving..." : "Save Changes"}
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
