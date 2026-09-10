import { notFound } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { getPermissionsForUser, PERMISSIONS } from "@/lib/authz";
import { prisma } from "@/lib/db/prisma";
import { ForbiddenNotice } from "@/components/ui/ForbiddenNotice";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ModerationActions } from "@/components/admin/ModerationActions";
import { moderateBusiness } from "@/modules/business/actions";

export default async function AdminBusinessDetailPage({ params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  const permissions = await getPermissionsForUser(session!.user.id, session!.user.systemRole);
  if (!permissions.has(PERMISSIONS.MANAGE_BUSINESSES)) return <ForbiddenNotice />;

  const business = await prisma.business.findUnique({
    where: { id: params.id },
    include: { owner: { include: { user: true } }, category: true, country: true, city: true },
  });
  if (!business) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">{business.name}</h1>
        <Badge tone="warning" className="mt-2">
          {business.status}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Owner</dt>
            <dd>
              {business.owner.firstName} {business.owner.lastName} ({business.owner.user.email})
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Category</dt>
            <dd>{business.category.name}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Location</dt>
            <dd>
              {business.city?.name ? `${business.city.name}, ` : ""}
              {business.country.name}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Website</dt>
            <dd>{business.website ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Contact</dt>
            <dd>{business.contactMethod ?? "—"}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-muted-foreground">Description</dt>
            <dd>{business.description}</dd>
          </div>
        </dl>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Decision</CardTitle>
        </CardHeader>
        <ModerationActions id={business.id} currentStatus={business.status} onDecide={moderateBusiness} />
      </Card>
    </div>
  );
}
