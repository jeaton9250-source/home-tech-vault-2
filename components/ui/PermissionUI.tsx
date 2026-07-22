"use client";

import Link from "next/link";
import {
  Eye,
  LockKeyhole,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import IconWell, {
  type IconWellSection,
} from "@/components/ui/IconWell";
import { useDemoReadOnlyAction } from "@/components/demo/DemoExperienceProvider";
import { usePermissions } from "@/hooks/usePermissions";

import type { FeatureKey } from "@/lib/permissions/types";

import { cn } from "@/lib/design-system/cn";

type ViewerBannerProps = {
  show?: boolean;
  title?: string;
  description?: string;
};

export function ViewerBanner({
  show,
  title = "Viewer Access",
  description = "This page is read-only. Members can make permitted changes, while Admins have full management access.",
}: ViewerBannerProps) {
  const {
    isDemo,
    isViewer,
    loading,
  } = usePermissions();

  const shouldShow =
    show ??
    (!loading && isViewer);

  if (!shouldShow) {
    return null;
  }

  const resolvedTitle = title;

  const resolvedDescription = description;

  return (
    <section className="rounded-[var(--radius-card)] border border-warning/35 bg-warning-soft/80 p-5 shadow-[var(--shadow-sm)]">
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "htv-icon-well flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-button)]",
            isDemo
              ? "border-charcoal/20 bg-charcoal text-surface-card"
              : "border-warning/30 bg-warning-soft text-warning"
          )}
        >
          {isDemo ? (
            <Sparkles size={18} />
          ) : (
            <Eye size={18} />
          )}
        </div>

        <div>
          <p className="text-overline text-achievement">
            {resolvedTitle}
          </p>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-text-muted">
            {resolvedDescription}
          </p>
        </div>
      </div>
    </section>
  );
}

type PageActionProps = {
  href: string;
  label: string;
  feature?: FeatureKey;
  lockedLabel?: string;
  icon?: LucideIcon;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  canCreate?: boolean;
};

export function PageAction({
  href,
  label,
  feature,
  lockedLabel = "Create Your Vault",
  icon: Icon = Plus,
  variant = "secondary",
  className = "",
  canCreate: canCreateOverride,
}: PageActionProps) {
  const {
    canCreate,
    isDemo,
    getActionHref,
    getActionLabel,
    canAccessFeature,
  } = usePermissions();

  const showReadOnlyModal = useDemoReadOnlyAction();

  const allowed =
    canCreateOverride ?? canCreate;

  const featureLocked =
    feature !== undefined &&
    !canAccessFeature(feature);

  const destination = allowed
    ? featureLocked
      ? "/upgrade"
      : getActionHref(href, feature)
    : isDemo
      ? "/signup"
      : featureLocked
        ? "/upgrade"
        : "/signup";

  const buttonLabel = allowed
    ? label
    : getActionLabel(label, lockedLabel);

  if (!allowed && isDemo) {
    return (
      <Button
        type="button"
        variant={variant}
        className={cn(className)}
        onClick={showReadOnlyModal}
      >
        <Icon size={17} />
        {label}
      </Button>
    );
  }

  return (
    <Button
      href={destination}
      variant={variant}
      className={cn(className)}
    >
      {!allowed && (
        <LockKeyhole size={16} />
      )}

      <Icon size={17} />

      {buttonLabel}
    </Button>
  );
}

type PermissionEmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  buttonLabel: string;
  feature?: FeatureKey;
  lockedLabel?: string;
  canCreate?: boolean;
  section?: IconWellSection;
};

export function PermissionEmptyState({
  icon: Icon,
  title,
  description,
  href,
  buttonLabel,
  feature,
  lockedLabel = "Create Your Vault",
  canCreate: canCreateOverride,
  section = "technology",
}: PermissionEmptyStateProps) {
  return (
    <EmptyState
      icon={Icon}
      title={title}
      description={description}
      section={section}
    >
      <div className="mt-6">
        <PageAction
          canCreate={canCreateOverride}
          href={href}
          label={buttonLabel}
          feature={feature}
          lockedLabel={lockedLabel}
          variant="primary"
        />
      </div>
    </EmptyState>
  );
}

type CardActionsProps = {
  editHref?: string;
  onDelete?: () => void;
  deleting?: boolean;
  viewerMessage?: string;
  deleteLabel?: string;
  editLabel?: string;
  feature?: FeatureKey;
  canEdit?: boolean;
  canDelete?: boolean;
  children?: ReactNode;
};

export function CardActions({
  editHref,
  onDelete,
  deleting = false,
  viewerMessage =
    "This item is read-only. You do not have permission to make changes.",
  deleteLabel = "Delete",
  editLabel = "Edit",
  feature,
  canEdit: canEditOverride,
  canDelete: canDeleteOverride,
  children,
}: CardActionsProps) {
  const {
    canEdit,
    canDelete,
    isDemo,
    isViewer,
    getActionHref,
  } = usePermissions();

  const showReadOnlyModal = useDemoReadOnlyAction();

  const editAllowed =
    canEditOverride ?? canEdit;

  const deleteAllowed =
    canDeleteOverride ?? canDelete;

  const hasActions =
    (editAllowed &&
      Boolean(editHref)) ||
    (deleteAllowed &&
      Boolean(onDelete)) ||
    Boolean(children);

  const resolvedMessage = isDemo
    ? "This vault is read-only while you explore."
    : isViewer
      ? viewerMessage
      : viewerMessage;

  if (!hasActions) {
    return (
      <div className="flex items-start gap-3 rounded-[var(--radius-button)] border border-border-subtle bg-surface-sunken p-4">
        <LockKeyhole
          size={18}
          className="mt-0.5 shrink-0 text-interaction"
        />

        <div>
          <p className="text-sm font-semibold text-text-primary">
            Read-only access
          </p>

          <p className="mt-1 text-sm leading-5 text-text-secondary">
            {resolvedMessage}
          </p>
        </div>
      </div>
    );
  }

  const resolvedEditHref =
    editHref &&
    getActionHref(editHref, feature);

  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-border-subtle pt-5">
      {editAllowed &&
        resolvedEditHref &&
        (isDemo ? (
          <Button
            type="button"
            size="sm"
            onClick={showReadOnlyModal}
          >
            <Pencil size={16} />
            {editLabel}
          </Button>
        ) : (
          <Button
            href={resolvedEditHref}
            size="sm"
          >
            <Pencil size={16} />
            {editLabel}
          </Button>
        ))}

      {children}

      {deleteAllowed && onDelete && (
        <Button
          type="button"
          variant="danger"
          size="sm"
          onClick={() => {
            if (isDemo) {
              showReadOnlyModal();
              return;
            }

            onDelete();
          }}
          disabled={deleting}
        >
          <Trash2 size={16} />

          {deleting
            ? "Deleting..."
            : deleteLabel}
        </Button>
      )}
    </div>
  );
}

type PermissionGateProps = {
  allowed?: boolean;
  action?: "view" | "create" | "edit" | "delete";
  feature?: FeatureKey;
  children: ReactNode;
  fallback?: ReactNode;
};

export function PermissionGate({
  allowed,
  action = "view",
  feature,
  children,
  fallback = null,
}: PermissionGateProps) {
  const permissions = usePermissions();

  let resolvedAllowed = allowed;

  if (resolvedAllowed === undefined) {
    if (action === "create") {
      resolvedAllowed =
        permissions.canPerformCreate(
          feature
        );
    } else if (action === "edit") {
      resolvedAllowed =
        permissions.canPerformEdit(
          feature
        );
    } else if (action === "delete") {
      resolvedAllowed =
        permissions.canPerformDelete(
          feature
        );
    } else if (feature) {
      resolvedAllowed =
        permissions.canAccessFeature(
          feature
        );
    } else {
      resolvedAllowed =
        permissions.canView;
    }
  }

  if (!resolvedAllowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

type ReadOnlyNoticeProps = {
  show?: boolean;
  message?: string;
};

export function ReadOnlyNotice({
  show,
  message,
}: ReadOnlyNoticeProps) {
  const {
    isDemo,
    isViewer,
    loading,
  } = usePermissions();

  const shouldShow =
    show ??
    (!loading && (isDemo || isViewer));

  if (!shouldShow) {
    return null;
  }

  const resolvedMessage =
    message ??
    (isDemo
      ? "Demo mode is read-only."
      : "You can view this information, but your role does not allow changes.");

  return (
    <div className="flex items-start gap-3 rounded-[var(--radius-button)] border border-border-subtle bg-surface-sunken p-4">
      <LockKeyhole
        size={18}
        className="mt-0.5 shrink-0 text-interaction"
      />

      <p className="text-sm leading-6 text-text-secondary">
        {resolvedMessage}
      </p>
    </div>
  );
}

type UpgradeLockProps = {
  feature: FeatureKey;
  title?: string;
  description?: string;
};

export function UpgradeLock({
  feature,
  title,
  description,
}: UpgradeLockProps) {
  const {
    loading,
    isDemo,
    getFeatureAccess,
  } = usePermissions();

  const access =
    getFeatureAccess(feature);

  if (
    loading ||
    isDemo ||
    !access.requiresUpgrade
  ) {
    return null;
  }

  const planLabel =
    access.requiredPlan === "family"
      ? "Family"
      : "Pro";

  return (
    <section className="rounded-[var(--radius-card)] border border-border-subtle bg-surface-card p-8 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[var(--radius-card)] bg-premium-soft">
        <LockKeyhole
          size={28}
          className="text-premium"
        />
      </div>

      <p className="mt-6 text-overline text-premium">
        {planLabel} Feature
      </p>

      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-text-primary">
        {title ??
          `Unlock ${planLabel} access`}
      </h2>

      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-text-secondary">
        {description ??
          access.upgradeReason ??
          `Upgrade to Home Tech Vault ${planLabel} to use this feature.`}
      </p>

      <Button
        href={access.upgradeHref}
        variant="premium"
        className="mt-6"
      >
        <Sparkles size={17} />
        View Upgrade Options
      </Button>
    </section>
  );
}
