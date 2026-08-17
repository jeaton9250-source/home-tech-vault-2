"use client";

import { useState } from "react";

import Link from "next/link";

import PlanAccessAdminSection from "@/components/admin/users/PlanAccessAdminSection";
import FoundingMemberAdminSection from "@/components/admin/users/FoundingMemberAdminSection";
import AccountDangerZone from "@/components/admin/users/AccountDangerZone";
import AdminSlideOver from "@/components/admin/ui/AdminSlideOver";
import AdminStatusChip, {
  userStatusChipTone,
} from "@/components/admin/ui/AdminStatusChip";
import {
  AdminDetailField,
  AdminEmptyState,
  AdminLoadingState,
} from "@/components/admin/layout/AdminPageLayout";
import { formatAdminDate } from "@/components/admin/AdminPanel";
import Button from "@/components/ui/Button";
import {
  formatAdminHouseholdLabel,
  getAdminUserDisplayName,
} from "@/lib/admin/displayName";
import {
  resolveUserDisplayStatus,
  USER_STATUS_LABELS,
} from "@/lib/admin/userStatus";
import type {
  AdminPendingInvitation,
  AdminUserDetail,
} from "@/lib/admin/types";

type UserDetailSlideOverProps = {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  error: string;
  detail: AdminUserDetail | null;
  invitation: AdminPendingInvitation | null;
  adminMessage: string;
  inviteActionLoading: boolean;
  onResendInvitation: (invitationId: string) => void;
  onRevokeInvitation: (invitationId: string) => void;
  onTogglePlatformAdmin: (nextValue: boolean) => void;
  onDetailUpdated: () => Promise<void>;
  onUserDeleted: () => Promise<void>;
};

export default function UserDetailSlideOver({
  open,
  onClose,
  loading,
  error,
  detail,
  invitation,
  adminMessage,
  inviteActionLoading,
  onResendInvitation,
  onRevokeInvitation,
  onTogglePlatformAdmin,
  onDetailUpdated,
  onUserDeleted,
}: UserDetailSlideOverProps) {
  const [impersonating, setImpersonating] =
    useState(false);

  const [impersonationError, setImpersonationError] =
    useState("");

  async function impersonateUser() {
    if (!detail) {
      return;
    }

    const targetUserId = (
      detail as AdminUserDetail & {
        id?: string;
      }
    ).id;

    if (!targetUserId) {
      setImpersonationError(
        "Unable to determine the selected user's ID."
      );
      return;
    }

    if (detail.isPlatformAdmin) {
      setImpersonationError(
        "Platform administrators cannot be impersonated."
      );
      return;
    }

    setImpersonating(true);
    setImpersonationError("");

    try {
      const response = await fetch(
        `/api/admin/users/${encodeURIComponent(
          targetUserId
        )}/impersonate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        redirectTo?: string;
      };

      if (!response.ok || !payload.ok) {
        throw new Error(
          payload.error ||
            "Unable to impersonate this user."
        );
      }

      window.location.assign(
        payload.redirectTo || "/dashboard"
      );
    } catch (cause) {
      setImpersonationError(
        cause instanceof Error
          ? cause.message
          : "Unable to impersonate this user."
      );

      setImpersonating(false);
    }
  }

  const title = invitation
    ? invitation.email
    : detail
      ? getAdminUserDisplayName({
          fullName: detail.fullName,
          email: detail.email,
        })
      : "User details";

  const subtitle = invitation
    ? "Pending invitation"
    : detail?.email || undefined;

  return (
    <AdminSlideOver
      open={open}
      title={title}
      subtitle={subtitle}
      onClose={onClose}
    >
      {invitation ? (
        <div className="space-y-4">
          <AdminStatusChip
            tone={userStatusChipTone(
              invitation.status === "expired"
                ? "expired"
                : "pending"
            )}
          >
            {invitation.status === "expired"
              ? "Expired"
              : "Invited"}
          </AdminStatusChip>

          <AdminDetailField
            label="Email"
            value={invitation.email}
            copyValue={invitation.email}
            onCopy={() => {
              void navigator.clipboard.writeText(
                invitation.email
              );
            }}
          />
          <AdminDetailField
            label="Invitation type"
            value={
              invitation.invitationType ===
              "create_account"
                ? "Create New Account"
                : "Join Household"
            }
          />
          <AdminDetailField
            label="Sent"
            value={formatAdminDate(invitation.createdAt)}
          />
          <AdminDetailField
            label="Expires"
            value={formatAdminDate(invitation.expiresAt)}
          />
          <AdminDetailField
            label="Invited by"
            value={
              invitation.invitedByName ||
              invitation.invitedByEmail ||
              "—"
            }
          />

          {adminMessage ? (
            <p className="text-sm text-text-secondary">
              {adminMessage}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2 border-t border-border-subtle pt-4">
            <Button
              type="button"
              onClick={() => {
                onResendInvitation(invitation.id);
              }}
              disabled={inviteActionLoading}
            >
              Resend Invite
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                onRevokeInvitation(invitation.id);
              }}
              disabled={inviteActionLoading}
            >
              Revoke
            </Button>
          </div>
        </div>
      ) : loading ? (
        <AdminLoadingState label="Loading user details…" />
      ) : error ? (
        <AdminEmptyState
          title="User unavailable"
          description={error}
        />
      ) : detail ? (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-sunken text-sm font-semibold text-text-primary">
              {getAdminUserDisplayName({
                fullName: detail.fullName,
                email: detail.email,
              })
                .slice(0, 1)
                .toUpperCase()}
            </div>
            <div>
              <AdminStatusChip
                tone={userStatusChipTone(
                  resolveUserDisplayStatus(detail)
                )}
              >
                {
                  USER_STATUS_LABELS[
                    resolveUserDisplayStatus(detail)
                  ]
                }
              </AdminStatusChip>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <AdminDetailField
              label="Full name"
              value={detail.fullName || "—"}
            />
            <AdminDetailField
              label="Email"
              value={detail.email || "—"}
              copyValue={detail.email || ""}
              onCopy={() => {
                void navigator.clipboard.writeText(
                  detail.email || ""
                );
              }}
            />
            <AdminDetailField
              label="User ID"
              value={detail.id}
              copyValue={detail.id}
              onCopy={() => {
                void navigator.clipboard.writeText(
                  detail.id
                );
              }}
            />
            <AdminDetailField
              label="Plan"
              value={detail.effectivePlan || detail.personalPlan}
            />
            <AdminDetailField
              label="Role"
              value={
                detail.isPlatformAdmin
                  ? "Platform admin"
                  : detail.householdRole || "—"
              }
            />
            <AdminDetailField
              label="Household"
              value={formatAdminHouseholdLabel({
                householdName: detail.householdName,
                householdId: detail.householdId,
              })}
            />
            <AdminDetailField
              label="Household ID"
              value={detail.householdId || "—"}
            />
            <AdminDetailField
              label="Devices"
              value={String(detail.deviceCount)}
            />
            <AdminDetailField
              label="Documents"
              value={String(detail.documentCount)}
            />
            <AdminDetailField
              label="Warranties"
              value={String(detail.warrantyCount)}
            />
            <AdminDetailField
              label="Maintenance tasks"
              value={String(detail.maintenanceTaskCount)}
            />
            <AdminDetailField
              label="Support tickets"
              value={String(detail.supportTicketCount)}
            />
            <AdminDetailField
              label="Date joined"
              value={formatAdminDate(detail.createdAt)}
            />
            <AdminDetailField
              label="Last login"
              value={formatAdminDate(detail.lastSignInAt)}
            />
            <AdminDetailField
              label="Last active"
              value={formatAdminDate(detail.lastSignInAt)}
            />
            <AdminDetailField
              label="Subscription"
              value={detail.subscriptionStatus}
            />
            <AdminDetailField
              label="Connector installed"
              value={
                detail.hasConnectorInstalled
                  ? "Yes"
                  : "No"
              }
            />
            <AdminDetailField
              label="Connector version"
              value={detail.connectorVersion || "—"}
            />
            <AdminDetailField
              label="Platform version"
              value="Web"
            />
          </div>

          {detail.recentActivity.length > 0 ? (
            <div className="border-t border-border-subtle pt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
                Recent activity
              </p>
              <div className="mt-3 space-y-2">
                {detail.recentActivity.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-[16px] border border-border-subtle px-3 py-2 text-sm"
                  >
                    <p className="font-medium capitalize text-text-primary">
                      {event.title}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      {formatAdminDate(event.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {detail.householdId ? (
            <Link
              href={`/admin/households?selected=${detail.householdId}`}
              className="inline-flex text-sm font-semibold text-interaction"
            >
              View Household
            </Link>
          ) : null}

          <div className="rounded-[20px] border border-border-subtle bg-surface-sunken/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
              Quick actions
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {detail.householdId ? (
                <Button
                  href={`/admin/households?selected=${detail.householdId}`}
                  variant="secondary"
                  size="sm"
                >
                  View Household
                </Button>
              ) : null}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  void impersonateUser();
                }}
                disabled={
                  impersonating ||
                  detail.isPlatformAdmin
                }
              >
                {impersonating
                  ? "Opening user vault…"
                  : "Impersonate User"}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled
              >
                Reset Password Email
              </Button>
            </div>

            {impersonationError ? (
              <p className="mt-3 text-sm text-red-600">
                {impersonationError}
              </p>
            ) : null}
          </div>

          <PlanAccessAdminSection
            detail={detail}
            onUpdated={onDetailUpdated}
          />

          <FoundingMemberAdminSection
            detail={detail}
            onUpdated={onDetailUpdated}
          />

          <AccountDangerZone
            detail={detail}
            onUpdated={onDetailUpdated}
            onDeleted={onUserDeleted}
          />

          <div className="border-t border-border-subtle pt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
              Platform access
            </p>

            {adminMessage ? (
              <p className="mt-2 text-sm text-text-secondary">
                {adminMessage}
              </p>
            ) : null}

            <div className="mt-3 flex flex-wrap gap-2">
              {detail.isPlatformAdmin ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    onTogglePlatformAdmin(false);
                  }}
                >
                  Remove Platform Admin
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => {
                    onTogglePlatformAdmin(true);
                  }}
                >
                  Grant Platform Admin
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <AdminEmptyState
          title="Select a user"
          description="Choose a row to inspect account details."
        />
      )}
    </AdminSlideOver>
  );
}
