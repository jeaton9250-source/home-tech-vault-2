import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import type { SafeFoundingMemberSummary } from "@/lib/founding-members/types";

export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({
        isFoundingMember: false,
        memberNumber: null,
        status: null,
        enrolledAt: null,
      } satisfies SafeFoundingMemberSummary);
    }

    const { data, error } = await supabase
      .from("platform_founding_members")
      .select(
        "member_number, status, enrolled_at"
      )
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data || data.status !== "active") {
      return NextResponse.json({
        isFoundingMember: false,
        memberNumber: null,
        status: data?.status ?? null,
        enrolledAt: data?.enrolled_at ?? null,
      } satisfies SafeFoundingMemberSummary);
    }

    return NextResponse.json({
      isFoundingMember: true,
      memberNumber: data.member_number,
      status: "active",
      enrolledAt: data.enrolled_at,
    } satisfies SafeFoundingMemberSummary);
  } catch (error) {
    console.error(
      "User founding member summary error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to load founding member status.",
      },
      { status: 500 }
    );
  }
}
