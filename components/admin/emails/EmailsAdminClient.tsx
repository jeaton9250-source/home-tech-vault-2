"use client";

import { useState } from "react";
import { Mail } from "lucide-react";

import {
  AdminContentSection,
  AdminDetailField,
  AdminPageHero,
  AdminStatusBadge,
  AdminSummaryCard,
  AdminSummaryGrid,
} from "@/components/admin/layout/AdminPageLayout";
import Button from "@/components/ui/Button";
import type { AdminEmailTemplateEntry } from "@/lib/admin/emailCatalog";

type EmailsAdminClientProps = {
  templates: AdminEmailTemplateEntry[];
  senderAddress: string;
  replyToAddress: string;
  supportDestination: string;
  resendConfigured: boolean;
};

export default function EmailsAdminClient({
  templates,
  senderAddress,
  replyToAddress,
  supportDestination,
  resendConfigured,
}: EmailsAdminClientProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const liveTemplates = templates.filter(
    (template) => template.live
  ).length;

  async function sendTestEmail() {
    const confirmed = window.confirm(
      "Send the Welcome email template to your platform-admin account?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setSending(true);
      setMessage("");

      const response = await fetch(
        "/api/admin/emails/test",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            confirm: true,
          }),
        }
      );

      const payload =
        (await response.json()) as {
          message?: string;
          error?: string;
        };

      if (!response.ok) {
        throw new Error(
          payload.error ||
            "Unable to send test email."
        );
      }

      setMessage(
        payload.message || "Test email sent."
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to send test email."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <AdminPageHero
        title="Email"
        description="Review live templates, sender configuration, and send a safe admin test."
      />

      <AdminSummaryGrid>
        <AdminSummaryCard
          label="Templates"
          value={templates.length}
          hint={`${liveTemplates} live`}
          icon={
            <Mail
              aria-hidden="true"
              className="h-5 w-5"
            />
          }
        />
        <AdminSummaryCard
          label="Resend"
          value={
            resendConfigured ? "Configured" : "Missing"
          }
        />
        <AdminSummaryCard
          label="Sender"
          value={senderAddress}
        />
        <AdminSummaryCard
          label="Support inbox"
          value={supportDestination}
        />
      </AdminSummaryGrid>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <AdminContentSection
          id="email-config-heading"
          title="Configuration"
          subtitle="Delivery settings currently in use."
        >
          <div className="space-y-4">
            <AdminDetailField
              label="Reply-to"
              value={replyToAddress}
            />
            <AdminDetailField
              label="Preview server"
              value="npm run email:dev"
            />
          </div>

          <div
            id="send-test-email"
            className="mt-6 border-t border-border-subtle pt-6"
          >
            <Button
              type="button"
              disabled={sending || !resendConfigured}
              onClick={() => {
                void sendTestEmail();
              }}
            >
              {sending
                ? "Sending…"
                : "Send Welcome test to my admin email"}
            </Button>

            {message ? (
              <p className="mt-3 text-sm text-text-secondary">
                {message}
              </p>
            ) : null}
          </div>
        </AdminContentSection>

        <AdminContentSection
          id="email-templates-heading"
          title="Template catalog"
          subtitle="Live and deferred transactional templates."
        >
          <ul className="space-y-3">
            {templates.map((template) => (
              <li
                key={template.id}
                className="rounded-[20px] border border-border-subtle bg-surface-sunken px-4 py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-text-primary">
                      {template.name}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.12em] text-text-tertiary">
                      {template.category}
                    </p>
                  </div>
                  <AdminStatusBadge
                    tone={
                      template.live ? "success" : "neutral"
                    }
                  >
                    {template.live ? "Live" : "Deferred"}
                  </AdminStatusBadge>
                </div>
                {template.notes ? (
                  <p className="mt-2 text-sm leading-6 text-text-secondary">
                    {template.notes}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </AdminContentSection>
      </section>
    </>
  );
}
