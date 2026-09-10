import { getCurrentSession } from "@/lib/auth/session";
import { getPermissionsForUser, PERMISSIONS, STAFF_ROLES } from "@/lib/authz";
import { prisma } from "@/lib/db/prisma";
import { ForbiddenNotice } from "@/components/ui/ForbiddenNotice";
import { Table, Thead, Tr, Th, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SetRoleForm } from "@/components/admin/SetRoleForm";

export default async function AdminAdminsPage() {
  const session = await getCurrentSession();
  const permissions = await getPermissionsForUser(session!.user.id, session!.user.systemRole);
  if (!permissions.has(PERMISSIONS.MANAGE_ADMINS_ROLES)) return <ForbiddenNotice />;

  const admins = await prisma.user.findMany({
    where: { systemRole: { in: STAFF_ROLES } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Admins</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Grant staff access by email. The member must already have an account.
      </p>

      <div className="mt-6">
        <SetRoleForm />
      </div>

      <div className="mt-6">
        {admins.length === 0 ? (
          <EmptyState title="No staff accounts yet" />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th>Joined</Th>
              </Tr>
            </Thead>
            <tbody>
              {admins.map((admin) => (
                <Tr key={admin.id}>
                  <Td>{admin.email}</Td>
                  <Td>
                    <Badge tone="accent">{admin.systemRole.replaceAll("_", " ")}</Badge>
                  </Td>
                  <Td>{admin.createdAt.toLocaleDateString()}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </div>
  );
}
