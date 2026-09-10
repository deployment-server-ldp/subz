import { getCurrentSession } from "@/lib/auth/session";
import { getPermissionsForUser, PERMISSIONS, DEFAULT_ROLE_PERMISSIONS, STAFF_ROLES } from "@/lib/authz";
import { prisma } from "@/lib/db/prisma";
import { ForbiddenNotice } from "@/components/ui/ForbiddenNotice";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, Thead, Tr, Th, Td } from "@/components/ui/Table";
import { CreateRoleForm, AssignRoleForm } from "@/components/admin/RoleManager";

export default async function AdminRolesPermissionsPage() {
  const session = await getCurrentSession();
  const permissions = await getPermissionsForUser(session!.user.id, session!.user.systemRole);
  if (!permissions.has(PERMISSIONS.MANAGE_ADMINS_ROLES)) return <ForbiddenNotice />;

  const [dbPermissions, customRoles] = await Promise.all([
    prisma.permission.findMany({ orderBy: { name: "asc" } }),
    prisma.role.findMany({
      where: { isSystem: false },
      include: { permissions: { include: { permission: true } }, users: { include: { user: true } } },
    }),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-semibold">Roles &amp; Permissions</h1>

      <Card>
        <CardHeader>
          <CardTitle>Baseline System Roles</CardTitle>
        </CardHeader>
        <p className="mb-3 text-sm text-muted-foreground">
          Every staff account has one of these system roles by default. Assign a custom role
          below to grant additional permissions beyond the baseline.
        </p>
        <Table>
          <Thead>
            <Tr>
              <Th>Role</Th>
              <Th>Default Permissions</Th>
            </Tr>
          </Thead>
          <tbody>
            {STAFF_ROLES.map((role) => (
              <Tr key={role}>
                <Td className="font-medium">{role.replaceAll("_", " ")}</Td>
                <Td>{DEFAULT_ROLE_PERMISSIONS[role].join(", ") || "None"}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Custom Roles</CardTitle>
        </CardHeader>
        <CreateRoleForm permissions={dbPermissions} />
        {customRoles.length > 0 ? (
          <div className="mt-4">
            <AssignRoleForm roles={customRoles} />
            <ul className="mt-4 space-y-2 text-sm">
              {customRoles.map((role) => (
                <li key={role.id} className="border-t border-border pt-2">
                  <span className="font-medium">{role.name}</span> —{" "}
                  {role.permissions.map((rp) => rp.permission.name).join(", ")}
                  {role.users.length > 0 ? (
                    <span className="text-muted-foreground"> · {role.users.map((u) => u.user.email).join(", ")}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
