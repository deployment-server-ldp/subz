import { prisma } from "@/lib/db/prisma";
import { StoryForm } from "@/components/admin/StoryForm";

export default async function NewStoryAdminPage() {
  const categories = await prisma.storyCategory.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">New Story</h1>
      <div className="mt-6">
        <StoryForm categories={categories} />
      </div>
    </div>
  );
}
