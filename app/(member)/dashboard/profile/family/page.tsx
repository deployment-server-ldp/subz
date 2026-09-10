import { getCurrentSession } from "@/lib/auth/session";
import { getOwnProfile } from "@/lib/profile/get";
import { prisma } from "@/lib/db/prisma";
import { FamilyInfoForm } from "@/components/member/FamilyInfoForm";
import { FamilyRelationshipsPanel } from "@/components/member/FamilyRelationshipsPanel";
import { ProfileTabs } from "@/components/member/ProfileTabs";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";

export default async function ProfileFamilyPage() {
  const session = await getCurrentSession();
  const profile = await getOwnProfile(session!.user.id);
  if (!profile) return null;

  const relationships = await prisma.familyRelationship.findMany({
    where: { OR: [{ fromProfileId: profile.id }, { toProfileId: profile.id }] },
    include: {
      fromProfile: { select: { firstName: true, lastName: true } },
      toProfile: { select: { firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Your profile</h1>
      <ProfileTabs active="family" />
      <div className="mt-6 space-y-8">
        <FamilyInfoForm
          initial={{
            fathersName: profile.fathersName ?? "",
            grandfathersName: profile.grandfathersName ?? "",
            greatGrandfathersName: profile.greatGrandfathersName ?? "",
            ancestralRegion: profile.ancestralRegion ?? "",
            familyInformation: profile.familyInformation ?? "",
          }}
        />

        <Card>
          <CardHeader>
            <CardTitle>Family Relationships</CardTitle>
          </CardHeader>
          <FamilyRelationshipsPanel myProfileId={profile.id} relationships={relationships} />
        </Card>

        <div className="border-t border-border pt-6">
          <p className="text-sm text-muted-foreground">
            Want to associate with a family branch?
          </p>
          <ButtonLink href="/family" variant="secondary" size="sm" className="mt-3">
            Explore Family Branches
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
