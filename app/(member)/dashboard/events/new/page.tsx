import { prisma } from "@/lib/db/prisma";
import { EventForm } from "@/components/member/EventForm";

export default async function NewEventPage() {
  const countries = await prisma.country.findMany({ orderBy: { displayOrder: "asc" } });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Propose an Event</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Events are reviewed by our community team before they&rsquo;re published.
      </p>
      <div className="mt-6">
        <EventForm countries={countries} />
      </div>
    </div>
  );
}
