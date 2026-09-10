import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { MemberShell } from "@/components/layout/MemberShell";

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession();
  if (!session?.user) redirect("/login");

  const unreadNotifications = await prisma.notification.count({
    where: { recipientId: session.user.id, read: false },
  });

  return <MemberShell unreadNotifications={unreadNotifications}>{children}</MemberShell>;
}
