import "server-only";

import { createHash } from "crypto";

import type { SupabaseClient } from "@supabase/supabase-js";

import { SUPPORT_RATE_LIMITS } from "@/lib/support/constants";

function hashIpAddress(ip: string) {
  const salt =
    process.env.SUPPORT_RATE_LIMIT_SALT?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    "htv-support-rate-limit";

  return createHash("sha256")
    .update(`${salt}:${ip}`)
    .digest("hex");
}

export function getClientIp(request: Request) {
  const forwardedFor =
    request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return (
    request.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

export function getSubmitterIpHash(request: Request) {
  const ip = getClientIp(request);

  if (ip === "unknown") {
    return null;
  }

  return hashIpAddress(ip);
}

export async function checkSupportSubmissionRateLimit(
  admin: SupabaseClient,
  email: string,
  submitterIpHash: string | null
) {
  const oneHourAgo = new Date(
    Date.now() - 60 * 60 * 1000
  ).toISOString();

  const duplicateSince = new Date(
    Date.now() - SUPPORT_RATE_LIMITS.duplicateWindowMs
  ).toISOString();

  const [
    duplicateResult,
    emailCountResult,
    ipCountResult,
  ] = await Promise.all([
    admin
      .from("support_tickets")
      .select("id, ticket_number")
      .eq("email", email)
      .gte("created_at", duplicateSince)
      .order("created_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle(),

    admin
      .from("support_tickets")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("email", email)
      .gte("created_at", oneHourAgo),

    submitterIpHash
      ? admin
          .from("support_tickets")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("submitter_ip_hash", submitterIpHash)
          .gte("created_at", oneHourAgo)
      : Promise.resolve({
          count: 0,
          error: null,
        }),
  ]);

  if (duplicateResult.error) {
    throw duplicateResult.error;
  }

  if (emailCountResult.error) {
    throw emailCountResult.error;
  }

  if (ipCountResult.error) {
    throw ipCountResult.error;
  }

  if (duplicateResult.data) {
    return {
      allowed: false as const,
      reason: "duplicate_submission" as const,
      existingTicketNumber:
        duplicateResult.data.ticket_number,
    };
  }

  if (
    (emailCountResult.count ?? 0) >=
    SUPPORT_RATE_LIMITS.maxSubmissionsPerEmailPerHour
  ) {
    return {
      allowed: false as const,
      reason: "rate_limited" as const,
    };
  }

  if (
    submitterIpHash &&
    (ipCountResult.count ?? 0) >=
      SUPPORT_RATE_LIMITS.maxSubmissionsPerIpPerHour
  ) {
    return {
      allowed: false as const,
      reason: "rate_limited" as const,
    };
  }

  return { allowed: true as const };
}
