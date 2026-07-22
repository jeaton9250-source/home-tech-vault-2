import type { ReactNode } from "react";

import { AdminPageHero } from "@/components/admin/layout/AdminPageLayout";

type AdminPageHeaderProps = {
  overline?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  primaryAction?: {
    label: string;
    href: string;
  };
  badge?: ReactNode;
};

export default function AdminPageHeader({
  title,
  description = "",
  primaryAction,
  badge,
}: AdminPageHeaderProps) {
  return (
    <AdminPageHero
      title={title}
      description={description}
      primaryAction={primaryAction}
      badge={badge}
    />
  );
}
