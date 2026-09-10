import Link from "next/link";
import { getCurrentSession } from "@/lib/auth/session";
import { getPermissionsForUser, PERMISSIONS } from "@/lib/authz";
import { prisma } from "@/lib/db/prisma";
import { ForbiddenNotice } from "@/components/ui/ForbiddenNotice";
import { ButtonLink } from "@/components/ui/Button";
import { Table, Thead, Tr, Th, Td } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function AdminFamilyBranchesPage() {
  const session = await getCurrentSession();
  const permissions = await getPermissionsForUser(session!.user.id, session!.user.systemRole);
  if (!permissions.has(PERMISSIONS.MANAGE_FAMILY_BRANCHES)) return <ForbiddenNotice />;

  const branches = await prisma.familyBranch.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { memberships: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Family Branches</h1>
        <ButtonLink href="/admin/family-branches/new" size="sm">
          Add Branch
        </ButtonLink>
      </div>
      <div className="mt-6">
        {branches.length === 0 ? (
          <EmptyState title="No family branches yet" />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Region</Th>
                <Th>Members</Th>
                <Th />
              </Tr>
            </Thead>
            <tbody>
              {branches.map((branch) => (
                <Tr key={branch.id}>
                  <Td>{branch.name}</Td>
                  <Td>{branch.region ?? "—"}</Td>
                  <Td>{branch._count.memberships}</Td>
                  <Td>
                    <Link href={`/admin/family-branches/${branch.id}`} className="text-accent hover:underline">
                      Manage
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
