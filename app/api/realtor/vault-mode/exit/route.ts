import { NextResponse } from "next/server";

import {
  clearClientVaultMode,
} from "@/lib/realtor/clientVaultMode";

export const dynamic =
  "force-dynamic";

export async function POST() {
  await clearClientVaultMode();

  return NextResponse.json({
    ok: true,
    redirectTo: "/realtor",
  });
}
