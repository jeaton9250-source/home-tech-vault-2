import { iosError } from "@/lib/ios-api/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  return iosError(
    "BACKEND_UNAVAILABLE",
    "Remote scan triggering is not available.",
    501,
    { code: "SCAN_TRIGGER_NOT_SUPPORTED" }
  );
}
