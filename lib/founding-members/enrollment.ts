import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { recordPlatformAdminAudit } from "@/lib/account-admin/audit";
import { loadActivePlanGrantForUser } from "@/lib/plan-grants/loadActiveGrant";
import {
  createPlatformPlanGrant,
  PlanGrantValidationError,
} from "@/lib/plan-grants/mutations";
import { isSubscriptionGrantingAccess } from "@/lib/permissions/effectivePlan";
import {
  buildServerPlanAccessContext,
  formatEffectivePlanSourceLabel,
} from "@/lib/permissions/serverPlanAccess";
import {
  FOUNDING_MEMBER_GRANT_REASON,
} from "@/lib/founding-members/constants";
import {
  countFoundingMemberSlotsUsed,
  getNextAvailableMemberNumber,
  loadFoundingMemberForUser,
  loadFoundingProgramSettings,
  mapMemberRow,
  resolveProgramAvailability,
} from "@/lib/founding-members/loaders";
import { sendFoundingMemberEnrollmentEmail } from "@/lib/founding-members/sendEnrollmentEmail";
import type {
  EnrollmentPreview,
  EnrollmentResult,
  FoundingMemberBenefitMode,
} from "@/lib/founding-members/types";

export class FoundingMemberValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FoundingMemberValidationError";
  }
}

function mapRpcError(error: unknown): never {
  const message =
    error instanceof Error
      ? error.message
      : String(error);

  if (message.includes("FOUNDING_PROGRAM_PAUSED")) {
    throw new FoundingMemberValidationError(
      "The Founding Members program is paused."
    );
  }

  if (message.includes("FOUNDING_PROGRAM_FULL")) {
    throw new FoundingMemberValidationError(
      "All Founding Member spots have been claimed."
    );
  }

  if (
    message.includes(
      "FOUNDING_MEMBER_ALREADY_ENROLLED"
    )
  ) {
    throw new FoundingMemberValidationError(
      "This user is already enrolled in the Founding Members program."
    );
  }

  if (
    message.includes("FOUNDING_PROGRAM_NOT_CONFIGURED")
  ) {
    throw new FoundingMemberValidationError(
      "The Founding Members program is not configured."
    );
  }

  throw error;
}

function resolveGrantAction(options: {
  personalPlan: string;
  personalStatus: string;
  hasActiveAdminGrant: boolean;
  adminGrantPlan: string | null;
  inheritsFamilyPlan: boolean;
  effectivePlan: string;
}) {
  const paidPersonalAccess =
    isSubscriptionGrantingAccess(
      options.personalPlan as
        | "free"
        | "pro"
        | "family",
      options.personalStatus,
      null
    );

  if (options.inheritsFamilyPlan) {
    return {
      benefitMode:
        "inherited_family" as FoundingMemberBenefitMode,
      grantAction:
        "skip_higher_access" as const,
      grantActionDescription:
        "Inherited Family access already satisfies the program benefit. Recognition will be recorded without changing household billing.",
    };
  }

  if (
    options.hasActiveAdminGrant &&
    options.adminGrantPlan === "family"
  ) {
    return {
      benefitMode:
        "higher_grant" as FoundingMemberBenefitMode,
      grantAction:
        "skip_higher_access" as const,
      grantActionDescription:
        "An active Family complimentary grant already provides higher access. The existing grant will be linked without creating a duplicate.",
    };
  }

  if (
    options.hasActiveAdminGrant &&
    options.adminGrantPlan === "pro"
  ) {
    return {
      benefitMode:
        "existing_grant" as FoundingMemberBenefitMode,
      grantAction: "reuse_pro_grant" as const,
      grantActionDescription:
        "An active Pro complimentary grant will be reused. No duplicate grant will be created.",
    };
  }

  if (
    paidPersonalAccess &&
    (options.personalPlan === "pro" ||
      options.personalPlan === "family")
  ) {
    return {
      benefitMode:
        "paid_access" as FoundingMemberBenefitMode,
      grantAction:
        "skip_paid_access" as const,
      grantActionDescription:
        "This user already has paid premium access through Stripe. Founding Member recognition will be recorded without creating an unnecessary complimentary grant.",
    };
  }

  return {
    benefitMode:
      "linked_grant" as FoundingMemberBenefitMode,
    grantAction: "create_pro_grant" as const,
    grantActionDescription:
      "A complimentary Pro grant with no expiration will be created and linked to this enrollment.",
  };
}

export async function buildEnrollmentPreview(
  admin: SupabaseClient,
  userId: string
): Promise<EnrollmentPreview> {
  const settings =
    await loadFoundingProgramSettings(admin);
  const enrolledCount =
    await countFoundingMemberSlotsUsed(admin);
  const existingMember =
    await loadFoundingMemberForUser(
      admin,
      userId
    );

  if (existingMember) {
    throw new FoundingMemberValidationError(
      "This user is already enrolled in the Founding Members program."
    );
  }

  const planAccess =
    await buildServerPlanAccessContext(
      admin,
      userId
    );
  const activeGrant =
    await loadActivePlanGrantForUser(
      admin,
      userId
    );

  const { data: profile } = await admin
    .from("profiles")
    .select(
      "full_name, account_status"
    )
    .eq("id", userId)
    .maybeSingle();

  if (!profile) {
    throw new FoundingMemberValidationError(
      "User not found."
    );
  }

  if (profile.account_status === "deactivated") {
    throw new FoundingMemberValidationError(
      "Deactivated accounts cannot be enrolled."
    );
  }

  const authUser =
    await admin.auth.admin.getUserById(userId);
  const email =
    authUser.data.user?.email?.trim() || null;

  const grantAction = resolveGrantAction({
    personalPlan:
      planAccess.input.personalPlan,
    personalStatus:
      planAccess.input.personalStatus,
    hasActiveAdminGrant:
      planAccess.result.hasActiveAdminGrant,
    adminGrantPlan:
      activeGrant?.plan ?? null,
    inheritsFamilyPlan:
      planAccess.result.inheritsFamilyPlan,
    effectivePlan:
      planAccess.result.effectivePlan,
  });

  const remainingSpots = Math.max(
    settings.capacity - enrolledCount,
    0
  );
  const expectedMemberNumber =
    remainingSpots > 0
      ? await getNextAvailableMemberNumber(
          admin,
          settings.capacity
        )
      : null;

  return {
    userId,
    fullName:
      profile.full_name?.trim() || null,
    email,
    personalPlan:
      planAccess.input.personalPlan,
    subscriptionStatus:
      planAccess.input.personalStatus,
    adminGrantPlan:
      activeGrant?.plan ?? null,
    adminGrantStatus:
      activeGrant?.status ?? null,
    effectivePlan:
      planAccess.result.effectivePlan,
    effectivePlanSource:
      formatEffectivePlanSourceLabel(
        planAccess.result
          .effectivePlanSource
      ),
    remainingSpots,
    expectedMemberNumber,
    programStatus: resolveProgramAvailability({
      enabled: settings.enabled,
      capacity: settings.capacity,
      enrolledCount,
    }),
    grantAction: grantAction.grantAction,
    grantActionDescription:
      grantAction.grantActionDescription,
  };
}

export async function enrollFoundingMember(
  admin: SupabaseClient,
  options: {
    targetUserId: string;
    actorId: string;
    confirm: boolean;
    notes?: string | null;
  }
): Promise<EnrollmentResult> {
  if (!options.confirm) {
    throw new FoundingMemberValidationError(
      "Confirmation is required."
    );
  }

  const preview =
    await buildEnrollmentPreview(
      admin,
      options.targetUserId
    );

  if (preview.programStatus !== "open") {
    if (preview.programStatus === "paused") {
      throw new FoundingMemberValidationError(
        "The Founding Members program is paused."
      );
    }

    throw new FoundingMemberValidationError(
      "All Founding Member spots have been claimed."
    );
  }

  const planAccess =
    await buildServerPlanAccessContext(
      admin,
      options.targetUserId
    );
  const activeGrantForAction =
    await loadActivePlanGrantForUser(
      admin,
      options.targetUserId
    );

  const grantAction = resolveGrantAction({
    personalPlan: preview.personalPlan,
    personalStatus:
      preview.subscriptionStatus,
    hasActiveAdminGrant:
      planAccess.result.hasActiveAdminGrant,
    adminGrantPlan:
      activeGrantForAction?.plan ?? null,
    inheritsFamilyPlan:
      planAccess.result.inheritsFamilyPlan,
    effectivePlan: preview.effectivePlan,
  });

  const activeGrant = activeGrantForAction;

  let grantId: string | null =
    activeGrant?.id ?? null;
  let grantCreated = false;
  let grantReused = false;

  const { data: reservation, error: reserveError } =
    await admin.rpc(
      "reserve_founding_member_slot",
      {
        p_user_id: options.targetUserId,
        p_enrolled_by: options.actorId,
        p_benefit_mode:
          grantAction.benefitMode,
        p_notes:
          options.notes?.trim() || null,
      }
    );

  if (reserveError) {
    mapRpcError(reserveError);
  }

  const reservationRow = Array.isArray(
    reservation
  )
    ? reservation[0]
    : reservation;

  if (!reservationRow?.id) {
    throw new Error(
      "Unable to reserve Founding Member slot."
    );
  }

  const enrollmentId =
    reservationRow.id as string;
  const memberNumber =
    reservationRow.member_number as number;

  try {
    if (
      grantAction.grantAction ===
      "create_pro_grant"
    ) {
      const grantResult =
        await createPlatformPlanGrant(
          admin,
          {
            targetUserId:
              options.targetUserId,
            actorId: options.actorId,
            plan: "pro",
            durationId: "none",
            reason:
              FOUNDING_MEMBER_GRANT_REASON,
            notes:
              options.notes?.trim() ||
              `Founding Member #${memberNumber}`,
            confirm: true,
          }
        );

      grantId = grantResult.grant.id;
      grantCreated = true;
    } else if (
      grantAction.grantAction ===
      "reuse_pro_grant"
    ) {
      grantId = activeGrant?.id ?? null;
      grantReused = Boolean(grantId);
    }

    const { data: updatedMember, error: linkError } =
      await admin
        .from("platform_founding_members")
        .update({
          plan_grant_id: grantId,
          benefit_mode:
            grantAction.benefitMode,
        })
        .eq("id", enrollmentId)
        .select(
          "id, user_id, plan_grant_id, member_number, status, benefit_mode, enrolled_at, enrolled_by, removed_at, removed_by, removal_reason, notes"
        )
        .single();

    if (linkError || !updatedMember) {
      throw (
        linkError ||
        new Error(
          "Unable to link Founding Member grant."
        )
      );
    }

    const member = mapMemberRow(updatedMember);

    let notification: EnrollmentResult["notification"] =
      {
        status: "skipped",
        message:
          "Enrollment saved without email delivery.",
      };

    try {
      const emailResult =
        await sendFoundingMemberEnrollmentEmail({
          admin,
          actorId: options.actorId,
          targetUserId:
            options.targetUserId,
          memberNumber,
          grantId,
          grantCreated,
        });

      notification = {
        status: emailResult.status,
        message: emailResult.message,
      };
    } catch (emailError) {
      console.error(
        "[founding-members] enrollment email failed:",
        emailError
      );

      notification = {
        status: "failed",
        message:
          "Enrollment saved, but the welcome email could not be delivered.",
      };
    }

    const authUser =
      await admin.auth.admin.getUserById(
        options.targetUserId
      );

    await recordPlatformAdminAudit(admin, {
      eventType: "founding_member_enrolled",
      actorId: options.actorId,
      targetUserId: options.targetUserId,
      targetEmailSnapshot:
        authUser.data.user?.email ?? null,
      notes: options.notes ?? null,
      metadata: {
        memberNumber,
        benefitMode:
          grantAction.benefitMode,
        grantId,
        grantCreated,
        grantReused,
        notificationStatus:
          notification.status,
      },
    });

    const enrolledCount =
      (reservationRow.enrolled_count as number) ??
      0;
    const capacity =
      (reservationRow.capacity as number) ??
      50;

    if (enrolledCount >= capacity) {
      await recordPlatformAdminAudit(admin, {
        eventType: "founding_program_full",
        actorId: options.actorId,
        metadata: {
          capacity,
          enrolledCount,
        },
      });
    }

    return {
      member,
      grantId,
      grantCreated,
      grantReused,
      notification,
    };
  } catch (error) {
    await admin
      .from("platform_founding_members")
      .delete()
      .eq("id", enrollmentId);

    if (
      error instanceof
        PlanGrantValidationError ||
      error instanceof
        FoundingMemberValidationError
    ) {
      throw error;
    }

    throw error;
  }
}
