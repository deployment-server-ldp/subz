import Link from "next/link";
import { getCurrentSession } from "@/lib/auth/session";
import { getOwnProfile } from "@/lib/profile/get";
import { computeProfileCompletion } from "@/lib/profile/completion";
import { prisma } from "@/lib/db/prisma";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge, VerifiedBadge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";

const STATUS_TONE: Record<string, "neutral" | "warning" | "success" | "danger"> = {
  REGISTERED: "neutral",
  PENDING: "warning",
  UNDER_REVIEW: "warning",
  VERIFIED: "success",
  REJECTED: "danger",
  MORE_INFO_REQUESTED: "warning",
  SUSPENDED: "danger",
};

export default async function DashboardPage() {
  const session = await getCurrentSession();
  const userId = session!.user.id;
  const profile = await getOwnProfile(userId);
  if (!profile) return null;

  const { percent, missing } = computeProfileCompletion(profile);

  const [connectionCount, upcomingEvents, unreadNotifications, openSupportRequests] = await Promise.all([
    prisma.connection.count({
      where: { status: "ACCEPTED", OR: [{ requesterId: profile.id }, { recipientId: profile.id }] },
    }),
    prisma.eventAttendee.count({
      where: { profileId: profile.id, status: "GOING", event: { startsAt: { gte: new Date() } } },
    }),
    prisma.notification.count({ where: { recipientId: userId, read: false } }),
    prisma.supportRequest.count({ where: { requesterId: profile.id, status: { in: ["OPEN", "IN_PROGRESS"] } } }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold">Welcome, {profile.firstName}.</h1>
        <p className="mt-1 text-muted-foreground">
          {profile.verificationStatus === "VERIFIED" ? (
            <VerifiedBadge />
          ) : (
            <Badge tone={STATUS_TONE[profile.verificationStatus]}>
              {profile.verificationStatus.replaceAll("_", " ")}
            </Badge>
          )}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-sm text-muted-foreground">Profile completion</p>
          <p className="mt-1 font-display text-2xl font-semibold">{percent}%</p>
          <div className="mt-2 h-2 rounded-full bg-muted">
            <div className="h-2 rounded-full bg-accent" style={{ width: `${percent}%` }} />
          </div>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">Connections</p>
          <p className="mt-1 font-display text-2xl font-semibold">{connectionCount}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">Upcoming events</p>
          <p className="mt-1 font-display text-2xl font-semibold">{upcomingEvents}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">Unread notifications</p>
          <p className="mt-1 font-display text-2xl font-semibold">{unreadNotifications}</p>
        </Card>
      </div>

      {missing.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Complete your profile</CardTitle>
          </CardHeader>
          <p className="text-sm text-muted-foreground">Missing: {missing.join(", ")}.</p>
          <ButtonLink href="/dashboard/profile" size="sm" className="mt-4">
            Complete profile
          </ButtonLink>
        </Card>
      ) : null}

      {profile.verificationStatus === "REGISTERED" || profile.verificationStatus === "MORE_INFO_REQUESTED" ? (
        <Card>
          <CardHeader>
            <CardTitle>Get verified</CardTitle>
          </CardHeader>
          <p className="text-sm text-muted-foreground">
            Submit your verification request to appear in the community directory.
          </p>
          <ButtonLink href="/dashboard/verification" size="sm" className="mt-4">
            Start verification
          </ButtonLink>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Quick actions</CardTitle>
        </CardHeader>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/dashboard/profile" variant="secondary" size="sm">
            Complete Profile
          </ButtonLink>
          <ButtonLink href="/network" variant="secondary" size="sm">
            Find Subzwari
          </ButtonLink>
          <ButtonLink href="/dashboard/profile/professional" variant="secondary" size="sm">
            Update Professional Profile
          </ButtonLink>
          <ButtonLink href="/dashboard/businesses/new" variant="secondary" size="sm">
            Add Business
          </ButtonLink>
          <ButtonLink href="/events" variant="secondary" size="sm">
            Explore Events
          </ButtonLink>
          <ButtonLink href="/dashboard/moments/new" variant="secondary" size="sm">
            Share a Moment
          </ButtonLink>
        </div>
      </Card>

      {openSupportRequests > 0 ? (
        <p className="text-sm text-muted-foreground">
          You have {openSupportRequests} open support request(s).{" "}
          <Link href="/dashboard/support" className="text-accent hover:underline">
            View them
          </Link>
          .
        </p>
      ) : null}
    </div>
  );
}
