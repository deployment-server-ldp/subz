import { getCurrentSession } from "@/lib/auth/session";
import { getOwnProfile } from "@/lib/profile/get";
import { prisma } from "@/lib/db/prisma";
import { PersonalInfoForm } from "@/components/member/PersonalInfoForm";
import { ProfileTabs } from "@/components/member/ProfileTabs";

export default async function ProfilePersonalPage() {
  const session = await getCurrentSession();
  const profile = await getOwnProfile(session!.user.id);
  if (!profile) return null;

  const [countries, cities] = await Promise.all([
    prisma.country.findMany({ orderBy: { displayOrder: "asc" }, select: { id: true, name: true } }),
    prisma.city.findMany({ select: { id: true, name: true, countryId: true } }),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Your profile</h1>
      <ProfileTabs active="personal" />
      <div className="mt-6">
        <PersonalInfoForm
          countries={countries}
          cities={cities}
          initial={{
            firstName: profile.firstName,
            middleName: profile.middleName ?? "",
            lastName: profile.lastName,
            gender: profile.gender ?? "",
            dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.toISOString().slice(0, 10) : "",
            countryId: profile.countryId ?? "",
            cityId: profile.cityId ?? "",
            currentResidence: profile.currentResidence ?? "",
            nationality: profile.nationality ?? "",
            bio: profile.bio ?? "",
          }}
        />
      </div>
    </div>
  );
}
