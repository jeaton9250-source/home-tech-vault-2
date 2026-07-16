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
import { useDemoMode } from "@/hooks/useDemoMode";
import { useSubscription } from "@/hooks/useSubscription";

import PageShell from "@/components/ui/PageShell";
import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";

type HouseholdRole =
  | "owner"
  | "admin"
  | "member"
  | "viewer";

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

type HouseholdMember =
  HouseholdMemberRow & {
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
  role: Exclude<
    HouseholdRole,
    "owner"
  >;
};

const initialInviteForm: InviteForm = {
  email: "",
  role: "member",
};

const demoHousehold: Household = {
  id: "demo-household",
  owner_id: "demo-owner",
  name: "The Demo Household",
  created_at:
    new Date().toISOString(),
  updated_at:
    new Date().toISOString(),
};

const demoMembers: HouseholdMember[] =
  [
    {
      id: "demo-member-1",
      household_id:
        "demo-household",
      user_id: "demo-owner",
      role: "owner",
      invited_by: "demo-owner",
      joined_at:
        new Date().toISOString(),
      updated_at:
        new Date().toISOString(),
      fullName: "Jason Eaton",
      avatarUrl: null,
    },
    {
      id: "demo-member-2",
      household_id:
        "demo-household",
      user_id: "demo-admin",
      role: "admin",
      invited_by: "demo-owner",
      joined_at: new Date(
        Date.now() -
          10 *
            24 *
            60 *
            60 *
            1000
      ).toISOString(),
      updated_at:
        new Date().toISOString(),
      fullName: "Alex Morgan",
      avatarUrl: null,
    },
    {
      id: "demo-member-3",
      household_id:
        "demo-household",
      user_id: "demo-viewer",
      role: "viewer",
      invited_by: "demo-owner",
      joined_at: new Date(
        Date.now() -
          5 *
            24 *
            60 *
            60 *
            1000
      ).toISOString(),
      updated_at:
        new Date().toISOString(),
      fullName: "Taylor Morgan",
      avatarUrl: null,
    },
  ];

const demoInvitations: HouseholdInvitation[] =
  [
    {
      id: "demo-invitation-1",
      household_id:
        "demo-household",
      email:
        "family@example.com",
      role: "member",
      token: "demo-token",
      invited_by: "demo-owner",
      accepted_by: null,
      accepted_at: null,
      expires_at: new Date(
        Date.now() +
          6 *
            24 *
            60 *
            60 *
            1000
      ).toISOString(),
      created_at:
        new Date().toISOString(),
    },
  ];

export default function FamilyPage() {
  const {
    user,
    isDemo,
    loading: demoLoading,
  } = useDemoMode();

  const {
    loading:
      subscriptionLoading,
    canUseFamilySharing,
    familyMemberLimit,
    isAdmin,
  } = useSubscription();

  const [
    household,
    setHousehold,
  ] =
    useState<Household | null>(
      null
    );

  const [members, setMembers] =
    useState<
      HouseholdMember[]
    >([]);

  const [
    invitations,
    setInvitations,
  ] = useState<
    HouseholdInvitation[]
  >([]);

  const [
    currentRole,
    setCurrentRole,
  ] =
    useState<HouseholdRole | null>(
      null
    );

  const [
    loadingFamily,
    setLoadingFamily,
  ] = useState(true);

  const [
    creatingHousehold,
    setCreatingHousehold,
  ] = useState(false);

  const [
    sendingInvitation,
    setSendingInvitation,
  ] = useState(false);

  const [
    updatingMemberId,
    setUpdatingMemberId,
  ] =
    useState<string | null>(
      null
    );

  const [
    removingMemberId,
    setRemovingMemberId,
  ] =
    useState<string | null>(
      null
    );

  const [
    cancelingInvitationId,
    setCancelingInvitationId,
  ] =
    useState<string | null>(
      null
    );

  const [
    showInviteForm,
    setShowInviteForm,
  ] = useState(false);

  const [
    householdName,
    setHouseholdName,
  ] = useState("");

  const [
    inviteForm,
    setInviteForm,
  ] =
    useState<InviteForm>(
      initialInviteForm
    );

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const loadFamilyData =
    useCallback(async () => {
      if (
        demoLoading ||
        subscriptionLoading
      ) {
        return;
      }

      try {
        setLoadingFamily(true);
        setErrorMessage("");

        if (isDemo) {
          setHousehold(
            demoHousehold
          );
          setMembers(demoMembers);
          setInvitations(
            demoInvitations
          );
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

        const {
          data:
            membershipData,
          error:
            membershipError,
        } = await supabase
          .from(
            "household_members"
          )
          .select(
            `
              id,
              household_id,
              user_id,
              role,
              invited_by,
              joined_at,
              updated_at
            `
          )
          .eq(
            "user_id",
            user.id
          )
          .limit(1)
          .maybeSingle();

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

        const membership =
          membershipData as HouseholdMemberRow;

        const [
          householdResult,
          membersResult,
          invitationsResult,
        ] = await Promise.all([
          supabase
            .from("households")
            .select("*")
            .eq(
              "id",
              membership.household_id
            )
            .maybeSingle(),

          supabase
            .from(
              "household_members"
            )
            .select(
              `
                id,
                household_id,
                user_id,
                role,
                invited_by,
                joined_at,
                updated_at
              `
            )
            .eq(
              "household_id",
              membership.household_id
            )
            .order("joined_at", {
              ascending: true,
            }),

          supabase
            .from(
              "household_invitations"
            )
            .select("*")
            .eq(
              "household_id",
              membership.household_id
            )
            .is(
              "accepted_at",
              null
            )
            .order(
              "created_at",
              {
                ascending: false,
              }
            ),
        ]);

        if (
          householdResult.error
        ) {
          throw householdResult.error;
        }

        if (
          membersResult.error
        ) {
          throw membersResult.error;
        }

        if (
          invitationsResult.error
        ) {
          console.error(
            "Unable to load household invitations:",
            invitationsResult.error
          );
        }

        const loadedMemberRows =
          (membersResult.data ||
            []) as HouseholdMemberRow[];

        const memberUserIds =
          loadedMemberRows.map(
            (member) =>
              member.user_id
          );

        let profiles: ProfileRow[] =
          [];

        if (
          memberUserIds.length >
          0
        ) {
          const {
            data: profileData,
            error: profileError,
          } = await supabase
            .from("profiles")
            .select(
              "id, full_name, avatar_url"
            )
            .in(
              "id",
              memberUserIds
            );

          if (profileError) {
            console.error(
              "Unable to load household profiles:",
              profileError
            );
          } else {
            profiles =
              (profileData ||
                []) as ProfileRow[];
          }
        }

        const profileMap =
          new Map(
            profiles.map(
              (profile) => [
                profile.id,
                profile,
              ]
            )
          );

        const loadedMembers =
          loadedMemberRows.map(
            (member) => {
              const profile =
                profileMap.get(
                  member.user_id
                );

              return {
                ...member,
                fullName:
                  profile?.full_name?.trim() ||
                  (member.user_id ===
                  user.id
                    ? user.email?.split(
                        "@"
                      )[0] ||
                      "You"
                    : "Household Member"),
                avatarUrl:
                  profile?.avatar_url ||
                  null,
              };
            }
          );

        setHousehold(
          (householdResult.data as Household) ||
            null
        );

        setMembers(
          loadedMembers
        );

        setInvitations(
          (invitationsResult.data ||
            []) as HouseholdInvitation[]
        );

        setCurrentRole(
          membership.role
        );
      } catch (error: unknown) {
        const possibleError =
          error as {
            message?: string;
            details?: string;
          };

        console.error(
          "Family Sharing loading error:",
          error
        );

        setErrorMessage(
          possibleError.message ||
            possibleError.details ||
            "Unable to load Family Sharing."
        );
      } finally {
        setLoadingFamily(false);
      }
    }, [
      user,
      isDemo,
      demoLoading,
      subscriptionLoading,
    ]);

  useEffect(() => {
    void loadFamilyData();
  }, [loadFamilyData]);

  const memberLimit =
    familyMemberLimit > 0
      ? familyMemberLimit
      : 6;

  const occupiedSeats =
    members.length +
    invitations.length;

  const availableSeats =
    Math.max(
      memberLimit -
        occupiedSeats,
      0
    );

  const isOwner =
    currentRole === "owner";

  const isHouseholdManager =
    currentRole === "owner" ||
    currentRole === "admin";

  const canManageSharing =
    isAdmin ||
    (canUseFamilySharing &&
      isHouseholdManager);

  const canCreateHousehold =
    isAdmin ||
    canUseFamilySharing;

  const hasHouseholdMembership =
    Boolean(
      household &&
        currentRole
    );

  const loading =
    demoLoading ||
    subscriptionLoading ||
    loadingFamily;

  const ownerMember =
    useMemo(
      () =>
        members.find(
          (member) =>
            member.role ===
            "owner"
        ) || null,
      [members]
    );

  async function createHousehold(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isDemo) {
      window.location.href =
        "/signup";
      return;
    }

    if (!user) {
      setErrorMessage(
        "Please sign in to create a household."
      );
      return;
    }

    if (
      !canCreateHousehold
    ) {
      window.location.href =
        "/upgrade";
      return;
    }

    const name =
      householdName.trim();

    if (!name) {
      setErrorMessage(
        "Please enter a household name."
      );
      return;
    }

    try {
      setCreatingHousehold(
        true
      );

      setSuccessMessage("");
      setErrorMessage("");

      const { error } = await supabase
        .from("households")
        .insert({
          owner_id: user.id,
          name,
        });

      if (error) {
        throw error;
      }

      setHouseholdName("");

      setSuccessMessage(
        "Your household was created successfully."
      );

      await loadFamilyData();
    } catch (error: unknown) {
      const possibleError =
        error as {
          message?: string;
          details?: string;
        };

      console.error(
        "Unable to create household:",
        error
      );

      setErrorMessage(
        possibleError.message ||
          possibleError.details ||
          "Unable to create your household."
      );
    } finally {
      setCreatingHousehold(
        false
      );
    }
  }

async function sendInvitation(
    event: FormEvent<HTMLFormElement>
  ) {
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

    if (!canManageSharing) {
      console.error(
        "[Family Invite] Stopped: User cannot manage sharing",
        {
          userId: user.id,
          householdId: household.id,
          canManageSharing,
        }
      );

      window.location.href = "/upgrade";
      return;
    }

    const email = inviteForm.email
      .trim()
      .toLowerCase();

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
        `Your household has reached its ${memberLimit}-member limit.`
      );

      return;
    }

    if (email === user.email?.trim().toLowerCase()) {
      console.error(
        "[Family Invite] Stopped: Owner attempted to invite themselves"
      );

      setErrorMessage(
        "You are already the household owner."
      );

      return;
    }

    const invitationAlreadyExists =
      invitations.some(
        (invitation) =>
          invitation.email
            .trim()
            .toLowerCase() === email
      );

    if (invitationAlreadyExists) {
      console.error(
        "[Family Invite] Stopped: Pending invitation already exists",
        { email }
      );

      setErrorMessage(
        "A pending invitation already exists for this email."
      );

      return;
    }

    try {
      setSendingInvitation(true);
      setSuccessMessage("");
      setErrorMessage("");

      console.log(
        "[Family Invite] Step 3: Creating invitation record"
      );

      const {
        data: createdInvitation,
        error: invitationError,
      } = await supabase
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
          invitationError
        );

        throw invitationError;
      }

      if (!createdInvitation) {
        throw new Error(
          "The invitation was created, but no invitation record was returned."
        );
      }

      const invitation =
        createdInvitation as HouseholdInvitation;

      console.log(
        "[Family Invite] Step 4: Invitation record created",
        {
          invitationId: invitation.id,
          invitationEmail: invitation.email,
        }
      );

      setInvitations((current) => [
        invitation,
        ...current,
      ]);

      alert(
        `Invitation created. Calling email function now.\n\nInvitation ID: ${invitation.id}`
      );

      console.log(
        "[Family Invite] Step 5: Calling send-family-invite Edge Function",
        {
          invitationId: invitation.id,
        }
      );

      const {
        data: emailResult,
        error: emailError,
      } = await supabase.functions.invoke(
        "send-family-invite",
        {
          body: {
            invitationId: invitation.id,
          },
        }
      );

      console.log(
        "[Family Invite] Step 6: Edge Function response received",
        {
          emailResult,
          emailError,
        }
      );

      setInviteForm(initialInviteForm);
      setShowInviteForm(false);

      if (emailError) {
        console.error(
          "[Family Invite] Edge Function returned an error",
          emailError
        );

        let detailedMessage =
          emailError.message ||
          "Unable to send the invitation email.";

        try {
          const context =
            "context" in emailError
              ? emailError.context
              : null;

          if (
            context &&
            typeof context.json === "function"
          ) {
            const errorBody =
              await context.json();

            console.error(
              "[Family Invite] Edge Function error body",
              errorBody
            );

            detailedMessage =
              errorBody?.error ||
              errorBody?.message ||
              detailedMessage;
          }
        } catch (contextError) {
          console.error(
            "[Family Invite] Could not read Edge Function error body",
            contextError
          );
        }

        setSuccessMessage(
          `Invitation created for ${email}.`
        );

        setErrorMessage(
          `The email was not sent: ${detailedMessage}`
        );

        return;
      }

      if (emailResult?.success !== true) {
        console.error(
          "[Family Invite] Edge Function returned an unsuccessful response",
          emailResult
        );

        setSuccessMessage(
          `Invitation created for ${email}.`
        );

        setErrorMessage(
          emailResult?.error ||
            "The email service returned an unexpected response."
        );

        return;
      }

      console.log(
        "[Family Invite] Step 7: Invitation email sent successfully",
        emailResult
      );

      setSuccessMessage(
        `Invitation emailed successfully to ${email}.`
      );
    } catch (error: unknown) {
      const possibleError =
        error as {
          message?: string;
          details?: string;
          hint?: string;
          code?: string;
        };

      console.error(
        "[Family Invite] Invitation process failed",
        error
      );

      setErrorMessage(
        possibleError.message ||
          possibleError.details ||
          possibleError.hint ||
          "Unable to create the invitation."
      );
    } finally {
      console.log(
        "[Family Invite] Process finished"
      );

      setSendingInvitation(false);
    }
  }

    async function copyInvitationLink(
    invitation: HouseholdInvitation
  ) {
    if (isDemo) {
      window.location.href =
        "/signup";
      return;
    }

    const invitationUrl =
      `${window.location.origin}/family/accept/` +
      invitation.token;

    try {
      await navigator.clipboard.writeText(
        invitationUrl
      );

      setSuccessMessage(
        `Invitation link copied for ${invitation.email}.`
      );

      setErrorMessage("");
    } catch (error) {
      console.error(
        "Unable to copy invitation link:",
        error
      );

      setErrorMessage(
        "Unable to copy the invitation link."
      );
    }
  }

  async function updateMemberRole(
    member: HouseholdMember,
    role: Exclude<
      HouseholdRole,
      "owner"
    >
  ) {
    if (isDemo) {
      window.location.href =
        "/signup";
      return;
    }

    if (
      !canManageSharing
    ) {
      return;
    }

    if (
      member.role === "owner"
    ) {
      setErrorMessage(
        "The household owner’s role cannot be changed."
      );
      return;
    }

    try {
      setUpdatingMemberId(
        member.id
      );

      setSuccessMessage("");
      setErrorMessage("");

      const { error } =
        await supabase
          .from(
            "household_members"
          )
          .update({
            role,
          })
          .eq(
            "id",
            member.id
          )
          .eq(
            "household_id",
            member.household_id
          );

      if (error) {
        throw error;
      }

      setMembers(
        (current) =>
          current.map(
            (
              currentMember
            ) =>
              currentMember.id ===
              member.id
                ? {
                    ...currentMember,
                    role,
                  }
                : currentMember
          )
      );

      setSuccessMessage(
        `${member.fullName} is now a ${formatRole(
          role
        )}.`
      );
    } catch (error: unknown) {
      const possibleError =
        error as {
          message?: string;
          details?: string;
        };

      setErrorMessage(
        possibleError.message ||
          possibleError.details ||
          "Unable to update the member’s role."
      );
    } finally {
      setUpdatingMemberId(
        null
      );
    }
  }

  async function removeMember(
    member: HouseholdMember
  ) {
    if (isDemo) {
      window.location.href =
        "/signup";
      return;
    }

    if (!isOwner) {
      setErrorMessage(
        "Only the household owner can remove members."
      );
      return;
    }

    if (
      member.role === "owner"
    ) {
      setErrorMessage(
        "The household owner cannot be removed."
      );
      return;
    }

    const confirmed =
      window.confirm(
        `Remove ${member.fullName} from this household?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setRemovingMemberId(
        member.id
      );

      setSuccessMessage("");
      setErrorMessage("");

      const { error } =
        await supabase
          .from(
            "household_members"
          )
          .delete()
          .eq(
            "id",
            member.id
          )
          .eq(
            "household_id",
            member.household_id
          );

      if (error) {
        throw error;
      }

      setMembers(
        (current) =>
          current.filter(
            (
              currentMember
            ) =>
              currentMember.id !==
              member.id
          )
      );

      setSuccessMessage(
        `${member.fullName} was removed from the household.`
      );
    } catch (error: unknown) {
      const possibleError =
        error as {
          message?: string;
          details?: string;
        };

      setErrorMessage(
        possibleError.message ||
          possibleError.details ||
          "Unable to remove the member."
      );
    } finally {
      setRemovingMemberId(
        null
      );
    }
  }

  async function cancelInvitation(
    invitation: HouseholdInvitation
  ) {
    if (isDemo) {
      window.location.href =
        "/signup";
      return;
    }

    if (
      !canManageSharing
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Cancel the invitation for ${invitation.email}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setCancelingInvitationId(
        invitation.id
      );

      setSuccessMessage("");
      setErrorMessage("");

      const { error } =
        await supabase
          .from(
            "household_invitations"
          )
          .delete()
          .eq(
            "id",
            invitation.id
          )
          .eq(
            "household_id",
            invitation.household_id
          );

      if (error) {
        throw error;
      }

      setInvitations(
        (current) =>
          current.filter(
            (
              currentInvitation
            ) =>
              currentInvitation.id !==
              invitation.id
          )
      );

      setSuccessMessage(
        `The invitation for ${invitation.email} was canceled.`
      );
    } catch (error: unknown) {
      const possibleError =
        error as {
          message?: string;
          details?: string;
        };

      setErrorMessage(
        possibleError.message ||
          possibleError.details ||
          "Unable to cancel the invitation."
      );
    } finally {
      setCancelingInvitationId(
        null
      );
    }
  }

  if (loading) {
    return (
      <PageShell>
        <PageCard className="flex min-h-72 items-center justify-center">
          <div className="flex items-center gap-3 text-neutral-500">
            <Loader2
              size={22}
              className="animate-spin"
            />

            Loading Family
            Sharing...
          </div>
        </PageCard>
      </PageShell>
    );
  }

  if (
    !isDemo &&
    !hasHouseholdMembership &&
    !canCreateHousehold
  ) {
    return (
      <PageShell>
        <section className="rounded-[32px] bg-[#111827] px-6 py-9 text-white shadow-sm md:px-10 md:py-11">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C8A96A]">
            Family Sharing
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] md:text-5xl">
            Share your vault.
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-7 text-white/60 md:text-base">
            Invite household
            members and manage your
            home technology
            together.
          </p>
        </section>

        <PageCard className="overflow-hidden p-0">
          <div className="bg-[#111827] p-8 text-white md:p-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-[#C8A96A]">
              <Crown size={27} />
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#C8A96A]">
              Family Plan
              Exclusive
            </p>

            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.04em]">
              Bring your household
              into one shared vault.
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60">
              Family Sharing is
              available only with
              the Family plan. Share
              devices, documents,
              warranties,
              maintenance,
              subscriptions,
              reports, and network
              information.
            </p>

            <Button
              href="/upgrade"
              variant="secondary"
              className="mt-7"
            >
              <Crown size={17} />
              Upgrade to Family
            </Button>
          </div>
        </PageCard>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="rounded-[32px] bg-[#111827] px-6 py-9 text-white shadow-sm md:px-10 md:py-11">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C8A96A]">
              Household Access
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] md:text-5xl">
              Family Sharing.
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-white/60 md:text-base">
              Invite trusted people
              and manage your Home
              Tech Vault together.
            </p>
          </div>

          {household &&
            canManageSharing &&
            availableSeats > 0 && (
              <Button
                variant="secondary"
                onClick={() =>
                  setShowInviteForm(
                    true
                  )
                }
              >
                <UserPlus
                  size={17}
                />
                Invite Member
              </Button>
            )}
        </div>
      </section>

      {isDemo && (
        <section className="rounded-3xl border border-[#D8C69D] bg-[#FFF8E8] p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#111827] text-[#C8A96A]">
              <Sparkles
                size={18}
              />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A6A2F]">
                Family Plan Preview
              </p>

              <p className="mt-2 text-sm leading-6 text-neutral-600">
                Explore a sample
                household. Creating
                invitations or
                changing members
                will take you to
                signup.
              </p>
            </div>
          </div>
        </section>
      )}

      {successMessage && (
        <div className="flex items-start gap-3 rounded-[22px] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <CheckCircle2
            size={19}
            className="mt-0.5 shrink-0"
          />

          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="flex items-start justify-between gap-4 rounded-[22px] border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p>
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={() =>
              setErrorMessage("")
            }
            aria-label="Dismiss error"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {!household ? (
        <CreateHouseholdCard
          householdName={
            householdName
          }
          setHouseholdName={
            setHouseholdName
          }
          creating={
            creatingHousehold
          }
          onSubmit={
            createHousehold
          }
        />
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              icon={Users}
              label="Members"
              value={members.length.toString()}
              description={`${availableSeats} seats available`}
            />

            <SummaryCard
              icon={Mail}
              label="Pending"
              value={invitations.length.toString()}
              description="Open invitations"
            />

            <SummaryCard
              icon={
                ShieldCheck
              }
              label="Your Role"
              value={formatRole(
                currentRole ||
                  "viewer"
              )}
              description="Household permissions"
            />

            <SummaryCard
              icon={Crown}
              label="Member Limit"
              value={memberLimit.toString()}
              description="Family-plan seats"
            />
          </section>

          <PageCard className="overflow-hidden p-0">
            <div className="!bg-[#111827] p-7 !text-white md:p-9">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">
                    Your Household
                  </p>

                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] !text-white">
                    {household.name}
                  </h2>

                  <p className="mt-3 text-sm !text-white/55">
                    Created{" "}
                    {formatDate(
                      household.created_at
                    )}
                  </p>
                </div>

                <div className="rounded-[22px] bg-white/10 px-5 py-4">
                  <p className="text-xs !text-white/40">
                    Household owner
                  </p>

                  <p className="mt-1 font-semibold !text-white">
                    {ownerMember?.fullName ||
                      "Owner"}
                  </p>
                </div>
              </div>
            </div>
          </PageCard>

          <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <PageCard className="p-7 md:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">
                    Members
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#111827]">
                    Household access
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-neutral-500">
                    Control what each
                    person can view or
                    manage.
                  </p>
                </div>

                {canManageSharing &&
                  availableSeats >
                    0 && (
                    <Button
                      variant="secondary"
                      onClick={() =>
                        setShowInviteForm(
                          true
                        )
                      }
                    >
                      <Plus
                        size={16}
                      />
                      Invite
                    </Button>
                  )}
              </div>

              <div className="mt-7 space-y-3">
                {members.map(
                  (member) => (
                    <MemberRow
                      key={
                        member.id
                      }
                      member={
                        member
                      }
                      currentUserId={
                        user?.id ||
                        ""
                      }
                      canManage={
                        canManageSharing
                      }
                      isOwner={
                        isOwner
                      }
                      updating={
                        updatingMemberId ===
                        member.id
                      }
                      removing={
                        removingMemberId ===
                        member.id
                      }
                      onRoleChange={(
                        role
                      ) =>
                        updateMemberRole(
                          member,
                          role
                        )
                      }
                      onRemove={() =>
                        removeMember(
                          member
                        )
                      }
                    />
                  )
                )}
              </div>
            </PageCard>

            <PageCard className="p-7 md:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
                  <Clock3
                    size={20}
                  />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">
                    Invitations
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#111827]">
                    Pending invites
                  </h2>
                </div>
              </div>

              {invitations.length ===
              0 ? (
                <div className="mt-7 rounded-[22px] bg-[#F7F5EF] p-5 text-sm leading-6 text-neutral-500">
                  No invitations are
                  currently pending.
                </div>
              ) : (
                <div className="mt-7 space-y-3">
                  {invitations.map(
                    (
                      invitation
                    ) => (
                      <InvitationRow
                        key={
                          invitation.id
                        }
                        invitation={
                          invitation
                        }
                        canManage={
                          canManageSharing
                        }
                        canceling={
                          cancelingInvitationId ===
                          invitation.id
                        }
                        onCopy={() =>
                          copyInvitationLink(
                            invitation
                          )
                        }
                        onCancel={() =>
                          cancelInvitation(
                            invitation
                          )
                        }
                      />
                    )
                  )}
                </div>
              )}

              <div className="mt-6 rounded-[22px] border border-[#E8E2D6] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
                  Invitation
                  Delivery
                </p>

                <p className="mt-2 text-sm leading-6 text-neutral-500">
                  Use the copy button
                  beside an invitation
                  to share its secure
                  link by text or
                  email.
                </p>
              </div>
            </PageCard>
          </section>

          <PageCard className="p-7 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">
              Role Permissions
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#111827]">
              Who can do what?
            </h2>

            <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <RoleCard
                role="Owner"
                description="Full control, billing, invitations, roles, and household management."
              />

              <RoleCard
                role="Admin"
                description="Can manage shared vault information and help organize the household."
              />

              <RoleCard
                role="Member"
                description="Can view, add, and update shared household information."
              />

              <RoleCard
                role="Viewer"
                description="Read-only access to the shared household vault."
              />
            </div>
          </PageCard>
        </>
      )}

      {showInviteForm &&
        household && (
          <InviteModal
            form={inviteForm}
            setForm={
              setInviteForm
            }
            sending={
              sendingInvitation
            }
            availableSeats={
              availableSeats
            }
            onClose={() => {
              setShowInviteForm(
                false
              );
              setInviteForm(
                initialInviteForm
              );
            }}
            onSubmit={
              sendInvitation
            }
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
  setHouseholdName: (
    value: string
  ) => void;
  creating: boolean;
  onSubmit: (
    event: FormEvent<HTMLFormElement>
  ) => void;
}) {
  return (
    <PageCard className="overflow-hidden p-0">
      <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
        <div className="!bg-[#111827] p-8 !text-white md:p-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-[#C8A96A]">
            <Home size={26} />
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#C8A96A]">
            Get Started
          </p>

          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] !text-white">
            Create your
            household.
          </h2>

          <p className="mt-4 text-sm leading-7 !text-white/60">
            Your household is the
            shared space where
            family members will
            access devices,
            documents, warranties,
            and other home
            technology information.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="p-8 md:p-10"
        >
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#111827]">
              Household name
            </span>

            <input
              type="text"
              value={
                householdName
              }
              onChange={(event) =>
                setHouseholdName(
                  event.target.value
                )
              }
              placeholder="The Eaton Household"
              maxLength={100}
              required
              className="w-full rounded-2xl border border-[#E8E2D6] bg-white px-4 py-3.5 text-[#111827] outline-none transition focus:border-[#C8A96A] focus:ring-4 focus:ring-[#C8A96A]/10"
            />
          </label>

          <p className="mt-3 text-sm leading-6 text-neutral-500">
            You can use your family
            name, street name, or
            anything that feels
            personal.
          </p>

          <Button
            type="submit"
            disabled={creating}
            className="mt-6"
          >
            {creating ? (
              <Loader2
                size={17}
                className="animate-spin"
              />
            ) : (
              <Plus size={17} />
            )}

            {creating
              ? "Creating..."
              : "Create Household"}
          </Button>
        </form>
      </div>
    </PageCard>
  );
}

function MemberRow({
  member,
  currentUserId,
  canManage,
  isOwner,
  updating,
  removing,
  onRoleChange,
  onRemove,
}: {
  member: HouseholdMember;
  currentUserId: string;
  canManage: boolean;
  isOwner: boolean;
  updating: boolean;
  removing: boolean;
  onRoleChange: (
    role: Exclude<
      HouseholdRole,
      "owner"
    >
  ) => void;
  onRemove: () => void;
}) {
  const initials =
    member.fullName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((name) =>
        name[0]?.toUpperCase()
      )
      .join("");

  const isCurrentUser =
    member.user_id ===
    currentUserId;

  return (
    <div className="flex flex-col gap-4 rounded-[24px] border border-[#E8E2D6] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        {member.avatarUrl ? (
          <img
            src={member.avatarUrl}
            alt={member.fullName}
            className="h-11 w-11 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#111827] text-xs font-bold text-white">
            {initials || "HT"}
          </div>
        )}

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-semibold text-[#111827]">
              {member.fullName}
            </p>

            {isCurrentUser && (
              <span className="rounded-full bg-[#F7F5EF] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                You
              </span>
            )}
          </div>

          <p className="mt-1 text-xs text-neutral-400">
            Joined{" "}
            {formatDate(
              member.joined_at
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {member.role ===
        "owner" ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-[#FFF8E8] px-3 py-2 text-xs font-semibold text-[#8A6A2F]">
            <Crown size={14} />
            Owner
          </span>
        ) : canManage ? (
          <select
            value={member.role}
            disabled={updating}
            onChange={(event) =>
              onRoleChange(
                event.target
                  .value as Exclude<
                  HouseholdRole,
                  "owner"
                >
              )
            }
            className="rounded-xl border border-[#E8E2D6] bg-white px-3 py-2 text-sm font-semibold text-[#111827] outline-none focus:border-[#C8A96A]"
          >
            <option value="admin">
              Admin
            </option>

            <option value="member">
              Member
            </option>

            <option value="viewer">
              Viewer
            </option>
          </select>
        ) : (
          <span className="rounded-full bg-[#F7F5EF] px-3 py-2 text-xs font-semibold text-neutral-600">
            {formatRole(
              member.role
            )}
          </span>
        )}

        {updating && (
          <Loader2
            size={16}
            className="animate-spin text-neutral-400"
          />
        )}

        {isOwner &&
          member.role !==
            "owner" && (
            <button
              type="button"
              onClick={onRemove}
              disabled={removing}
              aria-label={`Remove ${member.fullName}`}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-700 transition hover:bg-red-600 hover:text-white disabled:opacity-50"
            >
              {removing ? (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <Trash2
                  size={16}
                />
              )}
            </button>
          )}
      </div>
    </div>
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
  const expired =
    new Date(
      invitation.expires_at
    ).getTime() < Date.now();

  return (
    <div className="rounded-[22px] bg-[#F7F5EF] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-[#111827]">
            {invitation.email}
          </p>

          <p className="mt-1 text-xs text-neutral-400">
            {formatRole(
              invitation.role
            )}{" "}
            ·{" "}
            {expired
              ? "Expired"
              : `Expires ${formatDate(
                  invitation.expires_at
                )}`}
          </p>
        </div>

        {canManage && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCopy}
              disabled={expired}
              aria-label={`Copy invitation link for ${invitation.email}`}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#8A6A2F] transition hover:bg-[#111827] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Copy size={15} />
            </button>

            <button
              type="button"
              onClick={onCancel}
              disabled={canceling}
              aria-label={`Cancel invitation for ${invitation.email}`}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-red-700 transition hover:bg-red-600 hover:text-white disabled:opacity-50"
            >
              {canceling ? (
                <Loader2
                  size={15}
                  className="animate-spin"
                />
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
  setForm: (
    form: InviteForm
  ) => void;
  sending: boolean;
  availableSeats: number;
  onClose: () => void;
  onSubmit: (
    event: FormEvent<HTMLFormElement>
  ) => void;
}) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#111827]/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[32px] border border-[#E8E2D6] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#E8E2D6] p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">
              Family Sharing
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#111827]">
              Invite a member
            </h2>

            <p className="mt-2 text-sm text-neutral-500">
              {availableSeats}{" "}
              {availableSeats === 1
                ? "seat"
                : "seats"}{" "}
              remaining.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close invitation form"
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#111827]"
          >
            <X size={18} />
          </button>
        </div>

        <form
  onSubmit={(event) => {
    event.preventDefault();
    alert("Invite form submitted");
    console.log("[Family Invite] Modal form submitted");
    onSubmit(event);
  }}
  className="space-y-5 p-6"
>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#111827]">
              Email address
            </span>

            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm({
                  ...form,
                  email:
                    event.target
                      .value,
                })
              }
              placeholder="family@example.com"
              required
              className="w-full rounded-2xl border border-[#E8E2D6] bg-white px-4 py-3.5 outline-none focus:border-[#C8A96A] focus:ring-4 focus:ring-[#C8A96A]/10"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#111827]">
              Role
            </span>

            <select
              value={form.role}
              onChange={(event) =>
                setForm({
                  ...form,
                  role: event.target
                    .value as InviteForm["role"],
                })
              }
              className="w-full rounded-2xl border border-[#E8E2D6] bg-white px-4 py-3.5 outline-none focus:border-[#C8A96A]"
            >
              <option value="admin">
                Admin
              </option>

              <option value="member">
                Member
              </option>

              <option value="viewer">
                Viewer
              </option>
            </select>
          </label>

          <RoleExplanation
            role={form.role}
          />

          <button
  type="submit"
  disabled={
    sending ||
    availableSeats <= 0
  }
  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-[#111827] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#263044] disabled:cursor-not-allowed disabled:opacity-50"
>
  {sending ? (
    <Loader2
      size={17}
      className="animate-spin"
    />
  ) : (
    <UserPlus size={17} />
  )}

  {sending
    ? "Creating Invite..."
    : "Create Invitation"}
</button>
        </form>
      </div>
    </div>
  );
}

function RoleExplanation({
  role,
}: {
  role: InviteForm["role"];
}) {
  const descriptions = {
    admin:
      "Can manage shared vault information and help organize the household.",
    member:
      "Can view, add, and update shared household information.",
    viewer:
      "Can view shared information but cannot make changes.",
  };

  return (
    <div className="flex items-start gap-3 rounded-[22px] bg-[#F7F5EF] p-4">
      <UserCog
        size={18}
        className="mt-0.5 shrink-0 text-[#C8A96A]"
      />

      <p className="text-sm leading-6 text-neutral-500">
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
    <PageCard className="p-5 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-neutral-500">
            {label}
          </p>

          <p className="mt-2 truncate text-2xl font-semibold tracking-[-0.03em] text-[#111827] md:text-3xl">
            {value}
          </p>

          <p className="mt-2 text-xs text-neutral-400">
            {description}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
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
    <div className="rounded-[22px] bg-[#F7F5EF] p-5">
      <p className="font-semibold text-[#111827]">
        {role}
      </p>

      <p className="mt-2 text-sm leading-6 text-neutral-500">
        {description}
      </p>
    </div>
  );
}

function formatRole(
  role: HouseholdRole
) {
  return role
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );
}

function formatDate(
  value: string
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}
