import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, Thead, Tr, Th, Td } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function AdminCmsPagesPage() {
  const pages = await prisma.page.findMany({ orderBy: { title: "asc" } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">CMS Pages</h1>
        <ButtonLink href="/admin/cms/pages/new" size="sm">
          New Page
        </ButtonLink>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Use these to manage the copy for /about, /history, /privacy, /terms, /community-guidelines,
        /verification, and any other static content page — matched by slug.
      </p>
      <div className="mt-6">
        {pages.length === 0 ? (
          <EmptyState title="No pages yet" description='Create a page with slug "about" to populate /about, etc.' />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Title</Th>
                <Th>Slug</Th>
                <Th>Status</Th>
                <Th />
              </Tr>
            </Thead>
            <tbody>
              {pages.map((page) => (
                <Tr key={page.id}>
                  <Td>{page.title}</Td>
                  <Td>/{page.slug}</Td>
                  <Td>
                    <Badge tone={page.status === "PUBLISHED" ? "success" : "neutral"}>{page.status}</Badge>
                  </Td>
                  <Td>
                    <Link href={`/admin/cms/pages/${page.id}`} className="text-accent hover:underline">
                      Edit
                    </Link>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </div>
  );
}
