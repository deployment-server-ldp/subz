import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = {
  title: "Subzwari Moments",
  description: "Celebrations, achievements, and community gatherings shared by Subzwari members.",
};

export default async function MomentsPage() {
  const moments = await prisma.moment.findMany({
    where: { status: "APPROVED", deletedAt: null },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    include: { media: true, submittedBy: true },
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold">Subzwari Moments</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Celebrations, achievements, and community gatherings shared by Subzwari members.
      </p>

      <div className="mt-10">
        {moments.length === 0 ? (
          <EmptyState title="No moments yet" description="Be the first to share a community moment." />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {moments.map((moment) => (
              <figure key={moment.id} className="overflow-hidden rounded border border-border">
                {moment.media[0] ? (
                  <img src={moment.media[0].url} alt={moment.caption} className="aspect-square w-full object-cover" />
                ) : (
                  <div className="aspect-square w-full bg-muted" />
                )}
                <figcaption className="p-2 text-xs text-muted-foreground">{moment.caption}</figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
