import { getCurrentSession } from "@/lib/auth/session";
import { getOwnProfile } from "@/lib/profile/get";
import { FamilyInfoForm } from "@/components/member/FamilyInfoForm";
import { ProfileTabs } from "@/components/member/ProfileTabs";
import { ButtonLink } from "@/components/ui/Button";

export default async function ProfileFamilyPage() {
  const session = await getCurrentSession();
  const profile = await getOwnProfile(session!.user.id);
  if (!profile) return null;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Your profile</h1>
      <ProfileTabs active="family" />
      <div className="mt-6">
        <FamilyInfoForm
          initial={{
            fathersName: profile.fathersName ?? "",
            grandfathersName: profile.grandfathersName ?? "",
            greatGrandfathersName: profile.greatGrandfathersName ?? "",
            ancestralRegion: profile.ancestralRegion ?? "",
            familyInformation: profile.familyInformation ?? "",
          }}
        />
        <div className="mt-8 border-t border-border pt-6">
          <p className="text-sm text-muted-foreground">
            Want to associate with a family branch or link confirmed relatives?
          </p>
          <ButtonLink href="/family" variant="secondary" size="sm" className="mt-3">
            Explore Family Branches
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
