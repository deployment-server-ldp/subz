import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { Badge, VerifiedBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { SubmitVerificationForm } from "@/components/member/SubmitVerificationForm";

const STATUS_TONE: Record<string, "neutral" | "warning" | "success" | "danger"> = {
  REGISTERED: "neutral",
  PENDING: "warning",
  UNDER_REVIEW: "warning",
  VERIFIED: "success",
  REJECTED: "danger",
  MORE_INFO_REQUESTED: "warning",
  SUSPENDED: "danger",
};

const CAN_SUBMIT = new Set(["REGISTERED", "REJECTED", "MORE_INFO_REQUESTED"]);

export default async function VerificationPage() {
  const session = await getCurrentSession();
  const profile = await prisma.profile.findUnique({
    where: { userId: session!.user.id },
    include: {
      verificationRequests: {
        orderBy: { createdAt: "desc" },
        include: { reviews: { orderBy: { createdAt: "desc" }, include: { reviewer: { select: { email: true } } } } },
      },
    },
  });
  if (!profile) return null;

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Verification</h1>
        <div className="mt-2">
          {profile.verificationStatus === "VERIFIED" ? (
            <VerifiedBadge />
          ) : (
            <Badge tone={STATUS_TONE[profile.verificationStatus]}>
              {profile.verificationStatus.replaceAll("_", " ")}
            </Badge>
          )}
        </div>
      </div>

      {CAN_SUBMIT.has(profile.verificationStatus) ? (
        <Card>
          <SubmitVerificationForm />
        </Card>
      ) : profile.verificationStatus === "PENDING" || profile.verificationStatus === "UNDER_REVIEW" ? (
        <Card>
          <p className="text-sm text-muted-foreground">
            Your verification request is being reviewed by our community team. We&rsquo;ll notify
            you as soon as a decision is made.
          </p>
        </Card>
      ) : null}

      {profile.verificationRequests.length > 0 ? (
        <div>
          <h2 className="font-display text-lg font-semibold">History</h2>
          <div className="mt-3 space-y-3">
            {profile.verificationRequests.map((request) => (
              <Card key={request.id}>
                <p className="text-sm text-muted-foreground">
                  Submitted {request.createdAt.toLocaleDateString()} — status {request.status.replaceAll("_", " ")}
                </p>
                {request.reviews.map((review) => (
                  <div key={review.id} className="mt-2 border-t border-border pt-2 text-sm">
                    <p className="font-medium">{review.decision.replaceAll("_", " ")}</p>
                    {review.notes ? <p className="text-muted-foreground">{review.notes}</p> : null}
                    <p className="text-xs text-muted-foreground">{review.createdAt.toLocaleString()}</p>
                  </div>
                ))}
              </Card>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
