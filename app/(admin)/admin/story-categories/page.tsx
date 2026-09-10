import { prisma } from "@/lib/db/prisma";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { createStoryCategory, deleteStoryCategory } from "@/modules/categories/actions";

export default async function AdminStoryCategoriesPage() {
  const categories = await prisma.storyCategory.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Story Categories</h1>
      <div className="mt-6">
        <CategoryManager
          categories={categories}
          createAction={createStoryCategory}
          deleteAction={deleteStoryCategory}
          showDisplayOrder={false}
        />
      </div>
    </div>
  );
}
