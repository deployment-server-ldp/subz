import { getCurrentSession } from "@/lib/auth/session";
import { getPermissionsForUser, PERMISSIONS } from "@/lib/authz";
import { prisma } from "@/lib/db/prisma";
import { ForbiddenNotice } from "@/components/ui/ForbiddenNotice";
import { Badge } from "@/components/ui/Badge";
import { Table, Thead, Tr, Th, Td } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { SupportModerationActions } from "@/components/admin/SupportModerationActions";

const TONE: Record<string, "neutral" | "warning" | "success" | "danger" | "accent"> = {
  PENDING_REVIEW: "warning",
  OPEN: "accent",
  IN_PROGRESS: "warning",
  RESOLVED: "success",
  CLOSED: "neutral",
  REJECTED: "danger",
};

export default async function AdminSupportRequestsPage() {
  const session = await getCurrentSession();
  const permissions = await getPermissionsForUser(session!.user.id, session!.user.systemRole);
  if (!permissions.has(PERMISSIONS.MODERATE_CONTENT_QUEUE)) return <ForbiddenNotice />;

  const requests = await prisma.supportRequest.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: { requester: true },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Support Requests</h1>
      <div className="mt-6">
        {requests.length === 0 ? (
          <EmptyState title="No support requests yet" />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Title</Th>
                <Th>Requester</Th>
                <Th>Category</Th>
                <Th>Status</Th>
                <Th />
              </Tr>
            </Thead>
            <tbody>
              {requests.map((request) => (
                <Tr key={request.id}>
                  <Td>{request.title}</Td>
                  <Td>
                    {request.requester.firstName} {request.requester.lastName}
                  </Td>
                  <Td>{request.category.replaceAll("_", " ")}</Td>
                  <Td>
                    <Badge tone={TONE[request.status] ?? "neutral"}>{request.status.replaceAll("_", " ")}</Badge>
                  </Td>
                  <Td>{request.status === "PENDING_REVIEW" ? <SupportModerationActions id={request.id} /> : null}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </div>
  );
}
