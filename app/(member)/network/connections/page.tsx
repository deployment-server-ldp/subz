import Link from "next/link";
import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { RemoveConnectionButton } from "@/components/member/ConnectionActions";

export default async function ConnectionsPage() {
  const session = await getCurrentSession();
  const profileId = session!.user.profileId!;

  const connections = await prisma.connection.findMany({
    where: { status: "ACCEPTED", OR: [{ requesterId: profileId }, { recipientId: profileId }] },
    include: { requester: true, recipient: true },
    orderBy: { respondedAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">My Connections</h1>
      <div className="mt-6 space-y-3">
        {connections.length === 0 ? (
          <EmptyState title="No connections yet" description="Discover members and send a connection request." />
        ) : (
          connections.map((connection) => {
            const other = connection.requesterId === profileId ? connection.recipient : connection.requester;
            return (
              <Card key={connection.id} className="flex items-center justify-between">
                <Link href={`/members/${other.slug}`} className="font-medium hover:text-accent">
                  {other.firstName} {other.lastName}
                </Link>
                <RemoveConnectionButton connectionId={connection.id} />
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
