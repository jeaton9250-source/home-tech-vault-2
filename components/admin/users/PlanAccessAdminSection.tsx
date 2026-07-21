"use client";

import {
  useMemo,
  useState,
} from "react";

import { Loader2 } from "lucide-react";

import {
  formatAdminDate,
} from "@/components/admin/AdminPanel";
import Button from "@/components/ui/Button";
import {
  PLAN_GRANT_DURATIONS,
  PLAN_GRANT_REASONS,
} from "@/lib/plan-grants/types";

type PlanAccessDetail = {
  id: string;
  personalPlan: string;
  subscriptionStatus: string;
  inheritedHouseholdPlan: string | null;
  effectivePlan: string;
  effectivePlanSource: string;
  hasActiveAdminGrant: boolean;
  adminGrantPlan: string | null;
  adminGrantStatus: string | null;
  adminGrantExpiresAt: string | null;
  adminGrantReason: string | null;
  adminGrantNotes: string | null;
};

type PlanAccessAdminSectionProps = {
  detail: PlanAccessDetail;
  onUpdated: () => Promise<void>;
};

type GrantDialogMode =
  | "grant_pro"
  | "grant_family"
  | "replace"
  | null;

export default function PlanAccessAdminSection({
  detail,
  onUpdated,
}: PlanAccessAdminSectionProps) {
  const [dialogMode, setDialogMode] =
    useState<GrantDialogMode>(null);
  const [selectedPlan, setSelectedPlan] =
    useState<"pro" | "family">("pro");
  const [durationId, setDurationId] =
    useState("30d");
  const [customExpiresAt, setCustomExpiresAt] =
    useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [confirmed, setConfirmed] =
    useState(false);
  const [submitting, setSubmitting] =
    useState(false);
  const [message, setMessage] = useState("");

  const dialogPlan = useMemo(() => {
    if (dialogMode === "grant_pro") {
      return "pro";
    }

    if (dialogMode === "grant_family") {
      return "family";
    }

    return selectedPlan;
  }, [dialogMode, selectedPlan]);

  function openDialog(mode: GrantDialogMode) {
    setDialogMode(mode);
    setSelectedPlan(
      mode === "grant_family"
        ? "family"
        : mode === "grant_pro"
          ? "pro"
          : detail.adminGrantPlan === "family"
            ? "family"
            : "pro"
    );
    setDurationId("30d");
    setCustomExpiresAt("");
    setReason("");
    setNotes("");
    setConfirmed(false);
    setMessage("");
  }

  function closeDialog() {
    setDialogMode(null);
    setConfirmed(false);
    setMessage("");
  }

  async function submitGrant(
    plan: "pro" | "family"
  ) {
    if (!confirmed) {
      setMessage(
        "Confirm this grant before saving."
      );
      return;
    }

    if (!reason.trim()) {
      setMessage("A reason is required.");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      const response = await fetch(
        `/api/admin/users/${detail.id}/plan-grants`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            plan,
            durationId,
            customExpiresAt:
              durationId === "custom"
                ? customExpiresAt
                : null,
            reason,
            notes,
            confirm: true,
          }),
        }
      );

      const payload =
        (await response.json()) as {
          error?: string;
        };

      if (!response.ok) {
        throw new Error(
          payload.error ||
            "Unable to save plan grant."
        );
      }

      closeDialog();
      await onUpdated();
    } catch (submitError) {
      setMessage(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save plan grant."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function revokeGrant() {
    const confirmedRevoke = window.confirm(
      "Revoke this user's complimentary plan access?"
    );

    if (!confirmedRevoke) {
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      const response = await fetch(
        `/api/admin/users/${detail.id}/plan-grants`,
        {
          method: "DELETE",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            confirm: true,
            revocationReason:
              "Revoked by platform admin.",
          }),
        }
      );

      const payload =
        (await response.json()) as {
          error?: string;
        };

      if (!response.ok) {
        throw new Error(
          payload.error ||
            "Unable to revoke plan grant."
        );
      }

      await onUpdated();
    } catch (revokeError) {
      setMessage(
        revokeError instanceof Error
          ? revokeError.message
          : "Unable to revoke plan grant."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const hasGrantRecord =
    Boolean(detail.adminGrantPlan) &&
    detail.adminGrantStatus !== null;

  return (
    <div className="border-t border-border-subtle pt-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
        Plan access
      </p>

      <div className="mt-3 space-y-2 text-sm">
        <InfoRow
          label="Personal billing plan"
          value={detail.personalPlan}
        />
        <InfoRow
          label="Billing status"
          value={detail.subscriptionStatus}
        />
        <InfoRow
          label="Household inherited plan"
          value={
            detail.inheritedHouseholdPlan ||
            "—"
          }
        />
        <InfoRow
          label="Current admin grant"
          value={
            detail.adminGrantPlan
              ? `${detail.adminGrantPlan} (${detail.adminGrantStatus})`
              : "None"
          }
        />
        <InfoRow
          label="Grant expiration"
          value={
            detail.adminGrantExpiresAt
              ? formatAdminDate(
                  detail.adminGrantExpiresAt
                )
              : detail.adminGrantPlan
                ? "No expiration"
                : "—"
          }
        />
        {detail.adminGrantReason ? (
          <InfoRow
            label="Grant reason"
            value={detail.adminGrantReason}
          />
        ) : null}
        <InfoRow
          label="Effective plan"
          value={detail.effectivePlan}
        />
        <InfoRow
          label="Effective plan source"
          value={detail.effectivePlanSource}
        />
      </div>

      {detail.adminGrantNotes ? (
        <p className="mt-3 rounded-2xl bg-surface-sunken p-3 text-xs leading-5 text-text-secondary">
          Internal notes: {detail.adminGrantNotes}
        </p>
      ) : null}

      {message ? (
        <p className="mt-3 text-sm text-text-secondary">
          {message}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          onClick={() =>
            openDialog("grant_pro")
          }
        >
          Grant Pro
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={() =>
            openDialog("grant_family")
          }
        >
          Grant Family
        </Button>
        {hasGrantRecord ? (
          <>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() =>
                openDialog("replace")
              }
            >
              Replace grant
            </Button>
            <Button
              type="button"
              size="sm"
              variant="danger"
              disabled={submitting}
              onClick={() => {
                void revokeGrant();
              }}
            >
              Revoke grant
            </Button>
          </>
        ) : null}
      </div>

      {dialogMode ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 p-4">
          <div className="w-full max-w-lg rounded-3xl border border-border-subtle bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-text-primary">
              {dialogMode === "replace"
                ? "Replace plan grant"
                : dialogPlan === "family"
                  ? "Grant Family access"
                  : "Grant Pro access"}
            </h3>

            <p className="mt-2 text-sm leading-6 text-warning">
              This grants product access only. It does
              not create or modify a Stripe subscription.
            </p>

            <div className="mt-4 space-y-4">
              {(dialogMode === "replace" ||
                dialogMode === "grant_pro" ||
                dialogMode === "grant_family") &&
              dialogMode === "replace" ? (
                <label className="block text-sm">
                  <span className="mb-2 block font-semibold">
                    Plan
                  </span>
                  <select
                    value={selectedPlan}
                    onChange={(event) =>
                      setSelectedPlan(
                        event.target.value as
                          | "pro"
                          | "family"
                      )
                    }
                    className="w-full rounded-2xl border border-border-subtle px-4 py-3"
                  >
                    <option value="pro">Pro</option>
                    <option value="family">
                      Family
                    </option>
                  </select>
                </label>
              ) : null}

              <label className="block text-sm">
                <span className="mb-2 block font-semibold">
                  Duration
                </span>
                <select
                  value={durationId}
                  onChange={(event) =>
                    setDurationId(
                      event.target.value
                    )
                  }
                  className="w-full rounded-2xl border border-border-subtle px-4 py-3"
                >
                  {PLAN_GRANT_DURATIONS.map(
                    (duration) => (
                      <option
                        key={duration.id}
                        value={duration.id}
                      >
                        {duration.label}
                      </option>
                    )
                  )}
                </select>
              </label>

              {durationId === "custom" ? (
                <label className="block text-sm">
                  <span className="mb-2 block font-semibold">
                    Custom expiration
                  </span>
                  <input
                    type="datetime-local"
                    value={customExpiresAt}
                    onChange={(event) =>
                      setCustomExpiresAt(
                        event.target.value
                      )
                    }
                    className="w-full rounded-2xl border border-border-subtle px-4 py-3"
                  />
                </label>
              ) : null}

              <label className="block text-sm">
                <span className="mb-2 block font-semibold">
                  Reason
                </span>
                <select
                  value={reason}
                  onChange={(event) =>
                    setReason(event.target.value)
                  }
                  className="w-full rounded-2xl border border-border-subtle px-4 py-3"
                >
                  <option value="">
                    Select a reason
                  </option>
                  {PLAN_GRANT_REASONS.map(
                    (option) => (
                      <option
                        key={option}
                        value={option}
                      >
                        {option}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label className="block text-sm">
                <span className="mb-2 block font-semibold">
                  Notes (internal)
                </span>
                <textarea
                  value={notes}
                  onChange={(event) =>
                    setNotes(event.target.value)
                  }
                  rows={3}
                  className="w-full rounded-2xl border border-border-subtle px-4 py-3"
                  placeholder="Optional internal notes"
                />
              </label>

              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(event) =>
                    setConfirmed(
                      event.target.checked
                    )
                  }
                  className="mt-1"
                />
                <span>
                  I confirm granting{" "}
                  {dialogPlan === "family"
                    ? "Family"
                    : "Pro"}{" "}
                  access to this user without changing
                  Stripe billing.
                </span>
              </label>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={closeDialog}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={submitting}
                onClick={() => {
                  void submitGrant(
                    dialogPlan === "family"
                      ? "family"
                      : "pro"
                  );
                }}
              >
                {submitting ? (
                  <>
                    <Loader2
                      size={16}
                      className="mr-2 animate-spin"
                    />
                    Saving...
                  </>
                ) : (
                  "Save grant"
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-text-secondary">
        {label}
      </span>
      <span className="text-right font-medium capitalize text-text-primary">
        {value}
      </span>
    </div>
  );
}
