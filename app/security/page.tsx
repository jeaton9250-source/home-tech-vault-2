"use client";

import type { ReactNode } from "react";

import {
  KeyRound,
  Laptop,
  MailCheck,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

import FeatureGate from "@/components/permissions/FeatureGate";
import Button from "@/components/ui/Button";
import PageCard from "@/components/ui/PageCard";
import PageHero from "@/components/ui/PageHero";
import PageShell from "@/components/ui/PageShell";

import { usePermissions } from "@/hooks/usePermissions";

const SECURITY_CENTER_FEATURES = [
  "Password and identity management",
  "Session controls",
  "Security activity",
  "Recovery tools",
  "Multi-factor authentication when available",
];

const DEMO_SESSIONS = [
  {
    id: "demo-session-1",
    device: "MacBook Pro",
    location: "Home network",
    lastActive: "Active now",
  },
  {
    id: "demo-session-2",
    device: "iPhone",
    location: "Mobile app",
    lastActive: "2 days ago",
  },
];

const DEMO_ACTIVITY = [
  {
    id: "demo-activity-1",
    label: "Signed in from Chrome on macOS",
    timestamp: "Today at 9:14 AM",
  },
  {
    id: "demo-activity-2",
    label: "Password updated",
    timestamp: "March 12, 2026",
  },
];

function SecuritySection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof ShieldCheck;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <PageCard className="p-6 md:p-8">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-charcoal shadow-[var(--shadow-inset)]">
          <Icon size={21} />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-semibold text-text-primary">
            {title}
          </h2>

          <p className="mt-1 text-sm leading-6 text-text-secondary">
            {description}
          </p>

          <div className="mt-5">{children}</div>
        </div>
      </div>
    </PageCard>
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
    <div className="flex flex-col gap-1 rounded-2xl border border-border-subtle bg-surface-sunken px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm font-medium text-text-primary">
        {label}
      </span>

      <span className="text-sm text-text-secondary">
        {value}
      </span>
    </div>
  );
}

function SecurityCenterContent() {
  const { isDemo, user } = usePermissions();

  const accountEmail = isDemo
    ? "demo@example.com"
    : user?.email ?? "Not available";

  return (
    <PageShell>
      <PageHero
        section="neutral"
        eyebrow="Account Protection"
        title="Security Center"
        description="Advanced account security for your Home Tech Vault."
      >
        {isDemo && (
          <Button href="/signup">
            Create Your Vault
          </Button>
        )}
      </PageHero>

      {isDemo && (
        <section className="rounded-[var(--radius-card)] border border-warning/35 bg-warning-soft/80 p-5 shadow-[var(--shadow-sm)]">
          <p className="text-overline text-achievement">
            Interactive Demo
          </p>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
            This preview uses sample account security
            information. Create your vault to manage your
            own password, sessions, and recovery options.
          </p>
        </section>
      )}

      <section className="grid gap-6">
        <SecuritySection
          icon={KeyRound}
          title="Password and identity"
          description="Review how you sign in and keep your account credentials current."
        >
          <div className="space-y-3">
            <SettingRow
              label="Account email"
              value={accountEmail}
            />

            <SettingRow
              label="Password"
              value={
                isDemo
                  ? "Protected (sample)"
                  : "Managed through your account"
              }
            />

            {!isDemo && (
              <p className="text-sm leading-6 text-text-secondary">
                Password changes apply only to your personal
                Home Tech Vault account.
              </p>
            )}
          </div>
        </SecuritySection>

        <SecuritySection
          icon={MailCheck}
          title="Email verification"
          description="Confirm the email address associated with your account."
        >
          <SettingRow
            label="Verification status"
            value={
              isDemo
                ? "Verified (sample)"
                : "Available after account review"
            }
          />
        </SecuritySection>

        <SecuritySection
          icon={Laptop}
          title="Active sessions"
          description="Review devices and browsers currently signed in to your account."
        >
          {isDemo ? (
            <div className="space-y-3">
              {DEMO_SESSIONS.map((session) => (
                <SettingRow
                  key={session.id}
                  label={session.device}
                  value={`${session.location} · ${session.lastActive}`}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm leading-6 text-text-secondary">
              Session details load here once connected to
              your account security service.
            </p>
          )}
        </SecuritySection>

        <SecuritySection
          icon={ShieldCheck}
          title="Security activity"
          description="Track recent sign-ins and important account security events."
        >
          {isDemo ? (
            <div className="space-y-3">
              {DEMO_ACTIVITY.map((item) => (
                <SettingRow
                  key={item.id}
                  label={item.label}
                  value={item.timestamp}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm leading-6 text-text-secondary">
              Security activity will appear here after your
              account history is available.
            </p>
          )}
        </SecuritySection>

        <SecuritySection
          icon={Smartphone}
          title="Recovery and MFA"
          description="Prepare account recovery options and enable multi-factor authentication when available."
        >
          <div className="space-y-3">
            <SettingRow
              label="Account recovery"
              value={
                isDemo
                  ? "Recovery email configured (sample)"
                  : "Manage recovery options in your account"
              }
            />

            <SettingRow
              label="Multi-factor authentication"
              value={
                isDemo
                  ? "Not enabled (sample)"
                  : "Available when enabled for your account"
              }
            />
          </div>
        </SecuritySection>
      </section>
    </PageShell>
  );
}

export default function SecurityPage() {
  return (
    <FeatureGate
      feature="securityCenter"
      requireAuthentication
      redirectPath="/security"
      title="Security Center"
      description="Advanced account security tools are included with Home Tech Vault Pro and Family."
      features={SECURITY_CENTER_FEATURES}
      upgradeLabel="View Plans"
    >
      <SecurityCenterContent />
    </FeatureGate>
  );
}
