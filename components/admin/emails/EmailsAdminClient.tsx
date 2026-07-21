"use client";

import { useState } from "react";

import AdminPanel from "@/components/admin/AdminPanel";
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
        payload.message ||
          "Test email sent."
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
    <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <AdminPanel title="Configuration">
        <dl className="space-y-4 text-sm">
          <ConfigRow
            label="Resend"
            value={
              resendConfigured
                ? "Configured"
                : "Missing"
            }
          />
          <ConfigRow
            label="Sender"
            value={senderAddress}
          />
          <ConfigRow
            label="Reply-to"
            value={replyToAddress}
          />
          <ConfigRow
            label="Support destination"
            value={supportDestination}
          />
        </dl>

        <div className="mt-6 border-t border-border-subtle pt-4">
          <p className="text-sm text-text-secondary">
            React Email preview server:{" "}
            <code className="rounded bg-surface-sunken px-2 py-1 text-xs">
              npm run email:dev
            </code>
          </p>

          <Button
            type="button"
            className="mt-4"
            disabled={
              sending || !resendConfigured
            }
            onClick={() => {
              void sendTestEmail();
            }}
          >
            {sending
              ? "Sending..."
              : "Send Welcome test to my admin email"}
          </Button>

          {message ? (
            <p className="mt-3 text-sm text-text-secondary">
              {message}
            </p>
          ) : null}
        </div>
      </AdminPanel>

      <AdminPanel title="Template catalog">
        <div className="space-y-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="rounded-[18px] border border-border-subtle bg-surface-sunken px-4 py-3"
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
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                    template.live
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-surface-card text-text-tertiary"
                  }`}
                >
                  {template.live
                    ? "Live"
                    : "Deferred"}
                </span>
              </div>
              {template.notes ? (
                <p className="mt-2 text-xs leading-5 text-text-secondary">
                  {template.notes}
                </p>
              ) : null}
              {template.previewPath ? (
                <p className="mt-2 text-xs text-text-tertiary">
                  {template.previewPath}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </AdminPanel>
    </section>
  );
}

function ConfigRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
        {label}
      </dt>
      <dd className="mt-1 text-text-primary">
        {value}
      </dd>
    </div>
  );
}
