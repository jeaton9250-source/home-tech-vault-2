"use client";

import {
  useEffect,
  useState,
} from "react";

import { Loader2, X } from "lucide-react";

import Button from "@/components/ui/Button";
import type {
  AdminHouseholdInviteRole,
  AdminInvitationType,
} from "@/lib/admin/types";

type HouseholdOption = {
  id: string;
  name: string;
};

type InviteUserModalProps = {
  open: boolean;
  onClose: () => void;
  onInvited: (message: string) => void;
};

const INVITE_TYPE_OPTIONS: Array<{
  value: AdminInvitationType;
  label: string;
  description: string;
}> = [
  {
    value: "create_account",
    label: "Create New Account",
    description:
      "Invite this person to create their own Home Tech Vault account and household.",
  },
  {
    value: "join_household",
    label: "Add to Existing Household",
    description:
      "Invite this person to join an existing household with a household role.",
  },
];

const ROLE_OPTIONS: Array<{
  value: AdminHouseholdInviteRole;
  label: string;
  description: string;
}> = [
  {
    value: "admin",
    label: "Admin",
    description:
      "Can manage household users, devices, documents, warranties, maintenance, and network settings.",
  },
  {
    value: "member",
    label: "Member",
    description:
      "Can manage permitted household records but cannot manage protected household or administrator settings.",
  },
  {
    value: "viewer",
    label: "Viewer",
    description:
      "Read-only access to shared household information.",
  },
];

export default function InviteUserModal({
  open,
  onClose,
  onInvited,
}: InviteUserModalProps) {
  const [invitationType, setInvitationType] =
    useState<AdminInvitationType>("create_account");
  const [email, setEmail] = useState("");
  const [householdId, setHouseholdId] = useState("");
  const [role, setRole] =
    useState<AdminHouseholdInviteRole>("member");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [households, setHouseholds] = useState<
    HouseholdOption[]
  >([]);
  const [loadingHouseholds, setLoadingHouseholds] =
    useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isHouseholdInvite =
    invitationType === "join_household";

  useEffect(() => {
    if (!open || !isHouseholdInvite) {
      return;
    }

    let cancelled = false;

    async function loadHouseholds() {
      try {
        setLoadingHouseholds(true);
        setError("");

        const response = await fetch(
          "/api/admin/households?limit=100"
        );
        const payload = (await response.json()) as {
          households?: Array<{
            id: string;
            name: string | null;
          }>;
          error?: string;
        };

        if (!response.ok) {
          throw new Error(
            payload.error || "Unable to load households."
          );
        }

        if (cancelled) {
          return;
        }

        setHouseholds(
          (payload.households ?? []).map((household) => ({
            id: household.id,
            name: household.name?.trim() || "Untitled household",
          }))
        );
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load households."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingHouseholds(false);
        }
      }
    }

    void loadHouseholds();

    return () => {
      cancelled = true;
    };
  }, [open, isHouseholdInvite]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  function resetForm() {
    setInvitationType("create_account");
    setEmail("");
    setHouseholdId("");
    setRole("member");
    setFirstName("");
    setLastName("");
    setError("");
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Enter a valid email address.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await fetch("/api/admin/users/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invitationType,
          email: normalizedEmail,
          householdId: isHouseholdInvite ? householdId : null,
          role: isHouseholdInvite ? role : null,
          firstName: firstName.trim() || null,
          lastName: lastName.trim() || null,
          createOwnHousehold: !isHouseholdInvite,
        }),
      });

      const payload = (await response.json()) as {
        success?: boolean;
        message?: string;
        warning?: string | null;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          payload.error || "The invitation could not be sent."
        );
      }

      if (!payload.success) {
        throw new Error(
          payload.error || "The invitation could not be sent."
        );
      }

      const successMessage = payload.warning
        ? `${payload.message ?? `Invitation sent to ${normalizedEmail}.`} ${payload.warning}`
        : payload.message || `Invitation sent to ${normalizedEmail}.`;

      resetForm();
      onInvited(successMessage);
      onClose();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "The invitation could not be sent."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const selectedType = INVITE_TYPE_OPTIONS.find(
    (option) => option.value === invitationType
  );
  const selectedRole = ROLE_OPTIONS.find(
    (option) => option.value === role
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-user-title"
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[24px] border border-border-subtle bg-surface-card p-6 shadow-lg md:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
              Control Center
            </p>
            <h2
              id="invite-user-title"
              className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-text-primary"
            >
              Invite User
            </h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              {selectedType?.description ??
                "Choose how this person should join Home Tech Vault."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-[12px] text-text-secondary transition hover:bg-surface-sunken hover:text-text-primary"
            aria-label="Close invite dialog"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <fieldset>
            <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
              Invitation type
            </legend>
            <div className="mt-3 space-y-2">
              {INVITE_TYPE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-start gap-3 rounded-[16px] border border-border-subtle bg-surface-sunken px-4 py-3"
                >
                  <input
                    type="radio"
                    name="invitation-type"
                    value={option.value}
                    checked={invitationType === option.value}
                    onChange={() =>
                      setInvitationType(option.value)
                    }
                    className="mt-1"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-text-primary">
                      {option.label}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-text-secondary">
                      {option.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
              Email address
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-[12px] border border-border-subtle bg-surface-sunken px-4 py-3 text-sm text-text-primary outline-none focus:border-interaction"
              placeholder="name@example.com"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
                First name
              </span>
              <input
                type="text"
                value={firstName}
                onChange={(event) =>
                  setFirstName(event.target.value)
                }
                className="mt-2 w-full rounded-[12px] border border-border-subtle bg-surface-sunken px-4 py-3 text-sm text-text-primary outline-none focus:border-interaction"
                placeholder="Optional"
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
                Last name
              </span>
              <input
                type="text"
                value={lastName}
                onChange={(event) =>
                  setLastName(event.target.value)
                }
                className="mt-2 w-full rounded-[12px] border border-border-subtle bg-surface-sunken px-4 py-3 text-sm text-text-primary outline-none focus:border-interaction"
                placeholder="Optional"
              />
            </label>
          </div>

          {isHouseholdInvite ? (
            <>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
                  Household
                </span>
                <select
                  required
                  value={householdId}
                  onChange={(event) =>
                    setHouseholdId(event.target.value)
                  }
                  disabled={loadingHouseholds}
                  className="mt-2 w-full rounded-[12px] border border-border-subtle bg-surface-sunken px-4 py-3 text-sm text-text-primary outline-none focus:border-interaction"
                >
                  <option value="">
                    {loadingHouseholds
                      ? "Loading households…"
                      : "Select a household"}
                  </option>
                  {households.map((household) => (
                    <option
                      key={household.id}
                      value={household.id}
                    >
                      {household.name}
                    </option>
                  ))}
                </select>
              </label>

              <fieldset>
                <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
                  Household role
                </legend>
                <div className="mt-3 space-y-2">
                  {ROLE_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className="flex cursor-pointer items-start gap-3 rounded-[16px] border border-border-subtle bg-surface-sunken px-4 py-3"
                    >
                      <input
                        type="radio"
                        name="household-role"
                        value={option.value}
                        checked={role === option.value}
                        onChange={() => setRole(option.value)}
                        className="mt-1"
                      />
                      <span>
                        <span className="block text-sm font-semibold text-text-primary">
                          {option.label}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-text-secondary">
                          {option.description}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
                {selectedRole ? (
                  <p className="mt-3 text-xs leading-5 text-text-tertiary">
                    Selected: {selectedRole.label}. Platform-admin
                    access is managed separately after the account
                    exists.
                  </p>
                ) : null}
              </fieldset>
            </>
          ) : (
            <p className="rounded-[16px] border border-border-subtle bg-surface-sunken px-4 py-3 text-xs leading-5 text-text-secondary">
              This person will create their own household during
              setup and become its owner. They will not join your
              household, and platform-admin access is not included.
            </p>
          )}

          {error ? (
            <p className="rounded-[16px] border border-danger/30 bg-danger-soft/70 px-4 py-3 text-sm text-danger">
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Sending Invitation…
                </>
              ) : (
                "Send Invitation"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
