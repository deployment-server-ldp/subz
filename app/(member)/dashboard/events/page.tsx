import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

const TONE: Record<string, "neutral" | "warning" | "success" | "danger"> = {
  DRAFT: "neutral",
  PENDING_APPROVAL: "warning",
  PUBLISHED: "success",
  COMPLETED: "neutral",
  CANCELLED: "danger",
};

export default async function MyEventsPage() {
  const session = await getCurrentSession();
  const profile = await prisma.profile.findUnique({ where: { userId: session!.user.id } });

  const [organized, attending] = profile
    ? await Promise.all([
        prisma.event.findMany({ where: { organizerId: profile.id }, orderBy: { createdAt: "desc" } }),
        prisma.eventAttendee.findMany({
          where: { profileId: profile.id, status: "GOING" },
          include: { event: true },
          orderBy: { event: { startsAt: "asc" } },
        }),
      ])
    : [[], []];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">My Events</h1>
        <ButtonLink href="/dashboard/events/new" size="sm">
          Propose an Event
        </ButtonLink>
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold">Organized by me</h2>
        <div className="mt-3 space-y-3">
          {organized.length === 0 ? (
            <EmptyState title="No events proposed yet" />
          ) : (
            organized.map((event) => (
              <Card key={event.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{event.name}</p>
                  <p className="text-sm text-muted-foreground">{event.startsAt.toLocaleString()}</p>
                </div>
                <Badge tone={TONE[event.status]}>{event.status.replaceAll("_", " ")}</Badge>
              </Card>
            ))
          )}
        </div>
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold">Attending</h2>
        <div className="mt-3 space-y-3">
          {attending.length === 0 ? (
            <EmptyState title="No upcoming RSVPs" description="Explore events to find something to attend." />
          ) : (
            attending.map((rsvp) => (
              <Card key={rsvp.id}>
                <p className="font-medium">{rsvp.event.name}</p>
                <p className="text-sm text-muted-foreground">{rsvp.event.startsAt.toLocaleString()}</p>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
