import { getCurrentSession } from "@/lib/auth/session";
import { getOwnProfile } from "@/lib/profile/get";
import { PrivacyForm } from "@/components/member/PrivacyForm";
import { ProfileTabs } from "@/components/member/ProfileTabs";

export default async function ProfilePrivacyPage() {
  const session = await getCurrentSession();
  const profile = await getOwnProfile(session!.user.id);
  if (!profile) return null;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Your profile</h1>
      <ProfileTabs active="privacy" />
      <div className="mt-6">
        <PrivacyForm
          initial={{
            visibility: profile.visibility,
            openToNetworking: profile.openToNetworking,
            openToMentorship: profile.openToMentorship,
            openToBusinessNetwork: profile.openToBusinessNetwork,
            openToEvents: profile.openToEvents,
            openToHelping: profile.openToHelping,
          }}
        />
      </div>
    </div>
  );
}
