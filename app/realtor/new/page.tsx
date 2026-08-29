import {
  ArrowLeft,
} from "lucide-react";

import Link from "next/link";
import { redirect } from "next/navigation";

import RealtorGiftForm from "@/components/realtor/RealtorGiftForm";

import { createClient } from "@/lib/supabase/server";

export const dynamic =
  "force-dynamic";

export default async function NewRealtorVaultPage() {
  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      "/login?next=/realtor/new"
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f3ec] px-5 py-10 md:px-8 md:py-14">
      <div className="mx-auto max-w-[920px]">
        <Link
          href="/realtor"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#71807a] transition hover:text-[#183047]"
        >
          <ArrowLeft size={15} />
          Realtor Home
        </Link>

        <div className="mt-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#718d4f]">
            New closing gift
          </p>

          <h1 className="mt-4 max-w-3xl font-serif text-[clamp(44px,6vw,72px)] leading-[0.98] tracking-[-0.05em] text-[#183047]">
            Prepare a Vault
            for their new home.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-[#75807a]">
            Start with the property and buyer.
            You can prepare the home record before
            handing ownership over at closing.
          </p>
        </div>

        <div className="mt-12">
          <RealtorGiftForm />
        </div>
      </div>
    </main>
  );
}
