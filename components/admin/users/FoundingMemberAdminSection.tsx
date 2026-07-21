"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";

import { Loader2 } from "lucide-react";

import {
  formatAdminDate,
} from "@/components/admin/AdminPanel";
import Button from "@/components/ui/Button";
import type { AdminUserDetail } from "@/lib/admin/types";
import type { EnrollmentPreview } from "@/lib/founding-members/types";
import {
  trackFoundingMemberEnrolled,
  trackFoundingMemberRemoved,
} from "@/lib/founding-members/analytics";

type FoundingMemberAdminSectionProps = {
  detail: AdminUserDetail;
  onUpdated: () => Promise<void>;
};

export default function FoundingMemberAdminSection({
  detail,
  onUpdated,
}: FoundingMemberAdminSectionProps) {
  const [preview, setPreview] =
    useState<EnrollmentPreview | null>(null);
  const [previewLoading, setPreviewLoading] =
    useState(false);
  const [dialogOpen, setDialogOpen] =
    useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] =
    useState(false);
  const [confirmed, setConfirmed] =
    useState(false);
  const [removeConfirmed, setRemoveConfirmed] =
    useState(false);
  const [removeReason, setRemoveReason] =
    useState("");
  const [revokeLinkedGrant, setRevokeLinkedGrant] =
    useState(false);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] =
    useState(false);
  const [message, setMessage] = useState("");

  const isActiveMember =
    detail.foundingMemberStatus === "active";
  const isFormerMember =
    detail.foundingMemberStatus === "removed";

  async function loadPreview() {
    setPreviewLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/founding-members/${detail.id}/enroll`
      );
      const payload =
        (await response.json()) as {
          preview?: EnrollmentPreview;
          error?: string;
        };

      if (!response.ok) {
        throw new Error(
          payload.error ||
            "Unable to load enrollment preview."
        );
      }

      setPreview(payload.preview ?? null);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to load enrollment preview."
      );
      setPreview(null);
    } finally {
      setPreviewLoading(false);
    }
  }

  useEffect(() => {
    if (!isActiveMember && !isFormerMember) {
      void loadPreview();
    }
  }, [detail.id, isActiveMember, isFormerMember]);

  useEffect(() => {
    if (dialogOpen && !isActiveMember) {
      void loadPreview();
    }
  }, [dialogOpen, detail.id, isActiveMember]);

  async function handleEnroll() {
    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/founding-members/${detail.id}/enroll`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            confirm: true,
            notes: notes.trim() || null,
          }),
        }
      );

      const payload =
        (await response.json()) as {
          member?: {
            memberNumber: number;
          };
          grantCreated?: boolean;
          grantReused?: boolean;
          error?: string;
          notification?: {
            message?: string;
          };
        };

      if (!response.ok) {
        throw new Error(
          payload.error ||
            "Unable to enroll founding member."
        );
      }

      if (payload.member) {
        trackFoundingMemberEnrolled({
          memberNumber:
            payload.member.memberNumber,
          grantCreated:
            payload.grantCreated === true,
          grantReused:
            payload.grantReused === true,
        });
      }

      setMessage(
        payload.notification?.message ||
          "Founding Member enrolled."
      );
      setDialogOpen(false);
      setConfirmed(false);
      setNotes("");
      await onUpdated();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to enroll founding member."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove() {
    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/founding-members/${detail.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            confirm: true,
            reason: removeReason,
            revokeLinkedGrant,
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
            "Unable to remove founding member."
        );
      }

      trackFoundingMemberRemoved({
        revokeLinkedGrant,
      });

      setMessage(
        revokeLinkedGrant
          ? "Founding Member removed and linked grant revoked when applicable."
          : "Founding Member recognition removed."
      );
      setRemoveDialogOpen(false);
      setRemoveConfirmed(false);
      setRemoveReason("");
      setRevokeLinkedGrant(false);
      await onUpdated();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to remove founding member."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-[22px] border border-border-subtle bg-surface-base p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">
            Founding Members
          </h3>
          <p className="mt-1 text-sm text-text-secondary">
            Recognition for the first 50 early
            members, with complimentary Pro when
            needed.
          </p>
        </div>

        <Link
          href="/admin/founding-members"
          className="text-sm font-medium text-accent hover:underline"
        >
          View program
        </Link>
      </div>

      <div className="mt-4 rounded-[18px] border border-border-subtle bg-surface-sunken px-4 py-3 text-sm">
        {isActiveMember ? (
          <p className="font-medium text-text-primary">
            Founding Member #
            {detail.foundingMemberNumber}
          </p>
        ) : isFormerMember ? (
          <p className="font-medium text-text-primary">
            Former Founding Member #
            {detail.foundingMemberNumber}
          </p>
        ) : preview?.programStatus ===
          "paused" ? (
          <p className="text-text-secondary">
            Program paused
          </p>
        ) : preview?.programStatus ===
          "full" ? (
          <p className="text-text-secondary">
            Program full
          </p>
        ) : (
          <p className="text-text-secondary">
            Not enrolled
          </p>
        )}

        {detail.foundingMemberEnrolledAt ? (
          <p className="mt-1 text-xs text-text-tertiary">
            Enrolled{" "}
            {formatAdminDate(
              detail.foundingMemberEnrolledAt
            )}
          </p>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {!isActiveMember && !isFormerMember ? (
          <Button
            type="button"
            variant="secondary"
            onClick={() => setDialogOpen(true)}
          >
            Enroll as Founding Member
          </Button>
        ) : null}

        {isActiveMember ? (
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              setRemoveDialogOpen(true)
            }
          >
            Remove from program
          </Button>
        ) : null}
      </div>

      {message ? (
        <p className="mt-4 text-sm text-text-secondary">
          {message}
        </p>
      ) : null}

      {dialogOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[24px] border border-border-subtle bg-surface-base p-6 shadow-xl">
            <h4 className="text-lg font-semibold text-text-primary">
              Enroll as Founding Member
            </h4>

            {previewLoading ? (
              <div className="mt-6 flex items-center gap-2 text-sm text-text-secondary">
                <Loader2
                  size={16}
                  className="animate-spin"
                />
                Loading preview...
              </div>
            ) : preview ? (
              <div className="mt-4 space-y-3 text-sm text-text-secondary">
                <p>
                  <span className="font-medium text-text-primary">
                    {preview.fullName ||
                      preview.email ||
                      preview.userId}
                  </span>
                </p>
                <p>
                  Billing plan:{" "}
                  <span className="capitalize">
                    {preview.personalPlan}
                  </span>{" "}
                  · Effective plan:{" "}
                  <span className="capitalize">
                    {preview.effectivePlan}
                  </span>
                </p>
                <p>
                  Remaining spots:{" "}
                  {preview.remainingSpots}
                  {preview.expectedMemberNumber
                    ? ` · Expected member #${preview.expectedMemberNumber}`
                    : null}
                </p>
                <p>{preview.grantActionDescription}</p>
                <p className="rounded-[16px] border border-warning/30 bg-warning/5 px-4 py-3 text-warning">
                  This enrolls the user as a
                  Founding Member and grants
                  complimentary Pro access when
                  needed. No payment will be
                  collected and no Stripe
                  subscription will be created.
                </p>

                <label className="block">
                  <span className="mb-1 block text-xs uppercase tracking-wide text-text-tertiary">
                    Internal notes (optional)
                  </span>
                  <textarea
                    value={notes}
                    onChange={(event) =>
                      setNotes(
                        event.target.value
                      )
                    }
                    rows={3}
                    className="w-full rounded-[16px] border border-border-subtle bg-surface-sunken px-3 py-2"
                  />
                </label>

                <label className="flex items-start gap-2">
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
                    I confirm this enrollment.
                  </span>
                </label>
              </div>
            ) : (
              <p className="mt-4 text-sm text-warning">
                {message ||
                  "Unable to load enrollment preview."}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setDialogOpen(false);
                  setConfirmed(false);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={
                  !confirmed ||
                  !preview ||
                  submitting ||
                  preview.programStatus !==
                    "open"
                }
                onClick={() =>
                  void handleEnroll()
                }
              >
                {submitting ? (
                  <>
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                    Enrolling...
                  </>
                ) : (
                  "Confirm enrollment"
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {removeDialogOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[24px] border border-border-subtle bg-surface-base p-6 shadow-xl">
            <h4 className="text-lg font-semibold text-text-primary">
              Remove from Founding Members
            </h4>

            <div className="mt-4 space-y-3 text-sm text-text-secondary">
              <p>
                This preserves the historical
                record and member number. The
                customer-facing badge will
                disappear.
              </p>

              <label className="block">
                <span className="mb-1 block text-xs uppercase tracking-wide text-text-tertiary">
                  Reason
                </span>
                <textarea
                  value={removeReason}
                  onChange={(event) =>
                    setRemoveReason(
                      event.target.value
                    )
                  }
                  rows={3}
                  className="w-full rounded-[16px] border border-border-subtle bg-surface-sunken px-3 py-2"
                />
              </label>

              {detail.foundingMemberPlanGrantId ? (
                <label className="flex items-start gap-2 rounded-[16px] border border-border-subtle bg-surface-sunken px-4 py-3">
                  <input
                    type="checkbox"
                    checked={revokeLinkedGrant}
                    onChange={(event) =>
                      setRevokeLinkedGrant(
                        event.target.checked
                      )
                    }
                    className="mt-1"
                  />
                  <span>
                    Also revoke the linked
                    complimentary grant if it was
                    created for this program.
                    Leave unchecked to remove
                    recognition only.
                  </span>
                </label>
              ) : null}

              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={removeConfirmed}
                  onChange={(event) =>
                    setRemoveConfirmed(
                      event.target.checked
                    )
                  }
                  className="mt-1"
                />
                <span>
                  I confirm this removal.
                </span>
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setRemoveDialogOpen(false);
                  setRemoveConfirmed(false);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={
                  !removeConfirmed ||
                  !removeReason.trim() ||
                  submitting
                }
                onClick={() =>
                  void handleRemove()
                }
              >
                {submitting
                  ? "Removing..."
                  : "Confirm removal"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
