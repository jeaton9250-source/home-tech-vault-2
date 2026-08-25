
export type LifecycleEmailType =
  | "no_device_24h"
  | "no_device_3d"
  | "no_device_7d"
  | "device_details_missing"
  | "no_documents"
  | "warranty_missing";

type TemplateInput = {
  type: LifecycleEmailType;
  firstName?: string | null;
  appUrl: string;
  unsubscribeUrl: string;
};

export type LifecycleEmailTemplate = {
  subject: string;
  html: string;
  text: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeFirstName(
  value?: string | null
) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  return trimmed.split(/\s+/)[0] || null;
}

function layout(input: {
  preview: string;
  heading: string;
  body: string;
  buttonLabel: string;
  buttonHref: string;
  unsubscribeUrl: string;
}) {
  return `<!doctype html>
<html>
  <body
    style="
      margin:0;
      padding:0;
      background:#eee9df;
      font-family:Arial,Helvetica,sans-serif;
      color:#17212a;
    "
  >
    <div
      style="
        display:none;
        max-height:0;
        overflow:hidden;
        opacity:0;
      "
    >
      ${escapeHtml(input.preview)}
    </div>

    <table
      role="presentation"
      width="100%"
      cellspacing="0"
      cellpadding="0"
      border="0"
      style="background:#eee9df;"
    >
      <tr>
        <td
          align="center"
          style="padding:32px 16px;"
        >
          <table
            role="presentation"
            width="100%"
            cellspacing="0"
            cellpadding="0"
            border="0"
            style="
              max-width:620px;
              background:#f8f5ef;
              border:1px solid rgba(24,37,51,.10);
              border-radius:24px;
              overflow:hidden;
            "
          >
            <tr>
              <td
                style="
                  background:#183047;
                  padding:28px 32px;
                "
              >
                <div
                  style="
                    color:#718d4f;
                    font-size:11px;
                    font-weight:700;
                    letter-spacing:.14em;
                    text-transform:uppercase;
                  "
                >
                  Home Tech Vault
                </div>

                <div
                  style="
                    margin-top:8px;
                    color:#f5f1e8;
                    font-size:17px;
                    line-height:24px;
                  "
                >
                  Your household technology,
                  organized.
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:34px 32px 30px;">
                <h1
                  style="
                    margin:0;
                    color:#17212a;
                    font-family:Georgia,serif;
                    font-size:30px;
                    line-height:38px;
                    font-weight:500;
                  "
                >
                  ${input.heading}
                </h1>

                <div
                  style="
                    margin-top:20px;
                    color:#4f5b63;
                    font-size:16px;
                    line-height:27px;
                  "
                >
                  ${input.body}
                </div>

                <div style="margin-top:28px;">
                  <a
                    href="${input.buttonHref}"
                    style="
                      display:inline-block;
                      background:#617c43;
                      color:#ffffff;
                      text-decoration:none;
                      font-size:14px;
                      font-weight:700;
                      padding:13px 20px;
                      border-radius:999px;
                    "
                  >
                    ${escapeHtml(input.buttonLabel)}
                  </a>
                </div>

                <div
                  style="
                    margin-top:34px;
                    padding-top:22px;
                    border-top:1px solid rgba(24,37,51,.10);
                    color:#7c868d;
                    font-size:12px;
                    line-height:20px;
                  "
                >
                  You received this because you
                  created a Home Tech Vault account.

                  <br />

                  <a
                    href="${input.unsubscribeUrl}"
                    style="
                      color:#617c43;
                      text-decoration:underline;
                    "
                  >
                    Stop onboarding emails
                  </a>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function createLifecycleEmail({
  type,
  firstName,
  appUrl,
  unsubscribeUrl,
}: TemplateInput): LifecycleEmailTemplate {
  const normalizedFirstName =
    normalizeFirstName(firstName);

  const greeting = normalizedFirstName
    ? `Hi ${escapeHtml(normalizedFirstName)},`
    : "Hi there,";

  const devicesUrl =
    `${appUrl}/devices`;

  const documentsUrl =
    `${appUrl}/documents/upload`;

  const warrantiesUrl =
    `${appUrl}/warranties`;

  switch (type) {
    case "no_device_24h": {
      const subject =
        "Start your vault with one device";

      return {
        subject,
        html: layout({
          preview:
            "Your Home Tech Vault is ready. Start with one device.",
          heading:
            "Start with one device.",
          body: `
            <p style="margin:0 0 16px;">
              ${greeting}
            </p>

            <p style="margin:0 0 16px;">
              You do not need to organize your
              entire home today.
            </p>

            <p style="margin:0 0 16px;">
              Start with one device you use every
              day — your router, laptop, TV,
              appliance, or smart-home device.
            </p>

            <p style="margin:0;">
              Add what you know now. Your vault
              can grow from there.
            </p>
          `,
          buttonLabel:
            "Add my first device",
          buttonHref: devicesUrl,
          unsubscribeUrl,
        }),
        text: `${normalizedFirstName
          ? `Hi ${normalizedFirstName},`
          : "Hi there,"}

Start with one device you use every day.

Add your first device:
${devicesUrl}

Stop onboarding emails:
${unsubscribeUrl}`,
      };
    }

    case "no_device_3d": {
      const subject =
        "You don't have to enter everything manually";

      return {
        subject,
        html: layout({
          preview:
            "Home Tech Vault can help you get started faster.",
          heading:
            "Skip the weekend data-entry project.",
          body: `
            <p style="margin:0 0 16px;">
              ${greeting}
            </p>

            <p style="margin:0 0 16px;">
              Building a useful home inventory
              should not feel like another chore.
            </p>

            <p style="margin:0;">
              Start small, or use Smart Import™
              when available in your vault to help
              bring device information in faster.
            </p>
          `,
          buttonLabel:
            "Open my vault",
          buttonHref: devicesUrl,
          unsubscribeUrl,
        }),
        text: `${normalizedFirstName
          ? `Hi ${normalizedFirstName},`
          : "Hi there,"}

Building a useful home inventory should not feel like another chore.

Open your vault:
${devicesUrl}

Stop onboarding emails:
${unsubscribeUrl}`,
      };
    }

    case "no_device_7d": {
      const subject =
        "One device now can save a search later";

      return {
        subject,
        html: layout({
          preview:
            "Document one device before you need the information.",
          heading:
            "Your future self will appreciate this.",
          body: `
            <p style="margin:0 0 16px;">
              ${greeting}
            </p>

            <p style="margin:0 0 16px;">
              A failed router, warranty claim,
              insurance loss, or mystery model
              number is usually when people wish
              they had documented their technology.
            </p>

            <p style="margin:0;">
              Add one device today and give that
              information a permanent place to live.
            </p>
          `,
          buttonLabel:
            "Add one device",
          buttonHref: devicesUrl,
          unsubscribeUrl,
        }),
        text: `${normalizedFirstName
          ? `Hi ${normalizedFirstName},`
          : "Hi there,"}

Add one device today so the details are there when you need them.

${devicesUrl}

Stop onboarding emails:
${unsubscribeUrl}`,
      };
    }

    case "device_details_missing": {
      const subject =
        "Finish your device record while it's easy";

      return {
        subject,
        html: layout({
          preview:
            "A model and serial number can save a lot of searching later.",
          heading:
            "Your device is in. Now make the record useful.",
          body: `
            <p style="margin:0 0 16px;">
              ${greeting}
            </p>

            <p style="margin:0 0 16px;">
              Nice — you have already started
              building your Home Tech Vault.
            </p>

            <p style="margin:0 0 16px;">
              One of your device records is still
              missing its model number or serial
              number.
            </p>

            <p style="margin:0;">
              Those two details are especially
              useful for support calls, replacement
              parts, warranty claims, insurance,
              and identifying the exact version of
              a device later.
            </p>
          `,
          buttonLabel:
            "Complete my device",
          buttonHref: devicesUrl,
          unsubscribeUrl,
        }),
        text: `${normalizedFirstName
          ? `Hi ${normalizedFirstName},`
          : "Hi there,"}

One of your device records is missing its model number or serial number.

Complete the record:
${devicesUrl}

Stop onboarding emails:
${unsubscribeUrl}`,
      };
    }

    case "no_documents": {
      const subject =
        "Save the receipt while it's still easy to find";

      return {
        subject,
        html: layout({
          preview:
            "Add a receipt, manual, or warranty document to your vault.",
          heading:
            "Give the paperwork a permanent home.",
          body: `
            <p style="margin:0 0 16px;">
              ${greeting}
            </p>

            <p style="margin:0 0 16px;">
              You have devices in your vault, but
              none of them have a document attached
              yet.
            </p>

            <p style="margin:0 0 16px;">
              A receipt, warranty PDF, manual, or
              installation document is far easier
              to save now than to hunt down later.
            </p>

            <p style="margin:0;">
              Upload just one document to start.
              Home Tech Vault keeps it with the
              device it belongs to.
            </p>
          `,
          buttonLabel:
            "Upload a document",
          buttonHref: documentsUrl,
          unsubscribeUrl,
        }),
        text: `${normalizedFirstName
          ? `Hi ${normalizedFirstName},`
          : "Hi there,"}

You have devices in your vault but no documents attached yet.

Upload a receipt, warranty, or manual:
${documentsUrl}

Stop onboarding emails:
${unsubscribeUrl}`,
      };
    }

    case "warranty_missing": {
      const subject =
        "Do you know when your coverage ends?";

      return {
        subject,
        html: layout({
          preview:
            "Add warranty information before you need to make a claim.",
          heading:
            "Don't let a warranty quietly expire.",
          body: `
            <p style="margin:0 0 16px;">
              ${greeting}
            </p>

            <p style="margin:0 0 16px;">
              Your vault has devices in it, but no
              warranty expiration date is recorded
              yet.
            </p>

            <p style="margin:0 0 16px;">
              Recording coverage now gives you a
              much better chance of using it before
              it expires.
            </p>

            <p style="margin:0;">
              Start with your most expensive or
              newest device. You can fill in the
              rest over time.
            </p>
          `,
          buttonLabel:
            "Add warranty details",
          buttonHref: warrantiesUrl,
          unsubscribeUrl,
        }),
        text: `${normalizedFirstName
          ? `Hi ${normalizedFirstName},`
          : "Hi there,"}

Your vault has devices in it but no warranty expiration date is recorded yet.

Add warranty details:
${warrantiesUrl}

Stop onboarding emails:
${unsubscribeUrl}`,
      };
    }
  }
}
