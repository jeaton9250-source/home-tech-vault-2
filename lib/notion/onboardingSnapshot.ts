import "server-only";
import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { applyHouseholdScope, fetchHouseholdIdForUser } from "@/lib/data/householdScope";
import { eligibleOnboardingAccount, deriveOnboardingStatus, emailStateFromHistory } from "./onboardingPolicy";

export async function loadOnboardingSnapshot(user: User) {
  const db = createAdminClient();
  const [profile, partner, gift, deletion, subscriptions, grants, support, history] = await Promise.all([
    db.from("profiles").select("full_name,account_status").eq("id", user.id).maybeSingle(),
    db.from("realtor_partners").select("id").eq("user_id", user.id).limit(1),
    db.from("realtor_vault_gifts").select("id").eq("claimed_by_user_id", user.id).not("claimed_at", "is", null).limit(1),
    db.from("account_deletion_requests").select("id").eq("user_id", user.id).neq("status", "cancelled").limit(1),
    db.from("user_subscriptions").select("plan,status").eq("user_id", user.id),
    db.from("platform_plan_grants").select("plan,status,starts_at,expires_at").eq("user_id", user.id),
    db.from("support_tickets").select("id").eq("user_id", user.id).not("status", "in", "(resolved,closed)").limit(1),
    db.from("lifecycle_email_log").select("email_type,sent_at").eq("user_id", user.id).eq("status", "sent"),
  ]);
  for (const result of [profile, partner, gift, deletion, subscriptions, grants, support, history]) {
    if (result.error) throw new Error(`Onboarding lookup failed: ${result.error.message}`);
  }
  const giftRecipient = (gift.data?.length ?? 0) > 0;
  const realtor = (partner.data?.length ?? 0) > 0 || user.user_metadata?.signup_experience === "realtor" || user.user_metadata?.onboarding_mode === "realtor";
  if (!eligibleOnboardingAccount({ createdAt: user.created_at, email: user.email, realtor, giftRecipient,
    inactive: Boolean(profile.data?.account_status && profile.data.account_status !== "active"),
    deletionRequested: (deletion.data?.length ?? 0) > 0, bannedUntil: user.banned_until })) return null;

  const householdId = await fetchHouseholdIdForUser(user.id, db);
  const [devices, documents, deviceDocuments, maintenance] = await Promise.all([
    applyHouseholdScope(db.from("devices").select("created_at,warranty_date,warranty_expiration"), householdId, user.id),
    applyHouseholdScope(db.from("documents").select("created_at"), householdId, user.id),
    applyHouseholdScope(db.from("device_documents").select("created_at"), householdId, user.id),
    applyHouseholdScope(db.from("maintenance_tasks").select("created_at"), householdId, user.id),
  ]);
  for (const result of [devices, documents, deviceDocuments, maintenance]) {
    if (result.error) throw new Error(`Onboarding progress lookup failed: ${result.error.message}`);
  }
  const signals = {
    device: (devices.data?.length ?? 0) > 0,
    paperwork: (documents.data?.length ?? 0) > 0 || (deviceDocuments.data?.length ?? 0) > 0
      || (devices.data ?? []).some((row: { warranty_date?: string | null; warranty_expiration?: string | null }) => Boolean(row.warranty_date?.trim() || row.warranty_expiration)),
    maintenance: (maintenance.data?.length ?? 0) > 0,
    needsHelp: (support.data?.length ?? 0) > 0,
  };
  const times = [user.created_at, ...[devices, documents, deviceDocuments, maintenance].flatMap(result =>
    (result.data ?? []).map((row: { created_at?: string | null }) => row.created_at))]
    .filter((value): value is string => Boolean(value)).map(Date.parse).filter(Number.isFinite);
  const now = Date.now();
  const paid = subscriptions.data?.some(row => row.plan !== "free" && ["active", "trialing"].includes(row.status))
    || grants.data?.some(row => row.plan !== "free" && row.status === "active" && Date.parse(row.starts_at) <= now && (!row.expires_at || Date.parse(row.expires_at) > now));
  return {
    user, signals, status: deriveOnboardingStatus(signals),
    name: String(profile.data?.full_name?.trim() || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0]),
    plan: giftRecipient ? "Partner Gift" : paid ? "Paid" : "Free",
    source: giftRecipient ? "Realtor" : "Direct",
    lastProgress: new Date(Math.max(...times)).toISOString(),
    emailState: emailStateFromHistory(new Set((history.data ?? []).map(row => row.email_type))),
  };
}
