import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { OfferHelpForm } from "@/components/member/OfferHelpForm";

const TONE: Record<string, "neutral" | "warning" | "success" | "danger" | "accent"> = {
  PENDING_REVIEW: "warning",
  OPEN: "accent",
  IN_PROGRESS: "warning",
  RESOLVED: "success",
  CLOSED: "neutral",
  REJECTED: "danger",
};

export default async function SupportPage() {
  const session = await getCurrentSession();
  const profile = await prisma.profile.findUnique({ where: { userId: session!.user.id } });
  if (!profile) return null;

  const [myRequests, openRequests] = await Promise.all([
    prisma.supportRequest.findMany({
      where: { requesterId: profile.id },
      orderBy: { createdAt: "desc" },
      include: { offers: { include: { helper: true } } },
    }),
    prisma.supportRequest.findMany({
      where: { status: "OPEN", requesterId: { not: profile.id }, visibility: { in: ["PUBLIC", "COMMUNITY"] } },
      orderBy: { createdAt: "desc" },
      include: { requester: true },
      take: 20,
    }),
  ]);

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Community Support</h1>
        <ButtonLink href="/dashboard/support/new" size="sm">
          Request Support
        </ButtonLink>
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold">My Requests</h2>
        <div className="mt-3 space-y-3">
          {myRequests.length === 0 ? (
            <EmptyState title="No support requests yet" />
          ) : (
            myRequests.map((request) => (
              <Card key={request.id}>
                <div className="flex items-center justify-between">
                  <p className="font-medium">{request.title}</p>
                  <Badge tone={TONE[request.status] ?? "neutral"}>{request.status.replaceAll("_", " ")}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{request.category.replaceAll("_", " ")}</p>
                {request.offers.length > 0 ? (
                  <div className="mt-3 space-y-2 border-t border-border pt-3">
                    <p className="text-sm font-medium">Offers to help</p>
                    {request.offers.map((offer) => (
                      <p key={offer.id} className="text-sm text-muted-foreground">
                        {offer.helper.firstName} {offer.helper.lastName}: {offer.message}
                      </p>
                    ))}
                  </div>
                ) : null}
              </Card>
            ))
          )}
        </div>
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold">Requests You Could Help With</h2>
        <div className="mt-3 space-y-3">
          {openRequests.length === 0 ? (
            <EmptyState title="No open requests right now" />
          ) : (
            openRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <CardTitle>{request.title}</CardTitle>
                </CardHeader>
                <p className="text-sm text-muted-foreground">
                  {request.category.replaceAll("_", " ")} · from {request.requester.firstName} {request.requester.lastName}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{request.description}</p>
                <div className="mt-3">
                  <OfferHelpForm supportRequestId={request.id} />
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
