import {
  Check,
  Gift,
  Home,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import {
  notFound,
} from "next/navigation";

import ClaimHomeCard from "@/components/realtor/ClaimHomeCard";
import {
  loadOwnershipTransferByToken,
} from "@/lib/realtor/transfers";
import { createClient } from "@/lib/supabase/server";

export const dynamic =
  "force-dynamic";

type Props = {
  params: Promise<{
    token: string;
  }>;
};

export default async function ClaimHomePage({
  params,
}: Props) {
  const {
    token,
  } = await params;

  const transfer =
    await loadOwnershipTransferByToken(
      token
    );

  if (
    !transfer ||
    transfer.status !==
      "pending"
  ) {
    notFound();
  }

  const expiresAt =
    new Date(
      transfer.expires_at
    );

  if (
    expiresAt.getTime() <=
    Date.now()
  ) {
    notFound();
  }

  const rawGift =
    transfer.realtor_vault_gifts;

  const gift =
    Array.isArray(rawGift)
      ? rawGift[0] ?? null
      : rawGift ?? null;

  if (!gift) {
    notFound();
  }

  const supabase =
    await createClient();

  const {
    data: {
      user,
    },
  } = await supabase.auth.getUser();

  const planName =
    gift.gift_plan === "family"
      ? "Family"
      : gift.gift_plan === "pro"
        ? "Pro"
        : "Free";

  return (
    <main className="min-h-screen bg-[#f7f3ec] px-5 py-12 md:px-8 md:py-20">
      <div className="mx-auto max-w-[760px]">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#183047] text-white">
            <Home size={22} />
          </div>

          <p className="mt-7 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#718d4f]">
            Home Tech Vault
          </p>

          <h1 className="mt-5 font-serif text-[clamp(48px,8vw,76px)] leading-[0.94] tracking-[-0.055em] text-[#183047]">
            Welcome home
            {gift.buyer_first_name
              ? `, ${gift.buyer_first_name}.`
              : "."}
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-[#77817c]">
            Your Home Tech Vault has been
            prepared and is ready to become yours.
          </p>
        </div>

        <section className="mt-12 overflow-hidden rounded-[36px] bg-[#183047] text-white">
          <div className="p-7 md:p-9">
            <p className="text-[9px] font-semibold uppercase tracking-[0.19em] text-[#c3d5ad]">
              Your new home
            </p>

            <h2 className="mt-4 font-serif text-4xl tracking-[-0.04em]">
              {gift.property_address_line1}
            </h2>

            <div className="mt-3 flex items-center gap-2 text-sm text-white/55">
              <MapPin size={14} />
              {gift.property_city},{" "}
              {gift.property_state}{" "}
              {gift.property_postal_code}
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                "Devices and appliances",
                "Manuals and documents",
                "Warranty records",
                "Home Wi-Fi information",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm text-white/65"
                >
                  <Check size={13} />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10 bg-white/5 p-7 md:p-9">
            <div className="flex items-start gap-4">
              <Gift size={19} />

              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/45">
                  Included closing gift
                </p>

                <h3 className="mt-2 font-serif text-2xl">
                  1 Year Home Tech Vault{" "}
                  {planName}
                </h3>

                <p className="mt-2 text-sm text-white/50">
                  Premium access has already
                  been purchased for this home.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[30px] border border-[#183047]/10 bg-white p-7">
          <div className="flex items-start gap-4">
            <ShieldCheck
              size={20}
              className="mt-1 text-[#617c43]"
            />

            <div>
              <h3 className="font-serif text-xl text-[#183047]">
                The Vault becomes yours.
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#78837d]">
                When you accept, ownership of
                this home moves to your account.
              </p>
            </div>
          </div>

          <div className="mt-7">
            <ClaimHomeCard
              token={token}
              signedIn={Boolean(user)}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
