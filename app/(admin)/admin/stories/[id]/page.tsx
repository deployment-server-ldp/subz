import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { StoryForm } from "@/components/admin/StoryForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteStory } from "@/modules/stories/actions";

export default async function EditStoryPage({ params }: { params: { id: string } }) {
  const [story, categories] = await Promise.all([
    prisma.story.findUnique({ where: { id: params.id }, include: { tags: { include: { tag: true } } } }),
    prisma.storyCategory.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!story) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Edit Story</h1>
      <div className="mt-6">
        <StoryForm
          storyId={story.id}
          categories={categories}
          initial={{
            title: story.title,
            excerpt: story.excerpt ?? "",
            body: story.body,
            type: story.type,
            categoryId: story.categoryId ?? "",
            tags: story.tags.map((t) => t.tag.name).join(", "),
            status: story.status,
            scheduledAt: story.scheduledAt ? story.scheduledAt.toISOString().slice(0, 16) : "",
            featured: story.featured,
          }}
        />
      </div>
      <div className="mt-8 max-w-2xl border-t border-border pt-6">
        <DeleteButton action={deleteStory.bind(null, story.id)} confirmText="Archive this story?" redirectTo="/admin/stories" />
      </div>
    </div>
  );
}
