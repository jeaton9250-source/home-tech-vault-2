"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Crown,
  FileText,
  Home,
  Laptop,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Save,
  Settings,
  ShieldCheck,
  User,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { usePermissions } from "@/hooks/usePermissions";
import {
  formatSubscriptionStatus,
  getPlanDescription,
} from "@/lib/permissions/effectivePlan";
import PlanAccessSummary from "@/components/permissions/PlanAccessSummary";

import PageShell from "@/components/ui/PageShell";
import PageTitle from "@/components/ui/PageTitle";
import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";

type ProfileRecord = {
  full_name: string | null;
  household_name: string | null;
  city: string | null;
  phone: string | null;
  avatar_url: string | null;
};

type DeviceValueRow = {
  purchase_price: number | null;
};

const demoProfile: ProfileRecord = {
  full_name: "Alex Morgan",
  household_name: "The Morgan Household",
  city: "Wilmington, NC",
  phone: "(910) 555-0148",
  avatar_url: null,
};

export default function AccountPage() {
  const router = useRouter();

  const {
    user,
    isDemo,
    loading: permissionsLoading,
    plan,
    planDisplayName,
    roleDisplayName,
    effectiveStatus,
    currentPeriodEnd,
    isFree,
    isPlatformAdmin,
    canManageBilling,
    billingManagedByHousehold,
  } = usePermissions();

  const [fullName, setFullName] =
    useState("");

  const [householdName, setHouseholdName] =
    useState("");

  const [city, setCity] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [avatarUrl, setAvatarUrl] =
    useState<string | null>(null);

  const [email, setEmail] =
    useState("");

  const [memberSince, setMemberSince] =
    useState<string | null>(null);

  const [deviceCount, setDeviceCount] =
    useState(0);

  const [documentCount, setDocumentCount] =
    useState(0);

  const [protectedValue, setProtectedValue] =
    useState(0);

  const [loadingAccount, setLoadingAccount] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    async function loadAccount() {
      if (permissionsLoading) {
        return;
      }

      try {
        setLoadingAccount(true);
        setErrorMessage("");

        if (isDemo || !user) {
          setFullName(
            demoProfile.full_name || ""
          );

          setHouseholdName(
            demoProfile.household_name || ""
          );

          setCity(
            demoProfile.city || ""
          );

          setPhone(
            demoProfile.phone || ""
          );

          setAvatarUrl(null);
          setEmail("demo@hometechvault.com");

          setMemberSince(
            new Date(
              Date.now() -
                180 *
                  24 *
                  60 *
                  60 *
                  1000
            ).toISOString()
          );

          setDeviceCount(12);
          setDocumentCount(18);
          setProtectedValue(12650);

          return;
        }

        setEmail(user.email || "");
        setMemberSince(
          user.created_at || null
        );

        const [
          profileResult,
          devicesResult,
          documentsResult,
        ] = await Promise.all([
          supabase
            .from("profiles")
            .select(
              `
                full_name,
                household_name,
                city,
                phone,
                avatar_url
              `
            )
            .eq("id", user.id)
            .maybeSingle(),

          supabase
            .from("devices")
            .select("purchase_price")
            .eq("user_id", user.id),

          supabase
            .from("documents")
            .select("id")
            .eq("user_id", user.id),
        ]);

        if (profileResult.error) {
          throw profileResult.error;
        }

        const profileData =
          profileResult.data as
            | ProfileRecord
            | null;

        setFullName(
          profileData?.full_name || ""
        );

        setHouseholdName(
          profileData?.household_name || ""
        );

        setCity(
          profileData?.city || ""
        );

        setPhone(
          profileData?.phone || ""
        );

        setAvatarUrl(
          profileData?.avatar_url || null
        );

        if (devicesResult.error) {
          console.error(
            "Unable to load device statistics:",
            devicesResult.error
          );
        } else {
          const devices =
            (devicesResult.data ||
              []) as DeviceValueRow[];

          setDeviceCount(devices.length);

          setProtectedValue(
            devices.reduce(
              (total, device) =>
                total +
                Number(
                  device.purchase_price || 0
                ),
              0
            )
          );
        }

        if (documentsResult.error) {
          console.error(
            "Unable to load document statistics:",
            documentsResult.error
          );
        } else {
          setDocumentCount(
            documentsResult.data?.length || 0
          );
        }
      } catch (error) {
        console.error(
          "Account loading error:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load your account."
        );
      } finally {
        setLoadingAccount(false);
      }
    }

    loadAccount();
  }, [
    user,
    isDemo,
    permissionsLoading,
  ]);

  const loading =
    permissionsLoading ||
    loadingAccount;

  const displayName =
    fullName.trim() ||
    email.split("@")[0] ||
    "Homeowner";

  const firstName =
    displayName.split(" ")[0];

  const displayedHouseholdName =
    householdName.trim() ||
    `${firstName}'s Home Tech Vault`;

  const initials = useMemo(() => {
    return displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((name) =>
        name[0]?.toUpperCase()
      )
      .join("");
  }, [displayName]);

  const planLabel = isPlatformAdmin
    ? "Master Account"
    : `${planDisplayName} Plan`;

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
          {
            id: user.id,
            full_name:
              fullName.trim() || null,
            household_name:
              householdName.trim() || null,
            city:
              city.trim() || null,
            phone:
              phone.trim() || null,
          },
          {
            onConflict: "id",
          }
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

  async function signOut() {
    const { error } =
      await supabase.auth.signOut();

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    window.location.href = "/login";
  }

  return (
    <PageShell>

      {loading ? (
        <PageCard className="flex min-h-64 items-center justify-center">
          <div className="flex items-center gap-3 text-text-secondary">
            <Loader2
              size={22}
              className="animate-spin"
            />
            Loading your account...
          </div>
        </PageCard>
      ) : (
        <>
          {errorMessage && (
            <PageCard className="border-red-200 bg-red-50 text-red-700">
              {errorMessage}
            </PageCard>
          )}

          {isDemo && (
            <PageCard className="border-warning/40 bg-warning-soft">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-achievement">
                Interactive Demo
              </p>

              <h2 className="mt-2 text-xl font-bold text-text-primary">
                Preview the Account Center
              </h2>

              <p className="mt-2 text-sm leading-6 text-text-secondary">
                These are sample account details.
                Create an account to personalize
                your own vault.
              </p>
            </PageCard>
          )}

          <section className="htv-hero-band overflow-hidden p-7 md:p-10">
            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                {avatarUrl && !isDemo ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="h-24 w-24 rounded-[var(--radius-card)] border-4 border-surface-card object-cover shadow-[var(--shadow-md)]"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-[var(--radius-card)] border border-border-subtle bg-surface-card text-3xl font-bold text-home-health shadow-[var(--shadow-sm)]">
                    {initials || "HT"}
                  </div>
                )}

                <div>
                  <p className="text-overline text-home-health">
                    Welcome home
                  </p>

                  <h1 className="text-page-title mt-2 text-text-primary">
                    {firstName}
                  </h1>

                  <p className="mt-3 text-lg text-text-secondary">
                    {displayedHouseholdName}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-text-secondary">
                    <span className="inline-flex items-center gap-2">
                      <Mail size={15} />
                      {email}
                    </span>

                    {city && (
                      <span className="inline-flex items-center gap-2">
                        <MapPin size={15} />
                        {city}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-[var(--radius-card)] border border-border-subtle bg-surface-card p-5 shadow-[var(--shadow-sm)]">
                <p className="text-overline text-section-insights">
                  Membership
                </p>

                <p className="mt-2 text-2xl font-bold text-text-primary">
                  {planLabel}
                </p>

                {roleDisplayName && (
                  <p className="mt-2 text-sm font-semibold text-section-insights">
                    {roleDisplayName}
                  </p>
                )}

                <p className="mt-1 text-sm text-text-secondary">
                  {isPlatformAdmin
                    ? "All features are unlocked."
                    : getPlanDescription(plan)}
                </p>

                {!isPlatformAdmin &&
                  isFree &&
                  !billingManagedByHousehold && (
                    <Button
                      href="/upgrade"
                      className="mt-4"
                    >
                      <Crown size={17} />
                      Upgrade Account
                    </Button>
                  )}
              </div>
            </div>
          </section>

          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <AccountStat
              icon={Laptop}
              label="Saved Devices"
              value={deviceCount.toLocaleString()}
              description="Technology in your vault"
            />

            <AccountStat
              icon={ShieldCheck}
              label="Protected Value"
              value={formatCurrency(
                protectedValue
              )}
              description="Recorded purchase value"
            />

            <AccountStat
              icon={FileText}
              label="Documents"
              value={documentCount.toLocaleString()}
              description="Receipts, manuals, and files"
            />

            <AccountStat
              icon={CalendarDays}
              label="Member Since"
              value={formatMemberSince(
                memberSince
              )}
              description="Your vault journey"
            />
          </section>
                    <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <PageCard>
              <SectionHeading
                icon={User}
                eyebrow="Personal Profile"
                title="Your information"
                description="Control how your name and household appear throughout Home Tech Vault."
              />

              <div className="mt-7 grid gap-5 md:grid-cols-2">
                <AccountField
                  label="Full Name"
                  icon={User}
                  value={fullName}
                  placeholder="Your full name"
                  onChange={setFullName}
                />

                <AccountField
                  label="Household Name"
                  icon={Home}
                  value={householdName}
                  placeholder="The Morgan Household"
                  onChange={setHouseholdName}
                />

                <AccountField
                  label="City"
                  icon={MapPin}
                  value={city}
                  placeholder="Wilmington, NC"
                  onChange={setCity}
                />

                <AccountField
                  label="Phone Number"
                  icon={Phone}
                  value={phone}
                  placeholder="(910) 555-1234"
                  onChange={setPhone}
                  type="tel"
                />

                <AccountField
                  label="Email Address"
                  icon={Mail}
                  value={email}
                  placeholder="Email address"
                  onChange={() => {}}
                  disabled
                />
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-4 border-t border-border-subtle pt-6">
                <button
                  type="button"
                  onClick={saveProfile}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-charcoal px-6 py-3 font-semibold text-surface-card transition hover:bg-charcoal-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  ) : saved ? (
                    <CheckCircle2
                      size={18}
                      className="text-section-vault"
                    />
                  ) : (
                    <Save size={18} />
                  )}

                  {saving
                    ? "Saving..."
                    : saved
                      ? "Profile Saved"
                      : isDemo
                        ? "Create Your Vault"
                        : "Save Changes"}
                </button>

                {saved && (
                  <p className="text-sm font-medium text-emerald-700">
                    Your profile was updated.
                  </p>
                )}
              </div>
            </PageCard>

            <div className="space-y-6">
              <PageCard>
                <SectionHeading
                  icon={
                    isFree &&
                    !isPlatformAdmin
                      ? ShieldCheck
                      : Crown
                  }
                  eyebrow="Subscription"
                  title={planLabel}
                  description={
                    isPlatformAdmin
                      ? "All Home Tech Vault features are unlocked."
                      : getPlanDescription(plan)
                  }
                />

                <div className="mt-6 grid gap-4">
                  <SettingDetail
                    label="Plan"
                    value={
                      isPlatformAdmin
                        ? "Master"
                        : planDisplayName
                    }
                  />

                  {roleDisplayName && (
                    <SettingDetail
                      label="Household Role"
                      value={roleDisplayName}
                    />
                  )}

                  <SettingDetail
                    label="Status"
                    value={
                      isPlatformAdmin
                        ? "Active"
                        : formatSubscriptionStatus(
                            effectiveStatus
                          )
                    }
                  />

                  <SettingDetail
                    label={
                      effectiveStatus === "canceled"
                        ? "Access Ends"
                        : "Renewal Date"
                    }
                    value={
                      isPlatformAdmin
                        ? "No expiration"
                        : currentPeriodEnd
                          ? formatSubscriptionDate(
                              currentPeriodEnd
                            )
                          : "Not applicable"
                    }
                  />
                </div>

                <div className="mt-5 flex flex-col gap-3">
                  {canManageBilling && (
                    <Button
                      href="/settings/billing"
                      className="w-full"
                    >
                      <ArrowUpRight size={17} />
                      Manage Billing
                    </Button>
                  )}

                  {billingManagedByHousehold && (
                    <PlanAccessSummary
                      showRole={false}
                      compact
                    />
                  )}

                  {!isPlatformAdmin &&
                    isFree &&
                    !billingManagedByHousehold && (
                      <Button
                        href="/upgrade"
                        variant="secondary"
                        className="w-full"
                      >
                        <Crown size={17} />
                        View Upgrade Options
                      </Button>
                    )}
                </div>
              </PageCard>

              <PageCard>
                <SectionHeading
                  icon={Settings}
                  eyebrow="Preferences"
                  title="Display settings"
                  description="Your current Home Tech Vault display preferences."
                />

                <div className="mt-6 space-y-3">
                  <SettingRow
                    label="Theme"
                    value="Light Mode"
                  />

                  <SettingRow
                    label="Currency"
                    value="USD"
                  />

                  <SettingRow
                    label="Date Format"
                    value="MM/DD/YYYY"
                  />
                </div>
              </PageCard>
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-2">
            <PageCard>
              <SectionHeading
                icon={ShieldCheck}
                eyebrow="Privacy & Security"
                title="Your account"
                description="Your personal information is only displayed inside your private account."
              />

              <div className="mt-6 space-y-3">
                <SettingRow
                  label="Account Email"
                  value={
                    email ||
                    "Not signed in"
                  }
                />

                <SettingRow
                  label="Authentication"
                  value="Password Protected"
                />

                <SettingRow
                  label="Data Access"
                  value="Private to Your Account"
                />
              </div>
            </PageCard>

            <PageCard>
              <SectionHeading
                icon={LogOut}
                eyebrow="Account Access"
                title="Sign out"
                description="Securely end your current Home Tech Vault session."
              />

              <button
                type="button"
                onClick={signOut}
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </PageCard>
          </section>
        </>
      )}
    </PageShell>
  );
}

function SectionHeading({
  icon: Icon,
  eyebrow,
  title,
  description,
}: {
  icon: typeof User;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-charcoal shadow-[var(--shadow-inset)]">
        <Icon size={21} />
      </div>

      <div>
        <p className="text-overline text-charcoal-soft">
          {eyebrow}
        </p>

        <h2 className="mt-1 text-2xl font-bold text-text-primary">
          {title}
        </h2>

        <p className="mt-1 text-sm leading-6 text-text-secondary">
          {description}
        </p>
      </div>
    </div>
  );
}

function AccountStat({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: typeof User;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <PageCard>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-charcoal shadow-[var(--shadow-inset)]">
        <Icon size={23} />
      </div>

      <p className="mt-5 text-sm text-text-secondary">
        {label}
      </p>

      <p className="mt-2 break-words text-3xl font-bold text-text-primary">
        {value}
      </p>

      <p className="mt-2 text-sm text-text-tertiary">
        {description}
      </p>
    </PageCard>
  );
}

function AccountField({
  label,
  icon: Icon,
  value,
  placeholder,
  onChange,
  type = "text",
  disabled = false,
}: {
  label: string;
  icon: typeof User;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-semibold text-text-primary">
        {label}
      </span>

      <div className="relative">
        <Icon
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary"
        />

        <input
          type={type}
          value={value}
          disabled={disabled}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder={placeholder}
          className="w-full rounded-xl border border-border-subtle bg-white py-3 pl-11 pr-4 text-text-primary outline-none transition focus:border-interaction focus:ring-2 focus:ring-interaction/15 disabled:cursor-not-allowed disabled:bg-neutral-100"
        />
      </div>
    </label>
  );
}

function SettingDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-surface-sunken p-4">
      <p className="text-overline text-charcoal-soft">
        {label}
      </p>

      <p className="mt-2 font-semibold text-text-primary">
        {value}
      </p>
    </div>
  );
}

function SettingRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-5 rounded-2xl bg-surface-sunken p-4">
      <p className="text-sm text-text-secondary">
        {label}
      </p>

      <p className="break-all text-right text-sm font-semibold text-text-primary">
        {value}
      </p>
    </div>
  );
}

function formatCurrency(
  value: number
) {
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function formatMemberSince(
  value: string | null
) {
  if (!value) {
    return "Recently";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
}

function formatSubscriptionDate(
  value: string
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}