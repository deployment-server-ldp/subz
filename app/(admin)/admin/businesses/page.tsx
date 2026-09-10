import Link from "next/link";
import { getCurrentSession } from "@/lib/auth/session";
import { getPermissionsForUser, PERMISSIONS } from "@/lib/authz";
import { prisma } from "@/lib/db/prisma";
import { ForbiddenNotice } from "@/components/ui/ForbiddenNotice";
import { Badge } from "@/components/ui/Badge";
import { Table, Thead, Tr, Th, Td } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";

const TONE: Record<string, "warning" | "success" | "danger"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
  SUSPENDED: "danger",
};

export default async function AdminBusinessesPage() {
  const session = await getCurrentSession();
  const permissions = await getPermissionsForUser(session!.user.id, session!.user.systemRole);
  if (!permissions.has(PERMISSIONS.MANAGE_BUSINESSES)) return <ForbiddenNotice />;

  const businesses = await prisma.business.findMany({
    orderBy: { createdAt: "desc" },
    include: { owner: true, category: true, country: true },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Businesses</h1>
      <div className="mt-6">
        {businesses.length === 0 ? (
          <EmptyState title="No businesses submitted yet" />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Owner</Th>
                <Th>Category</Th>
                <Th>Country</Th>
                <Th>Status</Th>
                <Th />
              </Tr>
            </Thead>
            <tbody>
              {businesses.map((business) => (
                <Tr key={business.id}>
                  <Td>{business.name}</Td>
                  <Td>
                    {business.owner.firstName} {business.owner.lastName}
                  </Td>
                  <Td>{business.category.name}</Td>
                  <Td>{business.country.name}</Td>
                  <Td>
                    <Badge tone={TONE[business.status]}>{business.status}</Badge>
                  </Td>
                  <Td>
                    <Link href={`/admin/businesses/${business.id}`} className="text-accent hover:underline">
                      Review
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
