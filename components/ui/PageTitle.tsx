import type { ReactNode } from "react";

import PageHero, {
  type PageHeroSection,
} from "@/components/ui/PageHero";

type PageTitleProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  action?: ReactNode;
  section?: PageHeroSection;
  className?: string;
};

export default function PageTitle({
  title,
  description,
  eyebrow,
  action,
  section = "neutral",
  className,
}: PageTitleProps) {
  return (
    <PageHero
      section={section}
      eyebrow={eyebrow}
      title={title}
      description={description}
      className={className}
    >
      {action}
    </PageHero>
  );
}
