import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { NotificationRow } from "@/components/member/NotificationRow";
import { MarkAllReadButton } from "@/components/member/MarkAllReadButton";

const LABELS: Record<string, string> = {
  VERIFICATION_APPROVED: "Your verification was approved",
  VERIFICATION_REJECTED: "Your verification was not approved",
  VERIFICATION_MORE_INFO: "More information is needed for your verification",
  CONNECTION_REQUEST: "You have a new connection request",
  CONNECTION_ACCEPTED: "Your connection request was accepted",
  EVENT_RSVP_CONFIRMED: "Your event RSVP was recorded",
  STORY_APPROVED: "Your story was published",
  BUSINESS_APPROVED: "Your business listing was approved",
  SUPPORT_REQUEST_UPDATE: "There's an update on your support request",
  ADMIN_ANNOUNCEMENT: "Community announcement",
};

export default async function NotificationsPage() {
  const session = await getCurrentSession();
  const notifications = await prisma.notification.findMany({
    where: { recipientId: session!.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Notifications</h1>
        <MarkAllReadButton />
      </div>

      <div className="mt-6 space-y-2">
        {notifications.length === 0 ? (
          <EmptyState title="No notifications yet" />
        ) : (
          notifications.map((n) => (
            <NotificationRow key={n.id} id={n.id} label={LABELS[n.type] ?? n.type} link={n.link} read={n.read} createdAt={n.createdAt.toISOString()} />
          ))
        )}
      </div>
    </div>
  );
}
