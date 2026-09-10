import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { PageForm } from "@/components/admin/PageForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deletePage } from "@/modules/cms/actions";

export default async function EditCmsPage({ params }: { params: { id: string } }) {
  const page = await prisma.page.findUnique({ where: { id: params.id } });
  if (!page) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Edit {page.title}</h1>
      <div className="mt-6">
        <PageForm pageId={page.id} initial={{ title: page.title, slug: page.slug, body: page.body, status: page.status as any }} />
      </div>
      <div className="mt-8 max-w-2xl border-t border-border pt-6">
        <DeleteButton action={deletePage.bind(null, page.id)} confirmText="Delete this page?" redirectTo="/admin/cms/pages" />
      </div>
    </div>
  );
}
