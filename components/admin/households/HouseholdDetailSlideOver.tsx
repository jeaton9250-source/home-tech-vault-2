"use client";

import Link from "next/link";

import AdminSlideOver from "@/components/admin/ui/AdminSlideOver";
import {
  AdminDetailField,
  AdminEmptyState,
  AdminLoadingState,
} from "@/components/admin/layout/AdminPageLayout";
import { formatAdminDate } from "@/components/admin/AdminPanel";
import Button from "@/components/ui/Button";
import type { AdminHouseholdDetail } from "@/lib/admin/types";

type HouseholdDetailSlideOverProps = {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  detail: AdminHouseholdDetail | null;
};

export default function HouseholdDetailSlideOver({
  open,
  onClose,
  loading,
  detail,
}: HouseholdDetailSlideOverProps) {
  return (
    <AdminSlideOver
      open={open}
      title={detail?.name || "Household details"}
      subtitle={
        detail
          ? `${detail.memberCount} members · ${detail.deviceCount} devices`
          : undefined
      }
      onClose={onClose}
    >
      {loading ? (
        <AdminLoadingState label="Loading household details…" />
      ) : !detail ? (
        <AdminEmptyState
          title="Select a household"
          description="Choose a row to inspect membership and connector status."
        />
      ) : (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminDetailField
              label="Household ID"
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
              value={detail.inheritedPlan}
            />
            <AdminDetailField
              label="Created"
              value={formatAdminDate(detail.createdAt)}
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
              label="Open support"
              value={String(detail.openSupportTickets)}
            />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
              Owner
            </p>
            <p className="mt-1 text-sm text-text-primary">
              {detail.ownerName ||
                detail.ownerEmail ||
                detail.ownerId}
            </p>
            <Link
              href={`/admin/users?selected=${detail.ownerId}`}
              className="mt-2 inline-flex text-sm font-semibold text-interaction"
            >
              View owner profile
            </Link>
          </div>

          <div className="border-t border-border-subtle pt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
              Members
            </p>
            <div className="mt-3 space-y-3">
              {detail.members.length === 0 ? (
                <p className="text-sm text-text-secondary">
                  No members found.
                </p>
              ) : (
                detail.members.map((member) => (
                  <div
                    key={member.userId}
                    className="rounded-[18px] border border-border-subtle bg-surface-sunken px-4 py-3"
                  >
                    <p className="font-medium text-text-primary">
                      {member.fullName ||
                        member.email ||
                        member.userId}
                    </p>
                    <p className="mt-1 capitalize text-sm text-text-secondary">
                      {member.role}
                    </p>
                    <Link
                      href={`/admin/users?selected=${member.userId}`}
                      className="mt-2 inline-flex text-xs font-semibold text-interaction"
                    >
                      View profile
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border-t border-border-subtle pt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
              Connector installations
            </p>
            {detail.connectors.length === 0 ? (
              <p className="mt-3 text-sm text-text-secondary">
                No connector installations.
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                {detail.connectors.map((connector) => (
                  <div
                    key={connector.id}
                    className="rounded-[18px] border border-border-subtle bg-surface-sunken px-4 py-3"
                  >
                    <p className="font-medium text-text-primary">
                      {connector.name}
                    </p>
                    <p className="mt-1 text-sm text-text-secondary">
                      {connector.platform || "Unknown OS"} · v
                      {connector.appVersion || "—"}
                    </p>
                    <p className="mt-1 text-xs text-text-tertiary">
                      Last seen{" "}
                      {formatAdminDate(connector.lastSeenAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
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

          <div className="flex flex-wrap gap-2 border-t border-border-subtle pt-4">
            <Button
              href={`/admin/connectors?q=${encodeURIComponent(detail.name)}`}
              variant="secondary"
              size="sm"
            >
              View Connectors
            </Button>
          </div>
        </div>
      )}
    </AdminSlideOver>
  );
}
