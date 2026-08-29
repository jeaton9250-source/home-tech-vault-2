import { NextResponse } from "next/server";

import {
  clearClientVaultMode,
  resolveActiveClientVault,
} from "@/lib/realtor/clientVaultMode";
import {
  createAdminClient,
} from "@/lib/supabase/admin";
import {
  createClient,
} from "@/lib/supabase/server";

export const dynamic =
  "force-dynamic";

export async function GET() {
  try {
    const supabase =
      await createClient();

    const {
      data: { user },
    } =
      await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({
        active: false,
      });
    }

    const mode =
      await resolveActiveClientVault(
        createAdminClient(),
        user.id
      );

    if (!mode) {
      await clearClientVaultMode();

      return NextResponse.json({
        active: false,
      });
    }

    return NextResponse.json({
      active: true,
      label: mode.label,
      giftId: mode.giftId,
    });
  } catch (error) {
    console.error(
      "Client Vault status failed:",
      error
    );

    return NextResponse.json({
      active: false,
    });
  }
}
