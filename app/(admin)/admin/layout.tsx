import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { isStaffRole } from "@/lib/authz";
import { AdminShell } from "@/components/layout/AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession();
  if (!session?.user || !isStaffRole(session.user.systemRole)) {
    redirect("/login");
  }

  return <AdminShell>{children}</AdminShell>;
}
