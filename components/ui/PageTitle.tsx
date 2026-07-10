import { ReactNode } from "react";

type PageTitleProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  action?: ReactNode;
};

export default function PageTitle({
  title,
  description,
  eyebrow,
  action,
}: PageTitleProps) {
  return (
    <header className="flex flex-col gap-5 rounded-[32px] border border-[#E8E2D6] bg-white p-7 shadow-sm md:flex-row md:items-center md:justify-between md:p-8">
      <div>
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C8A96A]">
            {eyebrow}
          </p>
        )}

        <h1
          className={`text-3xl font-bold tracking-tight text-[#111827] md:text-4xl ${
            eyebrow ? "mt-3" : ""
          }`}
        >
          {title}
        </h1>

        {description && (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500 md:text-base">
            {description}
          </p>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}