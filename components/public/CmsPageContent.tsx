import { prisma } from "@/lib/db/prisma";

export async function getCmsPage(slug: string) {
  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page || page.status !== "PUBLISHED") return null;
  return page;
}

export function CmsPageBody({ title, body, fallback }: { title: string; body: string | null; fallback: string }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold">{title}</h1>
      <div className="prose prose-neutral mt-6 max-w-none whitespace-pre-wrap text-muted-foreground">
        {body ?? fallback}
      </div>
    </div>
  );
}
