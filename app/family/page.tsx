"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type FormEvent,
} from "react";

import {
  CheckCircle2,
  Clock3,
  Copy,
  Crown,
  Home,
  Loader2,
  Mail,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserCog,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { getDefaultActivityTitle, recordActivity } from "@/lib/activity";
import { usePermissions } from "@/hooks/usePermissions";

import PageShell from "@/components/ui/PageShell";
import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";

type HouseholdRole = "owner" | "admin" | "member" | "viewer";

type Household = {
  id: string;
  owner_id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

type HouseholdMemberRow = {
  id: string;
  household_id: string;
  user_id: string;
  role: HouseholdRole;
  invited_by: string | null;
  joined_at: string;
  updated_at: string;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
};

type HouseholdMember = HouseholdMemberRow & {
  fullName: string;
  avatarUrl: string | null;
};

type HouseholdInvitation = {
  id: string;
  household_id: string;
  email: string;
  role: HouseholdRole;
  token: string;
  invited_by: string;
  accepted_by: string | null;
  accepted_at: string | null;
  expires_at: string;
  created_at: string;
};

type FamilyIcon = ComponentType<{
  size?: number;
  className?: string;
}>;

type InviteForm = {
  email: string;
  role: Exclude<HouseholdRole, "owner">;
};

const initialInviteForm: InviteForm = {
  email: "",
  role: "member",
};

const demoHousehold: Household = {
  id: "demo-household",
  owner_id: "demo-owner",
  name: "The Demo Household",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const demoMembers: HouseholdMember[] = [
  {
    id: "demo-member-1",
    household_id: "demo-household",
    user_id: "demo-owner",
    role: "owner",
    invited_by: "demo-owner",
    joined_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    fullName: "Demo User",
    avatarUrl: null,
  },
  {
    id: "demo-member-2",
    household_id: "demo-household",
    user_id: "demo-admin",
    role: "admin",
    invited_by: "demo-owner",
    joined_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    fullName: "Alex Morgan",
    avatarUrl: null,
  },
  {
    id: "demo-member-3",
    household_id: "demo-household",
    user_id: "demo-viewer",
    role: "viewer",
    invited_by: "demo-owner",
    joined_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    fullName: "Taylor Morgan",
    avatarUrl: null,
  },
];

const demoInvitations: HouseholdInvitation[] = [
  {
    id: "demo-invitation-1",
    household_id: "demo-household",
    email: "family@example.com",
    role: "member",
    token: "demo-token",
    invited_by: "demo-owner",
    accepted_by: null,
    accepted_at: null,
    expires_at: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
  },
];

export default function FamilyPage() {
  const {
    user,
    isDemo,
    role,
    rawHouseholdRole,
    hasFamilyFeatureAccess,
    householdId,
    loading: permissionsLoading,
    planDisplayName,
    roleDisplayName,
    canUseFamilySharing,
    canManageHousehold,
    canInvite,
    billingManagedByHousehold,
    familyMemberLimit,
    isPlatformAdmin,
    householdId: permissionsHouseholdId,
    refreshPermissions,
  } = usePermissions();

  const [isClientVaultMode, setIsClientVaultMode] = useState(false);

  const [clientVaultModeChecked, setClientVaultModeChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadClientVaultMode() {
      try {
        const response = await fetch("/api/realtor/vault-mode/status", {
          cache: "no-store",
        });

        const payload = (await response.json()) as {
          active?: boolean;
        };

        if (!cancelled) {
          setIsClientVaultMode(payload.active === true);
        }
      } catch {
        if (!cancelled) {
          setIsClientVaultMode(false);
        }
      } finally {
        if (!cancelled) {
          setClientVaultModeChecked(true);
        }
      }
    }

    void loadClientVaultMode();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * Realtor Client Vault Mode allows preparation of
   * property records, but never household access changes.
   */
  const canManageHouseholdAccess =
    clientVaultModeChecked && !isClientVaultMode && canManageHousehold;

  const canInviteHouseholdMember =
    clientVaultModeChecked && !isClientVaultMode && canInvite;

  const [household, setHousehold] = useState<Household | null>(null);

  const [members, setMembers] = useState<HouseholdMember[]>([]);

  const [invitations, setInvitations] = useState<HouseholdInvitation[]>([]);

  const [currentRole, setCurrentRole] = useState<HouseholdRole | null>(null);

  const [loadingFamily, setLoadingFamily] = useState(true);

  const [creatingHousehold, setCreatingHousehold] = useState(false);

  const [sendingInvitation, setSendingInvitation] = useState(false);

  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);

  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

  const [cancelingInvitationId, setCancelingInvitationId] = useState<
    string | null
  >(null);

  const [showInviteForm, setShowInviteForm] = useState(false);

  const [householdName, setHouseholdName] = useState("");

  const [inviteForm, setInviteForm] = useState<InviteForm>(initialInviteForm);

  const [successMessage, setSuccessMessage] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  const loadFamilyData = useCallback(async () => {
    if (permissionsLoading) {
      return;
    }

    try {
      setLoadingFamily(true);
      setErrorMessage("");

      if (isDemo) {
        setHousehold(demoHousehold);
        setMembers(demoMembers);
        setInvitations(demoInvitations);
        setCurrentRole("owner");
        return;
      }

      if (!user) {
        setHousehold(null);
        setMembers([]);
        setInvitations([]);
        setCurrentRole(null);
        return;
      }

      let membershipQuery = supabase
        .from("household_members")
        .select(
          `
              id,
              household_id,
              user_id,
              role,
              invited_by,
              joined_at,
              updated_at
            `,
        )
        .eq("user_id", user.id);

      if (permissionsHouseholdId) {
        membershipQuery = membershipQuery.eq(
          "household_id",
          permissionsHouseholdId,
        );
      } else {
        membershipQuery = membershipQuery
          .order("joined_at", {
            ascending: false,
          })
          .limit(1);
      }

      const { data: membershipData, error: membershipError } =
        await membershipQuery.maybeSingle();

      if (membershipError) {
        throw membershipError;
      }

      if (!membershipData) {
        setHousehold(null);
        setMembers([]);
        setInvitations([]);
        setCurrentRole(null);
        return;
      }

      const membership = membershipData as HouseholdMemberRow;

      const [householdResult, membersResult, invitationsResult] =
        await Promise.all([
          supabase
            .from("households")
            .select("*")
            .eq("id", membership.household_id)
            .maybeSingle(),

          supabase
            .from("household_members")
            .select(
              `
                id,
                household_id,
                user_id,
                role,
                invited_by,
                joined_at,
                updated_at
              `,
            )
            .eq("household_id", membership.household_id)
            .order("joined_at", {
              ascending: true,
            }),

          supabase
            .from("household_invitations")
            .select("*")
            .eq("household_id", membership.household_id)
            .is("accepted_at", null)
            .order("created_at", {
              ascending: false,
            }),
        ]);

      if (householdResult.error) {
        throw householdResult.error;
      }

      if (membersResult.error) {
        throw membersResult.error;
      }

      if (invitationsResult.error) {
        console.error(
          "Unable to load household invitations:",
          invitationsResult.error,
        );
      }

      const loadedMemberRows = (membersResult.data ||
        []) as HouseholdMemberRow[];

      const memberUserIds = loadedMemberRows.map((member) => member.user_id);

      let profiles: ProfileRow[] = [];

      if (memberUserIds.length > 0) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", memberUserIds);

        if (profileError) {
          console.error("Unable to load household profiles:", profileError);
        } else {
          profiles = (profileData || []) as ProfileRow[];
        }
      }

      const profileMap = new Map(
        profiles.map((profile) => [profile.id, profile]),
      );

      const loadedMembers = loadedMemberRows.map((member) => {
        const profile = profileMap.get(member.user_id);

        return {
          ...member,
          fullName:
            profile?.full_name?.trim() ||
            (member.user_id === user.id
              ? user.email?.split("@")[0] || "You"
              : "Household Member"),
          avatarUrl: profile?.avatar_url || null,
        };
      });

      setHousehold((householdResult.data as Household) || null);

      setMembers(loadedMembers);

      setInvitations((invitationsResult.data || []) as HouseholdInvitation[]);

      setCurrentRole(membership.role);
    } catch (error: unknown) {
      const possibleError = error as {
        message?: string;
        details?: string;
      };

      console.error("Household Access loading error:", error);

      setErrorMessage(
        possibleError.message ||
          possibleError.details ||
          "Unable to load Your Household.",
      );
    } finally {
      setLoadingFamily(false);
    }
  }, [user, isDemo, permissionsLoading, permissionsHouseholdId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadFamilyData();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadFamilyData]);

  const memberLimit = familyMemberLimit > 0 ? familyMemberLimit : 6;

  const occupiedSeats = members.length + invitations.length;

  const availableSeats = Math.max(memberLimit - occupiedSeats, 0);

  const canCreateHousehold = isPlatformAdmin || canUseFamilySharing;

  const hasHouseholdMembership = Boolean(household && currentRole);

  const loading = permissionsLoading || loadingFamily;

  const ownerMember = useMemo(
    () => members.find((member) => member.role === "owner") || null,
    [members],
  );

  async function createHousehold(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isDemo) {
      window.location.href = "/signup";
      return;
    }

    if (!user) {
      setErrorMessage("Please sign in to create a household.");
      return;
    }

    if (!canCreateHousehold) {
      window.location.href = "/upgrade";
      return;
    }

    const name = householdName.trim();

    if (!name) {
      setErrorMessage("Please enter a household name.");
      return;
    }

    try {
      setCreatingHousehold(true);

      setSuccessMessage("");
      setErrorMessage("");

      const response = await fetch("/api/household/ensure", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          householdName: name,
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
        householdId?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "Unable to create your household.");
      }

      setHouseholdName("");

      setSuccessMessage("Your household was created successfully.");

      await refreshPermissions();
      await loadFamilyData();
    } catch (error: unknown) {
      const possibleError = error as {
        message?: string;
        details?: string;
      };

      console.error("Unable to create household:", error);

      setErrorMessage(
        possibleError.message ||
          possibleError.details ||
          "Unable to create your household.",
      );
    } finally {
      setCreatingHousehold(false);
    }
  }

  async function sendInvitation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    console.log("[Family Invite] Step 1: Form submitted");

    if (isDemo) {
      console.log("[Family Invite] Stopped: Demo mode");
      window.location.href = "/signup";
      return;
    }

    if (!user) {
      console.error("[Family Invite] Stopped: No signed-in user");
      setErrorMessage("Please sign in before sending an invitation.");
      return;
    }

    if (!household) {
      console.error("[Family Invite] Stopped: No household found");
      setErrorMessage("Your household could not be found.");
      return;
    }

    if (isClientVaultMode) {
      setErrorMessage(
        "Household invitations are unavailable while preparing a Client Vault.",
      );
      setShowInviteForm(false);
      return;
    }

    if (!canInviteHouseholdMember) {
      console.error(
        "[Family Invite] Stopped: User cannot invite household members",
        {
          userId: user.id,
          householdId: household.id,
          canInvite,
        },
      );

      window.location.href = "/upgrade";
      return;
    }

    const email = inviteForm.email.trim().toLowerCase();

    console.log("[Family Invite] Step 2: Validation started", {
      email,
      availableSeats,
      memberLimit,
      householdId: household.id,
    });

    if (!email) {
      console.error("[Family Invite] Stopped: Email missing");
      setErrorMessage("Please enter an email address.");
      return;
    }

    if (availableSeats <= 0) {
      console.error("[Family Invite] Stopped: No available seats");

      setErrorMessage(
        `Your household has reached its ${memberLimit}-member limit.`,
      );

      return;
    }

    if (email === user.email?.trim().toLowerCase()) {
      console.error(
        "[Family Invite] Stopped: Owner attempted to invite themselves",
      );

      setErrorMessage("You are already the household owner.");

      return;
    }

    const invitationAlreadyExists = invitations.some(
      (invitation) => invitation.email.trim().toLowerCase() === email,
    );

    if (invitationAlreadyExists) {
      console.error(
        "[Family Invite] Stopped: Pending invitation already exists",
        { email },
      );

      setErrorMessage("A pending invitation already exists for this email.");

      return;
    }

    try {
      setSendingInvitation(true);
      setSuccessMessage("");
      setErrorMessage("");

      console.log("[Family Invite] Step 3: Creating invitation record");

      const { data: createdInvitation, error: invitationError } = await supabase
        .from("household_invitations")
        .insert({
          household_id: household.id,
          email,
          role: inviteForm.role,
          invited_by: user.id,
        })
        .select("*")
        .single();

      if (invitationError) {
        console.error(
          "[Family Invite] Failed during database insert",
          invitationError,
        );

        throw invitationError;
      }

      if (!createdInvitation) {
        throw new Error(
          "The invitation was created, but no invitation record was returned.",
        );
      }

      const invitation = createdInvitation as HouseholdInvitation;

      console.log("[Family Invite] Step 4: Invitation record created", {
        invitationId: invitation.id,
        invitationEmail: invitation.email,
      });

      setInvitations((current) => [invitation, ...current]);

      await recordActivity({
        activityType: "family.member.invited",
        title: getDefaultActivityTitle("family.member.invited", email),
        description: `Invitation sent with ${inviteForm.role} access.`,
        userId: user.id,
        householdId: household.id,
        entityId: invitation.id,
      });

      alert(
        `Invitation created. Calling email function now.\n\nInvitation ID: ${invitation.id}`,
      );

      console.log(
        "[Family Invite] Step 5: Calling send-family-invite Edge Function",
        {
          invitationId: invitation.id,
        },
      );

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!session?.access_token) {
        throw new Error(
          "Your login session could not be found. Please sign out and sign back in.",
        );
      }

      const { data: emailResult, error: emailError } =
        await supabase.functions.invoke("send-family-invite", {
          body: {
            invitationId: invitation.id,
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

      console.log("[Family Invite] Step 6: Edge Function response received", {
        emailResult,
        emailError,
      });

      setInviteForm(initialInviteForm);
      setShowInviteForm(false);

      if (emailError) {
        console.error(
          "[Family Invite] Edge Function returned an error",
          emailError,
        );

        let detailedMessage =
          emailError.message || "Unable to send the invitation email.";

        try {
          const context = "context" in emailError ? emailError.context : null;

          if (context && typeof context.json === "function") {
            const errorBody = await context.json();

            console.error(
              "[Family Invite] Edge Function error body",
              errorBody,
            );

            detailedMessage =
              errorBody?.error || errorBody?.message || detailedMessage;
          }
        } catch (contextError) {
          console.error(
            "[Family Invite] Could not read Edge Function error body",
            contextError,
          );
        }

        setSuccessMessage(`Invitation created for ${email}.`);

        setErrorMessage(`The email was not sent: ${detailedMessage}`);

        return;
      }

      if (emailResult?.success !== true) {
        console.error(
          "[Family Invite] Edge Function returned an unsuccessful response",
          emailResult,
        );

        setSuccessMessage(`Invitation created for ${email}.`);

        setErrorMessage(
          emailResult?.error ||
            "The email service returned an unexpected response.",
        );

        return;
      }

      console.log(
        "[Family Invite] Step 7: Invitation email sent successfully",
        emailResult,
      );

      setSuccessMessage(`Invitation emailed successfully to ${email}.`);

      await refreshPermissions();
    } catch (error: unknown) {
      const possibleError = error as {
        message?: string;
        details?: string;
        hint?: string;
        code?: string;
      };

      console.error("[Family Invite] Invitation process failed", error);

      setErrorMessage(
        possibleError.message ||
          possibleError.details ||
          possibleError.hint ||
          "Unable to create the invitation.",
      );
    } finally {
      console.log("[Family Invite] Process finished");

      setSendingInvitation(false);
    }
  }

  async function copyInvitationLink(invitation: HouseholdInvitation) {
    if (isDemo) {
      window.location.href = "/signup";
      return;
    }

    const invitationUrl =
      `${window.location.origin}/family/accept/` + invitation.token;

    try {
      await navigator.clipboard.writeText(invitationUrl);

      setSuccessMessage(`Invitation link copied for ${invitation.email}.`);

      setErrorMessage("");
    } catch (error) {
      console.error("Unable to copy invitation link:", error);

      setErrorMessage("Unable to copy the invitation link.");
    }
  }

  async function updateMemberRole(
    member: HouseholdMember,
    role: Exclude<HouseholdRole, "owner">,
  ) {
    if (isDemo) {
      window.location.href = "/signup";
      return;
    }

    if (isClientVaultMode || !canManageHouseholdAccess) {
      setErrorMessage(
        isClientVaultMode
          ? "Household roles cannot be changed while preparing a Client Vault."
          : "You do not have permission to change household roles.",
      );
      return;
    }

    if (member.role === "owner") {
      setErrorMessage("The household owner’s role cannot be changed.");
      return;
    }

    try {
      setUpdatingMemberId(member.id);

      setSuccessMessage("");
      setErrorMessage("");

      const { error } = await supabase
        .from("household_members")
        .update({
          role,
        })
        .eq("id", member.id)
        .eq("household_id", member.household_id);

      if (error) {
        throw error;
      }

      setMembers((current) =>
        current.map((currentMember) =>
          currentMember.id === member.id
            ? {
                ...currentMember,
                role,
              }
            : currentMember,
        ),
      );

      setSuccessMessage(`${member.fullName} is now a ${formatRole(role)}.`);

      await refreshPermissions();
    } catch (error: unknown) {
      const possibleError = error as {
        message?: string;
        details?: string;
      };

      setErrorMessage(
        possibleError.message ||
          possibleError.details ||
          "Unable to update the member’s role.",
      );
    } finally {
      setUpdatingMemberId(null);
    }
  }

  async function removeMember(member: HouseholdMember) {
    if (isDemo) {
      window.location.href = "/signup";
      return;
    }

    if (isClientVaultMode || !canManageHouseholdAccess) {
      setErrorMessage(
        isClientVaultMode
          ? "Household members cannot be removed while preparing a Client Vault."
          : "Only household admins can remove members.",
      );
      return;
    }

    if (member.role === "owner") {
      setErrorMessage("The household owner cannot be removed.");
      return;
    }

    const confirmed = window.confirm(
      `Remove ${member.fullName} from this household?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setRemovingMemberId(member.id);

      setSuccessMessage("");
      setErrorMessage("");

      const { error } = await supabase
        .from("household_members")
        .delete()
        .eq("id", member.id)
        .eq("household_id", member.household_id);

      if (error) {
        throw error;
      }

      setMembers((current) =>
        current.filter((currentMember) => currentMember.id !== member.id),
      );

      if (user && household) {
        await recordActivity({
          activityType: "family.member.removed",
          title: getDefaultActivityTitle(
            "family.member.removed",
            member.fullName,
          ),
          description: "Household membership was removed.",
          userId: user.id,
          householdId: household.id,
          entityId: member.id,
        });
      }

      setSuccessMessage(`${member.fullName} was removed from the household.`);

      await refreshPermissions();
    } catch (error: unknown) {
      const possibleError = error as {
        message?: string;
        details?: string;
      };

      setErrorMessage(
        possibleError.message ||
          possibleError.details ||
          "Unable to remove the member.",
      );
    } finally {
      setRemovingMemberId(null);
    }
  }

  async function cancelInvitation(invitation: HouseholdInvitation) {
    if (isDemo) {
      window.location.href = "/signup";
      return;
    }

    if (!canManageHousehold) {
      return;
    }

    const confirmed = window.confirm(
      `Cancel the invitation for ${invitation.email}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancelingInvitationId(invitation.id);

      setSuccessMessage("");
      setErrorMessage("");

      const { error } = await supabase
        .from("household_invitations")
        .delete()
        .eq("id", invitation.id)
        .eq("household_id", invitation.household_id);

      if (error) {
        throw error;
      }

      setInvitations((current) =>
        current.filter(
          (currentInvitation) => currentInvitation.id !== invitation.id,
        ),
      );

      setSuccessMessage(`The invitation for ${invitation.email} was canceled.`);
    } catch (error: unknown) {
      const possibleError = error as {
        message?: string;
        details?: string;
      };

      setErrorMessage(
        possibleError.message ||
          possibleError.details ||
          "Unable to cancel the invitation.",
      );
    } finally {
      setCancelingInvitationId(null);
    }
  }

  if (loading) {
    return (
      <PageShell>
        {isClientVaultMode ? (
          <div className="mb-6 rounded-[22px] border border-[#718d4f]/20 bg-[#718d4f]/[0.07] px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#617c43]">
              Client Vault Access
            </p>

            <p className="mt-2 text-sm font-semibold text-[#183047]">
              Household access is locked while you prepare this home.
            </p>

            <p className="mt-1 text-sm leading-6 text-[#68737b]">
              You can organize the property&apos;s records, but invitations,
              member roles, removals, and household access changes are reserved
              for the buyer after handoff.
            </p>
          </div>
        ) : null}

        <PageCard className="flex min-h-72 items-center justify-center">
          <div className="flex items-center gap-3 text-[#68737b]">
            <Loader2 size={22} className="animate-spin" />
            Loading Family Sharing...
          </div>
        </PageCard>
      </PageShell>
    );
  }

  if (!isDemo && !hasHouseholdMembership && !canCreateHousehold) {
    return (
      <PageShell>
        <div className="mx-auto w-full max-w-[1180px] pb-14">
          {/* FAMILY HERO */}
          <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#183047] px-6 py-10 text-[#f5f1e8] shadow-[0_28px_70px_-44px_rgba(0,0,0,0.75)] md:px-10 md:py-12 lg:px-12">
            <div
              className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#718d4f]/15 blur-[90px]"
              aria-hidden
            />

            <div
              className="pointer-events-none absolute -bottom-36 left-1/4 h-72 w-72 rounded-full bg-[#718d4f]/8 blur-[100px]"
              aria-hidden
            />

            <div className="relative max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#718d4f]/20 bg-[#718d4f]/10 px-3.5 py-2">
                <Crown size={13} className="text-[#9bb27a]" aria-hidden />

                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9bb27a]">
                  Family Plan
                </span>
              </div>

              <h1 className="mt-7 max-w-3xl font-serif text-4xl font-medium leading-[1.04] tracking-[-0.05em] text-[#f5f1e8] md:text-5xl lg:text-[3.5rem]">
                Your home&apos;s information shouldn&apos;t live with just one
                person.
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-[#b6c0c7] md:text-base">
                Give the people you trust access to the same devices, receipts,
                warranties, maintenance records, and home technology information
                — without giving everyone the same level of control.
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                {[
                  "Shared household vault",
                  "Role-based access",
                  "One trusted record",
                ].map((label) => (
                  <span
                    key={label}
                    className="rounded-full border border-white/8 bg-white/[0.045] px-3 py-1.5 text-xs font-medium text-white/65"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* MAIN FAMILY PREVIEW */}
          <section className="mt-5 overflow-hidden rounded-[30px] border border-[#17212a]/10 bg-[#fdfcf9] shadow-[0_24px_65px_-48px_rgba(11,22,35,0.35)]">
            <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
              {/* LEFT */}
              <div className="p-6 sm:p-8 lg:p-10">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#617c43]">
                  Built for real households
                </p>

                <h2 className="mt-3 max-w-xl font-serif text-3xl font-medium tracking-[-0.04em] text-[#17212a] sm:text-4xl">
                  One vault.
                  <span className="block">The right access for everyone.</span>
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-7 text-[#68737b]">
                  Stop keeping important home information scattered across
                  texts, drawers, inboxes, and one person&apos;s memory.
                </p>

                <div className="mt-8 space-y-3">
                  <FamilyBenefit
                    icon={Users}
                    title="Bring your household together"
                    description="Invite the people who help manage your home so everyone works from the same trusted information."
                  />

                  <FamilyBenefit
                    icon={ShieldCheck}
                    title="Control who can do what"
                    description="Use Admin, Member, and Viewer access instead of giving every person full control."
                  />

                  <FamilyBenefit
                    icon={Home}
                    title="Keep the whole home in sync"
                    description="Share devices, documents, warranties, maintenance, subscriptions, reports, and home Wi-Fi information."
                  />
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button href="/upgrade" className="justify-center">
                    <Crown size={17} />
                    Unlock Household Access
                  </Button>

                  <Button
                    href="/upgrade"
                    variant="secondary"
                    className="justify-center"
                  >
                    Compare Plans
                  </Button>
                </div>

                <p className="mt-4 text-xs leading-5 text-[#8a9297]">
                  Your existing Vault stays exactly where it is. Family simply
                  adds secure household access around it.
                </p>
              </div>

              {/* RIGHT — PRODUCT PREVIEW */}
              <div className="border-t border-[#17212a]/8 bg-[#f5f2eb] p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-10">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7b856f]">
                      Household Preview
                    </p>

                    <h3 className="mt-2 text-lg font-semibold tracking-[-0.025em] text-[#17212a]">
                      Your shared Home Tech Vault
                    </h3>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#183047] text-[#9bb27a]">
                    <Users size={20} aria-hidden />
                  </div>
                </div>

                {/* MEMBER PREVIEW */}
                <div className="mt-6 rounded-[22px] border border-[#17212a]/8 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#17212a]">
                        Household access
                      </p>

                      <p className="mt-1 text-xs text-[#8a9297]">
                        Everyone gets the access they need.
                      </p>
                    </div>

                    <span className="rounded-full bg-[#edf2e8] px-2.5 py-1 text-[10px] font-semibold text-[#617c43]">
                      Family
                    </span>
                  </div>

                  <div className="mt-5 space-y-2.5">
                    <FamilyMemberPreview
                      initials="Y"
                      name="You"
                      detail="Household owner"
                      role="Admin"
                      active
                    />

                    <FamilyMemberPreview
                      initials="P"
                      name="Partner"
                      detail="Can add and update records"
                      role="Member"
                    />

                    <FamilyMemberPreview
                      initials="F"
                      name="Family member"
                      detail="Can see important information"
                      role="Viewer"
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#617c43]/25 bg-[#617c43]/5 px-4 py-3 text-xs font-medium text-[#617c43]">
                    <UserPlus size={14} aria-hidden />
                    Invite another household member
                  </div>
                </div>

                {/* SHARED CONTENT PREVIEW */}
                <div className="mt-4 rounded-[22px] border border-[#17212a]/8 bg-[#183047] p-5 text-white">
                  <div className="flex items-center gap-2">
                    <Sparkles
                      size={15}
                      className="text-[#9bb27a]"
                      aria-hidden
                    />

                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9bb27a]">
                      Shared automatically
                    </p>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2.5">
                    {[
                      "Devices",
                      "Documents",
                      "Warranties",
                      "Maintenance",
                      "Subscriptions",
                      "Home Wi-Fi",
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-2 rounded-xl border border-white/7 bg-white/[0.045] px-3 py-2.5"
                      >
                        <CheckCircle2
                          size={14}
                          className="shrink-0 text-[#718d4f]"
                          aria-hidden
                        />

                        <span className="text-xs font-medium text-white/65">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 rounded-[18px] border border-[#718d4f]/15 bg-[#edf2e8] p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck
                      size={18}
                      className="mt-0.5 shrink-0 text-[#617c43]"
                      aria-hidden
                    />

                    <div>
                      <p className="text-sm font-semibold text-[#17212a]">
                        You stay in control.
                      </p>

                      <p className="mt-1 text-xs leading-5 text-[#68737b]">
                        Decide who can view, edit, invite members, or manage
                        your household Vault.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* BOTTOM VALUE STRIP */}
          <section className="mt-5 grid gap-3 sm:grid-cols-3">
            <FamilyValueCard
              value="1"
              label="Shared source of truth"
              description="No more wondering who has the receipt, model number, or warranty."
            />

            <FamilyValueCard
              value="3"
              label="Permission levels"
              description="Admin, Member, and Viewer roles keep access intentional."
            />

            <FamilyValueCard
              value="All"
              label="Your household tech"
              description="Keep the information behind your home accessible when it matters."
            />
          </section>
        </div>
      </PageShell>
    );
  }

  function FamilyBenefit({
    icon: Icon,
    title,
    description,
  }: {
    icon: ComponentType<{
      size?: number;
      className?: string;
    }>;
    title: string;
    description: string;
  }) {
    return (
      <div className="flex gap-4 rounded-[20px] border border-[#17212a]/8 bg-[#f8f6f1] p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e9efe2] text-[#617c43]">
          <Icon size={18} aria-hidden />
        </div>

        <div>
          <p className="text-sm font-semibold text-[#17212a]">{title}</p>

          <p className="mt-1 text-xs leading-5 text-[#68737b]">{description}</p>
        </div>
      </div>
    );
  }

  function FamilyMemberPreview({
    initials,
    name,
    detail,
    role,
    active = false,
  }: {
    initials: string;
    name: string;
    detail: string;
    role: string;
    active?: boolean;
  }) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl bg-[#f8f6f1] px-3 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={
              active
                ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#183047] text-xs font-semibold text-white"
                : "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#17212a]/8 bg-white text-xs font-semibold text-[#68737b]"
            }
          >
            {initials}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#17212a]">
              {name}
            </p>

            <p className="truncate text-[11px] text-[#8a9297]">{detail}</p>
          </div>
        </div>

        <span className="shrink-0 rounded-full border border-[#17212a]/8 bg-white px-2.5 py-1 text-[10px] font-semibold text-[#68737b]">
          {role}
        </span>
      </div>
    );
  }

  function FamilyValueCard({
    value,
    label,
    description,
  }: {
    value: string;
    label: string;
    description: string;
  }) {
    return (
      <article className="rounded-[22px] border border-[#17212a]/8 bg-[#fdfcf9] p-5">
        <p className="font-serif text-3xl font-medium tracking-[-0.04em] text-[#617c43]">
          {value}
        </p>

        <p className="mt-2 text-sm font-semibold text-[#17212a]">{label}</p>

        <p className="mt-1.5 text-xs leading-5 text-[#68737b]">{description}</p>
      </article>
    );
  }

  const resolvedHouseholdRole: HouseholdRole =
    currentRole || rawHouseholdRole || "viewer";

  const householdViewerMode = resolvedHouseholdRole === "viewer";

  const householdMemberMode = resolvedHouseholdRole === "member";

  const householdManagerMode =
    resolvedHouseholdRole === "owner" || resolvedHouseholdRole === "admin";

  const householdRoleLabel =
    resolvedHouseholdRole === "owner"
      ? "Owner"
      : resolvedHouseholdRole === "admin"
        ? "Admin"
        : resolvedHouseholdRole === "member"
          ? "Member"
          : "Viewer";

  return (
    <PageShell>
      {isDemo && (
        <section className="rounded-[24px] border border-[#b58a42]/20 bg-[#b58a42]/10 p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#617c43] text-white">
              <Sparkles size={18} />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#617c43]">
                Household Preview
              </p>

              <p className="mt-2 text-sm leading-6 text-[#68737b]">
                Explore a sample household. Creating invitations or changing
                members will take you to signup.
              </p>
            </div>
          </div>
        </section>
      )}

      {successMessage && (
        <div className="flex items-start gap-3 rounded-[22px] border border-[#617c43]/20 bg-[#617c43]/10 p-4 text-sm text-[#526b39]">
          <CheckCircle2 size={19} className="mt-0.5 shrink-0" />

          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="flex items-start justify-between gap-4 rounded-[22px] border border-[#a6584e]/20 bg-[#a6584e]/10 p-4 text-sm text-[#984e46]">
          <p>{errorMessage}</p>

          <button
            type="button"
            onClick={() => setErrorMessage("")}
            aria-label="Dismiss error"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {!household ? (
        <CreateHouseholdCard
          householdName={householdName}
          setHouseholdName={setHouseholdName}
          creating={creatingHousehold}
          onSubmit={createHousehold}
        />
      ) : (
        <>
          {/* HOUSEHOLD HERO */}
          <section className="overflow-hidden rounded-[32px] bg-[#183047] text-[#f8f5ef] shadow-[0_28px_70px_-48px_rgba(15,25,35,0.65)]">
            <div className="grid gap-8 px-7 py-9 md:px-10 md:py-11 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="max-w-2xl">
                <div className="mb-5 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#dfe5df]">
                    {planDisplayName}
                  </span>

                  <span className="rounded-full border border-[#718d4f]/30 bg-[#718d4f]/15 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#b8cb9e]">
                    {householdRoleLabel}
                  </span>

                  {householdViewerMode ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#f2f4ef]">
                      <ShieldCheck size={12} />
                      Read only
                    </span>
                  ) : null}
                </div>

                <h1 className="font-serif text-4xl font-medium tracking-[-0.045em] text-[#f8f5ef] md:text-5xl">
                  {household.name}
                </h1>

                <p className="mt-5 max-w-xl text-base leading-7 text-[#c2cbd1]">
                  {householdViewerMode
                    ? "You’re viewing this shared home. Rooms, devices, records, warranties, and household details are ready whenever you need them."
                    : householdMemberMode
                      ? "A shared place for everyone helping keep this home organized, current, and remembered."
                      : "One shared place for the people you trust to help keep your home organized."}
                </p>

                <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-[#d6dcd9]">
                  <span>
                    {members.length}{" "}
                    {members.length === 1 ? "person" : "people"}
                  </span>

                  {householdManagerMode ? (
                    <>
                      <span
                        aria-hidden="true"
                        className="h-1 w-1 rounded-full bg-[#718d4f]"
                      />

                      <span>
                        {availableSeats}{" "}
                        {availableSeats === 1 ? "spot" : "spots"} available
                      </span>
                    </>
                  ) : null}

                  <span
                    aria-hidden="true"
                    className="h-1 w-1 rounded-full bg-[#718d4f]"
                  />

                  <span>
                    {householdViewerMode
                      ? "View access"
                      : householdMemberMode
                        ? "Shared access"
                        : "Private by default"}
                  </span>
                </div>
              </div>

              {canInviteHouseholdMember && availableSeats > 0 ? (
                <Button
                  variant="secondary"
                  onClick={() => setShowInviteForm(true)}
                >
                  <Plus size={16} />
                  Invite Someone
                </Button>
              ) : null}
            </div>
          </section>

          {/* PEOPLE */}
          <section className="py-5 md:py-7">
            <div className="border-b border-[#182533]/10 pb-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#718d4f]">
                People in your household
              </p>

              <h2 className="mt-2 font-serif text-3xl font-medium tracking-[-0.04em] text-[#17212a]">
                Shared with
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#68737b]">
                {householdViewerMode
                  ? "The people who share access to this home."
                  : "The people who can open and help organize this home’s Vault."}
              </p>
            </div>

            <div className="mt-5 space-y-3">
              {members.map((member) => (
                <MemberRow
                  key={member.id}
                  member={member}
                  currentUserId={user?.id || ""}
                  canManage={canManageHouseholdAccess}
                  updating={updatingMemberId === member.id}
                  removing={removingMemberId === member.id}
                  onRoleChange={(role) => updateMemberRole(member, role)}
                  onRemove={() => removeMember(member)}
                />
              ))}
            </div>
          </section>

          {/* SHARED HOME RECORDS */}
          <section className="border-t border-[#182533]/10 py-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#718d4f]">
                  Shared home records
                </p>

                <h2 className="mt-2 font-serif text-3xl font-medium tracking-[-0.04em] text-[#17212a]">
                  The paperwork behind the home.
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#68737b]">
                  {householdViewerMode
                    ? "Browse the records, reports, and warranty information shared with this household."
                    : "Keep the documents, insurance details, and warranty history behind this home easy to find."}
                </p>
              </div>

              {householdViewerMode ? (
                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#182533]/5 px-3 py-2 text-xs font-semibold text-[#68737b]">
                  <ShieldCheck size={14} />
                  Read-only access
                </span>
              ) : null}
            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-3">
              <HouseholdResourceCard
                href="/documents"
                icon="records"
                eyebrow="Records"
                title="Home Records"
                description={
                  householdViewerMode
                    ? "View shared receipts, manuals, policies, invoices, and important home documents."
                    : "Keep receipts, manuals, policies, invoices, and important home documents together."
                }
                action={householdViewerMode ? "View Records" : "Open Records"}
              />

              <HouseholdResourceCard
                href="/reports"
                icon="insurance"
                eyebrow="Insurance"
                title="Insurance Reports"
                description="Create or review claim-ready home inventory information with documented devices, value, and supporting records."
                action={householdViewerMode ? "View Reports" : "Open Reports"}
              />

              <HouseholdResourceCard
                href="/warranties"
                icon="warranties"
                eyebrow="Coverage"
                title="Warranties"
                description={
                  householdViewerMode
                    ? "Review shared warranty coverage, expiration dates, and documented purchase information."
                    : "Track warranty coverage, expiration dates, and the purchase information behind your devices."
                }
                action={
                  householdViewerMode ? "View Warranties" : "Open Warranties"
                }
              />
            </div>
          </section>

          {/* OWNER / ADMIN EXPERIENCE */}
          {householdManagerMode ? (
            <>
              <section className="grid gap-10 border-t border-[#182533]/10 py-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#718d4f]">
                    Invitations
                  </p>

                  <h2 className="mt-2 font-serif text-2xl font-medium tracking-[-0.035em] text-[#17212a]">
                    Waiting to join
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-[#68737b]">
                    Invitations stay here until they&apos;re accepted or
                    removed.
                  </p>

                  {invitations.length === 0 ? (
                    <div className="mt-6 rounded-[24px] border border-[#182533]/8 bg-[#f8f5ef] p-5">
                      <p className="font-serif text-lg text-[#17212a]">
                        Everyone&apos;s here.
                      </p>

                      <p className="mt-1 text-sm leading-6 text-[#7a858d]">
                        There are no outstanding household invitations.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-6 space-y-3">
                      {invitations.map((invitation) => (
                        <InvitationRow
                          key={invitation.id}
                          invitation={invitation}
                          canManage={canManageHouseholdAccess}
                          canceling={cancelingInvitationId === invitation.id}
                          onCopy={() => copyInvitationLink(invitation)}
                          onCancel={() => cancelInvitation(invitation)}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-[28px] bg-[#eee9df]/65 p-7 md:p-8">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#617c43]/10 text-[#617c43]">
                    <ShieldCheck size={20} />
                  </div>

                  <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#718d4f]">
                    Household management
                  </p>

                  <h2 className="mt-2 max-w-lg font-serif text-2xl font-medium tracking-[-0.035em] text-[#17212a]">
                    You decide who belongs here.
                  </h2>

                  <p className="mt-4 max-w-xl text-sm leading-7 text-[#68737b]">
                    Invite people you trust, choose how much access they
                    receive, and manage who shares this home.
                  </p>

                  <div className="mt-7 border-t border-[#182533]/10 pt-6">
                    <p className="text-xs font-semibold text-[#17212a]">
                      {ownerMember?.fullName || "Household owner"}
                    </p>

                    <p className="mt-1 text-sm text-[#7a858d]">
                      Household owner
                    </p>

                    <p className="mt-4 text-xs text-[#8a949b]">
                      Household created {formatDate(household.created_at)}
                    </p>
                  </div>
                </div>
              </section>

              <section className="border-t border-[#182533]/10 py-8">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#718d4f]">
                  Access levels
                </p>

                <h2 className="mt-2 font-serif text-xl font-medium tracking-[-0.03em] text-[#17212a]">
                  Choose how much access each person gets.
                </h2>

                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                  <HouseholdRoleCard
                    title="Owner"
                    description="Full household control, including invitations, roles, and billing."
                  />

                  <HouseholdRoleCard
                    title="Admin"
                    description="Can manage the shared Vault and household members."
                  />

                  <HouseholdRoleCard
                    title="Member"
                    description="Can view, add, and update shared household information."
                  />

                  <HouseholdRoleCard
                    title="Viewer"
                    description="Can browse household information without making changes."
                  />
                </div>
              </section>
            </>
          ) : null}

          {/* MEMBER EXPERIENCE */}
          {householdMemberMode ? (
            <section className="border-t border-[#182533]/10 py-8">
              <div className="grid overflow-hidden rounded-[30px] border border-[#182533]/8 bg-[#f8f5ef] lg:grid-cols-[0.9fr_1.1fr]">
                <div className="bg-[#183047] p-7 text-[#f8f5ef] md:p-9">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#718d4f]/25 bg-[#718d4f]/10 text-[#9db47e]">
                    <Users size={20} />
                  </div>

                  <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9db47e]">
                    Family Member
                  </p>

                  <h2 className="mt-3 max-w-md font-serif text-3xl font-medium tracking-[-0.04em] text-[#f8f5ef]">
                    Help keep this home remembered.
                  </h2>

                  <p className="mt-4 max-w-md text-sm leading-7 text-[#c2cbd1]">
                    You can help keep rooms, devices, records, warranties, and
                    other shared home information current.
                  </p>
                </div>

                <div className="p-7 md:p-9">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#718d4f]">
                    Your access
                  </p>

                  <div className="mt-5 space-y-5">
                    <HouseholdAccessItem
                      allowed
                      title="Rooms"
                      description="Browse and organize shared rooms."
                    />

                    <HouseholdAccessItem
                      allowed
                      title="Devices"
                      description="Add and update shared devices."
                    />

                    <HouseholdAccessItem
                      allowed
                      title="Records"
                      description="Help keep records, warranties, and documents current."
                    />

                    <HouseholdAccessItem
                      allowed
                      title="Make changes"
                      description="Update shared household content."
                    />

                    <HouseholdAccessItem
                      allowed={false}
                      title="Manage household"
                      description="Invitations, member roles, and billing stay with the household admin."
                    />
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          {/* VIEWER EXPERIENCE */}
          {householdViewerMode ? (
            <section className="border-t border-[#182533]/10 py-8">
              <div className="grid overflow-hidden rounded-[30px] border border-[#182533]/8 bg-[#f8f5ef] lg:grid-cols-[0.9fr_1.1fr]">
                <div className="bg-[#183047] p-7 text-[#f8f5ef] md:p-9">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#718d4f]/25 bg-[#718d4f]/10 text-[#9db47e]">
                    <ShieldCheck size={20} />
                  </div>

                  <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9db47e]">
                    Read-only household
                  </p>

                  <h2 className="mt-3 max-w-md font-serif text-3xl font-medium tracking-[-0.04em] text-[#f8f5ef]">
                    Everything is here when you need it.
                  </h2>

                  <p className="mt-4 max-w-md text-sm leading-7 text-[#c2cbd1]">
                    Browse the shared home without worrying about accidentally
                    changing anything.
                  </p>
                </div>

                <div className="p-7 md:p-9">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#718d4f]">
                    Your access
                  </p>

                  <div className="mt-5 space-y-5">
                    <HouseholdAccessItem
                      allowed
                      title="Rooms"
                      description="Browse every shared room."
                    />

                    <HouseholdAccessItem
                      allowed
                      title="Devices"
                      description="View shared device details."
                    />

                    <HouseholdAccessItem
                      allowed
                      title="Records"
                      description="Open shared records, warranties, and documents."
                    />

                    <HouseholdAccessItem
                      allowed={false}
                      title="Make changes"
                      description="Editing is handled by a household member or admin."
                    />

                    <HouseholdAccessItem
                      allowed={false}
                      title="Manage household"
                      description="Invitations, roles, and billing are handled by the household admin."
                    />
                  </div>
                </div>
              </div>
            </section>
          ) : null}
        </>
      )}

      {showInviteForm &&
        household &&
        canInviteHouseholdMember &&
        !isClientVaultMode && (
          <InviteModal
            form={inviteForm}
            setForm={setInviteForm}
            sending={sendingInvitation}
            availableSeats={availableSeats}
            onClose={() => {
              setShowInviteForm(false);
              setInviteForm(initialInviteForm);
            }}
            onSubmit={sendInvitation}
          />
        )}
    </PageShell>
  );
}

function CreateHouseholdCard({
  householdName,
  setHouseholdName,
  creating,
  onSubmit,
}: {
  householdName: string;
  setHouseholdName: (value: string) => void;
  creating: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <PageCard className="overflow-hidden p-0">
      <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
        <div className="bg-[#183047] p-8 text-[#f5f1e8] md:p-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#718d4f]/25 bg-[#718d4f]/10 text-[#718d4f]">
            <Home size={26} />
          </div>

          <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#718d4f]">
            Get Started
          </p>

          <h2 className="mt-3 font-serif text-3xl font-medium tracking-[-0.04em] text-[#f5f1e8]">
            Create your household.
          </h2>

          <p className="mt-4 text-sm leading-7 !text-[#b6c0c7]">
            Your household is the shared space where family members will access
            devices, documents, warranties, and other home technology
            information.
          </p>
        </div>

        <form onSubmit={onSubmit} className="p-8 md:p-10">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#17212a]">
              Household name
            </span>

            <input
              type="text"
              value={householdName}
              onChange={(event) => setHouseholdName(event.target.value)}
              placeholder="My Household"
              maxLength={100}
              required
              className="w-full rounded-xl border border-[#182533]/10 bg-[#eee9df]/50 px-4 py-3.5 text-[#17212a] outline-none transition focus:border-[#617c43]/40 focus:bg-[#f8f5ef] focus:ring-4 focus:ring-[#617c43]/10"
            />
          </label>

          <p className="mt-3 text-sm leading-6 text-text-secondary">
            You can use your family name, street name, or anything that feels
            personal.
          </p>

          <Button type="submit" disabled={creating} className="mt-6">
            {creating ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <Plus size={17} />
            )}

            {creating ? "Creating..." : "Create Household"}
          </Button>
        </form>
      </div>
    </PageCard>
  );
}

function HouseholdResourceCard({
  href,
  icon,
  eyebrow,
  title,
  description,
  action,
}: {
  href: string;
  icon: "records" | "insurance" | "warranties";
  eyebrow: string;
  title: string;
  description: string;
  action: string;
}) {
  const Icon =
    icon === "insurance" ? ShieldCheck : icon === "warranties" ? Clock3 : Mail;

  return (
    <a
      href={href}
      className="group flex min-h-[250px] flex-col rounded-[26px] border border-[#182533]/8 bg-[#f8f5ef] p-6 transition duration-200 hover:-translate-y-0.5 hover:border-[#617c43]/25 hover:shadow-[0_22px_55px_-42px_rgba(15,25,35,0.65)]"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#617c43]/10 text-[#617c43] transition group-hover:bg-[#617c43] group-hover:text-white">
        <Icon size={19} />
      </div>

      <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#718d4f]">
        {eyebrow}
      </p>

      <h3 className="mt-2 font-serif text-2xl font-medium tracking-[-0.035em] text-[#17212a]">
        {title}
      </h3>

      <p className="mt-3 flex-1 text-sm leading-6 text-[#68737b]">
        {description}
      </p>

      <div className="mt-6 flex items-center justify-between border-t border-[#182533]/8 pt-4">
        <span className="text-xs font-semibold text-[#17212a]">{action}</span>

        <span
          aria-hidden="true"
          className="text-lg text-[#718d4f] transition-transform group-hover:translate-x-1"
        >
          →
        </span>
      </div>
    </a>
  );
}

function HouseholdAccessItem({
  allowed,
  title,
  description,
}: {
  allowed: boolean;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={[
          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
          allowed
            ? "bg-[#617c43]/10 text-[#617c43]"
            : "bg-[#182533]/5 text-[#8a949b]",
        ].join(" ")}
      >
        {allowed ? <CheckCircle2 size={14} /> : <ShieldCheck size={14} />}
      </div>

      <div>
        <p className="text-sm font-semibold text-[#17212a]">{title}</p>

        <p className="mt-1 text-xs leading-5 text-[#68737b]">{description}</p>
      </div>
    </div>
  );
}

function HouseholdRoleCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[22px] border border-[#182533]/8 bg-[#f8f5ef] p-5">
      <p className="font-semibold text-[#17212a]">{title}</p>

      <p className="mt-2 text-sm leading-6 text-[#68737b]">{description}</p>
    </div>
  );
}

function MemberRow({
  member,
  currentUserId,
  canManage,
  updating,
  removing,
  onRoleChange,
  onRemove,
}: {
  member: HouseholdMember;
  currentUserId: string;
  canManage: boolean;
  updating: boolean;
  removing: boolean;
  onRoleChange: (role: Exclude<HouseholdRole, "owner">) => void;
  onRemove: () => void;
}) {
  const initials = member.fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name[0]?.toUpperCase())
    .join("");

  const isCurrentUser = member.user_id === currentUserId;

  const roleDescription =
    member.role === "owner"
      ? "Keeps the household organized"
      : member.role === "admin"
        ? "Can help manage the shared Vault"
        : member.role === "member"
          ? "Can add and update shared information"
          : "Can view shared household information";

  return (
    <article className="group overflow-hidden rounded-[28px] border border-[#182533]/8 bg-[#f8f5ef] transition duration-200 hover:border-[#617c43]/20 hover:shadow-[0_18px_45px_-38px_rgba(15,25,35,0.55)]">
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
        <div className="flex min-w-0 items-center gap-4">
          <div className="relative shrink-0">
            {member.avatarUrl ? (
              <img
                src={member.avatarUrl}
                alt={member.fullName}
                className="h-14 w-14 rounded-full object-cover ring-4 ring-[#eee9df]"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#617c43] font-serif text-base font-medium text-white ring-4 ring-[#eee9df]">
                {initials || "HT"}
              </div>
            )}

            {member.role === "owner" && (
              <span
                aria-label="Household owner"
                className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#f8f5ef] bg-[#b58a42] text-white"
              >
                <Crown size={12} />
              </span>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate font-serif text-lg font-medium tracking-[-0.02em] text-[#17212a]">
                {member.fullName}
              </p>

              {isCurrentUser && (
                <span className="rounded-full bg-[#617c43]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#617c43]">
                  You
                </span>
              )}
            </div>

            <p className="mt-1 text-sm leading-5 text-[#68737b]">
              {roleDescription}
            </p>

            <p className="mt-2 text-xs text-[#9aa2a7]">
              Joined {formatDate(member.joined_at)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {member.role === "owner" ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-[#b58a42]/10 px-3 py-2 text-xs font-semibold text-[#916c31]">
              <Crown size={14} />
              Owner
            </span>
          ) : canManage ? (
            <label className="relative">
              <span className="sr-only">
                Change access for {member.fullName}
              </span>

              <select
                value={member.role}
                disabled={updating}
                onChange={(event) =>
                  onRoleChange(
                    event.target.value as Exclude<HouseholdRole, "owner">,
                  )
                }
                className="appearance-none rounded-full border border-[#182533]/10 bg-[#eee9df]/65 py-2 pl-4 pr-9 text-xs font-semibold text-[#17212a] outline-none transition hover:border-[#617c43]/25 focus:border-[#617c43]/40 disabled:opacity-50"
              >
                <option value="admin">Admin</option>
                <option value="member">Member</option>
                <option value="viewer">View only</option>
              </select>

              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#7a858d]"
              >
                ▾
              </span>
            </label>
          ) : (
            <span className="rounded-full bg-[#182533]/5 px-3 py-2 text-xs font-semibold text-[#68737b]">
              {member.role === "viewer" ? "View only" : formatRole(member.role)}
            </span>
          )}

          {updating && (
            <Loader2 size={16} className="animate-spin text-[#718d4f]" />
          )}

          {canManage && member.role !== "owner" && (
            <button
              type="button"
              onClick={onRemove}
              disabled={removing}
              aria-label={`Remove ${member.fullName} from household`}
              title={`Remove ${member.fullName}`}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#9a6b64] transition hover:bg-[#a6584e]/10 hover:text-[#984e46] disabled:opacity-50"
            >
              {removing ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Trash2 size={15} />
              )}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function InvitationRow({
  invitation,
  canManage,
  canceling,
  onCopy,
  onCancel,
}: {
  invitation: HouseholdInvitation;
  canManage: boolean;
  canceling: boolean;
  onCopy: () => void;
  onCancel: () => void;
}) {
  const expired = new Date(invitation.expires_at).getTime() < Date.now();

  return (
    <div className="rounded-[22px] border border-[#182533]/8 bg-[#eee9df]/55 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-serif font-medium text-[#17212a]">
            {invitation.email}
          </p>

          <p className="mt-1 text-xs text-[#8a949b]">
            {formatRole(invitation.role)} ·{" "}
            {expired
              ? "Expired"
              : `Expires ${formatDate(invitation.expires_at)}`}
          </p>
        </div>

        {canManage && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCopy}
              disabled={expired}
              aria-label={`Copy invitation link for ${invitation.email}`}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#617c43]/15 bg-[#f8f5ef] text-[#617c43] transition hover:bg-[#617c43] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Copy size={15} />
            </button>

            <button
              type="button"
              onClick={onCancel}
              disabled={canceling}
              aria-label={`Cancel invitation for ${invitation.email}`}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#a6584e]/15 bg-[#f8f5ef] text-[#984e46] transition hover:bg-[#a6584e] hover:text-white disabled:opacity-50"
            >
              {canceling ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <X size={16} />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function InviteModal({
  form,
  setForm,
  sending,
  availableSeats,
  onClose,
  onSubmit,
}: {
  form: InviteForm;
  setForm: (form: InviteForm) => void;
  sending: boolean;
  availableSeats: number;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#07101a]/65 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[28px] border border-[#182533]/10 bg-[#f8f5ef] shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#182533]/10 p-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#718d4f]">
              Household Access
            </p>

            <h2 className="mt-2 font-serif text-2xl font-medium tracking-[-0.035em] text-[#17212a]">
              Invite someone
            </h2>

            <p className="mt-2 text-sm text-text-secondary">
              {availableSeats} {availableSeats === 1 ? "seat" : "seats"}{" "}
              remaining.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close invitation form"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eee9df] text-[#17212a] transition hover:bg-[#e5dfd4]"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit(event);
          }}
          className="space-y-5 p-6"
        >
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#17212a]">
              Email address
            </span>

            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm({
                  ...form,
                  email: event.target.value,
                })
              }
              placeholder="name@example.com"
              required
              className="w-full rounded-xl border border-[#182533]/10 bg-[#eee9df]/50 px-4 py-3.5 text-[#17212a] outline-none focus:border-[#617c43]/40 focus:bg-[#f8f5ef] focus:ring-4 focus:ring-[#617c43]/10"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#17212a]">
              Role
            </span>

            <select
              value={form.role}
              onChange={(event) =>
                setForm({
                  ...form,
                  role: event.target.value as InviteForm["role"],
                })
              }
              className="w-full rounded-xl border border-[#182533]/10 bg-[#eee9df]/50 px-4 py-3.5 text-[#17212a] outline-none focus:border-[#617c43]/40"
            >
              <option value="admin">Admin</option>

              <option value="member">Member</option>

              <option value="viewer">Viewer</option>
            </select>
          </label>

          <RoleExplanation role={form.role} />

          <button
            type="submit"
            disabled={sending || availableSeats <= 0}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#617c43] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#718d4f] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <UserPlus size={17} />
            )}

            {sending ? "Creating Invite..." : "Create Invitation"}
          </button>
        </form>
      </div>
    </div>
  );
}

function RoleExplanation({ role }: { role: InviteForm["role"] }) {
  const descriptions = {
    admin:
      "Can manage shared vault information and help organize the household.",
    member: "Can view, add, and update shared household information.",
    viewer: "Can view shared information but cannot make changes.",
  };

  return (
    <div className="flex items-start gap-3 rounded-[22px] border border-[#617c43]/12 bg-[#617c43]/[0.06] p-4">
      <UserCog size={18} className="mt-0.5 shrink-0 text-[#617c43]" />

      <p className="text-sm leading-6 text-text-secondary">
        {descriptions[role]}
      </p>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: FamilyIcon;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <PageCard className="border-[#182533]/10 bg-[#f8f5ef] p-5 shadow-[0_16px_40px_-34px_rgba(15,25,35,0.45)] md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-[#68737b]">{label}</p>

          <p className="mt-2 truncate font-serif text-2xl font-medium tracking-[-0.035em] text-[#17212a] md:text-3xl">
            {value}
          </p>

          <p className="mt-2 text-xs text-[#8a949b]">{description}</p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#617c43]/15 bg-[#617c43]/10 text-[#617c43]">
          <Icon size={20} />
        </div>
      </div>
    </PageCard>
  );
}

function RoleCard({
  role,
  description,
}: {
  role: string;
  description: string;
}) {
  return (
    <div className="rounded-[22px] border border-[#182533]/8 bg-[#eee9df]/55 p-5">
      <p className="font-serif font-medium text-[#17212a]">{role}</p>

      <p className="mt-2 text-sm leading-6 text-[#68737b]">{description}</p>
    </div>
  );
}

function formatRole(role: HouseholdRole) {
  return role
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
