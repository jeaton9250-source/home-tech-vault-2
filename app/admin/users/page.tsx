import { Suspense } from "react";

import UsersAdminClient from "@/components/admin/users/UsersAdminClient";

export const metadata = {
  title: "Users — Home Tech Vault Admin",
};

export default function AdminUsersPage() {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-text-secondary">
          Loading users...
        </p>
      }
    >
      <UsersAdminClient />
    </Suspense>
  );
}
