import { prisma } from "@/lib/db/prisma";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { createBusinessCategory, deleteBusinessCategory } from "@/modules/categories/actions";

export default async function AdminBusinessCategoriesPage() {
  const categories = await prisma.businessCategory.findMany({ orderBy: { displayOrder: "asc" } });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Business Categories</h1>
      <div className="mt-6">
        <CategoryManager
          categories={categories}
          createAction={createBusinessCategory}
          deleteAction={deleteBusinessCategory}
        />
      </div>
    </div>
  );
}
