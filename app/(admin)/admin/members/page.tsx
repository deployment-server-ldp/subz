import Link from "next/link";
import { getCurrentSession } from "@/lib/auth/session";
import { getPermissionsForUser, PERMISSIONS } from "@/lib/authz";
import { prisma } from "@/lib/db/prisma";
import { ForbiddenNotice } from "@/components/ui/ForbiddenNotice";
import { Badge } from "@/components/ui/Badge";
import { Table, Thead, Tr, Th, Td } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";

const PAGE_SIZE = 20;

const TONE: Record<string, "neutral" | "warning" | "success" | "danger"> = {
  REGISTERED: "neutral",
  PENDING: "warning",
  UNDER_REVIEW: "warning",
  VERIFIED: "success",
  REJECTED: "danger",
  MORE_INFO_REQUESTED: "warning",
  SUSPENDED: "danger",
};

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const session = await getCurrentSession();
  const permissions = await getPermissionsForUser(session!.user.id, session!.user.systemRole);
  if (!permissions.has(PERMISSIONS.MANAGE_MEMBERS)) return <ForbiddenNotice />;

  const q = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const status = typeof searchParams.status === "string" ? searchParams.status : undefined;
  const page = searchParams.page ? Number(searchParams.page) : 1;

  const where = {
    ...(q
      ? {
          OR: [
            { firstName: { contains: q, mode: "insensitive" as const } },
            { lastName: { contains: q, mode: "insensitive" as const } },
            { user: { email: { contains: q, mode: "insensitive" as const } } },
          ],
        }
      : {}),
    ...(status ? { verificationStatus: status as any } : {}),
  };

  const [members, total] = await Promise.all([
    prisma.profile.findMany({
      where,
      include: { user: true, country: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.profile.count({ where }),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Members</h1>

      <form method="get" className="mt-6 flex flex-wrap items-end gap-4">
        <Input name="q" placeholder="Search name or email…" defaultValue={q} className="max-w-xs" />
        <Select name="status" defaultValue={status} className="max-w-xs">
          <option value="">All statuses</option>
          <option value="REGISTERED">Registered</option>
          <option value="PENDING">Pending</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="VERIFIED">Verified</option>
          <option value="REJECTED">Rejected</option>
          <option value="MORE_INFO_REQUESTED">More Info Requested</option>
          <option value="SUSPENDED">Suspended</option>
        </Select>
        <Button type="submit" size="sm">
          Filter
        </Button>
      </form>

      <div className="mt-6">
        {members.length === 0 ? (
          <EmptyState title="No members found" />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Country</Th>
                <Th>Status</Th>
                <Th />
              </Tr>
            </Thead>
            <tbody>
              {members.map((member) => (
                <Tr key={member.id}>
                  <Td>
                    {member.firstName} {member.lastName}
                  </Td>
                  <Td>{member.user.email}</Td>
                  <Td>{member.country?.name ?? "—"}</Td>
                  <Td>
                    <Badge tone={TONE[member.verificationStatus]}>{member.verificationStatus.replaceAll("_", " ")}</Badge>
                  </Td>
                  <Td>
                    <Link href={`/admin/members/${member.id}`} className="text-accent hover:underline">
                      View
                    </Link>
                  </Td>
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
          return `/admin/members?${params.toString()}`;
        }}
      />
    </div>
  );
}
