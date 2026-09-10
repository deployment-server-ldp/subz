import { getCurrentSession } from "@/lib/auth/session";
import { getPermissionsForUser, PERMISSIONS } from "@/lib/authz";
import { prisma } from "@/lib/db/prisma";
import { ForbiddenNotice } from "@/components/ui/ForbiddenNotice";
import { Table, Thead, Tr, Th, Td } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";

const PAGE_SIZE = 30;

export default async function AdminAuditLogsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const session = await getCurrentSession();
  const permissions = await getPermissionsForUser(session!.user.id, session!.user.systemRole);
  if (!permissions.has(PERMISSIONS.VIEW_AUDIT_LOGS)) return <ForbiddenNotice />;

  const action = typeof searchParams.action === "string" ? searchParams.action : undefined;
  const page = searchParams.page ? Number(searchParams.page) : 1;

  const where = action ? { action: { contains: action, mode: "insensitive" as const } } : {};

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { actor: true },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Audit Logs</h1>

      <form method="get" className="mt-6 flex items-end gap-4">
        <Input name="action" placeholder="Filter by action (e.g. verification.approved)" defaultValue={action} className="max-w-sm" />
        <Button type="submit" size="sm">
          Filter
        </Button>
      </form>

      <div className="mt-6">
        {logs.length === 0 ? (
          <EmptyState title="No audit log entries" />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Actor</Th>
                <Th>Action</Th>
                <Th>Target</Th>
                <Th>When</Th>
              </Tr>
            </Thead>
            <tbody>
              {logs.map((log) => (
                <Tr key={log.id}>
                  <Td>{log.actor.email}</Td>
                  <Td>{log.action}</Td>
                  <Td>
                    {log.targetType}
                    {log.targetId ? `: ${log.targetId.slice(0, 8)}…` : ""}
                  </Td>
                  <Td>{log.createdAt.toLocaleString()}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      <Pagination
        page={page}
        totalPages={Math.max(1, Math.ceil(total / PAGE_SIZE))}
        buildHref={(p) => {
          const params = new URLSearchParams(searchParams as Record<string, string>);
          params.set("page", String(p));
          return `/admin/audit-logs?${params.toString()}`;
        }}
      />
    </div>
  );
}
