import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = {
  title: "Subzwari Stories",
  description: "Stories of heritage, achievement, and community from Subzwari around the world.",
};

export default async function StoriesPage() {
  const now = new Date();
  const stories = await prisma.story.findMany({
    where: {
      deletedAt: null,
      OR: [{ status: "PUBLISHED" }, { status: "SCHEDULED", scheduledAt: { lte: now } }],
    },
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
    include: { category: true },
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold">Subzwari Stories</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Heritage, achievement, and community stories from Subzwari around the world.
      </p>

      <div className="mt-10">
        {stories.length === 0 ? (
          <EmptyState title="No stories published yet" />
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {stories.map((story) => (
              <Link key={story.id} href={`/stories/${story.slug}`}>
                <Card className="h-full hover:border-accent">
                  {story.featured ? <p className="text-xs font-medium uppercase text-accent">Featured</p> : null}
                  <p className="mt-1 font-display text-lg font-semibold">{story.title}</p>
                  {story.category ? <p className="text-xs text-muted-foreground">{story.category.name}</p> : null}
                  {story.excerpt ? <p className="mt-2 text-sm text-muted-foreground">{story.excerpt}</p> : null}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
