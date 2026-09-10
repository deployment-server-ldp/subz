import Link from "next/link";
import { getCurrentSession } from "@/lib/auth/session";
import { getPermissionsForUser, PERMISSIONS } from "@/lib/authz";
import { prisma } from "@/lib/db/prisma";
import { ForbiddenNotice } from "@/components/ui/ForbiddenNotice";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, Thead, Tr, Th, Td } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";

const TONE: Record<string, "neutral" | "warning" | "success" | "danger" | "accent"> = {
  DRAFT: "neutral",
  PENDING_REVIEW: "warning",
  PUBLISHED: "success",
  SCHEDULED: "accent",
  REJECTED: "danger",
  ARCHIVED: "neutral",
};

export default async function AdminStoriesPage() {
  const session = await getCurrentSession();
  const permissions = await getPermissionsForUser(session!.user.id, session!.user.systemRole);
  if (!permissions.has(PERMISSIONS.MANAGE_STORIES_MOMENTS)) return <ForbiddenNotice />;

  const stories = await prisma.story.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: { author: true, category: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Stories</h1>
        <ButtonLink href="/admin/stories/new" size="sm">
          New Story
        </ButtonLink>
      </div>
      <div className="mt-6">
        {stories.length === 0 ? (
          <EmptyState title="No stories yet" />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Title</Th>
                <Th>Author</Th>
                <Th>Status</Th>
                <Th>Featured</Th>
                <Th />
              </Tr>
            </Thead>
            <tbody>
              {stories.map((story) => (
                <Tr key={story.id}>
                  <Td>{story.title}</Td>
                  <Td>{story.author ? `${story.author.firstName} ${story.author.lastName}` : "Editorial"}</Td>
                  <Td>
                    <Badge tone={TONE[story.status] ?? "neutral"}>{story.status.replaceAll("_", " ")}</Badge>
                  </Td>
                  <Td>{story.featured ? "Yes" : "—"}</Td>
                  <Td>
                    <Link href={`/admin/stories/${story.id}`} className="text-accent hover:underline">
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
