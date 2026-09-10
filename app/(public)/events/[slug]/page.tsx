import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { RsvpButtons } from "@/components/public/RsvpButtons";
import { ReportButton } from "@/components/public/ReportButton";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const event = await prisma.event.findUnique({ where: { slug: params.slug } });
  if (!event || event.status !== "PUBLISHED") return {};
  return { title: event.name, description: event.description };
}

export default async function EventDetailPage({ params }: { params: { slug: string } }) {
  const session = await getCurrentSession();
  const event = await prisma.event.findUnique({
    where: { slug: params.slug },
    include: {
      country: true,
      city: true,
      organizer: true,
      _count: { select: { rsvps: { where: { status: "GOING" } } } },
    },
  });
  if (!event || event.status !== "PUBLISHED") notFound();

  const myRsvp = session?.user.profileId
    ? await prisma.eventAttendee.findUnique({
        where: { eventId_profileId: { eventId: event.id, profileId: session.user.profileId } },
      })
    : null;

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold">{event.name}</h1>
      <p className="mt-1 text-muted-foreground">{event.startsAt.toLocaleString()}</p>
      <p className="text-muted-foreground">
        {[event.city?.name, event.country?.name].filter(Boolean).join(", ") || event.location}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Organized by {event.organizer.firstName} {event.organizer.lastName} · {event._count.rsvps} going
        {event.maxCapacity ? ` / ${event.maxCapacity} capacity` : ""}
      </p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>About this event</CardTitle>
        </CardHeader>
        <p className="text-sm text-muted-foreground">{event.description}</p>
      </Card>

      <div className="mt-6">
        {session?.user ? (
          <RsvpButtons eventId={event.id} currentStatus={myRsvp?.status} />
        ) : (
          <p className="text-sm text-muted-foreground">
            <a href="/login" className="text-accent hover:underline">
              Sign in
            </a>{" "}
            to RSVP.
          </p>
        )}
      </div>

      {session?.user ? (
        <div className="mt-6">
          <ReportButton targetType="EVENT" targetId={event.id} />
        </div>
      ) : null}
    </div>
  );
}
