import { prisma } from "@/lib/db/prisma";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { createProfessionalCategory, deleteProfessionalCategory } from "@/modules/categories/actions";

export default async function AdminProfessionalCategoriesPage() {
  const categories = await prisma.professionalCategory.findMany({ orderBy: { displayOrder: "asc" } });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Professional Categories</h1>
      <div className="mt-6">
        <CategoryManager
          categories={categories}
          createAction={createProfessionalCategory}
          deleteAction={deleteProfessionalCategory}
        />
      </div>
    </div>
  );
}
