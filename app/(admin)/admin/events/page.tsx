import Link from "next/link";
import { getCurrentSession } from "@/lib/auth/session";
import { getPermissionsForUser, PERMISSIONS } from "@/lib/authz";
import { prisma } from "@/lib/db/prisma";
import { ForbiddenNotice } from "@/components/ui/ForbiddenNotice";
import { Badge } from "@/components/ui/Badge";
import { Table, Thead, Tr, Th, Td } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";

const TONE: Record<string, "neutral" | "warning" | "success" | "danger"> = {
  DRAFT: "neutral",
  PENDING_APPROVAL: "warning",
  PUBLISHED: "success",
  COMPLETED: "neutral",
  CANCELLED: "danger",
};

export default async function AdminEventsPage() {
  const session = await getCurrentSession();
  const permissions = await getPermissionsForUser(session!.user.id, session!.user.systemRole);
  if (!permissions.has(PERMISSIONS.MANAGE_EVENTS)) return <ForbiddenNotice />;

  const events = await prisma.event.findMany({
    orderBy: { createdAt: "desc" },
    include: { organizer: true, country: true },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Events</h1>
      <div className="mt-6">
        {events.length === 0 ? (
          <EmptyState title="No events yet" />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Organizer</Th>
                <Th>Starts</Th>
                <Th>Status</Th>
                <Th />
              </Tr>
            </Thead>
            <tbody>
              {events.map((event) => (
                <Tr key={event.id}>
                  <Td>{event.name}</Td>
                  <Td>
                    {event.organizer.firstName} {event.organizer.lastName}
                  </Td>
                  <Td>{event.startsAt.toLocaleDateString()}</Td>
                  <Td>
                    <Badge tone={TONE[event.status]}>{event.status.replaceAll("_", " ")}</Badge>
                  </Td>
                  <Td>
                    <Link href={`/admin/events/${event.id}`} className="text-accent hover:underline">
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
