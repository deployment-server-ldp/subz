import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const story = await prisma.story.findUnique({ where: { slug: params.slug } });
  if (!story) return {};
  return { title: story.title, description: story.excerpt ?? undefined };
}

export default async function StoryDetailPage({ params }: { params: { slug: string } }) {
  const now = new Date();
  const story = await prisma.story.findUnique({
    where: { slug: params.slug },
    include: { author: true, category: true, tags: { include: { tag: true } } },
  });

  const isVisible =
    story &&
    !story.deletedAt &&
    (story.status === "PUBLISHED" || (story.status === "SCHEDULED" && story.scheduledAt && story.scheduledAt <= now));
  if (!isVisible || !story) notFound();

  return (
    <article className="mx-auto max-w-2xl px-6 py-16">
      {story.category ? <p className="text-sm uppercase tracking-wide text-accent">{story.category.name}</p> : null}
      <h1 className="font-display text-4xl font-semibold">{story.title}</h1>
      {story.author ? (
        <p className="mt-2 text-sm text-muted-foreground">
          By {story.author.firstName} {story.author.lastName}
        </p>
      ) : null}

      <div className="prose prose-neutral mt-8 max-w-none whitespace-pre-wrap text-muted-foreground">{story.body}</div>

      {story.tags.length > 0 ? (
        <div className="mt-8 flex flex-wrap gap-2">
          {story.tags.map((t) => (
            <span key={t.tagId} className="rounded-full bg-muted px-3 py-1 text-xs">
              {t.tag.name}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}
