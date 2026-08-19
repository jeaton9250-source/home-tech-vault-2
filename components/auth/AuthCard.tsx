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
    <div className="w-full max-w-[440px] rounded-[24px] border border-[#182533]/10 bg-[#f8f5ef] p-5 shadow-[0_24px_60px_-46px_rgba(15,25,35,0.6)] sm:rounded-[30px] sm:p-8 sm:shadow-[0_32px_80px_-52px_rgba(15,25,35,0.65)]">
      <div className="text-center">
        {showOverline ? (
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#617c43] sm:text-[10px]">
            {overline}
          </p>
        ) : null}

        <h1
          className={
            showOverline
              ? "mt-2.5 font-serif text-[28px] font-medium leading-[1.08] tracking-[-0.04em] text-[#17212a] sm:mt-3 sm:text-3xl"
              : "font-serif text-[28px] font-medium leading-[1.08] tracking-[-0.04em] text-[#17212a] sm:text-3xl"
          }
        >
          {title}
        </h1>

        {description ? (
          <p className="mx-auto mt-2.5 max-w-sm text-[13px] leading-5 text-[#707a81] sm:mt-3 sm:text-sm sm:leading-6">
            {description}
          </p>
        ) : null}
      </div>

      <div className="mt-6 sm:mt-7">
        {children}
      </div>
    </div>
  );
}
