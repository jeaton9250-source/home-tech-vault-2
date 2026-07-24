import { NextResponse } from "next/server";

import {
  loadAdminDeviceCategories,
  loadAdminDeviceHouseholdOptions,
  loadAdminDevices,
} from "@/lib/admin/data/devices";
import {
  platformAdminAccessResponse,
  requirePlatformAdminSession,
} from "@/lib/auth/platformAdmin";
import type {
  AdminDeviceOnlineStatus,
  AdminDeviceSortOption,
  AdminDeviceWarrantyStatus,
} from "@/lib/admin/types";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requirePlatformAdminSession();

    const url = new URL(request.url);

    const result = await loadAdminDevices({
      pagination: {
        page: url.searchParams.get("page"),
        limit: url.searchParams.get("limit"),
      },
      q: url.searchParams.get("q") ?? undefined,
      online:
        (url.searchParams.get("online") as
          | AdminDeviceOnlineStatus
          | "") ?? "",
      category:
        url.searchParams.get("category") ??
        undefined,
      warranty:
        (url.searchParams.get("warranty") as
          | AdminDeviceWarrantyStatus
          | "") ?? "",
      householdId:
        url.searchParams.get("household") ??
        undefined,
      createdFrom:
        url.searchParams.get("createdFrom") ??
        undefined,
      createdTo:
        url.searchParams.get("createdTo") ??
        undefined,
      sort:
        (url.searchParams.get("sort") as
          | AdminDeviceSortOption
          | "") ?? "",
    });

    const [categories, households] =
      await Promise.all([
        loadAdminDeviceCategories(),
        loadAdminDeviceHouseholdOptions(),
      ]);

    return NextResponse.json({
      ...result,
      filters: {
        categories,
        households,
      },
    });
  } catch (error) {
    const accessResponse =
      platformAdminAccessResponse(error);

    if (accessResponse) {
      return accessResponse;
    }

    console.error(
      "Admin devices list error:",
      error
    );

    return NextResponse.json(
      { error: "Unable to load devices." },
      { status: 500 }
    );
  }
}
