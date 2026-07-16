"use client";

import Link from "next/link";
import {
  Eye,
  LockKeyhole,
  Pencil,
  Plus,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import type {
  ReactNode,
} from "react";

type ViewerBannerProps = {
  show: boolean;
  title?: string;
  description?: string;
};

export function ViewerBanner({
  show,
  title = "Viewer Access",
  description = "This page is read-only. Members can make permitted changes, while Admins have full management access.",
}: ViewerBannerProps) {
  if (!show) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-[#D8C69D] bg-[#FFF8E8] p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#111827] text-[#C8A96A]">
          <Eye size={18} />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A6A2F]">
            {title}
          </p>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}

type PageActionProps = {
  canCreate: boolean;
  href: string;
  label: string;
  lockedLabel?: string;
  lockedHref?: string;
  icon?: LucideIcon;
  variant?: "dark" | "light" | "secondary";
  className?: string;
};

export function PageAction({
  canCreate,
  href,
  label,
  lockedLabel = "Create Your Vault",
  lockedHref = "/signup",
  icon: Icon = Plus,
  variant = "light",
  className = "",
}: PageActionProps) {
  const destination = canCreate
    ? href
    : lockedHref;

  const buttonLabel = canCreate
    ? label
    : lockedLabel;

  const styles =
    variant === "dark"
      ? "bg-[#111827] text-white hover:bg-[#263044]"
      : variant === "secondary"
        ? "border border-[#E8E2D6] bg-white text-[#111827] hover:bg-[#F7F5EF]"
        : "bg-white text-[#111827] hover:bg-neutral-100";

  return (
    <Link
      href={destination}
      className={
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition " +
        styles +
        " " +
        className
      }
    >
      <Icon size={17} />

      {buttonLabel}
    </Link>
  );
}

type PermissionEmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  canCreate: boolean;
  href: string;
  buttonLabel: string;
  lockedLabel?: string;
  lockedHref?: string;
};

export function PermissionEmptyState({
  icon: Icon,
  title,
  description,
  canCreate,
  href,
  buttonLabel,
  lockedLabel = "Create Your Vault",
  lockedHref = "/signup",
}: PermissionEmptyStateProps) {
  return (
    <section className="rounded-[28px] border border-[#E8E2D6] bg-white px-6 py-14 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
        <Icon size={29} />
      </div>

      <h2 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-[#111827]">
        {title}
      </h2>

      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-neutral-500">
        {description}
      </p>

      <div className="mt-6">
        <PageAction
          canCreate={canCreate}
          href={href}
          label={buttonLabel}
          lockedLabel={lockedLabel}
          lockedHref={lockedHref}
          variant="dark"
        />
      </div>
    </section>
  );
}

type CardActionsProps = {
  canEdit: boolean;
  canDelete: boolean;
  editHref?: string;
  onDelete?: () => void;
  deleting?: boolean;
  viewerMessage?: string;
  deleteLabel?: string;
  editLabel?: string;
  children?: ReactNode;
};

export function CardActions({
  canEdit,
  canDelete,
  editHref,
  onDelete,
  deleting = false,
  viewerMessage =
    "This item is read-only. You do not have permission to make changes.",
  deleteLabel = "Delete",
  editLabel = "Edit",
  children,
}: CardActionsProps) {
  const hasActions =
    (canEdit && Boolean(editHref)) ||
    (canDelete &&
      Boolean(onDelete)) ||
    Boolean(children);

  if (!hasActions) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-[#E8E2D6] bg-[#F7F5EF] p-4">
        <LockKeyhole
          size={18}
          className="mt-0.5 shrink-0 text-[#C8A96A]"
        />

        <div>
          <p className="text-sm font-semibold text-[#111827]">
            Read-only access
          </p>

          <p className="mt-1 text-sm leading-5 text-neutral-500">
            {viewerMessage}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-[#E8E2D6] pt-5">
      {canEdit && editHref && (
        <Link
          href={editHref}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#111827] px-4 text-sm font-semibold text-white transition hover:bg-[#263044]"
        >
          <Pencil size={16} />
          {editLabel}
        </Link>
      )}

      {children}

      {canDelete && onDelete && (
        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-700 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 size={16} />

          {deleting
            ? "Deleting..."
            : deleteLabel}
        </button>
      )}
    </div>
  );
}

type PermissionGateProps = {
  allowed: boolean;
  children: ReactNode;
  fallback?: ReactNode;
};

export function PermissionGate({
  allowed,
  children,
  fallback = null,
}: PermissionGateProps) {
  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

type ReadOnlyNoticeProps = {
  show: boolean;
  message?: string;
};

export function ReadOnlyNotice({
  show,
  message =
    "You can view this information, but your role does not allow changes.",
}: ReadOnlyNoticeProps) {
  if (!show) {
    return null;
  }

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-[#E8E2D6] bg-[#F7F5EF] p-4">
      <LockKeyhole
        size={18}
        className="mt-0.5 shrink-0 text-[#C8A96A]"
      />

      <p className="text-sm leading-6 text-neutral-600">
        {message}
      </p>
    </div>
  );
}