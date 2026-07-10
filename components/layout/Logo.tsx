import Link from "next/link";
import { Cpu } from "lucide-react";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-4 transition hover:opacity-90">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#111827] text-white shadow-lg">
        <Cpu size={28} />
      </div>

      <div>
        <h1 className="text-xl font-semibold tracking-tight text-[#111827]">
          Home Tech Vault
        </h1>

        <p className="text-sm uppercase tracking-[0.25em] text-[#C8A96A]">
          Organize • Protect • Simplify
        </p>
      </div>
    </Link>
  );
}