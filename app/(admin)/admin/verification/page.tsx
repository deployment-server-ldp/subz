import Link from "next/link";
import { getCurrentSession } from "@/lib/auth/session";
import { getPermissionsForUser, PERMISSIONS } from "@/lib/authz";
import { prisma } from "@/lib/db/prisma";
import { ForbiddenNotice } from "@/components/ui/ForbiddenNotice";
import { Badge } from "@/components/ui/Badge";
import { Table, Thead, Tr, Th, Td } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function AdminVerificationQueuePage() {
  const session = await getCurrentSession();
  const permissions = await getPermissionsForUser(session!.user.id, session!.user.systemRole);
  if (!permissions.has(PERMISSIONS.REVIEW_VERIFICATION)) return <ForbiddenNotice />;

  const requests = await prisma.verificationRequest.findMany({
    where: { status: { in: ["PENDING", "UNDER_REVIEW", "MORE_INFO_REQUESTED"] } },
    orderBy: { createdAt: "asc" },
    include: { profile: { include: { country: true } } },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Verification Queue</h1>
      <p className="mt-1 text-sm text-muted-foreground">{requests.length} pending request(s).</p>

      <div className="mt-6">
        {requests.length === 0 ? (
          <EmptyState title="Queue is clear" description="No verification requests are waiting for review." />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Member</Th>
                <Th>Country</Th>
                <Th>Status</Th>
                <Th>Submitted</Th>
                <Th />
              </Tr>
            </Thead>
            <tbody>
              {requests.map((request) => (
                <Tr key={request.id}>
                  <Td>
                    {request.profile.firstName} {request.profile.lastName}
                  </Td>
                  <Td>{request.profile.country?.name ?? "—"}</Td>
                  <Td>
                    <Badge tone="warning">{request.status.replaceAll("_", " ")}</Badge>
                  </Td>
                  <Td>{request.createdAt.toLocaleDateString()}</Td>
                  <Td>
                    <Link href={`/admin/verification/${request.id}`} className="text-accent hover:underline">
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
