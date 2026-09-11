import { AdminDashboard } from "@/components/admin-dashboard";
import { requireAdmin } from "@/lib/auth";

export default async function AdminPage() {
  await requireAdmin();
  return <AdminDashboard />;
}
