import { Suspense } from "react";

import FoundingMembersAdminClient from "@/components/admin/founding-members/FoundingMembersAdminClient";

export const metadata = {
  title:
    "Founding Members — Home Tech Vault Admin",
};

export default function FoundingMembersAdminPage() {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-text-secondary">
          Loading founding members...
        </p>
      }
    >
      <FoundingMembersAdminClient />
    </Suspense>
  );
}
