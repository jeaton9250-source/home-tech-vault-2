import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function LandingFooter() {
  return (
    <footer className="border-t border-[#E8E2D6] bg-[#F7F5EF] px-5 py-14 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#111827] text-[#C8A96A]">
            <ShieldCheck size={18} />
          </div>
          <span className="text-base font-bold tracking-tight text-[#111827]">
            Home Tech Vault
          </span>
        </div>

        <nav className="flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-[#6B7280]">
          <a href="#features" className="hover:text-[#111827]">
            Features
          </a>
          <Link href="/demo" className="hover:text-[#111827]">
            Demo
          </Link>
          <Link href="/login" className="hover:text-[#111827]">
            Sign in
          </Link>
          <Link href="/signup" className="hover:text-[#111827]">
            Create account
          </Link>
        </nav>
      </div>

      <div className="mx-auto mt-10 max-w-6xl border-t border-[#E8E2D6] pt-6">
        <p className="text-xs text-[#9CA3AF]">
          © {new Date().getFullYear()} Home Tech Vault. Organize. Protect.
          Simplify.
        </p>
      </div>
    </footer>
  );
}
