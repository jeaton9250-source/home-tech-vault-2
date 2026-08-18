import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const MAX_TEXT_LENGTH = 120;

type CompletionBody = {
  attemptId?: unknown;
  score?: unknown;
  source?: unknown;
  campaign?: unknown;
  referrerHost?: unknown;
};

function cleanText(
  value: unknown
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const cleaned = value
    .trim()
    .slice(0, MAX_TEXT_LENGTH);

  return cleaned || null;
}

function isAllowedOrigin(request: Request) {
  const origin = request.headers.get("origin");

  if (!origin) {
    return true;
  }

  try {
    const url = new URL(origin);

    return (
      url.hostname === "hometechvault.com" ||
      url.hostname === "www.hometechvault.com" ||
      url.hostname === "localhost" ||
      url.hostname === "127.0.0.1"
    );
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    if (!isAllowedOrigin(request)) {
      return NextResponse.json(
        { error: "Invalid request origin." },
        { status: 403 }
      );
    }

    const contentLength =
      Number(
        request.headers.get("content-length") ?? 0
      );

    if (contentLength > 4_096) {
      return NextResponse.json(
        { error: "Request is too large." },
        { status: 413 }
      );
    }

    const body =
      (await request.json()) as CompletionBody;

    const attemptId =
      typeof body.attemptId === "string"
        ? body.attemptId.trim()
        : "";

    const score =
      typeof body.score === "number"
        ? Math.round(body.score)
        : Number.NaN;

    if (!UUID_PATTERN.test(attemptId)) {
      return NextResponse.json(
        { error: "Invalid attempt id." },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(score) ||
      score < 0 ||
      score > 100
    ) {
      return NextResponse.json(
        { error: "Invalid score." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    const { error } = await admin
      .from("health_check_completions")
      .upsert(
        {
          attempt_id: attemptId,
          score,
          source: cleanText(body.source),
          campaign: cleanText(body.campaign),
          referrer_host:
            cleanText(body.referrerHost),
        },
        {
          onConflict: "attempt_id",
          ignoreDuplicates: true,
        }
      );

    if (error) {
      throw error;
    }

    return NextResponse.json(
      { success: true },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "[health-check-completion] failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to record Health Check completion.",
      },
      { status: 500 }
    );
  }
}
