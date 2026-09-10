import { getCurrentSession } from "@/lib/auth/session";
import { getPermissionsForUser, PERMISSIONS } from "@/lib/authz";
import { prisma } from "@/lib/db/prisma";
import { ForbiddenNotice } from "@/components/ui/ForbiddenNotice";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ModerationActions } from "@/components/admin/ModerationActions";
import { FeatureToggle } from "@/components/admin/FeatureToggle";
import { moderateMoment, toggleMomentFeatured } from "@/modules/moments/actions";

const TONE: Record<string, "warning" | "success" | "danger"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
  SUSPENDED: "danger",
};

export default async function AdminMomentsPage() {
  const session = await getCurrentSession();
  const permissions = await getPermissionsForUser(session!.user.id, session!.user.systemRole);
  if (!permissions.has(PERMISSIONS.MODERATE_CONTENT_QUEUE)) return <ForbiddenNotice />;

  const moments = await prisma.moment.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: { submittedBy: true, media: true },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Moments</h1>
      <div className="mt-6 space-y-4">
        {moments.length === 0 ? (
          <EmptyState title="No moments submitted yet" />
        ) : (
          moments.map((moment) => (
            <Card key={moment.id} className="flex items-start justify-between gap-6">
              <div className="flex gap-4">
                {moment.media[0] ? (
                  <img src={moment.media[0].url} alt="" className="h-20 w-20 rounded object-cover" />
                ) : (
                  <div className="h-20 w-20 rounded bg-muted" />
                )}
                <div>
                  <p className="font-medium">{moment.caption}</p>
                  <p className="text-sm text-muted-foreground">
                    {moment.submittedBy.firstName} {moment.submittedBy.lastName} · {moment.type.replaceAll("_", " ")}
                  </p>
                  <Badge tone={TONE[moment.status]} className="mt-1">
                    {moment.status}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2 text-right">
                <ModerationActions id={moment.id} currentStatus={moment.status} onDecide={moderateMoment} />
                {moment.status === "APPROVED" ? (
                  <FeatureToggle id={moment.id} featured={moment.featured} onToggle={toggleMomentFeatured} />
                ) : null}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
