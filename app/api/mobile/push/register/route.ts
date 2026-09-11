import { NextResponse } from "next/server";

import { authenticateRequest } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EXPO_PUSH_TOKEN = /^(ExponentPushToken|ExpoPushToken)\[[A-Za-z0-9_-]+\]$/;

export async function POST(request: Request) {
  const { client, user, error: userError } = await authenticateRequest(request);
  if (userError || !user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "The notification details could not be read." }, { status: 400 });
  }

  const token = typeof body.token === "string" ? body.token.trim() : "";
  const platform = body.platform === "ios" || body.platform === "android" ? body.platform : null;
  const deviceId = typeof body.deviceId === "string" ? body.deviceId.slice(0, 240) : null;
  if (!EXPO_PUSH_TOKEN.test(token) || !platform) {
    return NextResponse.json({ error: "The notification token is not valid." }, { status: 400 });
  }

  const { error } = await client.from("device_push_tokens").upsert({
    user_id: user.id,
    expo_push_token: token,
    platform,
    device_id: deviceId,
    enabled: true,
    last_seen_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id,expo_push_token" });

  if (error) {
    console.error("[mobile-push-register] failed", error.message);
    return NextResponse.json({ error: "Notifications could not be connected." }, { status: 500 });
  }

  return NextResponse.json({ registered: true }, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
