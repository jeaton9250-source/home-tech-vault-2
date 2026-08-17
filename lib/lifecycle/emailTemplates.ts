export type LifecycleEmailType =
  | "no_device_24h"
  | "no_device_3d"
  | "no_device_7d";

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
      font-family:
        Arial,
        Helvetica,
        sans-serif;
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
                  background:#0b1623;
                  padding:28px 32px;
                "
              >
                <div
                  style="
                    color:#8ca667;
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
                    color:#f4f0e8;
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
              <td
                style="
                  padding:34px 32px 30px;
                "
              >
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

  switch (type) {
    case "no_device_24h": {
      const subject =
        "Start your vault with one device";

      const html = layout({
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
            Add what you know now. Model numbers,
            serial numbers, receipts, warranty
            information, and documents can all be
            added as your vault grows.
          </p>
        `,
        buttonLabel:
          "Add my first device",
        buttonHref: devicesUrl,
        unsubscribeUrl,
      });

      const text = `${normalizedFirstName
        ? `Hi ${normalizedFirstName},`
        : "Hi there,"}

You do not need to organize your entire home today.

Start with one device you use every day — your router, laptop, TV, appliance, or smart-home device.

Add what you know now. Your vault can grow from there.

Add your first device:
${devicesUrl}

Stop onboarding emails:
${unsubscribeUrl}`;

      return {
        subject,
        html,
        text,
      };
    }

    case "no_device_3d": {
      const subject =
        "You don't have to enter everything manually";

      const html = layout({
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

          <p style="margin:0 0 16px;">
            Home Tech Vault is designed so you can
            start small and build from there.
          </p>

          <p style="margin:0;">
            You can also use Smart Import™ when
            available in your vault to help bring
            device information in without typing
            every detail manually.
          </p>
        `,
        buttonLabel:
          "Open my vault",
        buttonHref: devicesUrl,
        unsubscribeUrl,
      });

      const text = `${normalizedFirstName
        ? `Hi ${normalizedFirstName},`
        : "Hi there,"}

Building a useful home inventory should not feel like another chore.

Start small, or use Smart Import™ when available in your vault to help bring device information in faster.

Open your vault:
${devicesUrl}

Stop onboarding emails:
${unsubscribeUrl}`;

      return {
        subject,
        html,
        text,
      };
    }

    case "no_device_7d": {
      const subject =
        "One device now can save a search later";

      const html = layout({
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
            You can get ahead of that today.
            Add one device and Home Tech Vault
            will give that information a permanent
            place to live.
          </p>
        `,
        buttonLabel:
          "Add one device",
        buttonHref: devicesUrl,
        unsubscribeUrl,
      });

      const text = `${normalizedFirstName
        ? `Hi ${normalizedFirstName},`
        : "Hi there,"}

A failed router, warranty claim, insurance loss, or mystery model number is usually when people wish they had documented their technology.

Get ahead of that by adding one device today.

Add one device:
${devicesUrl}

Stop onboarding emails:
${unsubscribeUrl}`;

      return {
        subject,
        html,
        text,
      };
    }
  }
}
