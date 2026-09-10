import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { MemberShell } from "@/components/layout/MemberShell";

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession();
  if (!session?.user) redirect("/login");

  return <MemberShell>{children}</MemberShell>;
}
