import type { ReactNode } from "react";

type AuthCardProps = {
  overline?: string;
  title: string;
  description?: string;
  children: ReactNode;
};

export default function AuthCard({
  overline,
  title,
  description,
  children,
}: AuthCardProps) {
  const showOverline =
    Boolean(overline) &&
    overline?.trim().toLowerCase() !==
      title.trim().toLowerCase();

  return (
    <div className="w-full max-w-[440px] rounded-[30px] border border-[#182533]/10 bg-[#f8f5ef] p-6 shadow-[0_32px_80px_-52px_rgba(15,25,35,0.65)] sm:p-8">
      <div className="text-center">
        {showOverline ? (
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#617c43]">
            {overline}
          </p>
        ) : null}

        <h1
          className={
            showOverline
              ? "mt-3 font-serif text-3xl font-medium tracking-[-0.04em] text-[#17212a]"
              : "font-serif text-3xl font-medium tracking-[-0.04em] text-[#17212a]"
          }
        >
          {title}
        </h1>

        {description ? (
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#707a81]">
            {description}
          </p>
        ) : null}
      </div>

      <div className="mt-7">
        {children}
      </div>
    </div>
  );
}
