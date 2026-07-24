"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  CheckCircle2,
  Loader2,
  ShieldAlert,
  Users,
} from "lucide-react";
import {
  useParams,
  useRouter,
} from "next/navigation";

import { supabase } from "@/lib/supabase";
import {
  getDefaultActivityTitle,
  recordActivity,
} from "@/lib/activity";
import { usePermissions } from "@/hooks/usePermissions";

import PageShell from "@/components/ui/PageShell";
import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";

type AcceptState =
  | "checking"
  | "accepting"
  | "success"
  | "error";

export default function AcceptFamilyInvitationPage() {
  const params = useParams<{
    token: string;
  }>();

  const router = useRouter();
  const { refreshPermissions } =
    usePermissions();

  const token =
    typeof params.token === "string"
      ? params.token
      : "";

  const hasStarted =
    useRef(false);

  const [state, setState] =
    useState<AcceptState>("checking");

  const [message, setMessage] =
    useState(
      "Checking your family invitation..."
    );

  useEffect(() => {
    if (hasStarted.current) {
      return;
    }

    hasStarted.current = true;

    let active = true;

    async function acceptInvitation() {
      try {
        if (!token) {
          throw new Error(
            "This invitation link is missing its token."
          );
        }

        const {
          data: {
            user,
          },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          const returnPath =
            `/family/accept/${encodeURIComponent(
              token
            )}`;

          router.replace(
            `/login?redirect=${encodeURIComponent(
              returnPath
            )}`
          );

          return;
        }

        if (!active) {
          return;
        }

        const {
          data: invitationPreview,
          error: invitationPreviewError,
        } = await supabase
          .from("household_invitations")
          .select("invitation_type, household_id")
          .eq("token", token)
          .maybeSingle();

        if (
          !invitationPreviewError &&
          invitationPreview &&
          (
            invitationPreview.invitation_type ===
              "create_account" ||
            invitationPreview.invitation_type ===
              "new_account" ||
            !invitationPreview.household_id
          )
        ) {
          router.replace("/invite/setup");
          return;
        }

        setState("accepting");
        setMessage(
          "Adding you to the shared household..."
        );

        const {
          error: acceptanceError,
        } = await supabase.rpc(
          "accept_household_invitation",
          {
            invitation_token: token,
          }
        );

        if (acceptanceError) {
          throw acceptanceError;
        }

        await recordActivity({
          activityType:
            "family.member.joined",
          title: getDefaultActivityTitle(
            "family.member.joined",
            user.email || "Member"
          ),
          description:
            "A family invitation was accepted.",
          userId: user.id,
        });

        if (!active) {
          return;
        }

        setState("success");
        setMessage(
          "You have joined the shared household."
        );

        await refreshPermissions();

        window.setTimeout(() => {
          router.replace("/family");
          router.refresh();
        }, 1200);
      } catch (error: unknown) {
        if (!active) {
          return;
        }

        const possibleError =
          error as {
            message?: string;
            details?: string;
            hint?: string;
          };

        console.error(
          "Unable to accept family invitation:",
          error
        );

        setState("error");
        setMessage(
          possibleError.message ||
            possibleError.details ||
            possibleError.hint ||
            "Unable to accept this invitation."
        );
      }
    }

    void acceptInvitation();

    return () => {
      active = false;
    };
  }, [
    token,
    router,
    refreshPermissions,
  ]);

  return (
    <PageShell>
      <PageCard className="mx-auto max-w-xl text-center">
        <div
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${
            state === "error"
              ? "bg-red-50 text-red-700"
              : state === "success"
                ? "bg-emerald-50 text-emerald-700"
                : "border border-border-subtle bg-surface-sunken text-charcoal"
          }`}
        >
          {state === "error" ? (
            <ShieldAlert size={30} />
          ) : state === "success" ? (
            <CheckCircle2 size={30} />
          ) : state === "accepting" ? (
            <Loader2
              size={30}
              className="animate-spin"
            />
          ) : (
            <Users size={30} />
          )}
        </div>

        <p className="mt-6 text-overline text-charcoal-soft">
          Family Sharing
        </p>

        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-text-primary">
          {state === "success"
            ? "Invitation accepted"
            : state === "error"
              ? "Unable to join household"
              : "Joining household"}
        </h1>

        <p className="mt-4 leading-7 text-text-secondary">
          {message}
        </p>

        {state === "error" && (
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button
              href="/family"
              variant="secondary"
            >
              Go to Family Sharing
            </Button>

            <Button href="/contact">
              Contact Support
            </Button>
          </div>
        )}

        {state === "success" && (
          <p className="mt-5 text-sm text-text-tertiary">
            Opening your shared household...
          </p>
        )}
      </PageCard>
    </PageShell>
  );
}
