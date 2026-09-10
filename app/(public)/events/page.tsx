import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = {
  title: "Community Events",
  description: "Upcoming Subzwari community events around the world.",
};

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const countryId = typeof searchParams.countryId === "string" ? searchParams.countryId : undefined;

  const events = await prisma.event.findMany({
    where: { status: "PUBLISHED", startsAt: { gte: new Date() }, ...(countryId ? { countryId } : {}) },
    orderBy: { startsAt: "asc" },
    include: { country: true, city: true, _count: { select: { rsvps: { where: { status: "GOING" } } } } },
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold">Community Events</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">Upcoming Subzwari community events around the world.</p>

      <div className="mt-8">
        {events.length === 0 ? (
          <EmptyState title="No upcoming events" description="Check back soon, or propose one yourself." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {events.map((event) => (
              <Link key={event.id} href={`/events/${event.slug}`}>
                <Card className="h-full hover:border-accent">
                  <p className="font-display text-lg font-semibold">{event.name}</p>
                  <p className="text-sm text-muted-foreground">{event.startsAt.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">
                    {[event.city?.name, event.country?.name].filter(Boolean).join(", ") || event.location}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">{event._count.rsvps} going</p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
