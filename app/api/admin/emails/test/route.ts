import { NextResponse } from "next/server";

import WelcomeEmail, {
  renderWelcomePlainText,
  welcomeSubject,
} from "@/emails/templates/WelcomeEmail";
import {
  platformAdminAccessResponse,
  requirePlatformAdminSession,
} from "@/lib/auth/platformAdmin";
import { sendReactEmail } from "@/lib/email/sendEmail";
import { emailTheme } from "@/emails/styles/emailTheme";

export const runtime = "nodejs";

type TestEmailBody = {
  confirm?: boolean;
};

export async function POST(request: Request) {
  try {
    const session =
      await requirePlatformAdminSession();

    const body =
      (await request.json()) as TestEmailBody;

    if (body.confirm !== true) {
      return NextResponse.json(
        {
          error:
            "Confirmation is required to send a test email.",
        },
        { status: 400 }
      );
    }

    if (!session.email) {
      return NextResponse.json(
        {
          error:
            "Your admin account does not have an email address.",
        },
        { status: 400 }
      );
    }

    const dashboardUrl = `${emailTheme.brand.siteUrl}/dashboard`;

    const result = await sendReactEmail({
      to: session.email,
      subject: welcomeSubject,
      template: WelcomeEmail({
        firstName: "Admin",
        dashboardUrl,
      }),
      text: renderWelcomePlainText({
        firstName: "Admin",
        dashboardUrl,
      }),
      tags: [
        {
          name: "category",
          value: "admin_test_email",
        },
      ],
    });

    if (!result.ok) {
      return NextResponse.json(
        {
          error:
            result.message ||
            "Unable to send test email.",
        },
        { status: 500 }
      );
    }

    console.info(
      "[admin] test email sent",
      {
        adminId: session.userId,
        email: session.email,
      }
    );

    return NextResponse.json({
      ok: true,
      message: `Test email sent to ${session.email}.`,
    });
  } catch (error) {
    const accessResponse =
      platformAdminAccessResponse(error);

    if (accessResponse) {
      return accessResponse;
    }

    console.error(
      "Admin test email error:",
      error
    );

    return NextResponse.json(
      { error: "Unable to send test email." },
      { status: 500 }
    );
  }
}
