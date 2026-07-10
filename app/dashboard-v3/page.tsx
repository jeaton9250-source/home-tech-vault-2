import { redirect } from "next/navigation";

export default function DashboardV3() {
  // Redirect this secondary route to the canonical dashboard to avoid
  // duplicate content being served.
  redirect("/");
}