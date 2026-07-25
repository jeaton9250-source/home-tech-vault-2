"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  CheckCircle2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  User,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { stripPrivilegedProfileFields } from "@/lib/auth/stripPrivilegedProfileFields";
import { usePermissions } from "@/hooks/usePermissions";
import FoundingMemberBadge from "@/components/founding-members/FoundingMemberBadge";

import {
  FormField,
  formatMemberSince,
  ReadOnlyRow,
  SettingsCard,
} from "@/components/account-settings/shared";

type ProfileRecord = {
  full_name: string | null;
  household_name: string | null;
  city: string | null;
  phone: string | null;
  avatar_url: string | null;
};

const demoProfile: ProfileRecord = {
  full_name: "Alex Morgan",
  household_name: "Morgan Household",
  city: "Wilmington, NC",
  phone: "(910) 555-0148",
  avatar_url: null,
};

export default function ProfileTab() {
  const router = useRouter();

  const {
    user,
    isDemo,
    loading: permissionsLoading,
    roleDisplayName,
    vaultContextLabel,
    isPlatformAdmin,
    isVerifiedPlatformAdmin,
    planDisplayName,
  } = usePermissions();

  const [fullName, setFullName] =
    useState("");

  const [householdName, setHouseholdName] =
    useState("");

  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] =
    useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [memberSince, setMemberSince] =
    useState<string | null>(null);
  const [loading, setLoading] =
    useState(true);
  const [saving, setSaving] =
    useState(false);
  const [saved, setSaved] =
    useState(false);
  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    async function loadProfile() {
      if (permissionsLoading) {
        return;
      }

      try {
        setLoading(true);
        setErrorMessage("");

        if (isDemo || !user) {
          setFullName(
            demoProfile.full_name || ""
          );
          setHouseholdName(
            demoProfile.household_name || ""
          );
          setCity(demoProfile.city || "");
          setPhone(demoProfile.phone || "");
          setAvatarUrl(null);
          setEmail("alex.morgan@example.com");
          setMemberSince(
            new Date(
              Date.now() -
                180 * 24 * 60 * 60 * 1000
            ).toISOString()
          );
          return;
        }

        setEmail(user.email || "");
        setMemberSince(user.created_at || null);

        const { data, error } = await supabase
          .from("profiles")
          .select(
            "full_name, household_name, city, phone, avatar_url"
          )
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          throw error;
        }

        const profile =
          data as ProfileRecord | null;

        setFullName(profile?.full_name || "");
        setHouseholdName(
          profile?.household_name || ""
        );
        setCity(profile?.city || "");
        setPhone(profile?.phone || "");
        setAvatarUrl(
          profile?.avatar_url || null
        );
      } catch (error) {
        console.error(
          "Profile loading error:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load your profile."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, [user, isDemo, permissionsLoading]);

  const displayName =
    fullName.trim() ||
    email.split("@")[0] ||
    "Homeowner";

  const initials = useMemo(() => {
    return displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((name) => name[0]?.toUpperCase())
      .join("");
  }, [displayName]);

  async function saveProfile() {
    if (isDemo) {
      router.push("/signup");
      return;
    }

    if (!user) {
      router.push("/login");
      return;
    }

    try {
      setSaving(true);
      setSaved(false);
      setErrorMessage("");

      const { error } = await supabase
        .from("profiles")
        .upsert(
          stripPrivilegedProfileFields({
            id: user.id,
            full_name:
              fullName.trim() || null,
            household_name:
              householdName.trim() || null,
            city: city.trim() || null,
            phone: phone.trim() || null,
          }),
          { onConflict: "id" }
        );

      if (error) {
        throw error;
      }

      setSaved(true);
      window.setTimeout(() => {
        setSaved(false);
      }, 2500);
      router.refresh();
    } catch (error) {
      console.error(
        "Profile saving error:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to save your profile."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading || permissionsLoading) {
    return (
      <SettingsCard title="Profile">
        <div className="flex items-center gap-3 text-sm text-text-secondary">
          <Loader2
            size={18}
            className="animate-spin"
          />
          Loading profile...
        </div>
      </SettingsCard>
    );
  }

  return (
    <div className="space-y-6">
      {errorMessage ? (
        <div className="rounded-[var(--radius-card)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {isDemo ? (
        <div className="rounded-[var(--radius-card)] border border-warning/40 bg-warning-soft px-4 py-3 text-sm text-text-secondary">
          These are sample profile details. Create
          an account to personalize your vault.
        </div>
      ) : null}

      <SettingsCard
        title="Personal information"
        description="Update how your name and contact details appear across Home Tech Vault."
        footer={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => {
                void saveProfile();
              }}
              disabled={saving}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-charcoal px-6 text-sm font-semibold text-white transition hover:bg-charcoal-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              ) : saved ? (
                <CheckCircle2 size={16} />
              ) : (
                <Save size={16} />
              )}
              {saving
                ? "Saving..."
                : saved
                  ? "Profile Saved"
                  : isDemo
                    ? "Create Your Vault"
                    : "Save Profile"}
            </button>

            {saved ? (
              <p className="text-sm text-emerald-700">
                Your profile was updated.
              </p>
            ) : null}
          </div>
        }
      >
        <div className="mb-6 flex items-center gap-4">
          {avatarUrl && !isDemo ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="h-16 w-16 rounded-full border border-border-subtle object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border-subtle bg-surface-sunken text-lg font-semibold text-text-primary">
              {initials || "HT"}
            </div>
          )}

          <div>
            <p className="text-base font-semibold text-text-primary">
              {displayName}
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              Member since{" "}
              {formatMemberSince(memberSince)}
            </p>
            <div className="mt-2">
              <FoundingMemberBadge compact />
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <FormField
            label="Full name"
            icon={User}
            value={fullName}
            placeholder="Your full name"
            onChange={setFullName}
          />

          <FormField
            label="Household display name"
            icon={User}
            value={householdName}
            placeholder="The Morgan Household"
            onChange={setHouseholdName}
          />

          <FormField
            label="City"
            icon={MapPin}
            value={city}
            placeholder="Wilmington, NC"
            onChange={setCity}
          />

          <FormField
            label="Phone number"
            icon={Phone}
            value={phone}
            placeholder="(910) 555-1234"
            onChange={setPhone}
            type="tel"
          />

          <div className="md:col-span-2">
            <FormField
              label="Email address"
              icon={Mail}
              value={email}
              disabled
              helperText="Email changes require verification. Contact support if you need to update your sign-in email."
            />
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Account summary"
        description="Read-only details about your account and household access."
      >
        <div className="space-y-3">
          <ReadOnlyRow
            label="Current plan"
            value={
              isPlatformAdmin
                ? "Platform Admin"
                : planDisplayName || "Free"
            }
          />

          {roleDisplayName || vaultContextLabel ? (
            <ReadOnlyRow
              label="Household role"
              value={
                vaultContextLabel ||
                roleDisplayName ||
                "—"
              }
            />
          ) : null}

          {isVerifiedPlatformAdmin ? (
            <ReadOnlyRow
              label="Platform access"
              value="Control Center enabled"
            />
          ) : null}

          <ReadOnlyRow
            label="Member since"
            value={formatMemberSince(memberSince)}
          />
        </div>
      </SettingsCard>
    </div>
  );
}
