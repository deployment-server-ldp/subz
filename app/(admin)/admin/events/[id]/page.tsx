import { notFound } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { getPermissionsForUser, PERMISSIONS } from "@/lib/authz";
import { prisma } from "@/lib/db/prisma";
import { ForbiddenNotice } from "@/components/ui/ForbiddenNotice";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ModerationActions } from "@/components/admin/ModerationActions";
import { reviewEvent } from "@/modules/events/actions";

export default async function AdminEventDetailPage({ params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  const permissions = await getPermissionsForUser(session!.user.id, session!.user.systemRole);
  if (!permissions.has(PERMISSIONS.MANAGE_EVENTS)) return <ForbiddenNotice />;

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: { organizer: { include: { user: true } }, country: true, city: true, _count: { select: { rsvps: true } } },
  });
  if (!event) notFound();

  const statusForModeration = event.status === "PUBLISHED" ? "APPROVED" : event.status === "CANCELLED" ? "REJECTED" : "PENDING";

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">{event.name}</h1>
        <Badge tone="warning" className="mt-2">
          {event.status.replaceAll("_", " ")}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Organizer</dt>
            <dd>
              {event.organizer.firstName} {event.organizer.lastName} ({event.organizer.user.email})
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Starts</dt>
            <dd>{event.startsAt.toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Location</dt>
            <dd>{event.location ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">RSVPs</dt>
            <dd>
              {event._count.rsvps}
              {event.maxCapacity ? ` / ${event.maxCapacity}` : ""}
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="text-muted-foreground">Description</dt>
            <dd>{event.description}</dd>
          </div>
        </dl>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Decision</CardTitle>
        </CardHeader>
        <ModerationActions id={event.id} currentStatus={statusForModeration} onDecide={reviewEvent} />
      </Card>
    </div>
  );
}
