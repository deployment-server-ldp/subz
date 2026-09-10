import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { withdrawBusiness } from "@/modules/business/actions";

const TONE: Record<string, "warning" | "success" | "danger"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
  SUSPENDED: "danger",
};

export default async function MyBusinessesPage() {
  const session = await getCurrentSession();
  const profile = await prisma.profile.findUnique({ where: { userId: session!.user.id } });
  const businesses = profile
    ? await prisma.business.findMany({ where: { ownerId: profile.id }, orderBy: { createdAt: "desc" }, include: { category: true } })
    : [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">My Businesses</h1>
        <ButtonLink href="/dashboard/businesses/new" size="sm">
          Add Business
        </ButtonLink>
      </div>

      <div className="mt-6 space-y-4">
        {businesses.length === 0 ? (
          <EmptyState title="No businesses yet" description="Add your business to the community directory." />
        ) : (
          businesses.map((business) => (
            <Card key={business.id}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display text-lg font-semibold">{business.name}</p>
                  <p className="text-sm text-muted-foreground">{business.category.name}</p>
                </div>
                <Badge tone={TONE[business.status]}>{business.status}</Badge>
              </div>
              {business.status === "PENDING" || business.status === "REJECTED" ? (
                <div className="mt-3">
                  <DeleteButton
                    action={withdrawBusiness.bind(null, business.id)}
                    confirmText="Withdraw this listing?"
                  />
                </div>
              ) : null}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
