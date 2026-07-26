import { requireIosHouseholdContext } from "@/lib/ios-api/auth";
import { iosErrorResponse, iosInternalError, iosJson } from "@/lib/ios-api/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_FILTERS = new Set(["all", "unread", "connector", "device", "warranty", "maintenance"]);

function offsetFromCursor(cursor: string | null) {
  if (!cursor) return 0;
  const parsed = Number.parseInt(Buffer.from(cursor, "base64url").toString("utf8"), 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function cursorFromOffset(offset: number) {
  return Buffer.from(String(offset), "utf8").toString("base64url");
}

function deepLinkFor(row: { entity_type: string | null; entity_id: string | null }) {
  if (!row.entity_type || !row.entity_id) {
    return { destination: "notifications", id: null };
  }

  if (row.entity_type === "connector") return { destination: "connector_detail", id: row.entity_id };
  if (row.entity_type === "discovered_device") return { destination: "discovered_device", id: row.entity_id };
  if (row.entity_type === "device") return { destination: "device_detail", id: row.entity_id };
  if (row.entity_type === "maintenance_task") return { destination: "maintenance_task", id: row.entity_id };
  if (row.entity_type === "warranty") return { destination: "warranty", id: row.entity_id };
  return { destination: "notifications", id: row.entity_id };
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const context = await requireIosHouseholdContext(
      request,
      url.searchParams.get("household_id"),
      { requirePaid: true }
    );
    const filter = url.searchParams.get("filter") ?? "all";
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 50), 1), 100);
    const offset = offsetFromCursor(url.searchParams.get("cursor"));

    if (!VALID_FILTERS.has(filter)) {
      return iosJson({ notifications: [], unread_count: 0, next_cursor: null });
    }

    let query = context.admin
      .from("notifications")
      .select("id, household_id, type, title, body, entity_type, entity_id, is_read, created_at, read_at", { count: "exact" })
      .eq("household_id", context.householdId)
      .eq("user_id", context.userId)
      .is("archived_at", null)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (filter === "unread") {
      query = query.eq("is_read", false);
    } else if (filter !== "all") {
      query = query.like("type", `${filter}%`);
    }

    const [{ data, error, count }, unreadResult] = await Promise.all([
      query,
      context.admin
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("household_id", context.householdId)
        .eq("user_id", context.userId)
        .eq("is_read", false)
        .is("archived_at", null),
    ]);

    if (error) throw error;
    if (unreadResult.error) throw unreadResult.error;

    const rows = data ?? [];
    return iosJson({
      notifications: rows.map((row) => ({
        id: row.id,
        household_id: row.household_id,
        type: row.type,
        title: row.title,
        body: row.body,
        entity_type: row.entity_type,
        entity_id: row.entity_id,
        is_read: row.is_read,
        created_at: row.created_at,
        read_at: row.read_at,
        deep_link: deepLinkFor(row),
      })),
      unread_count: unreadResult.count ?? 0,
      next_cursor: count && offset + limit < count ? cursorFromOffset(offset + limit) : null,
    });
  } catch (error) {
    return iosErrorResponse(error) ?? iosInternalError("list notifications", error);
  }
}
