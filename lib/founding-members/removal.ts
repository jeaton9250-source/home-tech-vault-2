import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { recordPlatformAdminAudit } from "@/lib/account-admin/audit";
import {
  revokePlatformPlanGrant,
} from "@/lib/plan-grants/mutations";
import {
  FOUNDING_MEMBER_GRANT_REASON,
} from "@/lib/founding-members/constants";
import {
  loadFoundingMemberForUser,
  mapMemberRow,
} from "@/lib/founding-members/loaders";
import {
  FoundingMemberValidationError,
} from "@/lib/founding-members/enrollment";
import type { RemovalResult } from "@/lib/founding-members/types";

export async function removeFoundingMember(
  admin: SupabaseClient,
  options: {
    targetUserId: string;
    actorId: string;
    confirm: boolean;
    reason: string;
    revokeLinkedGrant: boolean;
  }
): Promise<RemovalResult> {
  if (!options.confirm) {
    throw new FoundingMemberValidationError(
      "Confirmation is required."
    );
  }

  const trimmedReason =
    options.reason?.trim() || "";

  if (!trimmedReason) {
    throw new FoundingMemberValidationError(
      "A removal reason is required."
    );
  }

  const member =
    await loadFoundingMemberForUser(
      admin,
      options.targetUserId
    );

  if (!member) {
    throw new FoundingMemberValidationError(
      "This user is not enrolled in the Founding Members program."
    );
  }

  if (member.status === "removed") {
    throw new FoundingMemberValidationError(
      "This user has already been removed from the Founding Members program."
    );
  }

  const now = new Date().toISOString();
  let grantRevoked = false;

  if (
    options.revokeLinkedGrant &&
    member.planGrantId
  ) {
    const { data: linkedGrant } = await admin
      .from("platform_plan_grants")
      .select("id, reason, status")
      .eq("id", member.planGrantId)
      .maybeSingle();

    if (
      linkedGrant?.status === "active" &&
      linkedGrant.reason ===
        FOUNDING_MEMBER_GRANT_REASON
    ) {
      const revokeResult =
        await revokePlatformPlanGrant(
          admin,
          {
            targetUserId:
              options.targetUserId,
            actorId: options.actorId,
            revocationReason: `Founding Member removal: ${trimmedReason}`,
            confirm: true,
          }
        );

      grantRevoked = Boolean(revokeResult);

      if (grantRevoked) {
        await recordPlatformAdminAudit(admin, {
          eventType:
            "founding_member_grant_revoked",
          actorId: options.actorId,
          targetUserId:
            options.targetUserId,
          reason: trimmedReason,
          metadata: {
            memberNumber:
              member.memberNumber,
            grantId: member.planGrantId,
          },
        });
      }
    }
  }

  const { data: updatedMember, error } =
    await admin
      .from("platform_founding_members")
      .update({
        status: "removed",
        removed_at: now,
        removed_by: options.actorId,
        removal_reason: trimmedReason,
      })
      .eq("id", member.id)
      .select(
        "id, user_id, plan_grant_id, member_number, status, benefit_mode, enrolled_at, enrolled_by, removed_at, removed_by, removal_reason, notes"
      )
      .single();

  if (error || !updatedMember) {
    throw (
      error ||
      new Error(
        "Unable to remove Founding Member."
      )
    );
  }

  const authUser =
    await admin.auth.admin.getUserById(
      options.targetUserId
    );

  await recordPlatformAdminAudit(admin, {
    eventType: "founding_member_removed",
    actorId: options.actorId,
    targetUserId: options.targetUserId,
    targetEmailSnapshot:
      authUser.data.user?.email ?? null,
    reason: trimmedReason,
    metadata: {
      memberNumber: member.memberNumber,
      grantRevoked,
      revokeLinkedGrantRequested:
        options.revokeLinkedGrant,
    },
  });

  return {
    member: mapMemberRow(updatedMember),
    grantRevoked,
  };
}
