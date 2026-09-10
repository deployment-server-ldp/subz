import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { RespondConnectionButtons } from "@/components/member/ConnectionActions";

export default async function ConnectionRequestsPage() {
  const session = await getCurrentSession();
  const profileId = session!.user.profileId!;

  const [incoming, outgoing] = await Promise.all([
    prisma.connection.findMany({
      where: { recipientId: profileId, status: "PENDING" },
      include: { requester: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.connection.findMany({
      where: { requesterId: profileId, status: "PENDING" },
      include: { recipient: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Connection Requests</h1>
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold">Incoming</h2>
        <div className="mt-3 space-y-3">
          {incoming.length === 0 ? (
            <EmptyState title="No incoming requests" />
          ) : (
            incoming.map((request) => (
              <Card key={request.id} className="flex items-center justify-between">
                <span className="font-medium">
                  {request.requester.firstName} {request.requester.lastName}
                </span>
                <RespondConnectionButtons connectionId={request.id} />
              </Card>
            ))
          )}
        </div>
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold">Sent</h2>
        <div className="mt-3 space-y-3">
          {outgoing.length === 0 ? (
            <EmptyState title="No pending sent requests" />
          ) : (
            outgoing.map((request) => (
              <Card key={request.id}>
                <span className="text-sm text-muted-foreground">
                  Waiting on {request.recipient.firstName} {request.recipient.lastName}
                </span>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
