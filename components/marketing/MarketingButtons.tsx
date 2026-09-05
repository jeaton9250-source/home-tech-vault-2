import Link from "next/link";
import { ArrowRight } from "lucide-react";

type ButtonProps = {
  href: string;
  children: React.ReactNode;
};

export function PrimaryMarketingButton({
  href,
  children,
}: ButtonProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#152335] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-[#24384c]"
    >
      {children}

      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}

export function SecondaryMarketingButton({
  href,
  children,
}: ButtonProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center gap-2 rounded-full border border-[#152335]/12 bg-white/60 px-6 py-3.5 text-sm font-semibold text-[#152335] backdrop-blur transition duration-200 hover:bg-white"
    >
      {children}
    </Link>
  );
}

export function RealtorMarketingButton({
  href,
  children,
}: ButtonProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#9b9a3d] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#898835]"
    >
      {children}

      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}
