import { notFound } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { getPermissionsForUser, PERMISSIONS } from "@/lib/authz";
import { prisma } from "@/lib/db/prisma";
import { ForbiddenNotice } from "@/components/ui/ForbiddenNotice";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { VerificationReviewActions } from "@/components/admin/VerificationReviewActions";

export default async function AdminVerificationDetailPage({ params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  const permissions = await getPermissionsForUser(session!.user.id, session!.user.systemRole);
  if (!permissions.has(PERMISSIONS.REVIEW_VERIFICATION)) return <ForbiddenNotice />;

  const request = await prisma.verificationRequest.findUnique({
    where: { id: params.id },
    include: {
      profile: { include: { country: true, city: true, user: { select: { email: true } } } },
      reviews: { orderBy: { createdAt: "desc" }, include: { reviewer: { select: { email: true } } } },
    },
  });
  if (!request) notFound();

  const data = request.submissionData as Record<string, unknown>;
  const isOpen = ["PENDING", "UNDER_REVIEW", "MORE_INFO_REQUESTED"].includes(request.status);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">
          {request.profile.firstName} {request.profile.lastName}
        </h1>
        <p className="text-sm text-muted-foreground">{request.profile.user.email}</p>
        <Badge tone="warning" className="mt-2">
          {request.status.replaceAll("_", " ")}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Member Information</CardTitle>
        </CardHeader>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Country</dt>
            <dd>{request.profile.country?.name ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">City</dt>
            <dd>{request.profile.city?.name ?? "—"}</dd>
          </div>
        </dl>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Submitted Family Information</CardTitle>
        </CardHeader>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Father&rsquo;s name</dt>
            <dd>{(data.fathersName as string) || "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Grandfather&rsquo;s name</dt>
            <dd>{(data.grandfathersName as string) || "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Great-grandfather&rsquo;s name</dt>
            <dd>{(data.greatGrandfathersName as string) || "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Ancestral region</dt>
            <dd>{(data.ancestralRegion as string) || "—"}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-muted-foreground">Family information</dt>
            <dd>{(data.familyInformation as string) || "—"}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-muted-foreground">Additional notes from member</dt>
            <dd>{(data.additionalNotes as string) || "—"}</dd>
          </div>
        </dl>
      </Card>

      {request.reviews.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Review History</CardTitle>
          </CardHeader>
          <div className="space-y-3 text-sm">
            {request.reviews.map((review) => (
              <div key={review.id} className="border-t border-border pt-3 first:border-t-0 first:pt-0">
                <p className="font-medium">
                  {review.decision.replaceAll("_", " ")} — {review.reviewer.email}
                </p>
                {review.notes ? <p className="text-muted-foreground">{review.notes}</p> : null}
                <p className="text-xs text-muted-foreground">{review.createdAt.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {isOpen ? (
        <Card>
          <CardHeader>
            <CardTitle>Decision</CardTitle>
          </CardHeader>
          <VerificationReviewActions requestId={request.id} />
        </Card>
      ) : null}
    </div>
  );
}
