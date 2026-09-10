import { notFound } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { getPermissionsForUser, PERMISSIONS } from "@/lib/authz";
import { prisma } from "@/lib/db/prisma";
import { ForbiddenNotice } from "@/components/ui/ForbiddenNotice";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MemberStatusActions } from "@/components/admin/MemberStatusActions";

export default async function AdminMemberDetailPage({ params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  const permissions = await getPermissionsForUser(session!.user.id, session!.user.systemRole);
  if (!permissions.has(PERMISSIONS.MANAGE_MEMBERS)) return <ForbiddenNotice />;

  const member = await prisma.profile.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      country: true,
      city: true,
      verificationRequests: { orderBy: { createdAt: "desc" }, include: { reviews: true } },
    },
  });
  if (!member) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">
          {member.firstName} {member.lastName}
        </h1>
        <p className="text-sm text-muted-foreground">{member.user.email}</p>
        <Badge tone="warning" className="mt-2">
          {member.verificationStatus.replaceAll("_", " ")}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Country</dt>
            <dd>{member.country?.name ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">City</dt>
            <dd>{member.city?.name ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Profession</dt>
            <dd>{member.profession ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Visibility</dt>
            <dd>{member.visibility}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Joined</dt>
            <dd>{member.createdAt.toLocaleDateString()}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Account status</dt>
            <dd>{member.user.accountStatus}</dd>
          </div>
        </dl>
      </Card>

      {member.verificationRequests.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Verification History</CardTitle>
          </CardHeader>
          <ul className="space-y-2 text-sm">
            {member.verificationRequests.map((req) => (
              <li key={req.id} className="border-b border-border pb-2 last:border-b-0">
                {req.createdAt.toLocaleDateString()} — {req.status.replaceAll("_", " ")} ({req.reviews.length} review
                {req.reviews.length === 1 ? "" : "s"})
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <MemberStatusActions profileId={member.id} isSuspended={member.verificationStatus === "SUSPENDED"} />
      </Card>
    </div>
  );
}
