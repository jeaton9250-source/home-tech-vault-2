"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { AlertTriangle, Loader2 } from "lucide-react";

import {
  formatAdminDate,
} from "@/components/admin/AdminPanel";
import Button from "@/components/ui/Button";
import { DELETION_REASONS } from "@/lib/account-admin/constants";
import type { AdminUserDetail } from "@/lib/admin/types";

type DeletionPreview = {
  userId: string;
  email: string | null;
  fullName: string | null;
  accountStatus: "active" | "deactivated";
  personalPlan: string;
  subscriptionStatus: string;
  billingGrantingAccess: boolean;
  householdName: string | null;
  isHouseholdOwner: boolean;
  householdMemberCount: number;
  otherHouseholdMembers: Array<{
    userId: string;
    email: string | null;
    fullName: string | null;
    role: string;
  }>;
  deviceCount: number;
  documentCount: number;
  supportTicketCount: number;
  activeGrantCount: number;
  blockers: Array<{
    code: string;
    message: string;
  }>;
  dataToDelete: string[];
  dataPreserved: string[];
};

type DeletionJob = {
  id: string;
  status: string;
  current_step: string | null;
  safe_error_message: string | null;
};

type AccountDangerZoneProps = {
  detail: AdminUserDetail;
  onUpdated: () => Promise<void>;
};

function accountStatusLabel(
  detail: AdminUserDetail
): string {
  if (
    detail.deletionJobStatus === "processing" ||
    detail.deletionJobStatus === "pending" ||
    detail.deletionJobStatus === "validating"
  ) {
    return "Deletion pending";
  }

  if (detail.deletionJobStatus === "blocked") {
    return "Deletion blocked";
  }

  if (detail.accountStatus === "deactivated") {
    return "Deactivated";
  }

  return "Active";
}

export default function AccountDangerZone({
  detail,
  onUpdated,
}: AccountDangerZoneProps) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] =
    useState(false);

  const [deactivateOpen, setDeactivateOpen] =
    useState(false);
  const [deactivateReason, setDeactivateReason] =
    useState("");
  const [deactivateNotes, setDeactivateNotes] =
    useState("");
  const [deactivateConfirm, setDeactivateConfirm] =
    useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [preview, setPreview] =
    useState<DeletionPreview | null>(null);
  const [previewLoading, setPreviewLoading] =
    useState(false);
  const [deleteReason, setDeleteReason] =
    useState("");
  const [deleteNotes, setDeleteNotes] =
    useState("");
  const [emailConfirmation, setEmailConfirmation] =
    useState("");
  const [transferOwnerUserId, setTransferOwnerUserId] =
    useState("");
  const [deleteHouseholdData, setDeleteHouseholdData] =
    useState(false);
  const [deleteConfirm, setDeleteConfirm] =
    useState(false);
  const [deleteFinalConfirm, setDeleteFinalConfirm] =
    useState(false);
  const [latestJob, setLatestJob] =
    useState<DeletionJob | null>(null);

  const statusLabel = useMemo(
    () => accountStatusLabel(detail),
    [detail]
  );

  const canRetryDeletion =
    detail.deletionJobStatus === "failed" ||
    latestJob?.status === "failed";

  const deletionInProgress =
    detail.deletionJobStatus === "pending" ||
    detail.deletionJobStatus === "processing" ||
    detail.deletionJobStatus === "validating";

  useEffect(() => {
    if (!deleteOpen) {
      return;
    }

    let cancelled = false;

    async function loadPreview() {
      try {
        setPreviewLoading(true);
        setError("");

        const response = await fetch(
          `/api/admin/users/${detail.id}/deletion/preview`
        );

        const payload =
          (await response.json()) as {
            preview?: DeletionPreview;
            error?: string;
          };

        if (!response.ok) {
          throw new Error(
            payload.error ||
              "Unable to load deletion preview."
          );
        }

        if (!cancelled) {
          setPreview(payload.preview ?? null);
        }
      } catch (previewError) {
        if (!cancelled) {
          setPreview(null);
          setError(
            previewError instanceof Error
              ? previewError.message
              : "Unable to load deletion preview."
          );
        }
      } finally {
        if (!cancelled) {
          setPreviewLoading(false);
        }
      }
    }

    void loadPreview();

    return () => {
      cancelled = true;
    };
  }, [deleteOpen, detail.id]);

  async function handleDeactivate() {
    if (!deactivateConfirm) {
      setError(
        "Confirm deactivation before continuing."
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setMessage("");

      const response = await fetch(
        `/api/admin/users/${detail.id}/account-status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "deactivate",
            reason: deactivateReason.trim(),
            notes: deactivateNotes.trim() || null,
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
            "Unable to deactivate account."
        );
      }

      setDeactivateOpen(false);
      setDeactivateReason("");
      setDeactivateNotes("");
      setDeactivateConfirm(false);
      setMessage("Account deactivated.");
      await onUpdated();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Unable to deactivate account."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReactivate() {
    const confirmed = window.confirm(
      "Reactivate this account and restore sign-in access?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setMessage("");

      const response = await fetch(
        `/api/admin/users/${detail.id}/account-status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "reactivate",
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
            "Unable to reactivate account."
        );
      }

      setMessage("Account reactivated.");
      await onUpdated();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Unable to reactivate account."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePermanentDelete() {
    if (!deleteConfirm || !deleteFinalConfirm) {
      setError(
        "Complete both confirmation steps before permanent deletion."
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setMessage("");

      const createResponse = await fetch(
        `/api/admin/users/${detail.id}/deletion`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reason: deleteReason,
            notes: deleteNotes.trim() || null,
            emailConfirmation,
            transferOwnerUserId:
              transferOwnerUserId || null,
            deleteHouseholdData,
            confirmIrreversible: true,
          }),
        }
      );

      const createPayload =
        (await createResponse.json()) as {
          job?: DeletionJob;
          error?: string;
        };

      if (!createResponse.ok) {
        throw new Error(
          createPayload.error ||
            "Unable to start permanent deletion."
        );
      }

      const jobId = createPayload.job?.id;

      if (!jobId) {
        throw new Error(
          "Deletion job was not created."
        );
      }

      setLatestJob(createPayload.job ?? null);

      const processResponse = await fetch(
        `/api/admin/users/${detail.id}/deletion/process`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jobId,
            confirm: true,
          }),
        }
      );

      const processPayload =
        (await processResponse.json()) as {
          deleted?: boolean;
          job?: DeletionJob;
          error?: string;
        };

      if (!processResponse.ok) {
        setLatestJob(
          processPayload.job ??
            createPayload.job ??
            null
        );
        throw new Error(
          processPayload.error ||
            "Deletion could not be completed."
        );
      }

      if (processPayload.deleted) {
        setDeleteOpen(false);
        setMessage(
          "Account permanently deleted."
        );
        await onUpdated();
        return;
      }

      setMessage("Deletion job completed.");
      await onUpdated();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Unable to permanently delete account."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRetryDeletion() {
    try {
      setSubmitting(true);
      setError("");
      setMessage("");

      const response = await fetch(
        `/api/admin/users/${detail.id}/deletion/process`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jobId: detail.deletionJobId,
            confirm: true,
          }),
        }
      );

      const payload =
        (await response.json()) as {
          deleted?: boolean;
          job?: DeletionJob;
          error?: string;
        };

      if (!response.ok) {
        setLatestJob(payload.job ?? null);
        throw new Error(
          payload.error ||
            "Retry failed."
        );
      }

      if (payload.deleted) {
        setMessage(
          "Account permanently deleted."
        );
      } else {
        setMessage("Deletion retry completed.");
      }

      await onUpdated();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Unable to retry deletion."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const householdTransferRequired = Boolean(
    preview?.blockers.some(
      (blocker) =>
        blocker.code ===
        "HOUSEHOLD_HAS_MEMBERS"
    )
  );

  const hardBlockers =
    preview?.blockers.filter(
      (blocker) =>
        blocker.code !==
          "HOUSEHOLD_HAS_MEMBERS" ||
        !transferOwnerUserId
    ) ?? [];

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50/40 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle
          size={18}
          className="mt-0.5 shrink-0 text-red-700"
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-red-800">
            Danger zone
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            Deactivation preserves customer data and billing records.
            Permanent deletion is irreversible.
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3 text-sm">
        <DetailRow
          label="Account status"
          value={statusLabel}
        />

        {detail.accountStatus ===
          "deactivated" && (
          <>
            <DetailRow
              label="Deactivated"
              value={formatAdminDate(
                detail.deactivatedAt
              )}
            />
            <DetailRow
              label="Reason"
              value={
                detail.deactivationReason ||
                "—"
              }
            />
          </>
        )}

        {detail.deletionJobStatus && (
          <>
            <DetailRow
              label="Deletion job"
              value={detail.deletionJobStatus}
            />
            {detail.deletionJobStep ? (
              <DetailRow
                label="Current step"
                value={
                  detail.deletionJobStep
                }
              />
            ) : null}
            {detail.deletionJobError ? (
              <p className="text-sm text-red-700">
                {detail.deletionJobError}
              </p>
            ) : null}
          </>
        )}
      </div>

      {message ? (
        <p className="mt-3 text-sm text-text-secondary">
          {message}
        </p>
      ) : null}

      {error ? (
        <p className="mt-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {detail.accountStatus === "active" &&
        !deletionInProgress ? (
          <Button
            type="button"
            variant="secondary"
            disabled={submitting}
            onClick={() => {
              setDeactivateOpen(true);
              setDeleteOpen(false);
              setError("");
              setMessage("");
            }}
          >
            Deactivate account
          </Button>
        ) : null}

        {detail.accountStatus ===
          "deactivated" &&
        !deletionInProgress ? (
          <Button
            type="button"
            disabled={submitting}
            onClick={() => {
              void handleReactivate();
            }}
          >
            Reactivate account
          </Button>
        ) : null}

        {!deletionInProgress ? (
          <Button
            type="button"
            variant="secondary"
            disabled={submitting}
            className="border-red-300 text-red-800 hover:bg-red-100"
            onClick={() => {
              setDeleteOpen(true);
              setDeactivateOpen(false);
              setError("");
              setMessage("");
              setEmailConfirmation("");
              setDeleteReason("");
              setDeleteNotes("");
              setDeleteConfirm(false);
              setDeleteFinalConfirm(false);
              setTransferOwnerUserId("");
              setDeleteHouseholdData(false);
            }}
          >
            Permanently delete account
          </Button>
        ) : null}

        {canRetryDeletion ? (
          <Button
            type="button"
            variant="secondary"
            disabled={submitting}
            onClick={() => {
              void handleRetryDeletion();
            }}
          >
            Retry failed deletion
          </Button>
        ) : null}
      </div>

      {deactivateOpen ? (
        <div className="mt-4 space-y-3 rounded-2xl border border-red-200 bg-white p-4">
          <p className="font-semibold text-text-primary">
            Deactivate account
          </p>
          <p className="text-sm text-text-secondary">
            The user cannot sign in, but data, Stripe records,
            households, and support history are preserved.
          </p>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">
              Reason (required)
            </span>
            <input
              value={deactivateReason}
              onChange={(event) =>
                setDeactivateReason(
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-border-subtle px-3 py-2.5 text-sm"
              placeholder="Why is this account being deactivated?"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">
              Internal notes (optional)
            </span>
            <textarea
              value={deactivateNotes}
              onChange={(event) =>
                setDeactivateNotes(
                  event.target.value
                )
              }
              rows={3}
              className="w-full rounded-xl border border-border-subtle px-3 py-2.5 text-sm"
              placeholder="Internal notes for other platform admins"
            />
          </label>

          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={deactivateConfirm}
              onChange={(event) =>
                setDeactivateConfirm(
                  event.target.checked
                )
              }
              className="mt-1"
            />
            <span>
              I confirm this account should be deactivated and
              the user should be blocked from signing in.
            </span>
          </label>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={submitting}
              onClick={() =>
                setDeactivateOpen(false)
              }
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={
                submitting ||
                !deactivateReason.trim()
              }
              className="bg-red-800 hover:bg-red-900"
              onClick={() => {
                void handleDeactivate();
              }}
            >
              {submitting ? (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              ) : (
                "Deactivate account"
              )}
            </Button>
          </div>
        </div>
      ) : null}

      {deleteOpen ? (
        <div className="mt-4 space-y-4 rounded-2xl border border-red-200 bg-white p-4">
          <p className="font-semibold text-text-primary">
            Permanently delete account
          </p>
          <p className="text-sm text-red-800">
            This permanently removes the user&apos;s Home Tech Vault
            account and may remove associated data. This action
            cannot be undone.
          </p>

          {previewLoading ? (
            <div className="flex items-center text-sm text-text-secondary">
              <Loader2
                size={16}
                className="mr-2 animate-spin"
              />
              Loading deletion summary...
            </div>
          ) : preview ? (
            <div className="space-y-3 rounded-xl border border-border-subtle bg-surface-sunken/50 p-3 text-sm">
              <SummaryRow
                label="User"
                value={`${preview.fullName || "—"} · ${preview.email || "—"}`}
              />
              <SummaryRow
                label="Plan"
                value={`${preview.personalPlan} (${preview.subscriptionStatus})`}
              />
              <SummaryRow
                label="Billing access"
                value={
                  preview.billingGrantingAccess
                    ? "Active billing — deletion blocked"
                    : "No active billing access"
                }
              />
              <SummaryRow
                label="Household"
                value={
                  preview.isHouseholdOwner
                    ? `Owner · ${preview.householdName || "Unnamed"} (${preview.householdMemberCount} members)`
                    : preview.householdName ||
                      "None"
                }
              />
              <SummaryRow
                label="Devices"
                value={String(
                  preview.deviceCount
                )}
              />
              <SummaryRow
                label="Documents"
                value={String(
                  preview.documentCount
                )}
              />
              <SummaryRow
                label="Support tickets"
                value={String(
                  preview.supportTicketCount
                )}
              />
              <SummaryRow
                label="Active grants"
                value={String(
                  preview.activeGrantCount
                )}
              />

              {hardBlockers.length > 0 ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-800">
                  <p className="font-semibold">
                    Blocking issues
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {hardBlockers.map(
                      (blocker) => (
                        <li
                          key={blocker.code}
                        >
                          {blocker.message}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              ) : null}

              <div>
                <p className="font-semibold text-text-primary">
                  Will be deleted
                </p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-text-secondary">
                  {preview.dataToDelete.map(
                    (item) => (
                      <li key={item}>{item}</li>
                    )
                  )}
                </ul>
              </div>

              <div>
                <p className="font-semibold text-text-primary">
                  Will be preserved
                </p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-text-secondary">
                  {preview.dataPreserved.map(
                    (item) => (
                      <li key={item}>{item}</li>
                    )
                  )}
                </ul>
              </div>
            </div>
          ) : null}

          {householdTransferRequired &&
          preview ? (
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">
                Transfer ownership to
              </span>
              <select
                value={transferOwnerUserId}
                onChange={(event) =>
                  setTransferOwnerUserId(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-border-subtle px-3 py-2.5 text-sm"
              >
                <option value="">
                  Select household member
                </option>
                {preview.otherHouseholdMembers.map(
                  (member) => (
                    <option
                      key={member.userId}
                      value={member.userId}
                    >
                      {member.fullName ||
                        member.email ||
                        member.userId}{" "}
                      ({member.role})
                    </option>
                  )
                )}
              </select>
            </label>
          ) : null}

          {preview?.isHouseholdOwner &&
          preview.householdMemberCount <= 1 ? (
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={deleteHouseholdData}
                onChange={(event) =>
                  setDeleteHouseholdData(
                    event.target.checked
                  )
                }
                className="mt-1"
              />
              <span>
                Also delete this user&apos;s sole household and
                its data (devices, documents, storage).
              </span>
            </label>
          ) : null}

          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">
              Deletion reason
            </span>
            <select
              value={deleteReason}
              onChange={(event) =>
                setDeleteReason(
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-border-subtle px-3 py-2.5 text-sm"
            >
              <option value="">
                Select a reason
              </option>
              {DELETION_REASONS.map(
                (reason) => (
                  <option
                    key={reason.id}
                    value={reason.id}
                  >
                    {reason.label}
                  </option>
                )
              )}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">
              Internal notes (optional)
            </span>
            <textarea
              value={deleteNotes}
              onChange={(event) =>
                setDeleteNotes(
                  event.target.value
                )
              }
              rows={2}
              className="w-full rounded-xl border border-border-subtle px-3 py-2.5 text-sm"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">
              Type email to confirm
            </span>
            <input
              value={emailConfirmation}
              onChange={(event) =>
                setEmailConfirmation(
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-border-subtle px-3 py-2.5 text-sm"
              placeholder={detail.email || ""}
            />
          </label>

          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={deleteConfirm}
              onChange={(event) =>
                setDeleteConfirm(
                  event.target.checked
                )
              }
              className="mt-1"
            />
            <span>
              I understand this permanently deletes the account
              and associated application data.
            </span>
          </label>

          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={deleteFinalConfirm}
              onChange={(event) =>
                setDeleteFinalConfirm(
                  event.target.checked
                )
              }
              className="mt-1"
            />
            <span>
              This action is irreversible. I want to permanently
              delete this account.
            </span>
          </label>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={submitting}
              onClick={() => setDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={
                submitting ||
                hardBlockers.length > 0 ||
                !deleteReason ||
                !emailConfirmation.trim() ||
                !deleteConfirm ||
                !deleteFinalConfirm ||
                (householdTransferRequired &&
                  !transferOwnerUserId)
              }
              className="bg-red-800 hover:bg-red-900"
              onClick={() => {
                void handlePermanentDelete();
              }}
            >
              {submitting ? (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              ) : (
                "Permanently delete account"
              )}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">
        {label}
      </p>
      <p className="mt-0.5 capitalize text-text-primary">
        {value}
      </p>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-text-tertiary">
        {label}
      </span>
      <span className="text-right text-text-primary">
        {value}
      </span>
    </div>
  );
}
