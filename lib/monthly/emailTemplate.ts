
export type MonthlyVaultReportData = {
  firstName: string | null;
  reportLabel: string;

  score: number;
  status: string | null;

  deviceCount: number;
  completeDeviceCount: number;

  documentCount: number;

  warrantyTrackedCount: number;
  missingWarrantyCount: number;
  expiringWarrantyCount: number;

  missingSerialCount: number;
  devicesWithoutDocuments: number;

  networkConfigured: boolean;

  recommendation:
    | {
        title: string;
        description: string;
      }
    | null;

  appUrl: string;
  unsubscribeUrl: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function metric(
  value: number | string,
  label: string
) {
  return `
    <td
      width="50%"
      style="
        padding:10px;
        vertical-align:top;
      "
    >
      <div
        style="
          border:1px solid rgba(24,37,51,.10);
          border-radius:16px;
          background:#eee9df;
          padding:17px;
        "
      >
        <div
          style="
            color:#17212a;
            font-family:Georgia,serif;
            font-size:26px;
            line-height:30px;
          "
        >
          ${escapeHtml(String(value))}
        </div>

        <div
          style="
            margin-top:5px;
            color:#68737b;
            font-size:12px;
            line-height:18px;
          "
        >
          ${escapeHtml(label)}
        </div>
      </div>
    </td>
  `;
}

function attentionRow(
  text: string
) {
  return `
    <div
      style="
        margin-top:10px;
        border:1px solid rgba(24,37,51,.08);
        background:#eee9df;
        border-radius:14px;
        padding:12px 14px;
        color:#56616a;
        font-size:14px;
        line-height:21px;
      "
    >
      <span
        style="
          color:#617c43;
          font-weight:700;
        "
      >
        •
      </span>
      ${escapeHtml(text)}
    </div>
  `;
}

export function createMonthlyVaultReportEmail(
  data: MonthlyVaultReportData
) {
  const greeting =
    data.firstName?.trim()
      ? `Hi ${escapeHtml(data.firstName.trim())},`
      : "Hi there,";

  const dashboardUrl =
    `${data.appUrl}/dashboard`;

  const warrantiesUrl =
    `${data.appUrl}/warranties`;

  const attention: string[] = [];

  if (data.missingSerialCount > 0) {
    attention.push(
      `${data.missingSerialCount} device${
        data.missingSerialCount === 1 ? "" : "s"
      } missing a serial number`
    );
  }

  if (data.missingWarrantyCount > 0) {
    attention.push(
      `${data.missingWarrantyCount} device${
        data.missingWarrantyCount === 1 ? "" : "s"
      } missing warranty information`
    );
  }

  if (data.expiringWarrantyCount > 0) {
    attention.push(
      `${data.expiringWarrantyCount} warrant${
        data.expiringWarrantyCount === 1
          ? "y"
          : "ies"
      } expiring within 90 days`
    );
  }

  if (data.devicesWithoutDocuments > 0) {
    attention.push(
      `${data.devicesWithoutDocuments} device${
        data.devicesWithoutDocuments === 1
          ? "" : "s"
      } without a saved document`
    );
  }

  if (!data.networkConfigured) {
    attention.push(
      "Your household network details are not documented yet"
    );
  }

  const attentionHtml =
    attention.length > 0
      ? attention
          .slice(0, 5)
          .map(attentionRow)
          .join("")
      : attentionRow(
          "Your vault is in good shape. Keep important records current as your household technology changes."
        );

  const subject =
    `${data.reportLabel} Vault Health Report — ${data.score}% ready`;

  const html = `<!doctype html>
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
      Your ${escapeHtml(
        data.reportLabel
      )} Home Tech Vault health report.
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
              max-width:640px;
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
                  padding:30px 32px;
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
                    margin-top:10px;
                    color:#f4f0e8;
                    font-family:Georgia,serif;
                    font-size:27px;
                    line-height:35px;
                  "
                >
                  Your ${escapeHtml(
                    data.reportLabel
                  )} Vault Health Report
                </div>
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding:32px;
                "
              >
                <p
                  style="
                    margin:0;
                    color:#56616a;
                    font-size:15px;
                    line-height:25px;
                  "
                >
                  ${greeting}
                </p>

                <p
                  style="
                    margin:12px 0 0;
                    color:#56616a;
                    font-size:15px;
                    line-height:25px;
                  "
                >
                  Here is a quick look at how complete
                  and useful your household technology
                  records are right now.
                </p>

                <div
                  style="
                    margin-top:26px;
                    border-radius:22px;
                    background:#101d2b;
                    padding:28px;
                    text-align:center;
                  "
                >
                  <div
                    style="
                      color:#8ca667;
                      font-size:10px;
                      font-weight:700;
                      letter-spacing:.15em;
                      text-transform:uppercase;
                    "
                  >
                    Vault Readiness
                  </div>

                  <div
                    style="
                      margin-top:8px;
                      color:#f4f0e8;
                      font-family:Georgia,serif;
                      font-size:54px;
                      line-height:60px;
                    "
                  >
                    ${data.score}%
                  </div>

                  <div
                    style="
                      margin-top:5px;
                      color:#aab4bc;
                      font-size:13px;
                    "
                  >
                    ${escapeHtml(
                      data.status || "Building"
                    )}
                  </div>
                </div>

                <table
                  role="presentation"
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                  style="
                    margin-top:18px;
                  "
                >
                  <tr>
                    ${metric(
                      data.deviceCount,
                      "Devices documented"
                    )}

                    ${metric(
                      data.completeDeviceCount,
                      "Complete device records"
                    )}
                  </tr>

                  <tr>
                    ${metric(
                      data.documentCount,
                      "Documents stored"
                    )}

                    ${metric(
                      data.warrantyTrackedCount,
                      "Warranties tracked"
                    )}
                  </tr>
                </table>

                <div
                  style="
                    margin-top:28px;
                  "
                >
                  <div
                    style="
                      color:#617c43;
                      font-size:10px;
                      font-weight:700;
                      letter-spacing:.14em;
                      text-transform:uppercase;
                    "
                  >
                    Needs Attention
                  </div>

                  ${attentionHtml}
                </div>

                ${
                  data.recommendation
                    ? `
                      <div
                        style="
                          margin-top:28px;
                          border-left:3px solid #617c43;
                          padding:4px 0 4px 16px;
                        "
                      >
                        <div
                          style="
                            color:#17212a;
                            font-family:Georgia,serif;
                            font-size:20px;
                            line-height:28px;
                          "
                        >
                          ${escapeHtml(
                            data.recommendation.title
                          )}
                        </div>

                        <div
                          style="
                            margin-top:7px;
                            color:#68737b;
                            font-size:14px;
                            line-height:22px;
                          "
                        >
                          ${escapeHtml(
                            data.recommendation.description
                          )}
                        </div>
                      </div>
                    `
                    : ""
                }

                <div
                  style="
                    margin-top:30px;
                  "
                >
                  <a
                    href="${dashboardUrl}"
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
                    Improve my vault
                  </a>

                  ${
                    data.expiringWarrantyCount > 0
                      ? `
                        <a
                          href="${warrantiesUrl}"
                          style="
                            display:inline-block;
                            margin-left:10px;
                            color:#617c43;
                            font-size:13px;
                            font-weight:700;
                            text-decoration:none;
                          "
                        >
                          Review warranties
                        </a>
                      `
                      : ""
                  }
                </div>

                <div
                  style="
                    margin-top:34px;
                    border-top:1px solid rgba(24,37,51,.10);
                    padding-top:20px;
                    color:#7c868d;
                    font-size:12px;
                    line-height:19px;
                  "
                >
                  This is your monthly Home Tech Vault
                  household report.

                  <br />

                  <a
                    href="${data.unsubscribeUrl}"
                    style="
                      color:#617c43;
                      text-decoration:underline;
                    "
                  >
                    Stop monthly vault reports
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

  const text = `${data.reportLabel} Vault Health Report

${data.firstName?.trim()
  ? `Hi ${data.firstName.trim()},`
  : "Hi there,"}

Vault readiness: ${data.score}%
Status: ${data.status || "Building"}

Devices documented: ${data.deviceCount}
Complete device records: ${data.completeDeviceCount}
Documents stored: ${data.documentCount}
Warranties tracked: ${data.warrantyTrackedCount}

Needs attention:
${
  attention.length
    ? attention.map((item) => `- ${item}`).join("\n")
    : "- Your vault is in good shape."
}

Open your vault:
${dashboardUrl}

Stop monthly vault reports:
${data.unsubscribeUrl}`;

  return {
    subject,
    html,
    text,
  };
}
